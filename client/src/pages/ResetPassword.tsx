import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  BookOpen,
  Eye,
  EyeOff,
  Check,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react'
import { useToast } from '../stores/useToast'

const passwordRules = [
  { label: 'Mínimo 8 caracteres', test: (p: string) => p.length >= 8 },
  { label: 'Uma letra maiúscula', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Um número', test: (p: string) => /\d/.test(p) },
]

export default function ResetPassword() {
  const toast = useToast()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const hasValidToken = Boolean(token && token.trim().length > 12)

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [done, setDone] = useState(false)

  const allRulesPass = passwordRules.every((r) => r.test(password))
  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword
  const passwordMismatch =
    confirmPassword.length > 0 && password !== confirmPassword
  const canSubmit =
    hasValidToken && allRulesPass && passwordsMatch && !isLoading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || !token) {
      if (!hasValidToken) {
        toast.error({
          title: 'Link invalido',
          message: 'Solicite um novo e-mail para redefinir sua senha.',
        })
      }
      return
    }
    setIsLoading(true)
    // TODO: integrate with /api/auth/reset-password using body { token, password }
    setTimeout(() => {
      setIsLoading(false)
      setDone(true)
      toast.success({
        title: 'Senha redefinida',
        message: 'Sua nova senha foi registrada com sucesso.',
      })
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

      {/* Reset Password Card */}
      <div className="relative z-10 w-full max-w-sm bg-white/95 border border-white/70 rounded-2xl p-8 shadow-[0_20px_56px_rgba(15,23,42,0.14)] backdrop-blur-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-white border border-neutral-200 flex items-center justify-center mb-4 shadow-sm">
            <BookOpen size={24} className="text-brand-deep" />
          </div>
          <h1 className="text-neutral-950 text-2xl font-semibold tracking-tight">
            Nova senha
          </h1>
          <p className="text-neutral-500 text-sm mt-1.5 font-normal text-center">
            Crie uma senha forte para sua segurança
          </p>
        </div>

        {!done ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            {!hasValidToken ? (
              <div className="rounded-lg border border-brand-deep/25 bg-brand-deep/5 px-3 py-2 text-xs font-medium text-brand-deep">
                Link invalido ou expirado. Solicite um novo e-mail de
                recuperacao.
              </div>
            ) : null}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-neutral-600 text-xs font-medium ml-0.5"
              >
                Nova senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
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
                  aria-label={
                    showPassword ? 'Ocultar nova senha' : 'Mostrar nova senha'
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              {(passwordFocused || password.length > 0) && (
                <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200 space-y-2 mt-2">
                  {passwordRules.map((rule) => {
                    const ok = rule.test(password)
                    return (
                      <div key={rule.label} className="flex items-center gap-2">
                        <div
                          className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 ${ok ? 'bg-success/15 text-success' : 'bg-neutral-200 text-neutral-400'}`}
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
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="confirm"
                className="block text-neutral-600 text-xs font-medium ml-0.5"
              >
                Confirmar
              </label>
              <div className="relative">
                <input
                  id="confirm"
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full bg-neutral-50 border rounded-lg px-3.5 py-3 pr-10 text-neutral-950 text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    passwordMismatch
                      ? 'border-brand-deep/50 focus:border-brand-deep focus:ring-brand-deep/12'
                      : 'border-neutral-200 focus:border-accent focus:ring-accent/12'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label={
                    showConfirm
                      ? 'Ocultar confirmacao de senha'
                      : 'Mostrar confirmacao de senha'
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors duration-200"
                >
                  {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full bg-accent hover:bg-brand-deep disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg py-3 transition-all duration-300 shadow-md shadow-accent/16 mt-2"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Salvando...
                </span>
              ) : (
                'Redefinir senha'
              )}
            </button>
          </form>
        ) : (
          <div className="text-center py-2">
            <div className="w-12 h-12 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-center mx-auto mb-5">
              <ShieldCheck size={22} className="text-brand-deep" />
            </div>
            <h2 className="text-neutral-950 text-lg font-semibold mb-2">
              Senha redefinida
            </h2>
            <p className="text-neutral-500 text-sm leading-relaxed mb-6">
              Sua senha foi atualizada com sucesso. Você já pode entrar com sua
              nova senha.
            </p>
            <Link
              to="/login"
              className="inline-block w-full bg-accent hover:bg-brand-deep text-white font-semibold text-sm rounded-lg py-3 transition-all duration-300 text-center shadow-md shadow-accent/16"
            >
              Ir para o login
            </Link>
          </div>
        )}

        {!done && (
          <div className="mt-8 pt-6 border-t border-neutral-200 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-neutral-500 hover:text-brand-deep text-xs font-medium transition-colors duration-200"
            >
              <ArrowLeft size={14} />
              Voltar para o login
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
