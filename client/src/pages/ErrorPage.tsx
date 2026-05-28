import { AlertTriangle, ChevronLeft, RotateCcw } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

function ServerErrorIllustration() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1100 700"
      className="mx-auto mb-8 h-48 w-auto opacity-90 sm:h-64"
    >
      <circle cx="550" cy="350" r="300" fill="var(--color-accent)" opacity=".05" />
      <rect x="350" y="250" width="400" height="250" rx="20" fill="#3F3D56" opacity=".1" />
      <path
        fill="var(--color-accent)"
        d="M550 150l-80 150h160z"
        opacity=".2"
      />
      <circle cx="550" cy="400" r="80" fill="var(--color-accent)" opacity=".4" />
      <path
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="20"
        strokeLinecap="round"
        d="M450 500c0-55.2 44.8-100 100-100s100 44.8 100 100"
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="120"
        fontWeight="bold"
        fill="#3F3D56"
        fontFamily="Arial, sans-serif"
      >
        500
      </text>
    </svg>
  )
}

export default function ErrorPage() {
  const navigate = useNavigate()

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-[#fcfbf9] p-6 sm:p-12">
      <ServerErrorIllustration />

      <div className="max-w-xl text-center">
        <div className="mx-auto mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/10 text-danger shadow-sm ring-1 ring-danger/20">
          <AlertTriangle size={28} />
        </div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-danger/80">
          Erro inesperado
        </p>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-ink sm:text-5xl">
          Algo nao saiu como o planejado.
        </h1>
        <p className="mt-6 text-base leading-relaxed text-ink-muted sm:text-lg">
          Ocorreu um erro interno no servidor ou uma falha de conexao. Ja estamos
          trabalhando para colocar as estantes em ordem!
        </p>
      </div>

      <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <button
          type="button"
          onClick={() => navigate(0)}
          className="btn-primary h-11 px-8 rounded-xl shadow-lg shadow-accent/20"
        >
          <RotateCcw size={18} />
          Tentar novamente
        </button>
        <Link
          to="/app/feed"
          className="btn-secondary h-11 px-8 rounded-xl bg-white shadow-sm"
        >
          <ChevronLeft size={18} />
          Voltar ao feed
        </Link>
      </div>

      <p className="mt-12 text-xs font-medium text-ink-muted/60 italic">
        Se o problema persistir, entre em contato com nosso suporte.
      </p>
    </main>
  )
}
