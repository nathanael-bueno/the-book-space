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

type TradeStatus = 'pending' | 'accepted' | 'completed'

type Trade = {
  id: string
  status: TradeStatus
  requestedTitle: string
  offeredTitle: string
  partner: string
  updatedAt: string
  note: string
}

const trades: Trade[] = [
  {
    id: 'trade-1',
    status: 'pending',
    requestedTitle: 'Grande Sertao: Veredas',
    offeredTitle: 'Ensaio Sobre a Cegueira',
    partner: 'Ana Ribeiro',
    updatedAt: '29 abr 2026',
    note: 'Aguardando resposta da dona do livro.',
  },
  {
    id: 'trade-2',
    status: 'accepted',
    requestedTitle: 'A Hora da Estrela',
    offeredTitle: 'Torto Arado',
    partner: 'Eduarda Nunes',
    updatedAt: '28 abr 2026',
    note: 'Troca aceita. Combine retirada pelo chat.',
  },
  {
    id: 'trade-3',
    status: 'completed',
    requestedTitle: 'Capitaes da Areia',
    offeredTitle: 'Quarto de Despejo',
    partner: 'Bruno Costa',
    updatedAt: '24 abr 2026',
    note: 'Troca concluida. Avalie a experiencia.',
  },
]

const statusInfo: Record<
  TradeStatus,
  { label: string; icon: typeof Clock3; className: string }
> = {
  pending: {
    label: 'Pendente',
    icon: Clock3,
    className: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  accepted: {
    label: 'Aceita',
    icon: CheckCircle2,
    className: 'border-accent/25 bg-[#fbfaf7] text-accent',
  },
  completed: {
    label: 'Concluida',
    icon: Star,
    className: 'border-brand-deep/20 bg-[#fbfaf7] text-brand-deep',
  },
}

export default function TradesHistory() {
  return (
    <main className="mx-auto w-full max-w-6xl">
      <section className="overflow-hidden rounded-2xl border border-line/45 bg-white shadow-sm">
        <div className="h-1.5 bg-gradient-to-r from-accent via-brand-deep to-accent" />
        <div className="p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-deep">
                Trocas
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-ink">
                Historico de trocas
              </h1>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-line/35 bg-[#fbfaf7] px-3 py-2 text-sm font-semibold text-ink-dim">
              <Repeat2 size={16} className="text-brand-deep" />
              {trades.length} registros
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-4">
        {trades.map((trade) => {
          const currentStatus = statusInfo[trade.status]
          const StatusIcon = currentStatus.icon

          return (
            <article
              key={trade.id}
              className="rounded-2xl border border-line/45 bg-white p-4 shadow-sm sm:p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold ${currentStatus.className}`}
                    >
                      <StatusIcon size={14} />
                      {currentStatus.label}
                    </span>
                    <span className="text-sm text-ink-muted">
                      Atualizada em {trade.updatedAt}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
                    <div className="rounded-lg border border-line/35 bg-[#fbfaf7] px-3 py-2.5">
                      <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                        Voce pediu
                      </p>
                      <p className="mt-1 text-sm font-semibold text-ink">
                        {trade.requestedTitle}
                      </p>
                    </div>
                    <Repeat2
                      size={18}
                      className="hidden text-brand-deep md:block"
                    />
                    <div className="rounded-lg border border-line/35 bg-[#fbfaf7] px-3 py-2.5">
                      <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                        Voce ofereceu
                      </p>
                      <p className="mt-1 text-sm font-semibold text-ink">
                        {trade.offeredTitle}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-ink-dim">
                    {trade.note} Parceiro: {trade.partner}.
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                  <Link
                    to={`/trades/${trade.id}`}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep"
                  >
                    Detalhes
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    to={`/trades/${trade.id}/chat`}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-line/55 bg-white px-4 text-sm font-semibold text-ink-dim shadow-sm transition-colors hover:border-accent/35 hover:text-brand-deep"
                  >
                    <MessageSquareText size={16} />
                    Chat
                  </Link>
                  {trade.status === 'completed' ? (
                    <Link
                      to={`/trades/${trade.id}/review`}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-line/55 bg-white px-4 text-sm font-semibold text-ink-dim shadow-sm transition-colors hover:border-accent/35 hover:text-brand-deep"
                    >
                      <Star size={16} />
                      Avaliar
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-line/55 bg-white px-4 text-sm font-semibold text-ink-muted shadow-sm"
                    >
                      <XCircle size={16} />
                      Aguardando
                    </button>
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </section>
    </main>
  )
}
