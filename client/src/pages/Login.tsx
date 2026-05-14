import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useLoginFlow } from '../hooks/useLoginFlow'
import { useToast } from '../stores/useToast'

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

export default function Login() {
  const [searchParams] = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const {
    email,
    setEmail,
    password,
    setPassword,
    code,
    setCode,
    isLoading,
    errorMessage,
    loginMethod,
    resendCooldown,
    handleSubmit,
    handleChangeEmail,
    handleResendCode,
    handleSocialLogin,
  } = useLoginFlow({ initialErrorMessage: searchParams.get('error') ?? '' })

  const toast = useToast()

  useEffect(() => {
    if (errorMessage) {
      toast.error({ title: 'Erro', message: errorMessage })
    }
  }, [errorMessage])

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
        <div className="ui-auth-card w-full max-w-sm p-8 backdrop-blur-md">
          <div className="flex flex-col items-center mb-8">
            <h1 className="text-neutral-950 text-2xl font-semibold tracking-tight">
              The Book Space
            </h1>
            <p className="text-neutral-500 text-sm mt-1.5 font-normal">
              Acesse sua biblioteca pessoal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
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
                disabled={loginMethod !== 'email'}
                placeholder="seu@email.com"
                className="ui-auth-input w-full h-9 px-3.5 py-2.5 text-sm placeholder-neutral-400 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/12 transition-all duration-200"
              />
            </div>

            {loginMethod === 'password' ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-0.5">
                  <label
                    htmlFor="password"
                    className="block text-neutral-600 text-xs font-medium"
                  >
                    Senha
                  </label>
                  <Link
                    to="/auth/forgot-password"
                    className="text-neutral-500 text-xs font-medium hover:text-brand-deep transition-colors duration-200"
                  >
                    Esqueceu?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
            ) : null}

            {loginMethod === 'google_code' ? (
              <div className="space-y-1.5">
                <label
                  htmlFor="code"
                  className="block text-neutral-600 text-xs font-medium ml-0.5"
                >
                  Codigo de acesso
                </label>
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="ui-auth-input w-full h-9 px-3.5 py-2.5 text-sm tracking-[0.25em] placeholder-neutral-400 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/12 transition-all duration-200"
                />
                <p className="text-[11px] text-neutral-500">
                  Enviamos um codigo de 6 digitos para {email}.
                </p>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0 || isLoading}
                  className="text-left text-[11px] font-medium text-brand-deep transition-colors hover:text-accent disabled:cursor-not-allowed disabled:text-neutral-400"
                >
                  {resendCooldown > 0
                    ? `Reenviar codigo em ${resendCooldown}s`
                    : 'Reenviar codigo'}
                </button>
              </div>
            ) : null}

            {loginMethod !== 'email' ? (
              <button
                type="button"
                onClick={handleChangeEmail}
                className="text-xs font-medium text-neutral-500 transition-colors hover:text-brand-deep"
              >
                Trocar e-mail
              </button>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="ui-auth-primary-btn w-full bg-accent hover:bg-brand-deep disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm py-2.5 transition-all duration-300 mt-2"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Validando...
                </span>
              ) : loginMethod === 'email' ? (
                'Continuar'
              ) : loginMethod === 'google_code' ? (
                'Entrar com codigo'
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-2.5">
            <div className="h-px flex-1 bg-neutral-200" />
            <span className="text-xs font-medium text-neutral-400">ou</span>
            <div className="h-px flex-1 bg-neutral-200" />
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleSocialLogin}
              className="flex h-9 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white text-sm font-medium text-neutral-700 transition-colors duration-200 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Entrar com Google"
            >
              <GoogleIcon />
              Google
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-200 text-center">
            <p className="text-neutral-500 text-xs font-medium">
              Não tem uma conta?{' '}
              <Link
                to="/auth/register"
                className="text-brand-deep font-semibold hover:text-accent transition-colors duration-200 ml-1"
              >
                Cadastre-se agora
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
