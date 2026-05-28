import { AlertTriangle, Check, Eye, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import {
  listAdminReports,
  persistReportStatus,
  type AdminReport,
  type AdminReportStatus,
} from '../services/admin'
import { useToast } from '../stores/useToast'

export default function AdminReports() {
  const toast = useToast()
  const [reports, setReports] = useState<AdminReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    id: string
    status: AdminReportStatus
  } | null>(null)

  useEffect(() => {
    let active = true
    async function loadData() {
      setIsLoading(true)
      try {
        const response = await listAdminReports()
        if (!active) return
        setReports(response)
      } catch {
        if (!active) return
        toast.error({
          title: 'Erro',
          message: 'Nao foi possivel carregar denuncias.',
        })
      } finally {
        if (active) setIsLoading(false)
      }
    }
    loadData()
    return () => {
      active = false
    }
  }, [])

  const pendingCount = useMemo(
    () => reports.filter((report) => report.status === 'Pendente').length,
    [reports]
  )

  async function updateStatus(id: string, status: AdminReportStatus) {
    try {
      await persistReportStatus(id, status)
      setReports((prev) =>
        prev.map((report) =>
          report.id === id ? { ...report, status } : report
        )
      )
      toast.success({
        title: 'Status atualizado',
        message: 'Status da denuncia atualizado.',
      })
    } catch {
      toast.error({
        title: 'Erro',
        message: 'Nao foi possivel atualizar o status da denuncia.',
      })
    }
  }

  return (
    <main className="mx-auto w-full space-y-3">
      <section className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Denuncias</h1>
          <p className="mt-1 max-w-2xl text-sm leading-5 text-ink-dim">
            Revisao de denuncias com aprovacao e rejeicao.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-md border border-line/45 bg-[#fbfaf7] px-2 py-0.5 text-xs font-medium text-ink-dim">
          <AlertTriangle size={14} className="text-accent" />
          {pendingCount} pendentes
        </div>
      </section>

      {isLoading ? (
        <p className="rounded-xl border border-line/45 bg-white p-3 text-sm text-ink-dim shadow-sm sm:p-3.5">
          Carregando denuncias...
        </p>
      ) : null}

      {!isLoading && !reports.length ? (
        <section className="ui-empty-state flex flex-col items-center gap-2">
          <AlertTriangle size={32} className="text-brand-deep" />
          <p className="text-sm font-medium text-ink">
            Nenhuma denuncia pendente no momento.
          </p>
          <p className="text-sm">
            Quando houver novas denuncias, elas aparecem aqui.
          </p>
        </section>
      ) : null}

      <section className="space-y-2.5">
        {reports.map((report) => {
          const resolved = report.status !== 'Pendente'
          return (
            <article
              key={report.id}
              className="rounded-xl border border-line/45 bg-white p-3 shadow-sm sm:p-3.5"
            >
              <div className="flex flex-wrap items-start justify-between gap-2.5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-deep">
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
                  className={`inline-flex rounded-md border border-line/45 bg-[#fbfaf7] px-2 py-0.5 text-xs font-medium ${
                    report.status === 'Aprovada'
                      ? 'text-accent'
                      : report.status === 'Rejeitada'
                        ? 'text-ink-dim'
                        : 'text-brand-deep'
                  }`}
                >
                  {report.status}
                </span>
              </div>

              <div className="mt-2.5 flex flex-wrap gap-2 border-t border-line/35 pt-2.5">
                {report.contextPath ? (
                  <Link
                    to={report.contextPath}
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-line/45 bg-white px-3 text-sm font-semibold text-ink-dim transition-colors hover:border-accent/35 hover:text-brand-deep"
                  >
                    <Eye size={16} />
                    Ver contexto
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-line/45 bg-white px-3 text-sm font-semibold text-ink-dim opacity-60"
                  >
                    <Eye size={16} />
                    Ver contexto
                  </button>
                )}
                <button
                  type="button"
                  disabled={resolved}
                  onClick={() =>
                    setPendingStatusChange({
                      id: report.id,
                      status: 'Aprovada',
                    })
                  }
                  className="inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-3 text-sm font-semibold text-white transition-colors hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Check size={16} />
                  Aprovar acao
                </button>
                <button
                  type="button"
                  disabled={resolved}
                  onClick={() =>
                    setPendingStatusChange({
                      id: report.id,
                      status: 'Rejeitada',
                    })
                  }
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-line/45 bg-white px-3 text-sm font-semibold text-ink-dim transition-colors hover:border-accent/35 hover:text-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <X size={16} />
                  Rejeitar
                </button>
              </div>
            </article>
          )
        })}
      </section>

      <ConfirmDialog
        open={Boolean(pendingStatusChange)}
        title="Confirmar moderacao"
        description="Deseja confirmar essa acao de moderacao para a denuncia?"
        confirmLabel="Confirmar"
        danger={pendingStatusChange?.status === 'Rejeitada'}
        onCancel={() => setPendingStatusChange(null)}
        onConfirm={() => {
          if (!pendingStatusChange) return
          void updateStatus(pendingStatusChange.id, pendingStatusChange.status)
          setPendingStatusChange(null)
        }}
      />
    </main>
  )
}
