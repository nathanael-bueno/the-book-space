import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpen,
  MapPin,
  MessageSquare,
  Star,
  UserRound,
} from 'lucide-react'
import { books } from '../data/books'

const reviews = [
  {
    id: 'rev-1',
    author: 'Ana Ribeiro',
    text: 'Troca rapida, livro bem conservado e comunicacao clara.',
  },
  {
    id: 'rev-2',
    author: 'Bruno Costa',
    text: 'Combinou a entrega com cuidado e respondeu tudo no mesmo dia.',
  },
]

export default function PublicProfile() {
  const { userId } = useParams()
  const userBooks = books.slice(0, 3)

  return (
    <main className="mx-auto w-full max-w-6xl space-y-5">
      <Link
        to="/"
        className="inline-flex items-center gap-2 rounded-lg border border-line/55 bg-white px-3 py-2 text-sm font-medium text-ink-dim shadow-sm transition-colors hover:border-accent/35 hover:text-brand-deep"
      >
        <ArrowLeft size={16} />
        Voltar
      </Link>

      <section className="overflow-hidden rounded-2xl border border-line/45 bg-white shadow-sm">
        <div className="h-1.5 bg-gradient-to-r from-accent via-brand-deep to-accent" />
        <div className="p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-accent/15 bg-canvas/55 text-accent shadow-sm">
                <UserRound size={30} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-deep">
                  Usuario #{userId ?? 'publico'}
                </p>
                <h1 className="mt-1 text-2xl font-semibold text-ink">
                  Marcos Macedo
                </h1>
                <p className="mt-1 inline-flex items-center gap-1 text-sm text-ink-muted">
                  <MapPin size={14} />
                  Belo Horizonte, MG
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-line/35 bg-[#fbfaf7] px-4 py-3">
              <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-deep">
                <Star size={16} fill="currentColor" />
                4.8
              </p>
              <p className="mt-1 text-xs text-ink-muted">12 avaliacoes</p>
            </div>
          </div>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-ink-dim">
            Leitor de classicos brasileiros, tecnologia e ficcao cientifica.
            Aberto a trocas locais e doacoes para projetos comunitarios.
          </p>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <article className="rounded-2xl border border-line/45 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="border-l-4 border-brand-deep pl-3 text-base font-semibold text-ink">
            Livros publicados
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {userBooks.map((book) => (
              <Link
                key={book.id}
                to={`/books/${book.id}`}
                className="overflow-hidden rounded-xl border border-line/45 bg-[#fbfaf7] shadow-sm transition-colors hover:border-accent/35"
              >
                <div className="aspect-[3/4] bg-canvas/35">
                  <img
                    src={book.cover}
                    alt={`Capa do livro ${book.title}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="border-t border-line/25 bg-white p-3">
                  <p className="text-sm font-semibold leading-snug text-ink">
                    {book.title}
                  </p>
                  <p className="mt-1 text-xs text-ink-muted">{book.author}</p>
                </div>
              </Link>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-line/45 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="border-l-4 border-brand-deep pl-3 text-base font-semibold text-ink">
            Avaliacoes
          </h2>
          <div className="mt-4 space-y-3">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-lg border border-line/35 bg-[#fbfaf7] p-3"
              >
                <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <MessageSquare size={15} className="text-brand-deep" />
                  {review.author}
                </p>
                <p className="mt-2 text-sm leading-6 text-ink-dim">
                  {review.text}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-line/45 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="border-l-4 border-brand-deep pl-3 text-base font-semibold text-ink">
          Resumo
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-line/35 bg-[#fbfaf7] px-3 py-2.5">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
              Livros ativos
            </p>
            <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-ink">
              <BookOpen size={14} className="text-brand-deep" />3
            </p>
          </div>
          <div className="rounded-lg border border-line/35 bg-[#fbfaf7] px-3 py-2.5">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
              Trocas feitas
            </p>
            <p className="mt-1 text-sm font-semibold text-ink">9</p>
          </div>
          <div className="rounded-lg border border-line/35 bg-[#fbfaf7] px-3 py-2.5">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
              Doacoes
            </p>
            <p className="mt-1 text-sm font-semibold text-ink">4</p>
          </div>
        </div>
      </section>
    </main>
  )
}
