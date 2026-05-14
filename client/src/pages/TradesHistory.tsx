import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  MessageSquareText,
  Repeat2,
  Star,
  XCircle,
} from 'lucide-react'
import { ApiError } from '../services/http'
import { getCurrentUserId } from '../services/auth'
import { listMyTrades, type ApiTrade } from '../services/trades'
import { useToast } from '../stores/useToast'

const statusInfo: Record<
  ApiTrade['status'],
  { label: string; icon: typeof Clock3; className: string }
> = {
  pendente: {
    label: 'Pendente',
    icon: Clock3,
    className: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  aceita: {
    label: 'Aceita',
    icon: CheckCircle2,
    className: 'border-accent/25 bg-[#fbfaf7] text-accent',
  },
  concluida: {
    label: 'Concluida',
    icon: Star,
    className: 'border-brand-deep/20 bg-[#fbfaf7] text-brand-deep',
  },
  recusada: {
    label: 'Recusada',
    icon: XCircle,
    className: 'border-line/35 bg-white text-ink-muted',
  },
  cancelada: {
    label: 'Cancelada',
    icon: XCircle,
    className: 'border-line/35 bg-white text-ink-muted',
  },
}

export default function TradesHistory() {
  const toast = useToast()
  const [trades, setTrades] = useState<ApiTrade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const currentUserId = useMemo(() => getCurrentUserId(), [])

  useEffect(() => {
    let active = true

    async function load() {
      setIsLoading(true)
      try {
        const response = await listMyTrades(30)
        if (!active) return
        setTrades(response.data)
      } catch (err) {
        if (!active) return
        toast.error({
          title: 'Erro',
          message:
            err instanceof ApiError
              ? err.message
              : 'Nao foi possivel carregar seu historico de trocas.',
        })
      } finally {
        if (active) setIsLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  return (
    <main className="mx-auto w-full space-y-3">
      <section className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">
            Historico de trocas
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-5 text-ink-dim">
            Acompanhe o andamento das suas propostas e veja as trocas ja
            finalizadas.
          </p>
        </div>
        <div className="inline-flex h-9 w-fit items-center gap-2 rounded-lg border border-line/35 bg-[#fbfaf7] px-3 text-sm font-semibold text-ink-dim">
          <Repeat2 size={16} className="text-brand-deep" />
          {trades.length} registros
        </div>
      </section>

      {isLoading ? (
        <section className="rounded-xl border border-line/45 bg-white p-3 text-sm text-ink-dim shadow-sm sm:p-3.5">
          Carregando historico de trocas...
        </section>
      ) : null}

      <section className="grid gap-2.5">
        {trades.map((trade) => {
          const currentStatus = statusInfo[trade.status]
          const StatusIcon = currentStatus.icon
          const partner =
            trade.id_usuario_proponente === currentUserId
              ? trade.recipient?.nome_completo
              : trade.proponent?.nome_completo

          return (
            <article
              key={trade.id}
              className="rounded-xl border border-line/45 bg-white p-3 shadow-sm sm:p-3.5"
            >
              <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold ${currentStatus.className}`}
                    >
                      <StatusIcon size={14} />
                      {currentStatus.label}
                    </span>
                    <span className="text-sm text-ink-muted">
                      Atualizada em{' '}
                      {trade.updated_at
                        ? new Date(trade.updated_at).toLocaleDateString('pt-BR')
                        : '-'}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-2.5 md:grid-cols-[1fr_auto_1fr] md:items-center">
                    <div className="rounded-lg border border-line/35 bg-[#fbfaf7] px-3 py-2.5">
                      <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                        Livro solicitado
                      </p>
                      <p className="mt-1 text-sm font-semibold text-ink">
                        {trade.requested_book?.titulo ?? '-'}
                      </p>
                    </div>
                    <Repeat2
                      size={18}
                      className="hidden text-brand-deep md:block"
                    />
                    <div className="rounded-lg border border-line/35 bg-[#fbfaf7] px-3 py-2.5">
                      <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                        Livro oferecido
                      </p>
                      <p className="mt-1 text-sm font-semibold text-ink">
                        {trade.offered_book?.titulo ?? '-'}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-ink-dim">
                    Parceiro: {partner ?? 'Leitor da comunidade'}.
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                  <Link
                    to={`/app/trades/${trade.id}`}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep"
                  >
                    Detalhes
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    to={`/app/trades/${trade.id}/chat`}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-line/55 bg-white px-4 text-sm font-semibold text-ink-dim shadow-sm transition-colors hover:border-accent/35 hover:text-brand-deep"
                  >
                    <MessageSquareText size={16} />
                    Chat
                  </Link>
                </div>
              </div>
            </article>
          )
        })}
      </section>

      {!isLoading && !trades.length ? (
        <section className="ui-empty-state flex flex-col items-center gap-2">
          <Repeat2 size={32} className="text-brand-deep" />
          <p className="text-sm font-medium text-ink">
            Nenhuma troca encontrada.
          </p>
          <p className="text-sm">Suas propostas de troca aparecerao aqui.</p>
        </section>
      ) : null}
    </main>
  )
}
