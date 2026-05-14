import {
  AlertTriangle,
  BookHeart,
  RefreshCcw,
  Repeat2,
  UserRound,
  Users,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import {
  getAdminDashboardStats,
  type AdminDashboardRecentUser,
} from '../services/admin'
import { useToast } from '../stores/useToast'

export default function AdminDashboard() {
  const toast = useToast()
  const [stats, setStats] = useState({
    activeUsers: 0,
    completedTrades: 0,
    donations: 0,
    pendingReports: 0,
    recentUsers: [] as AdminDashboardRecentUser[],
  })
  const [isLoading, setIsLoading] = useState(true)

  const metrics = [
    {
      label: 'Usuarios ativos',
      value: stats.activeUsers.toLocaleString('pt-BR'),
      detail: 'contas com status Ativo',
      icon: Users,
    },
    {
      label: 'Trocas concluidas',
      value: stats.completedTrades.toLocaleString('pt-BR'),
      detail: 'status concluida',
      icon: Repeat2,
    },
    {
      label: 'Doacoes realizadas',
      value: stats.donations.toLocaleString('pt-BR'),
      detail: 'registros totais de doacao',
      icon: BookHeart,
    },
    {
      label: 'Denuncias pendentes',
      value: stats.pendingReports.toLocaleString('pt-BR'),
      detail: 'aguardando moderacao',
      icon: AlertTriangle,
    },
  ]

  const loadStats = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await getAdminDashboardStats()
      setStats(response)
    } catch {
      toast.error({ title: 'Erro', message: 'Nao foi possivel carregar as metricas do dashboard.' })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadStats()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadStats])

  return (
    <main className="mx-auto w-full space-y-3">
      <section className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Painel</h1>
          <p className="mt-1 max-w-2xl text-sm leading-5 text-ink-dim">
            Acompanhe saude da comunidade e principais indicadores.
          </p>
        </div>
        <button
          type="button"
          onClick={loadStats}
          disabled={isLoading}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-line/45 bg-white px-4 text-sm font-semibold text-ink-dim transition-colors hover:border-accent/35 hover:text-brand-deep"
        >
          <RefreshCcw size={16} />
          {isLoading ? 'Atualizando...' : 'Atualizar'}
        </button>
      </section>

      <section className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon

          return (
            <article
              key={metric.label}
              className="rounded-xl border border-line/45 bg-white p-3 shadow-sm sm:p-3.5"
            >
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/15 bg-[#fbfaf7] text-brand-deep">
                  <Icon size={18} />
                </div>
                <span className="inline-flex items-center rounded-md border border-line/45 bg-[#fbfaf7] px-2 py-0.5 text-xs font-medium text-brand-deep">
                  KPI
                </span>
              </div>
              <p className="mt-4 text-sm text-ink-muted">{metric.label}</p>
              <p className="mt-1 text-2xl font-semibold text-ink">
                {metric.value}
              </p>
              <p className="mt-1 text-xs text-ink-muted">{metric.detail}</p>
            </article>
          )
        })}
      </section>

      <section className="rounded-xl border border-line/45 bg-white p-3 shadow-sm sm:p-3.5">
        <h2 className="text-base font-semibold text-ink">
          Usuarios cadastrados recentemente
        </h2>

        <div className="mt-2.5 space-y-2.5 border-t border-line/35 pt-2.5">
          {stats.recentUsers.length
            ? stats.recentUsers.map((user) => (
                <article
                  key={user.id}
                  className="flex items-center gap-2.5 rounded-md border border-line/45 bg-[#fbfaf7] px-2 py-1.5"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-accent/15 bg-white text-brand-deep">
                    <UserRound size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-ink-muted">
                      {user.email}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-brand-deep">
                    {user.created_at}
                  </span>
                </article>
              ))
            : !isLoading && (
                <p className="text-sm text-ink-muted">
                  Nenhum usuario cadastrado ainda.
                </p>
              )}
        </div>
      </section>
    </main>
  )
}
