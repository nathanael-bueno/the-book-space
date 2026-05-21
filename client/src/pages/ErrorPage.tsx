import { AlertTriangle, ChevronLeft, RotateCcw } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

export default function ErrorPage() {
  const navigate = useNavigate()

  return (
    <main className="flex min-h-screen w-full flex-col justify-center bg-[#fcfbf9] px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-brand-deep/20 bg-brand-deep/10 text-brand-deep">
          <AlertTriangle size={20} />
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-brand-deep">
          Erro inesperado
        </p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight text-ink sm:text-4xl">
          Algo deu errado ao carregar esta pagina
        </h1>
        <p className="mt-3 text-sm leading-6 text-ink-dim sm:text-base">
          Pode ter ocorrido uma falha temporaria de conexao ou processamento.
          Tente novamente ou volte para o feed principal.
        </p>
      </div>

      <div className="mt-5 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
        <button
          type="button"
          onClick={() => navigate(0)}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-accent px-5 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep"
        >
          <RotateCcw size={16} />
          Tentar novamente
        </button>
        <Link
          to="/app/feed"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-line/55 bg-white px-5 text-sm font-semibold text-ink-dim shadow-sm transition-colors hover:border-accent/35 hover:text-brand-deep"
        >
          <ChevronLeft size={16} />
          Voltar ao feed
        </Link>
      </div>
    </main>
  )
}
