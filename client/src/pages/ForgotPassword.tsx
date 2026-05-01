import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, ArrowLeft, Mail } from 'lucide-react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // TODO: integrate with /api/auth/forgot-password
    setTimeout(() => {
      setIsLoading(false)
      setSent(true)
    }, 1500)
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
      <div className="relative z-10 w-full max-w-sm bg-white/95 border border-white/70 rounded-2xl p-8 shadow-[0_20px_56px_rgba(15,23,42,0.14)] backdrop-blur-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-white border border-neutral-200 flex items-center justify-center mb-4 shadow-sm">
            <BookOpen size={24} className="text-brand-deep" />
          </div>
          <h1 className="text-neutral-950 text-2xl font-semibold tracking-tight">
            Recuperar senha
          </h1>
          <p className="text-neutral-500 text-sm mt-1.5 font-normal text-center">
            Informe seu e-mail para redefinir sua senha
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-5">
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
                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3.5 py-3 text-neutral-950 text-sm placeholder-neutral-400 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/12 transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-accent hover:bg-brand-deep disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg py-3 transition-all duration-300 shadow-md shadow-accent/16 mt-2"
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
            <div className="w-12 h-12 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-center mx-auto mb-5">
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

        <div className="mt-8 pt-6 border-t border-neutral-200 text-center">
          <Link
            to="/login"
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
