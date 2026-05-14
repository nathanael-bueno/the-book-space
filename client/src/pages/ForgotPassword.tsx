import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail } from 'lucide-react'
import { ApiError } from '../services/http'
import { forgotPassword } from '../services/auth'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')
    try {
      await forgotPassword(email)
      setIsLoading(false)
      setSent(true)
    } catch (error) {
      setIsLoading(false)
      setErrorMessage(
        error instanceof ApiError ? error.message : 'Nao foi possivel enviar.'
      )
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-5 overflow-hidden">
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

      {/* Forgot Password Card */}
      <div className="ui-auth-card relative z-10 w-full max-w-sm p-8 backdrop-blur-md">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-neutral-950 text-2xl font-semibold tracking-tight">
            Recuperar senha
          </h1>
          <p className="text-neutral-500 text-sm mt-1.5 font-normal text-center">
            Informe seu e-mail para redefinir sua senha
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            {errorMessage ? (
              <div className="rounded-lg border border-brand-deep/25 bg-brand-deep/5 px-3 py-2 text-xs font-medium text-brand-deep">
                {errorMessage}
              </div>
            ) : null}
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

            <button
              type="submit"
              disabled={isLoading}
              className="ui-auth-primary-btn w-full bg-accent hover:bg-brand-deep disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm py-2.5 transition-all duration-300 mt-2"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Enviando...
                </span>
              ) : (
                'Enviar link'
              )}
            </button>
          </form>
        ) : (
          <div className="text-center py-2">
            <div className="ui-auth-icon w-9 h-9 flex items-center justify-center mx-auto mb-5">
              <Mail size={22} className="text-brand-deep" />
            </div>
            <h2 className="text-neutral-950 text-lg font-semibold mb-2">
              Verifique seu e-mail
            </h2>
            <p className="text-neutral-500 text-sm leading-relaxed mb-6">
              Enviamos um link de recuperação para{' '}
              <span className="text-neutral-900 font-semibold">{email}</span>
            </p>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="text-brand-deep text-sm font-semibold hover:text-accent transition-colors"
            >
              Reenviar e-mail
            </button>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-neutral-200 text-center">
          <Link
            to="/auth/login"
            className="inline-flex items-center gap-2 text-neutral-500 hover:text-brand-deep text-xs font-medium transition-colors duration-200"
          >
            <ArrowLeft size={14} />
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  )
}
