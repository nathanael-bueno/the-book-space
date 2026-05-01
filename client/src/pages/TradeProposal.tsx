import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  MapPin,
  MessageSquareText,
  Send,
  UserRound,
} from 'lucide-react'
import { books } from '../data/books'
import { useToast } from '../stores/useToast'

const userBooks = [
  {
    id: 'mine-1',
    title: 'Ensaio Sobre a Cegueira',
    author: 'Jose Saramago',
    condition: 'Muito bom',
  },
  {
    id: 'mine-2',
    title: 'Quarto de Despejo',
    author: 'Carolina Maria de Jesus',
    condition: 'Bom',
  },
  {
    id: 'mine-3',
    title: 'Torto Arado',
    author: 'Itamar Vieira Junior',
    condition: 'Novo',
  },
]

export default function TradeProposal() {
  const toast = useToast()
  const { bookId } = useParams()
  const book = books.find((item) => item.id === bookId)
  const [offeredBookId, setOfferedBookId] = useState(userBooks[0].id)
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  if (!book) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center rounded-2xl border border-line/45 bg-white p-6 text-center shadow-sm">
        <BookOpen size={36} className="text-brand-deep" />
        <h1 className="mt-4 text-xl font-semibold text-ink">
          Livro nao encontrado
        </h1>
        <p className="mt-2 text-sm text-ink-dim">
          Nao encontramos o livro solicitado para esta proposta de troca.
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

  const offeredBook = userBooks.find((item) => item.id === offeredBookId)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    toast.success({
      title: 'Proposta enviada',
      message: 'Aguardando resposta do outro usuario.',
    })
  }

  return (
    <main className="mx-auto w-full max-w-6xl">
      <Link
        to={`/books/${book.id}`}
        className="mb-5 inline-flex items-center gap-2 rounded-lg border border-line/55 bg-white px-3 py-2 text-sm font-medium text-ink-dim shadow-sm transition-colors hover:border-accent/35 hover:text-brand-deep"
      >
        <ArrowLeft size={16} />
        Voltar ao livro
      </Link>

      <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="overflow-hidden rounded-2xl border border-line/45 bg-white shadow-sm">
          <div className="h-1.5 bg-gradient-to-r from-accent via-brand-deep to-accent" />
          <div className="p-4 sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-deep">
              Livro solicitado
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-[112px_1fr]">
              <div className="aspect-[3/4] overflow-hidden rounded-xl border border-line/35 bg-canvas/35 shadow-sm">
                <img
                  src={book.cover}
                  alt={`Capa do livro ${book.title}`}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-semibold leading-tight text-ink">
                  {book.title}
                </h1>
                <p className="mt-2 text-sm font-medium text-ink-muted">
                  {book.author}
                </p>
                <p className="mt-4 text-sm leading-6 text-ink-dim">
                  {book.description}
                </p>
              </div>
            </div>

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
          </div>
        </article>

        <article className="rounded-2xl border border-line/45 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="border-l-4 border-brand-deep pl-3 text-base font-semibold text-ink">
            Propor troca
          </h2>

          {submitted ? (
            <div className="mt-5 rounded-xl border border-accent/25 bg-[#fbfaf7] p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={22} className="mt-0.5 text-accent" />
                <div>
                  <p className="text-sm font-semibold text-ink">
                    Proposta enviada
                  </p>
                  <p className="mt-1 text-sm leading-6 text-ink-dim">
                    Sua oferta de troca por {offeredBook?.title} foi registrada
                    para avaliacao de {book.owner}.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm font-semibold text-ink">
                Livro que voce oferece
              </span>
              <select
                value={offeredBookId}
                onChange={(event) => setOfferedBookId(event.target.value)}
                className="mt-2 h-11 w-full rounded-lg border border-line/55 bg-white px-3 text-sm font-medium text-ink shadow-sm outline-none transition-colors focus:border-accent"
              >
                {userBooks.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title} - {item.author} ({item.condition})
                  </option>
                ))}
              </select>
            </label>

            <div className="rounded-lg border border-line/35 bg-[#fbfaf7] px-3 py-2.5">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                Oferta selecionada
              </p>
              <p className="mt-1 text-sm font-semibold text-ink">
                {offeredBook?.title}
              </p>
              <p className="mt-1 text-sm text-ink-dim">
                {offeredBook?.author} · {offeredBook?.condition}
              </p>
            </div>

            <label className="block">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
                <MessageSquareText size={16} className="text-brand-deep" />
                Mensagem opcional
              </span>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={5}
                placeholder="Combine detalhes sobre retirada, entrega ou estado do livro."
                className="mt-2 w-full resize-none rounded-lg border border-line/55 bg-white px-3 py-2.5 text-sm leading-6 text-ink shadow-sm outline-none transition-colors placeholder:text-ink-muted focus:border-accent"
              />
            </label>

            <button
              type="submit"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep sm:w-auto"
            >
              <Send size={17} />
              Enviar proposta
            </button>
          </form>
        </article>
      </section>
    </main>
  )
}
