import { Ban, Search, ShieldBan, UserX } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import {
  listAdminUsers,
  persistUserStatus,
  type AdminUser,
  type AdminUserStatus,
} from '../services/admin'

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    id: string
    status: AdminUserStatus
  } | null>(null)

  useEffect(() => {
    let active = true
    async function loadData() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await listAdminUsers()
        if (!active) return
        setUsers(response)
      } catch {
        if (!active) return
        setError('Nao foi possivel carregar usuarios.')
      } finally {
        if (active) setIsLoading(false)
      }
    }
    loadData()
    return () => {
      active = false
    }
  }, [])

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return users
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
    )
  }, [search, users])

  async function updateStatus(id: string, status: AdminUserStatus) {
    setError(null)
    try {
      await persistUserStatus(id, status)
      setUsers((prev) =>
        prev.map((user) => (user.id === id ? { ...user, status } : user))
      )
      setNotice('Status do usuario atualizado.')
    } catch {
      setError('Nao foi possivel atualizar o status do usuario.')
    }
  }

  return (
    <main className="mx-auto w-full space-y-3">
      <section className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Usuarios</h1>
          <p className="mt-1 max-w-2xl text-sm leading-5 text-ink-dim">
            Controle de status de conta para moderacao da comunidade.
          </p>
        </div>
        <label className="flex h-9 items-center gap-2 rounded-lg border border-line/45 bg-[#fbfaf7] px-3">
          <Search size={16} className="text-brand-deep" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome ou email"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted"
          />
        </label>
      </section>

      {isLoading ? (
        <p className="rounded-xl border border-line/45 bg-white p-3 text-sm text-ink-dim shadow-sm sm:p-3.5">
          Carregando usuarios...
        </p>
      ) : null}
      {error ? (
        <p className="rounded-xl border border-brand-deep/25 bg-brand-deep/5 p-3 text-sm font-medium text-brand-deep shadow-sm sm:p-3.5">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="rounded-xl border border-line/45 bg-[#fbfaf7] p-3 text-sm text-ink-dim shadow-sm sm:p-3.5">
          {notice}
        </p>
      ) : null}

      {!isLoading && !error && !filteredUsers.length ? (
        <section className="ui-empty-state flex flex-col items-center gap-2">
          <Search size={32} className="text-brand-deep" aria-hidden="true" />
          <p className="text-sm font-medium text-ink">
            Nenhum usuario encontrado para este filtro.
          </p>
          <p className="text-sm">Tente outro nome, email ou status.</p>
        </section>
      ) : null}

      <section className="space-y-2.5">
        {filteredUsers.map((user) => (
          <article
            key={user.id}
            className="rounded-xl border border-line/45 bg-white p-3 shadow-sm sm:p-3.5"
          >
            <div className="flex flex-wrap items-start justify-between gap-2.5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-deep">
                  ID {user.id}
                </p>
                <h2 className="mt-1 text-base font-semibold text-ink">
                  {user.name}
                </h2>
                <p className="mt-1 text-sm text-ink-muted">{user.email}</p>
                <p className="mt-1 text-sm text-ink-muted">
                  Reputacao: {user.reputation.toFixed(1)}
                </p>
              </div>

              <span
                className={`inline-flex rounded-md border border-line/45 bg-[#fbfaf7] px-2 py-0.5 text-xs font-medium ${
                  user.status === 'Ativo'
                    ? 'text-accent'
                    : user.status === 'Suspenso'
                      ? 'text-brand-deep'
                      : 'text-ink-dim'
                }`}
              >
                {user.status}
              </span>
            </div>

            <div className="mt-2.5 flex flex-wrap gap-2 border-t border-line/35 pt-2.5">
              <button
                type="button"
                onClick={() =>
                  setPendingStatusChange({ id: user.id, status: 'Suspenso' })
                }
                disabled={user.status === 'Banido'}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-line/45 bg-white px-3 text-sm font-semibold text-ink-dim transition-colors hover:border-accent/35 hover:text-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
              >
                <UserX size={16} />
                Suspender
              </button>
              <button
                type="button"
                onClick={() =>
                  setPendingStatusChange({ id: user.id, status: 'Banido' })
                }
                disabled={user.status === 'Banido'}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-line/45 bg-white px-3 text-sm font-semibold text-ink-dim transition-colors hover:border-accent/35 hover:text-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Ban size={16} />
                Banir
              </button>
              <button
                type="button"
                onClick={() =>
                  setPendingStatusChange({ id: user.id, status: 'Ativo' })
                }
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-3 text-sm font-semibold text-white transition-colors hover:bg-brand-deep"
              >
                <ShieldBan size={16} />
                Reativar
              </button>
            </div>
          </article>
        ))}
      </section>

      <ConfirmDialog
        open={Boolean(pendingStatusChange)}
        title="Confirmar alteracao"
        description="Deseja aplicar essa mudanca de status para este usuario?"
        confirmLabel="Confirmar"
        danger={pendingStatusChange?.status === 'Banido'}
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
