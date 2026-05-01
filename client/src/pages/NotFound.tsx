import { Link } from 'react-router-dom'
import { Compass, House, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-4xl rounded-2xl border border-line/45 bg-white p-6 shadow-sm sm:p-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-deep">
          Erro 404
        </p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight text-ink sm:text-4xl">
          Pagina nao encontrada
        </h1>
        <p className="mt-3 text-sm leading-6 text-ink-dim sm:text-base">
          O endereco pode ter sido removido, renomeado ou digitado
          incorretamente.
        </p>
      </div>

      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          to="/"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-accent px-5 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep"
        >
          <House size={16} />
          Ir para inicio
        </Link>
        <Link
          to="/catalog"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-line/55 bg-white px-5 text-sm font-semibold text-ink-dim shadow-sm transition-colors hover:border-accent/35 hover:text-brand-deep"
        >
          <Search size={16} />
          Abrir catalogo
        </Link>
      </div>

      <section className="mt-6 rounded-xl border border-line/35 bg-[#fbfaf7] p-4 sm:p-5">
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
          <Compass size={16} className="text-brand-deep" />
          Sugestoes
        </div>
        <ul className="mt-3 space-y-2 text-sm text-ink-dim">
          <li>Confira se o endereco foi digitado corretamente.</li>
          <li>Use o menu superior para navegar pelas telas principais.</li>
          <li>Volte para a home e continue de onde parou.</li>
        </ul>
      </section>
    </main>
  )
}
