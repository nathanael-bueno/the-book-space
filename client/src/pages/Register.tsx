import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, BookOpen, Check } from 'lucide-react'

type SocialProvider = 'google' | 'facebook'

const passwordRules = [
  { label: 'Mínimo 8 caracteres', test: (p: string) => p.length >= 8 },
  { label: 'Uma letra maiúscula', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Um número', test: (p: string) => /\d/.test(p) },
]

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
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

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path
        fill="#1877F2"
        d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.03 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.96h-1.51c-1.49 0-1.96.93-1.96 1.89v2.27h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z"
      />
    </svg>
  )
}

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // TODO: integrate with /api/auth/register
    setTimeout(() => setIsLoading(false), 1500)
  }

  const handleSocialRegister = (provider: SocialProvider) => {
    // TODO: integrate with OAuth route when backend provider endpoints exist.
    void provider
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

      {/* Register Card */}
      <div className="relative z-10 w-full max-w-sm bg-white/95 border border-white/70 rounded-2xl p-8 shadow-[0_20px_56px_rgba(15,23,42,0.14)] backdrop-blur-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-white border border-neutral-200 flex items-center justify-center mb-4 shadow-sm">
            <BookOpen size={24} className="text-brand-deep" />
          </div>
          <h1 className="text-neutral-950 text-2xl font-semibold tracking-tight">
            Crie sua conta
          </h1>
          <p className="text-neutral-500 text-sm mt-1.5 font-normal">
            Junte-se à nossa comunidade de leitores
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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
              className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3.5 py-3 text-neutral-950 text-sm placeholder-neutral-400 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/12 transition-all duration-200"
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
              className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3.5 py-3 text-neutral-950 text-sm placeholder-neutral-400 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/12 transition-all duration-200"
            />
          </div>

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
                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3.5 py-3 pr-10 text-neutral-950 text-sm placeholder-neutral-400 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/12 transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors duration-200"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {(passwordFocused || password.length > 0) && (
            <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200 grid grid-cols-1 sm:grid-cols-3 gap-2">
              {passwordRules.map((rule) => {
                const ok = rule.test(password)
                return (
                  <div key={rule.label} className="flex items-center gap-2">
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-accent hover:bg-brand-deep disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg py-3 transition-all duration-300 shadow-md shadow-accent/16 mt-2"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Criando...
              </span>
            ) : (
              'Criar conta'
            )}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-neutral-200" />
          <span className="text-xs font-medium text-neutral-400">ou</span>
          <div className="h-px flex-1 bg-neutral-200" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleSocialRegister('google')}
            className="flex h-11 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white text-sm font-medium text-neutral-700 transition-colors duration-200 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Cadastrar com Google"
          >
            <GoogleIcon />
            Google
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleSocialRegister('facebook')}
            className="flex h-11 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white text-sm font-medium text-neutral-700 transition-colors duration-200 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Cadastrar com Facebook"
          >
            <FacebookIcon />
            Facebook
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-neutral-200 text-center">
          <p className="text-neutral-500 text-xs font-medium">
            Já possui uma conta?{' '}
            <Link
              to="/login"
              className="text-brand-deep font-semibold hover:text-accent transition-colors duration-200 ml-1"
            >
              Entrar agora
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
