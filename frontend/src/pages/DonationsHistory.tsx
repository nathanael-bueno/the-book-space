import { useEffect, useMemo, useState } from 'react'
import { Building2 } from 'lucide-react'
import { ApiError } from '../services/http'
import {
  getMyDonationHistory,
  type DonationHistoryItem,
} from '../services/donations'
import { StatusBadge } from '../components/ui/StatusBadge'

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
  const [donations, setDonations] = useState<DonationHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadDonations() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await getMyDonationHistory({
          status: 'concluida',
          perPage: 50,
        })
        if (!active) return
        setDonations(response)
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
      donations.map((donation) => ({
        id: donation.id,
        institution: donation.institutionName,
        book: `${donation.bookTitle} - ${donation.bookAuthor}`,
        status: 'Concluida',
        date: formatDate(donation.updatedAt ?? donation.createdAt),
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
              Acompanhe as doacoes finalizadas e mantenha um historico da sua
              contribuicao com instituicoes parceiras.
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
          return (
            <article
              key={donation.id}
              className="grid gap-2 rounded-xl border border-line/45 bg-white p-3 shadow-sm sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">
                  {donation.book}
                </p>
                <p className="mt-1 text-xs text-ink-dim">
                  {donation.institution}
                </p>
                <p className="mt-1.5 text-xs text-ink-muted">
                  Registro confirmado em {donation.date}.
                </p>
              </div>
              <StatusBadge status="doado" className="w-fit" />
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
