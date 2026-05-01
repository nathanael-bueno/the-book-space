import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  MessageSquareText,
  Repeat2,
  X,
} from 'lucide-react'

type TradeStatus = 'pending' | 'accepted' | 'completed'

type BookSummary = {
  title: string
  author: string
  condition: string
  owner: string
}

type Trade = {
  id: string
  status: TradeStatus
  partner: string
  requested: BookSummary
  offered: BookSummary
}

const trades: Trade[] = [
  {
    id: 'trade-1',
    status: 'pending',
    partner: 'Ana Ribeiro',
    requested: {
      title: 'Grande Sertao: Veredas',
      author: 'Joao Guimaraes Rosa',
      condition: 'Bom',
      owner: 'Ana Ribeiro',
    },
    offered: {
      title: 'Ensaio Sobre a Cegueira',
      author: 'Jose Saramago',
      condition: 'Muito bom',
      owner: 'Voce',
    },
  },
  {
    id: 'trade-2',
    status: 'accepted',
    partner: 'Eduarda Nunes',
    requested: {
      title: 'A Hora da Estrela',
      author: 'Clarice Lispector',
      condition: 'Muito bom',
      owner: 'Eduarda Nunes',
    },
    offered: {
      title: 'Torto Arado',
      author: 'Itamar Vieira Junior',
      condition: 'Novo',
      owner: 'Voce',
    },
  },
  {
    id: 'trade-3',
    status: 'completed',
    partner: 'Bruno Costa',
    requested: {
      title: 'Capitaes da Areia',
      author: 'Jorge Amado',
      condition: 'Muito bom',
      owner: 'Bruno Costa',
    },
    offered: {
      title: 'Quarto de Despejo',
      author: 'Carolina Maria de Jesus',
      condition: 'Bom',
      owner: 'Voce',
    },
  },
]

const timeline = [
  { key: 'pending', label: 'Proposta enviada', text: 'A troca foi criada.' },
  { key: 'accepted', label: 'Troca aceita', text: 'Combine entrega no chat.' },
  { key: 'completed', label: 'Concluida', text: 'Livros recebidos.' },
]

const statusStep: Record<TradeStatus, number> = {
  pending: 0,
  accepted: 1,
  completed: 2,
}

function BookCard({ book, label }: { book: BookSummary; label: string }) {
  return (
    <article className="rounded-2xl border border-line/45 bg-white p-4 shadow-sm sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-deep">
        {label}
      </p>
      <div className="mt-4 flex gap-3">
        <div className="flex h-16 w-12 shrink-0 items-center justify-center rounded-lg border border-line/35 bg-[#fbfaf7] text-brand-deep">
          <BookOpen size={22} />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-ink">{book.title}</h2>
          <p className="mt-1 text-sm text-ink-muted">{book.author}</p>
          <p className="mt-3 text-sm leading-6 text-ink-dim">
            {book.condition} · {book.owner}
          </p>
        </div>
      </div>
    </article>
  )
}

export default function TradeDetails() {
  const { tradeId } = useParams()
  const trade = trades.find((item) => item.id === tradeId) ?? trades[0]
  const [actionMessage, setActionMessage] = useState('')
  const activeStep = statusStep[trade.status]

  return (
    <main className="mx-auto w-full max-w-6xl">
      <Link
        to="/trades"
        className="mb-5 inline-flex items-center gap-2 rounded-lg border border-line/55 bg-white px-3 py-2 text-sm font-medium text-ink-dim shadow-sm transition-colors hover:border-accent/35 hover:text-brand-deep"
      >
        <ArrowLeft size={16} />
        Voltar para trocas
      </Link>

      <section className="overflow-hidden rounded-2xl border border-line/45 bg-white shadow-sm">
        <div className="h-1.5 bg-gradient-to-r from-accent via-brand-deep to-accent" />
        <div className="p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-deep">
                Troca com {trade.partner}
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-ink">
                Status da troca
              </h1>
            </div>
            <Link
              to={`/trades/${trade.id}/chat`}
              className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep"
            >
              <MessageSquareText size={16} />
              Abrir chat
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {timeline.map((item, index) => {
              const isDone = index <= activeStep
              return (
                <div
                  key={item.key}
                  className="rounded-lg border border-line/35 bg-[#fbfaf7] px-3 py-3"
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

      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        <BookCard book={trade.requested} label="Livro solicitado" />
        <BookCard book={trade.offered} label="Livro oferecido" />
      </section>

      <section className="mt-5 rounded-2xl border border-line/45 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="border-l-4 border-brand-deep pl-3 text-base font-semibold text-ink">
          Acoes
        </h2>
        {actionMessage ? (
          <p className="mt-4 rounded-lg border border-accent/25 bg-[#fbfaf7] px-3 py-2.5 text-sm font-semibold text-brand-deep">
            {actionMessage}
          </p>
        ) : null}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={() => setActionMessage('Troca aceita no mock.')}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep"
          >
            <Check size={17} />
            Aceitar
          </button>
          <button
            type="button"
            onClick={() => setActionMessage('Troca recusada no mock.')}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-line/55 bg-white px-4 text-sm font-semibold text-ink-dim shadow-sm transition-colors hover:border-accent/35 hover:text-brand-deep"
          >
            <X size={17} />
            Recusar
          </button>
          <button
            type="button"
            onClick={() => setActionMessage('Troca cancelada no mock.')}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-line/55 bg-white px-4 text-sm font-semibold text-ink-dim shadow-sm transition-colors hover:border-accent/35 hover:text-brand-deep"
          >
            <X size={17} />
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => setActionMessage('Recebimento confirmado no mock.')}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-line/55 bg-white px-4 text-sm font-semibold text-ink-dim shadow-sm transition-colors hover:border-accent/35 hover:text-brand-deep"
          >
            <Repeat2 size={17} />
            Confirmar troca
          </button>
        </div>
      </section>
    </main>
  )
}
