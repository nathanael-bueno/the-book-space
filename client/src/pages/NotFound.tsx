import { Link } from 'react-router-dom'
import { Compass, House, Search } from 'lucide-react'

function VoidIllustration() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1104.84 711.05"
      className="mx-auto mb-8 h-48 w-auto opacity-90 sm:h-64"
    >
      <path
        fill="var(--color-accent)"
        opacity=".1"
        d="M1010.5 500.5c0 82.8-156.5 150-349.5 150s-349.5-67.2-349.5-150 156.5-150 349.5-150 349.5 67.2 349.5 150z"
      />
      <path
        fill="#3F3D56"
        d="M661 500.5c0 41.4-78.3 75-174.7 75s-174.7-33.6-174.7-75 78.3-75 174.7-75 174.7 33.6 174.7 75z"
        opacity=".1"
      />
      <path
        fill="var(--color-accent)"
        d="M486.3 500.5c0 10.1-19.1 18.3-42.7 18.3s-42.7-8.2-42.7-18.3 19.1-18.3 42.7-18.3 42.7 8.2 42.7 18.3z"
      />
      <path
        fill="#3F3D56"
        d="M248.4 239.4h208c6.1 0 11.1 5 11.1 11.1v197c0 6.1-5 11.1-11.1 11.1h-208c-6.1 0-11.1-5-11.1-11.1v-197c0-6.1 5-11.1 11.1-11.1z"
      />
      <text
        x="352"
        y="360"
        fill="#FFFFFF"
        fontSize="100"
        fontWeight="bold"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
      >
        404
      </text>
      <path
        fill="#3F3D56"
        d="M741.3 416.7l-45.7-91.4-45.7 91.4h91.4z"
      />
      <circle cx="695.6" cy="300" r="30" fill="var(--color-accent)" />
      <rect x="550" y="450" width="300" height="15" rx="7.5" fill="#3F3D56" opacity=".2" />
    </svg>
  )
}

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center p-6 sm:p-12">
      <VoidIllustration />

      <div className="max-w-xl text-center">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent/80">
          Pagina perdida no espaco
        </p>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-ink sm:text-5xl">
          Ops! Nao encontramos o que voce buscava.
        </h1>
        <p className="mt-6 text-base leading-relaxed text-ink-muted sm:text-lg">
          O endereco pode ter sido removido, renomeado ou talvez voce tenha
          digitado algo incorretamente. Que tal voltar ao catalogo?
        </p>
      </div>

      <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Link to="/app/feed" className="btn-secondary h-11 px-8 rounded-xl shadow-sm">
          <House size={18} />
          Ir para o feed
        </Link>
        <Link to="/app/catalog" className="btn-primary h-11 px-8 rounded-xl">
          <Search size={18} />
          Explorar catalogo
        </Link>
      </div>

      <section className="mt-16 w-full max-w-2xl rounded-2xl border border-line/30 bg-surface-alt/50 p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-ink">
          <Compass size={18} className="text-accent" />
          Algumas sugestoes
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm font-bold text-ink">Verifique a URL</p>
            <p className="text-xs text-ink-muted">Confira se nao ha erros de digitacao no endereco.</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-ink">Use a Busca</p>
            <p className="text-xs text-ink-muted">Tente buscar pelo titulo do livro no topo da pagina.</p>
          </div>
        </div>
      </section>
    </main>
  )
}
