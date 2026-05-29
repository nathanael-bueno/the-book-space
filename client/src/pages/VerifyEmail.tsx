import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { resendEmailCodeByEmail, verifyEmailCode } from '../services/auth'
import { ApiError } from '../services/http'
import {
  listGenres,
  saveMyFavoriteGenres,
  type ApiGenre,
} from '../services/books'
import { useToast } from '../stores/useToast'

type Step = 'verify' | 'genres'

export default function VerifyEmail() {
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const initialEmail =
    (location.state as { email?: string } | null)?.email ??
    localStorage.getItem('book-space.pending-verification-email') ??
    ''

  const [email, setEmail] = useState(initialEmail)
  const [code, setCode] = useState('')
  const [step, setStep] = useState<Step>('verify')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [message, setMessage] = useState('')
  const [genres, setGenres] = useState<ApiGenre[]>([])
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [isSavingGenres, setIsSavingGenres] = useState(false)
  const TIMER_KEY = 'book-space.verify-code-expiry'
  const CODE_DURATION = 900 // 15 minutos em segundos

  function getSecondsLeft(): number {
    const saved = localStorage.getItem(TIMER_KEY)
    if (!saved) return CODE_DURATION
    const diff = Math.floor((parseInt(saved) - Date.now()) / 1000)
    return Math.max(0, diff)
  }

  function saveTimer() {
    localStorage.setItem(TIMER_KEY, String(Date.now() + CODE_DURATION * 1000))
  }

  const [timeLeft, setTimeLeft] = useState(() => getSecondsLeft())

  // Salva o timestamp na primeira vez que chega na tela (se não houver um salvo)
  useEffect(() => {
    if (!localStorage.getItem(TIMER_KEY)) saveTimer()
  }, [])

  useEffect(() => {
    if (step !== 'verify') return
    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      const remaining = getSecondsLeft()
      setTimeLeft(remaining)
      if (remaining <= 0) clearInterval(timer)
    }, 1000)

    return () => clearInterval(timer)
  }, [step, timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  useEffect(() => {
    if (step !== 'genres') return

    let active = true

    listGenres()
      .then((response) => {
        if (!active) return
        setGenres(response.data)
      })
      .catch((error) => {
        if (!active) return
        toast.error({
          title: 'Erro',
          message:
            error instanceof ApiError
              ? error.message
              : 'Nao foi possivel carregar as categorias.',
        })
      })

    return () => {
      active = false
    }
  }, [step, toast])

  async function handleVerify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const response = await verifyEmailCode({ email, code })
      setMessage(response.message)
      setStep('genres')
    } catch (error) {
      toast.error({
        title: 'Erro',
        message:
          error instanceof ApiError
            ? error.message
            : 'Nao foi possivel verificar.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleResendCode() {
    const normalizedEmail = email.trim()
    if (!normalizedEmail) {
      toast.error({
        title: 'Erro',
        message: 'Informe o e-mail para reenviar o codigo.',
      })
      return
    }

    setIsResending(true)
    setMessage('')

    try {
      const response = await resendEmailCodeByEmail(normalizedEmail)
      setMessage(response.message)
      saveTimer() // Reseta o timestamp no localStorage
      setTimeLeft(CODE_DURATION) // Atualiza o estado local
    } catch (error) {
      toast.error({
        title: 'Erro',
        message:
          error instanceof ApiError
            ? error.message
            : 'Nao foi possivel reenviar o codigo.',
      })
    } finally {
      setIsResending(false)
    }
  }

  function toggleGenre(genreId: string) {
    setSelectedGenres((current) => {
      const exists = current.includes(genreId)
      if (exists) return current.filter((id) => id !== genreId)
      if (current.length >= 5) return current
      return [...current, genreId]
    })
  }

  async function handleSaveGenres() {
    if (selectedGenres.length < 3 || selectedGenres.length > 5) return

    setIsSavingGenres(true)

    try {
      await saveMyFavoriteGenres(selectedGenres)
      localStorage.removeItem('book-space.pending-verification-email')
      navigate('/app/home', { replace: true })
    } catch (error) {
      toast.error({
        title: 'Erro',
        message:
          error instanceof ApiError
            ? error.message
            : 'Nao foi possivel salvar as categorias favoritas.',
      })
    } finally {
      setIsSavingGenres(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-5 overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=1920")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-neutral-950/52 backdrop-blur-[1px]" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-neutral-950/30 to-transparent" />
      </div>

      <div className="ui-auth-card relative z-10 w-full max-w-md p-8 backdrop-blur-md">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-neutral-950 text-2xl font-semibold tracking-tight">
            {step === 'verify' ? 'Verificar e-mail' : 'Escolher categorias'}
          </h1>
          <p className="text-neutral-500 text-sm mt-1.5 font-normal text-center">
            {step === 'verify'
              ? 'Digite o codigo enviado para seu e-mail.'
              : 'Selecione de 3 a 5 categorias para personalizar seu feed.'}
          </p>
        </div>

        {message ? (
          <div className="mb-4 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-xs font-medium text-success">
            {message}
          </div>
        ) : null}

        {step === 'verify' ? (
          <form onSubmit={handleVerify} className="space-y-3">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-neutral-600 text-xs font-medium ml-0.5"
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="ui-auth-input w-full h-9 px-3.5 py-2.5 text-sm placeholder-neutral-400 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/12 transition-all duration-200"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="code"
                className="block text-neutral-600 text-xs font-medium ml-0.5"
              >
                Codigo de verificacao
              </label>
              <input
                id="code"
                type="text"
                required
                value={code}
                onChange={(event) =>
                  setCode(event.target.value.replace(/\D/g, '').slice(0, 6))
                }
                placeholder="000000"
                className="ui-auth-input w-full h-9 px-3.5 py-2.5 text-sm tracking-[0.25em] placeholder-neutral-400 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/12 transition-all duration-200"
              />
            </div>

            <div className="text-center py-1">
              {timeLeft > 0 ? (
                <p className="text-xs text-neutral-500">
                  O código expira em:{' '}
                  <span className="font-semibold text-brand-deep">
                    {formatTime(timeLeft)}
                  </span>
                </p>
              ) : (
                <p className="text-xs font-semibold text-brand-deep animate-pulse">
                  Código expirado! Solicite um novo reenvio.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || code.length !== 6 || timeLeft === 0}
              className="ui-auth-primary-btn w-full bg-accent hover:bg-brand-deep disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm py-2.5 transition-all duration-300"
            >
              {isLoading ? 'Validando...' : 'Verificar codigo'}
            </button>

            <button
              type="button"
              onClick={handleResendCode}
              disabled={isResending}
              className="w-full border border-line/55 bg-white py-2.5 text-sm font-semibold text-ink-dim hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? 'Reenviando...' : 'Reenviar codigo'}
            </button>

            <p className="text-center text-xs text-neutral-500">
              Ja verificou?{' '}
              <Link to="/auth/login" className="text-brand-deep">
                Entrar
              </Link>
            </p>
          </form>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {genres.map((genre) => {
                const selected = selectedGenres.includes(genre.id)
                const disabled = !selected && selectedGenres.length >= 5

                return (
                  <button
                    key={genre.id}
                    type="button"
                    onClick={() => toggleGenre(genre.id)}
                    disabled={disabled}
                    className={[
                      'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                      selected
                        ? 'border-accent bg-accent text-white'
                        : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-accent/45 hover:text-brand-deep',
                      disabled ? 'cursor-not-allowed opacity-50' : '',
                    ].join(' ')}
                  >
                    {genre.nome}
                  </button>
                )
              })}
            </div>

            <p className="text-xs font-semibold text-neutral-500">
              Selecionadas: {selectedGenres.length}/5
            </p>

            <button
              type="button"
              onClick={handleSaveGenres}
              disabled={
                isSavingGenres ||
                selectedGenres.length < 3 ||
                selectedGenres.length > 5
              }
              className="ui-auth-primary-btn w-full bg-accent hover:bg-brand-deep disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm py-2.5 transition-all duration-300"
            >
              {isSavingGenres ? 'Salvando...' : 'Concluir cadastro'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
