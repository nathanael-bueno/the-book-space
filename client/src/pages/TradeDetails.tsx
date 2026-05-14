import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock3,
  MessageSquareText,
  Repeat2,
  X,
} from 'lucide-react'
import { ApiError } from '../services/http'
import { getCurrentUserId } from '../services/auth'
import {
  getTrade,
  updateTradeStatus,
  type ApiTrade,
  type ApiTradeBook,
} from '../services/trades'
import { useToast } from '../stores/useToast'

const timeline = [
  { key: 'pendente', label: 'Proposta enviada', text: 'A troca foi criada.' },
  { key: 'aceita', label: 'Troca aceita', text: 'Combine entrega no chat.' },
  { key: 'concluida', label: 'Concluida', text: 'Livros recebidos.' },
]

const statusStep: Record<ApiTrade['status'], number> = {
  pendente: 0,
  aceita: 1,
  concluida: 2,
  recusada: 0,
  cancelada: 0,
}

function BookCard({ book, label }: { book?: ApiTradeBook; label: string }) {
  return (
    <article className="rounded-xl border border-line/45 bg-white p-3 shadow-sm sm:p-3.5">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-deep">
        {label}
      </p>
      <div className="mt-4 flex gap-2.5">
        <div className="flex h-16 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line/35 bg-[#fbfaf7] text-brand-deep">
          {book?.fotos?.[0] ? (
            <img
              src={book.fotos[0]}
              alt={`Capa do livro ${book.titulo}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-[11px] font-medium text-ink-muted">
              Sem capa
            </span>
          )}
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-ink">
            {book?.titulo ?? 'Titulo indisponivel'}
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            {book?.autor ?? 'Autor indisponivel'}
          </p>
          <p className="mt-3 text-sm leading-6 text-ink-dim">
            {book?.estado_conservacao ?? 'Estado nao informado'}
          </p>
        </div>
      </div>
    </article>
  )
}

export default function TradeDetails() {
  const toast = useToast()
  const { tradeId } = useParams()
  const hasInvalidTradeId = !tradeId
  const currentUserId = useMemo(() => getCurrentUserId(), [])
  const [trade, setTrade] = useState<ApiTrade | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!tradeId) return
    const safeTradeId = tradeId

    let active = true

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await getTrade(safeTradeId)
        if (!active) return
        setTrade(response.data)
      } catch (err) {
        if (!active) return
        setError(
          err instanceof ApiError
            ? err.message
            : 'Nao foi possivel carregar os detalhes da troca.'
        )
      } finally {
        if (active) setIsLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [tradeId])

  if (hasInvalidTradeId) {
    return (
      <main className="mx-auto w-full space-y-3">
        <section className="rounded-xl border border-brand-deep/25 bg-brand-deep/5 p-3 text-sm font-medium text-brand-deep shadow-sm sm:p-3.5">
          Troca invalida.
        </section>
      </main>
    )
  }

  async function runAction(
    action: 'aceitar' | 'recusar' | 'cancelar' | 'confirmar'
  ) {
    if (!trade) return
    setIsSaving(true)
    try {
      const response = await updateTradeStatus(trade.id, action)
      setTrade(response.data)
      toast.success({ title: 'Status atualizado', message: response.message })
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Nao foi possivel atualizar o status da troca.'
      toast.error({ title: 'Erro na acao', message })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto w-full space-y-3">
        <section className="rounded-xl border border-line/45 bg-white p-3 text-sm text-ink-dim shadow-sm sm:p-3.5">
          Carregando troca...
        </section>
      </main>
    )
  }

  if (!trade || error) {
    return (
      <main className="mx-auto w-full space-y-3">
        <section className="rounded-xl border border-brand-deep/25 bg-brand-deep/5 p-3 text-sm font-medium text-brand-deep shadow-sm sm:p-3.5">
          {error ?? 'Troca nao encontrada.'}
        </section>
      </main>
    )
  }

  const activeStep = statusStep[trade.status]
  const isProponent = trade.id_usuario_proponente === currentUserId
  const isRecipient = trade.id_usuario_destinatario === currentUserId
  const canReview = trade.status === 'concluida'

  return (
    <main className="mx-auto w-full space-y-3">
      <Link
        to="/app/trades"
        className="inline-flex items-center gap-2 rounded-lg border border-line/55 bg-white px-3 py-2 text-sm font-medium text-ink-dim shadow-sm transition-colors hover:border-accent/35 hover:text-brand-deep"
      >
        <ArrowLeft size={16} />
        Voltar para trocas
      </Link>

      <section className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Status da troca</h1>
          <p className="mt-1 max-w-2xl text-sm leading-5 text-ink-dim">
            Veja a etapa atual da proposta e avance para o chat quando precisar
            alinhar a entrega.
          </p>
        </div>
        <Link
          to={`/app/trades/${trade.id}/chat`}
          className="inline-flex h-9 w-fit items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep"
        >
          <MessageSquareText size={16} />
          Abrir chat
        </Link>
      </section>

      <section className="rounded-xl border border-line/45 bg-white p-3 shadow-sm sm:p-3.5">
        <div>
          <div className="grid gap-2.5 md:grid-cols-3">
            {timeline.map((item, index) => {
              const isDone = index <= activeStep
              return (
                <div
                  key={item.key}
                  className="rounded-lg border border-line/35 bg-[#fbfaf7] px-3 py-2.5"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        isDone
                          ? 'bg-accent text-white'
                          : 'border border-line/55 bg-white text-ink-muted'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 size={17} />
                      ) : (
                        <Clock3 size={17} />
                      )}
                    </span>
                    <p className="text-sm font-semibold text-ink">
                      {item.label}
                    </p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-ink-dim">
                    {item.text}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-2.5 lg:grid-cols-2">
        <BookCard book={trade.requested_book} label="Livro solicitado" />
        <BookCard book={trade.offered_book} label="Livro oferecido" />
      </section>

      <section className="rounded-xl border border-line/45 bg-white p-3 shadow-sm sm:p-3.5">
        <h2 className="border-l-4 border-brand-deep pl-3 text-base font-semibold text-ink">
          Acoes
        </h2>
        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
          {isRecipient && trade.status === 'pendente' ? (
            <>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => runAction('aceitar')}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep disabled:opacity-60"
              >
                <Check size={17} />
                Aceitar
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => runAction('recusar')}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-line/55 bg-white px-4 text-sm font-semibold text-ink-dim shadow-sm transition-colors hover:border-accent/35 hover:text-brand-deep disabled:opacity-60"
              >
                <X size={17} />
                Recusar
              </button>
            </>
          ) : null}

          {isProponent && trade.status === 'pendente' ? (
            <button
              type="button"
              disabled={isSaving}
              onClick={() => runAction('cancelar')}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-line/55 bg-white px-4 text-sm font-semibold text-ink-dim shadow-sm transition-colors hover:border-accent/35 hover:text-brand-deep disabled:opacity-60"
            >
              <X size={17} />
              Cancelar
            </button>
          ) : null}

          {trade.status === 'aceita' ? (
            <button
              type="button"
              disabled={isSaving}
              onClick={() => runAction('confirmar')}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-line/55 bg-white px-4 text-sm font-semibold text-ink-dim shadow-sm transition-colors hover:border-accent/35 hover:text-brand-deep disabled:opacity-60"
            >
              <Repeat2 size={17} />
              Confirmar recebimento
            </button>
          ) : null}

          {canReview ? (
            <Link
              to={`/app/trades/${trade.id}/review`}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-line/55 bg-white px-4 text-sm font-semibold text-ink-dim shadow-sm transition-colors hover:border-accent/35 hover:text-brand-deep"
            >
              Avaliar troca
            </Link>
          ) : null}
        </div>
      </section>
    </main>
  )
}
