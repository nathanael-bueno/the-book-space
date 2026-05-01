import { Ban, Search, Shield, ShieldBan, UserRound, UserX } from 'lucide-react'
import { useMemo, useState } from 'react'

type UserStatus = 'Ativo' | 'Suspenso' | 'Banido'

type AdminUser = {
  id: string
  name: string
  email: string
  reputation: number
  status: UserStatus
}

const initialUsers: AdminUser[] = [
  {
    id: 'u-1',
    name: 'Ana Clara',
    email: 'ana@bookspace.app',
    reputation: 4.9,
    status: 'Ativo',
  },
  {
    id: 'u-2',
    name: 'Lucas Mendes',
    email: 'lucas@bookspace.app',
    reputation: 3.8,
    status: 'Ativo',
  },
  {
    id: 'u-3',
    name: 'Marina Souza',
    email: 'marina@bookspace.app',
    reputation: 2.1,
    status: 'Suspenso',
  },
  {
    id: 'u-4',
    name: 'Perfil Anonimo',
    email: 'anonimo@bookspace.app',
    reputation: 1.0,
    status: 'Banido',
  },
]

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers)
  const [search, setSearch] = useState('')

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return users
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
    )
  }, [search, users])

  function updateStatus(id: string, status: UserStatus) {
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, status } : user))
    )
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-2xl border border-line/45 bg-white shadow-sm">
        <div className="h-1.5 bg-gradient-to-r from-accent via-brand-deep to-accent" />
        <div className="p-4 sm:p-5">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-deep">
            <Shield size={14} />
            Admin {'>'} Usuarios
          </p>
          <h1 className="mt-1 text-xl font-semibold text-ink sm:text-2xl">
            Gestao de usuarios
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Acionar suspensao e banimento em fluxo mock.
          </p>
          <label className="mt-4 flex h-11 items-center gap-2 rounded-lg border border-line/55 bg-[#fbfaf7] px-3">
            <Search size={16} className="text-brand-deep" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome ou email"
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted"
            />
          </label>
        </div>
      </section>

      <section className="space-y-3">
        {filteredUsers.map((user) => (
          <article
            key={user.id}
            className="rounded-2xl border border-line/45 bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-deep">
                  <UserRound size={14} />
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
                className={`inline-flex rounded-lg border px-2 py-1 text-xs font-semibold ${
                  user.status === 'Ativo'
                    ? 'border-accent/25 bg-[#fbfaf7] text-accent'
                    : user.status === 'Suspenso'
                      ? 'border-brand-deep/20 bg-[#fbfaf7] text-brand-deep'
                      : 'border-line/40 bg-white text-ink-dim'
                }`}
              >
                {user.status}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => updateStatus(user.id, 'Suspenso')}
                disabled={user.status === 'Banido'}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-line/55 bg-white px-3 text-sm font-medium text-ink-dim transition-colors hover:border-accent/35 hover:text-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
              >
                <UserX size={16} />
                Suspender
              </button>
              <button
                type="button"
                onClick={() => updateStatus(user.id, 'Banido')}
                disabled={user.status === 'Banido'}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-line/55 bg-white px-3 text-sm font-medium text-ink-dim transition-colors hover:border-accent/35 hover:text-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Ban size={16} />
                Banir
              </button>
              <button
                type="button"
                onClick={() => updateStatus(user.id, 'Ativo')}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-3 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep"
              >
                <ShieldBan size={16} />
                Reativar
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
