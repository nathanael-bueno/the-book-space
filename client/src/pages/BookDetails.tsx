import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpen,
  Edit3,
  MapPin,
  Repeat2,
  UserRound,
} from 'lucide-react'
import { books } from '../data/books'

export default function BookDetails() {
  const { bookId } = useParams()
  const book = books.find((item) => item.id === bookId)

  if (!book) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center rounded-2xl border border-line/45 bg-white p-6 text-center shadow-sm">
        <BookOpen size={36} className="text-brand-deep" />
        <h1 className="mt-4 text-xl font-semibold text-ink">
          Livro nao encontrado
        </h1>
        <p className="mt-2 text-sm text-ink-dim">
          O livro que voce tentou abrir nao esta disponivel.
        </p>
        <Link
          to="/"
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep"
        >
          <ArrowLeft size={16} />
          Voltar para home
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-6xl">
      <Link
        to="/"
        className="mb-5 inline-flex items-center gap-2 rounded-lg border border-line/55 bg-white px-3 py-2 text-sm font-medium text-ink-dim shadow-sm transition-colors hover:border-accent/35 hover:text-brand-deep"
      >
        <ArrowLeft size={16} />
        Voltar
      </Link>

      <section className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="overflow-hidden rounded-2xl border border-line/45 bg-white shadow-sm">
          <div className="h-1.5 bg-gradient-to-r from-accent via-brand-deep to-accent" />
          <div className="bg-canvas/35 p-4 sm:p-5">
            <div className="mx-auto aspect-[3/4] max-w-sm overflow-hidden rounded-xl border border-line/35 bg-white shadow-sm">
              <img
                src={book.cover}
                alt={`Capa do livro ${book.title}`}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <article className="rounded-2xl border border-line/45 bg-white p-4 shadow-sm sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-deep">
              {book.category}
            </p>
            <h1 className="mt-2 text-2xl font-semibold leading-tight text-ink sm:text-3xl">
              {book.title}
            </h1>
            <p className="mt-2 text-sm font-medium text-ink-muted">
              {book.author}
            </p>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-line/35 bg-[#fbfaf7] px-3 py-2.5">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                  Estado
                </p>
                <p className="mt-1 text-sm font-semibold text-ink">
                  {book.condition}
                </p>
              </div>
              <div className="rounded-lg border border-line/35 bg-[#fbfaf7] px-3 py-2.5">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                  Local
                </p>
                <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-ink">
                  <MapPin size={14} className="text-brand-deep" />
                  {book.city}
                </p>
              </div>
              <div className="rounded-lg border border-line/35 bg-[#fbfaf7] px-3 py-2.5">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                  Dono
                </p>
                <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-ink">
                  <UserRound size={14} className="text-brand-deep" />
                  {book.owner}
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-line/45 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="border-l-4 border-brand-deep pl-3 text-base font-semibold text-ink">
              Sobre o livro
            </h2>
            <p className="mt-4 text-sm leading-6 text-ink-dim">
              {book.description}
            </p>
          </article>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to={`/books/${book.id}/trade`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep"
            >
              <Repeat2 size={17} />
              Propor troca
            </Link>
            <Link
              to={`/books/${book.id}/edit`}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-line/55 bg-white px-4 text-sm font-semibold text-ink-dim shadow-sm transition-colors hover:border-accent/35 hover:text-brand-deep"
            >
              <Edit3 size={17} />
              Editar livro
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
