import { useEffect, useMemo, useState } from 'react'
import { Building2, CheckCircle2, Clock3 } from 'lucide-react'
import { ApiError } from '../services/http'
import { getMyBooks, type ApiBook } from '../services/books'

function formatDate(isoDate?: string) {
  if (!isoDate) return 'Data nao informada'
  const parsed = new Date(isoDate)
  if (Number.isNaN(parsed.getTime())) return 'Data nao informada'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed)
}

export default function DonationsHistory() {
  const [donations, setDonations] = useState<ApiBook[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadDonations() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await getMyBooks()
        if (!active) return
        setDonations(
          response.data.filter(
            (book) => book.status?.toLowerCase().trim() === 'doado'
          )
        )
      } catch (err) {
        if (!active) return
        setError(
          err instanceof ApiError
            ? err.message
            : 'Nao foi possivel carregar o historico de doacoes.'
        )
      } finally {
        if (active) setIsLoading(false)
      }
    }

    loadDonations()

    return () => {
      active = false
    }
  }, [])

  const donationItems = useMemo(
    () =>
      donations.map((book) => ({
        id: book.id,
        institution: 'Instituicao parceira',
        book: `${book.titulo} - ${book.autor}`,
        status: 'Concluida',
        date: formatDate(book.updated_at ?? book.created_at),
      })),
    [donations]
  )

  return (
    <main className="mx-auto w-full space-y-3">
      <section className="">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-ink">
              Historico de doacoes
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-5 text-ink-dim">
              Acompanhe livros enviados para instituicoes e o andamento de cada
              solicitacao.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-2.5">
        {isLoading ? (
          <p className="text-sm text-ink-dim">
            Carregando historico de doacoes...
          </p>
        ) : null}
        {error ? (
          <p className="rounded-xl border border-brand-deep/25 bg-brand-deep/5 p-3 text-sm font-medium text-brand-deep">
            {error}
          </p>
        ) : null}
        {donationItems.map((donation) => {
          const isDone = donation.status === 'Concluida'

          return (
            <article
              key={donation.id}
              className="grid gap-2.5 rounded-xl border border-line/45 bg-white p-3 shadow-sm sm:grid-cols-[1fr_auto] sm:items-center sm:p-3.5"
            >
              <div className="flex items-start gap-2.5">
                <div className="flex h-9 w-11 shrink-0 items-center justify-center rounded-lg border border-accent/15 bg-[#fbfaf7] text-brand-deep">
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
        {!isLoading && !error && donationItems.length === 0 ? (
          <section className="ui-empty-state flex flex-col items-center gap-2">
            <Building2 size={32} className="text-brand-deep" />
            <p className="text-sm font-medium text-ink">
              Voce ainda nao possui doacoes concluidas.
            </p>
            <p className="text-sm">
              Quando finalizar uma doacao, ela aparece aqui.
            </p>
          </section>
        ) : null}
      </section>
    </main>
  )
}
