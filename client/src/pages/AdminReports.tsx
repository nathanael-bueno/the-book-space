import {
  AlertTriangle,
  Check,
  Eye,
  MessageSquareWarning,
  ShieldAlert,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'

type ReportStatus = 'Pendente' | 'Aprovada' | 'Rejeitada'

type Report = {
  id: string
  reason: string
  target: string
  author: string
  createdAt: string
  status: ReportStatus
}

const initialReports: Report[] = [
  {
    id: 'r-1',
    reason: 'Spam recorrente no feed',
    target: '@leitorRapido',
    author: '@ana',
    createdAt: 'Hoje, 09:12',
    status: 'Pendente',
  },
  {
    id: 'r-2',
    reason: 'Linguagem ofensiva em comentario',
    target: 'Post #842',
    author: '@carlos',
    createdAt: 'Hoje, 08:33',
    status: 'Pendente',
  },
  {
    id: 'r-3',
    reason: 'Tentativa de golpe em troca',
    target: 'Troca #211',
    author: '@marta',
    createdAt: 'Ontem, 18:05',
    status: 'Pendente',
  },
]

export default function AdminReports() {
  const [reports, setReports] = useState<Report[]>(initialReports)
  const pendingCount = useMemo(
    () => reports.filter((report) => report.status === 'Pendente').length,
    [reports]
  )

  function updateStatus(id: string, status: ReportStatus) {
    setReports((prev) =>
      prev.map((report) => (report.id === id ? { ...report, status } : report))
    )
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-2xl border border-line/45 bg-white shadow-sm">
        <div className="h-1.5 bg-gradient-to-r from-accent via-brand-deep to-accent" />
        <div className="p-4 sm:p-5">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-deep">
            <ShieldAlert size={14} />
            Admin {'>'} Moderacao
          </p>
          <h1 className="mt-1 text-xl font-semibold text-ink sm:text-2xl">
            Denuncias da comunidade
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Fluxo mock de revisao, aprovacao e rejeicao.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-accent/25 bg-[#fbfaf7] px-3 py-2 text-sm font-medium text-ink">
            <AlertTriangle size={16} className="text-accent" />
            {pendingCount} pendentes para analise
          </div>
        </div>
      </section>

      <section className="space-y-3">
        {reports.map((report) => {
          const resolved = report.status !== 'Pendente'
          return (
            <article
              key={report.id}
              className="rounded-2xl border border-line/45 bg-white p-4 shadow-sm sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-deep">
                    <MessageSquareWarning size={14} />
                    {report.target}
                  </p>
                  <h2 className="mt-1 text-base font-semibold text-ink">
                    {report.reason}
                  </h2>
                  <p className="mt-1 text-sm text-ink-muted">
                    Denunciante: {report.author} · {report.createdAt}
                  </p>
                </div>
                <span
                  className={`inline-flex rounded-lg border px-2 py-1 text-xs font-semibold ${
                    report.status === 'Aprovada'
                      ? 'border-accent/25 bg-[#fbfaf7] text-accent'
                      : report.status === 'Rejeitada'
                        ? 'border-line/40 bg-white text-ink-dim'
                        : 'border-brand-deep/20 bg-[#fbfaf7] text-brand-deep'
                  }`}
                >
                  {report.status}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-line/55 bg-white px-3 text-sm font-medium text-ink-dim transition-colors hover:border-accent/35 hover:text-brand-deep"
                >
                  <Eye size={16} />
                  Ver contexto
                </button>
                <button
                  type="button"
                  disabled={resolved}
                  onClick={() => updateStatus(report.id, 'Aprovada')}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-3 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Check size={16} />
                  Aprovar acao
                </button>
                <button
                  type="button"
                  disabled={resolved}
                  onClick={() => updateStatus(report.id, 'Rejeitada')}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-line/55 bg-white px-3 text-sm font-medium text-ink-dim transition-colors hover:border-accent/35 hover:text-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <X size={16} />
                  Rejeitar
                </button>
              </div>
            </article>
          )
        })}
      </section>
    </div>
  )
}
