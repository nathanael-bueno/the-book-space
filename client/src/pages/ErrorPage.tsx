import { Link } from 'react-router-dom'

export default function ErrorPage() {
  return (
    <main className="mx-auto w-full max-w-3xl rounded-2xl border border-line/45 bg-white p-6 text-center shadow-sm">
      <h1 className="text-2xl font-semibold text-ink">Algo deu errado</h1>
      <p className="mt-2 text-sm text-ink-dim">
        Ocorreu um erro ao carregar esta tela.
      </p>
      <Link
        to="/"
        className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep"
      >
        Voltar para home
      </Link>
    </main>
  )
}
