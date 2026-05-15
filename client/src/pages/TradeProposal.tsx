import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  MessageSquareText,
  Send,
  UserRound,
} from 'lucide-react'
import { getCurrentUserId } from '../services/auth'
import { getBook, getMyBooks, type ApiBook } from '../services/books'
import { ApiError } from '../services/http'
import { createTrade } from '../services/trades'
import { useToast } from '../stores/useToast'

export default function TradeProposal() {
  const toast = useToast()
  const { bookId } = useParams()
  const hasInvalidBookId = !bookId
  const [requestedBook, setRequestedBook] = useState<ApiBook | null>(null)
  const [userBooks, setUserBooks] = useState<ApiBook[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [offeredBookId, setOfferedBookId] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!bookId) return
    const safeBookId = bookId

    let active = true

    async function loadData() {
      setIsLoading(true)

      try {
        const [bookResponse, myBooksResponse] = await Promise.all([
          getBook(safeBookId),
          getMyBooks(),
        ])

        if (!active) return

        const filteredBooks = myBooksResponse.data.filter(
          (item) => item.status === 'disponivel'
        )

        setRequestedBook(bookResponse.data)
        setUserBooks(filteredBooks)
        setOfferedBookId(filteredBooks[0]?.id ?? '')
      } catch (err) {
        if (!active) return
        toast.error({
          title: 'Erro',
          message:
            err instanceof ApiError
              ? err.message
              : 'Nao foi possivel carregar os dados da proposta.',
        })
      } finally {
        if (active) setIsLoading(false)
      }
    }

    loadData()

    return () => {
      active = false
    }
  }, [bookId])

  const offeredBook = useMemo(
    () => userBooks.find((item) => item.id === offeredBookId),
    [offeredBookId, userBooks]
  )

  const currentUserId = useMemo(() => getCurrentUserId(), [])
  const isOwnRequestedBook =
    Boolean(requestedBook) &&
    Boolean(currentUserId) &&
    requestedBook?.id_usuario_dono === currentUserId
  const isRequestedBookUnavailable =
    Boolean(requestedBook) && requestedBook?.status !== 'disponivel'

  const blockReason = useMemo(() => {
    if (isOwnRequestedBook) {
      return 'Este livro e seu. Nao e possivel propor troca para o proprio livro.'
    }

    if (isRequestedBookUnavailable) {
      return 'Este livro nao esta disponivel para troca no momento.'
    }

    if (!userBooks.length) {
      return 'Voce nao tem livros disponiveis para oferecer.'
    }

    return null
  }, [isOwnRequestedBook, isRequestedBookUnavailable, userBooks.length])

  const isProposalBlocked = Boolean(blockReason)

  if (hasInvalidBookId) {
    return (
      <main className="mx-auto w-full space-y-3">
        <section className="rounded-xl border border-brand-deep/25 bg-brand-deep/5 p-3 text-sm font-medium text-brand-deep shadow-sm sm:p-3.5">
          Livro invalido.
        </section>
      </main>
    )
  }

  if (!requestedBook && !isLoading) {
    return (
      <main className="mx-auto w-full space-y-3">
        <section className="rounded-xl border border-brand-deep/25 bg-brand-deep/5 p-3 text-sm font-medium text-brand-deep shadow-sm sm:p-3.5">
          <h1 className="mt-4 text-xl font-semibold text-ink">
            Livro nao encontrado
          </h1>
          <p className="mt-2 text-sm text-ink-dim">
            Nao encontramos o livro solicitado para esta proposta de troca.
          </p>
          <Link
            to="/app/feed"
            className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep"
          >
            <ArrowLeft size={16} />
            Voltar para home
          </Link>
        </section>
      </main>
    )
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!requestedBook || !offeredBookId || isProposalBlocked) return

    setIsSubmitting(true)

    try {
      const response = await createTrade({
        id_livro_solicitado: requestedBook.id,
        id_livro_oferecido: offeredBookId,
        mensagem: message.trim() || undefined,
      })
      setSubmitted(true)
      toast.success({
        title: 'Proposta enviada',
        message: response.message,
      })
    } catch (err) {
      const apiMessage =
        err instanceof ApiError
          ? err.message
          : 'Nao foi possivel enviar sua proposta.'
      toast.error({ title: 'Erro ao enviar', message: apiMessage })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="mx-auto w-full space-y-3">
      <section className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            to={`/app/books/${requestedBook?.id ?? ''}`}
            className="inline-flex items-center gap-2 rounded-lg border border-line/55 bg-white px-3 py-2 text-sm font-medium text-ink-dim shadow-sm transition-colors hover:border-accent/35 hover:text-brand-deep"
          >
            <ArrowLeft size={16} />
            Voltar ao livro
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-ink">Propor troca</h1>
            <p className="mt-1 max-w-2xl text-sm leading-5 text-ink-dim">
              Selecione um livro seu e envie uma mensagem para iniciar a troca.
            </p>
          </div>
        </div>
      </section>

      {isLoading ? (
        <section className="rounded-xl border border-line/45 bg-white p-3 text-sm text-ink-dim shadow-sm sm:p-3.5">
          Carregando proposta...
        </section>
      ) : null}

      <section className="grid gap-2.5 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-xl border border-line/45 bg-white p-3 shadow-sm sm:p-3.5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-deep">
              Livro solicitado
            </p>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-[112px_1fr]">
              <div className="aspect-[3/4] overflow-hidden rounded-xl border border-line/35 bg-canvas/35 shadow-sm">
                <img
                  src={requestedBook?.fotos?.[0] ?? ''}
                  alt={`Capa do livro ${requestedBook?.titulo ?? ''}`}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-ink">
                  {requestedBook?.titulo}
                </h1>
                <p className="mt-2 text-sm font-medium text-ink-muted">
                  {requestedBook?.autor}
                </p>
                <p className="mt-4 text-sm leading-6 text-ink-dim">
                  {requestedBook?.descricao ?? 'Sem descricao informada.'}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              <div className="rounded-lg border border-line/35 bg-[#fbfaf7] px-3 py-2.5">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                  Estado
                </p>
                <p className="mt-1 text-sm font-semibold text-ink">
                  {requestedBook?.estado_conservacao}
                </p>
              </div>
              <div className="rounded-lg border border-line/35 bg-[#fbfaf7] px-3 py-2.5">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                  Local
                </p>
                <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-ink">
                  <MapPin size={14} className="text-brand-deep" />
                  {requestedBook?.cidade ?? 'Nao informado'}
                </p>
              </div>
              <div className="rounded-lg border border-line/35 bg-[#fbfaf7] px-3 py-2.5">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                  Dono
                </p>
                <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-ink">
                  <UserRound size={14} className="text-brand-deep" />
                  {requestedBook?.owner?.nome_completo ?? 'Usuario'}
                </p>
              </div>
            </div>
          </div>
        </article>

        <article className="rounded-xl border border-line/45 bg-white p-3 shadow-sm sm:p-3.5">
          <h2 className="border-l-4 border-brand-deep pl-3 text-base font-semibold text-ink">
            Propor troca
          </h2>

          {submitted ? (
            <div className="mt-5 rounded-xl border border-accent/25 bg-[#fbfaf7] p-3 sm:p-3.5">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={22} className="mt-0.5 text-accent" />
                <div>
                  <p className="text-sm font-semibold text-ink">
                    Proposta enviada
                  </p>
                  <p className="mt-1 text-sm leading-6 text-ink-dim">
                    Sua oferta de troca por {offeredBook?.titulo} foi registrada
                    para avaliacao de{' '}
                    {requestedBook?.owner?.nome_completo ?? 'Usuario'}.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {blockReason ? (
            <div className="mt-5 rounded-xl border border-brand-deep/25 bg-brand-deep/5 p-3 text-sm font-medium text-brand-deep">
              {blockReason}
            </div>
          ) : null}

          <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
            <label className={blockReason ? 'hidden' : 'block'}>
              <span className="text-sm font-semibold text-ink">
                Livro que voce oferece
              </span>
              <select
                value={offeredBookId}
                onChange={(event) => setOfferedBookId(event.target.value)}
                disabled={!userBooks.length || submitted || isProposalBlocked}
                className="mt-2 h-9 w-full rounded-lg border border-line/55 bg-white px-3 text-sm font-medium text-ink shadow-sm outline-none transition-colors focus:border-accent"
              >
                {!userBooks.length ? (
                  <option value="">
                    Nenhum livro disponivel para oferecer
                  </option>
                ) : null}
                {userBooks.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.titulo} - {item.autor} ({item.estado_conservacao})
                  </option>
                ))}
              </select>
            </label>

            {!blockReason ? (
              <div className="rounded-lg border border-line/35 bg-[#fbfaf7] px-3 py-2.5">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                  Oferta selecionada
                </p>
                <p className="mt-1 text-sm font-semibold text-ink">
                  {offeredBook?.titulo ?? '-'}
                </p>
                <p className="mt-1 text-sm text-ink-dim">
                  {offeredBook
                    ? `${offeredBook.autor} · ${offeredBook.estado_conservacao}`
                    : '-'}
                </p>
              </div>
            ) : null}

            {!blockReason ? (
              <label className="block">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
                  <MessageSquareText size={16} className="text-brand-deep" />
                  Mensagem opcional
                </span>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  disabled={submitted}
                  rows={5}
                  placeholder="Combine detalhes sobre retirada, entrega ou estado do livro."
                  className="mt-2 w-full resize-none rounded-lg border border-line/55 bg-white px-3 py-2.5 text-sm leading-6 text-ink shadow-sm outline-none transition-colors placeholder:text-ink-muted focus:border-accent"
                />
              </label>
            ) : null}

            {!blockReason ? (
              <button
                type="submit"
                disabled={!offeredBookId || submitted || isSubmitting}
                className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep sm:w-auto"
              >
                <Send size={17} />
                {isSubmitting ? 'Enviando...' : 'Enviar proposta'}
              </button>
            ) : null}
          </form>
        </article>
      </section>
    </main>
  )
}
