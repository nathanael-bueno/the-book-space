import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Check } from 'lucide-react'
import { ApiError } from '../services/http'
import { register, startGoogleLogin } from '../services/auth'
import { listBrazilianStates, listCitiesByState } from '../services/locations'

const passwordRules = [
  { label: 'Mínimo 8 caracteres', test: (p: string) => p.length >= 8 },
  { label: 'Uma letra maiúscula', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Um número', test: (p: string) => /\d/.test(p) },
]

const ageRanges = [
  { value: '13-17', label: '13 a 17 anos' },
  { value: '18-24', label: '18 a 24 anos' },
  { value: '25-34', label: '25 a 34 anos' },
  { value: '35-44', label: '35 a 44 anos' },
  { value: '45-54', label: '45 a 54 anos' },
  { value: '55+', label: '55 anos ou mais' },
]

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="ui-social-icon">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  )
}

export default function Register() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [ageRange, setAgeRange] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [states, setStates] = useState<Array<{ code: string; name: string }>>(
    []
  )
  const [cities, setCities] = useState<string[]>([])
  const [isLoadingStates, setIsLoadingStates] = useState(true)
  const [isLoadingCities, setIsLoadingCities] = useState(false)

  const stepLabels = ['Dados basicos', 'Localizacao', 'Seguranca']

  useEffect(() => {
    let active = true

    async function loadStates() {
      setIsLoadingStates(true)
      try {
        const data = await listBrazilianStates()
        if (!active) return
        setStates(data)
      } catch {
        if (!active) return
        setErrorMessage(
          'Nao foi possivel carregar estados e cidades no momento.'
        )
      } finally {
        if (active) setIsLoadingStates(false)
      }
    }

    loadStates()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!state) return

    let active = true

    async function loadCities() {
      setIsLoadingCities(true)
      try {
        const data = await listCitiesByState(state)
        if (!active) return
        setCities(data)
        setCity('')
      } catch {
        if (!active) return
        setErrorMessage(
          'Nao foi possivel carregar cidades para o estado selecionado.'
        )
        setCities([])
      } finally {
        if (active) setIsLoadingCities(false)
      }
    }

    loadCities()

    return () => {
      active = false
    }
  }, [state])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')
    try {
      await register({
        nome_completo: name,
        email,
        senha: password,
        cidade: city,
        estado: state,
        faixa_etaria: ageRange,
      })
      localStorage.setItem('book-space.pending-verification-email', email)
      navigate('/auth/verify-email', { replace: true, state: { email } })
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : 'Não foi possível criar conta.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const goNextStep = () => {
    setErrorMessage('')

    if (step === 1) {
      if (!name.trim() || !email.trim()) {
        setErrorMessage('Preencha nome e e-mail para continuar.')
        return
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email.trim())) {
        setErrorMessage('Informe um e-mail valido.')
        return
      }
    }

    if (step === 2 && (!state || !city || !ageRange)) {
      setErrorMessage('Preencha estado, cidade e faixa etaria para continuar.')
      return
    }

    setStep((current) => Math.min(3, current + 1))
  }

  const goPreviousStep = () => {
    setErrorMessage('')
    setStep((current) => Math.max(1, current - 1))
  }

  const handleSocialRegister = () => {
    startGoogleLogin()
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image with neutral overlay */}
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

      <div className="relative z-10 flex min-h-screen w-full items-center justify-center p-5">
        <div className="ui-auth-card w-full max-w-sm p-7 backdrop-blur-md">
          <div className="flex flex-col items-center mb-6">
            <h1 className="text-neutral-950 text-2xl font-semibold tracking-tight">
              Crie sua conta
            </h1>
            <p className="text-neutral-500 text-sm mt-1.5 font-normal">
              Junte-se à nossa comunidade de leitores
            </p>
          </div>

          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between text-xs font-medium text-neutral-500">
              <span>Passo {step} de 3</span>
              <span>{stepLabels[step - 1]}</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[1, 2, 3].map((index) => (
                <span
                  key={index}
                  className={`h-1.5 rounded-full ${index <= step ? 'bg-accent' : 'bg-neutral-200'}`}
                />
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {errorMessage ? (
              <div className="rounded-lg border border-brand-deep/25 bg-brand-deep/5 px-3 py-2 text-xs font-medium text-brand-deep">
                {errorMessage}
              </div>
            ) : null}

            {step === 1 ? (
              <>
                <div className="space-y-1.5">
                  <label
                    htmlFor="name"
                    className="block text-neutral-600 text-xs font-medium ml-0.5"
                  >
                    Nome completo
                  </label>
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="ui-auth-input w-full h-9 px-3.5 py-2.5 text-sm placeholder-neutral-400 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/12 transition-all duration-200"
                  />
                </div>
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
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="ui-auth-input w-full h-9 px-3.5 py-2.5 text-sm placeholder-neutral-400 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/12 transition-all duration-200"
                  />
                </div>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="state"
                      className="block text-neutral-600 text-xs font-medium ml-0.5"
                    >
                      Estado
                    </label>
                    <select
                      id="state"
                      autoComplete="address-level1"
                      required
                      value={state}
                      onChange={(e) => {
                        setState(e.target.value)
                        setCity('')
                        setCities([])
                      }}
                      disabled={isLoadingStates}
                      className="ui-auth-input w-full h-9 px-3.5 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/12 transition-all duration-200"
                    >
                      <option value="">
                        {isLoadingStates
                          ? 'Carregando estados...'
                          : 'Selecione'}
                      </option>
                      {states.map((stateOption) => (
                        <option key={stateOption.code} value={stateOption.code}>
                          {stateOption.name} ({stateOption.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="city"
                      className="block text-neutral-600 text-xs font-medium ml-0.5"
                    >
                      Cidade
                    </label>
                    <select
                      id="city"
                      autoComplete="address-level2"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      disabled={!state || isLoadingCities}
                      className="ui-auth-input w-full h-9 px-3.5 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/12 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="">
                        {!state
                          ? 'Selecione um estado primeiro'
                          : isLoadingCities
                            ? 'Carregando cidades...'
                            : 'Selecione'}
                      </option>
                      {cities.map((cityName) => (
                        <option key={cityName} value={cityName}>
                          {cityName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="ageRange"
                    className="block text-neutral-600 text-xs font-medium ml-0.5"
                  >
                    Faixa etaria
                  </label>
                  <select
                    id="ageRange"
                    required
                    value={ageRange}
                    onChange={(e) => setAgeRange(e.target.value)}
                    className="ui-auth-input w-full h-9 px-3.5 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/12 transition-all duration-200"
                  >
                    <option value="">Selecione</option>
                    {ageRanges.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : null}

            {step === 3 ? (
              <>
                <div className="space-y-1.5">
                  <label
                    htmlFor="password"
                    className="block text-neutral-600 text-xs font-medium ml-0.5"
                  >
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      placeholder="••••••••"
                      className="ui-auth-input w-full h-9 px-3.5 py-2.5 pr-10 text-sm placeholder-neutral-400 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/12 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? 'Ocultar senha' : 'Mostrar senha'
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {(passwordFocused || password.length > 0) && (
                  <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200 grid grid-cols-1 gap-2">
                    {passwordRules.map((rule) => {
                      const ok = rule.test(password)
                      return (
                        <div
                          key={rule.label}
                          className="flex items-center gap-2"
                        >
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${ok ? 'bg-success/15 text-success' : 'bg-neutral-200 text-neutral-400'}`}
                          >
                            <Check size={10} strokeWidth={3} />
                          </div>
                          <span
                            className={`text-xs font-medium ${ok ? 'text-neutral-800' : 'text-neutral-500'}`}
                          >
                            {rule.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            ) : null}

            <div className="mt-4 grid grid-cols-2 gap-2">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={goPreviousStep}
                  className="h-9 rounded-lg border border-neutral-200 bg-white text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
                >
                  Voltar
                </button>
              ) : (
                <span />
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={goNextStep}
                  className="ui-auth-primary-btn h-9 rounded-lg bg-accent text-sm font-semibold text-white transition-colors hover:bg-brand-deep"
                >
                  Continuar
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="ui-auth-primary-btn h-9 rounded-lg bg-accent text-sm font-semibold text-white transition-colors hover:bg-brand-deep disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Criando...' : 'Criar conta'}
                </button>
              )}
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-neutral-200 text-center">
            <p className="text-neutral-500 text-xs font-medium">
              Ja possui uma conta?{' '}
              <Link
                to="/auth/login"
                className="text-brand-deep font-semibold hover:text-accent transition-colors duration-200 ml-1"
              >
                Entrar agora
              </Link>
            </p>

            <div className="my-4 flex items-center gap-2.5">
              <div className="h-px flex-1 bg-neutral-200" />
              <span className="text-xs font-medium text-neutral-400">ou</span>
              <div className="h-px flex-1 bg-neutral-200" />
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              <button
                type="button"
                disabled={isLoading}
                onClick={handleSocialRegister}
                className="flex h-9 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white text-sm font-medium text-neutral-700 transition-colors duration-200 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Cadastrar com Google"
              >
                <GoogleIcon />
                Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
