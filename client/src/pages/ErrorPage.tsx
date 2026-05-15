import { AlertTriangle, ChevronLeft, RotateCcw } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

export default function ErrorPage() {
  const navigate = useNavigate()

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden rounded-xl border border-line/45 bg-white p-5 shadow-sm sm:p-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-brand-deep/10 to-transparent" />

      <div className="relative mx-auto flex w-full max-w-2xl flex-col items-center text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-brand-deep/20 bg-brand-deep/10 text-brand-deep">
          <AlertTriangle size={22} />
        </div>

        <div className="mt-4 flex items-center gap-3 text-left">
          <Link
            to="/app/feed"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-line/55 bg-white px-4 text-sm font-semibold text-ink-dim shadow-sm transition-colors hover:border-accent/35 hover:text-brand-deep"
          >
            <ChevronLeft size={16} />
            Voltar
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-deep">
              Erro inesperado
            </p>
            <h1 className="mt-1 text-3xl font-semibold leading-tight text-ink sm:text-4xl">
              Algo deu errado ao carregar esta pagina
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-ink-dim sm:text-base">
              Pode ter ocorrido uma falha temporaria de conexao ou processamento.
              Tente novamente ou volte para o feed principal.
            </p>
          </div>
        </div>

        <div className="mt-6 flex w-full flex-col items-center justify-center gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate(0)}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-line/55 bg-white px-5 text-sm font-semibold text-ink-dim shadow-sm transition-colors hover:border-accent/35 hover:text-brand-deep"
          >
            <RotateCcw size={16} />
            Tentar novamente
          </button>
        </div>
      </div>
    </main>
  )
}
