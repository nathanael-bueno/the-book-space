import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock3,
  HandHeart,
} from 'lucide-react'

const donations = [
  {
    id: 'don-1',
    institution: 'Biblioteca Comunitaria Aurora',
    book: 'Dom Casmurro',
    status: 'Concluida',
    date: '18 abr 2026',
  },
  {
    id: 'don-2',
    institution: 'Instituto Paginas Abertas',
    book: 'A Hora da Estrela',
    status: 'Em analise',
    date: '22 abr 2026',
  },
  {
    id: 'don-3',
    institution: 'Casa de Leitura Mar do Norte',
    book: 'Capitaes da Areia',
    status: 'Entrega combinada',
    date: '25 abr 2026',
  },
]

export default function DonationsHistory() {
  return (
    <main className="mx-auto w-full max-w-5xl space-y-5">
      <Link
        to="/profile"
        className="inline-flex items-center gap-2 rounded-lg border border-line/55 bg-white px-3 py-2 text-sm font-medium text-ink-dim shadow-sm transition-colors hover:border-accent/35 hover:text-brand-deep"
      >
        <ArrowLeft size={16} />
        Voltar
      </Link>

      <section className="overflow-hidden rounded-2xl border border-line/45 bg-white shadow-sm">
        <div className="h-1.5 bg-gradient-to-r from-accent via-brand-deep to-accent" />
        <div className="p-4 sm:p-5">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-deep">
            <HandHeart size={15} />
            Doacoes
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-ink">
            Historico de doacoes
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-dim">
            Acompanhe livros enviados para instituicoes e o andamento de cada
            solicitacao.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-line/45 bg-white p-4 shadow-sm sm:p-5">
        <div className="space-y-3">
          {donations.map((donation) => {
            const isDone = donation.status === 'Concluida'

            return (
              <article
                key={donation.id}
                className="grid gap-3 rounded-xl border border-line/35 bg-[#fbfaf7] p-3 sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent/15 bg-white text-brand-deep">
                    <Building2 size={21} />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-ink">
                      {donation.institution}
                    </h2>
                    <p className="mt-1 text-sm text-ink-dim">{donation.book}</p>
                    <p className="mt-2 text-xs font-medium text-ink-muted">
                      {donation.date}
                    </p>
                  </div>
                </div>

                <span
                  className={[
                    'inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-semibold',
                    isDone
                      ? 'border-accent/25 bg-white text-brand-deep'
                      : 'border-line/45 bg-white text-ink-dim',
                  ].join(' ')}
                >
                  {isDone ? <CheckCircle2 size={16} /> : <Clock3 size={16} />}
                  {donation.status}
                </span>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}
