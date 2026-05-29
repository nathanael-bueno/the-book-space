import { Ban, MoreVertical, Search, ShieldBan, UserX } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import {
  listAdminUsers,
  persistUserStatus,
  type AdminUser,
  type AdminUserStatus,
} from '../services/admin'
import { useToast } from '../stores/useToast'

export default function AdminUsers() {
  const toast = useToast()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [openMenu, setOpenMenu] = useState<{
    id: string
    top: number
    left: number
  } | null>(null)
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    id: string
    status: AdminUserStatus
  } | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let active = true
    async function loadData() {
      setIsLoading(true)
      try {
        const response = await listAdminUsers()
        if (!active) return
        setUsers(response)
      } catch {
        if (!active) return
        toast.error({
          title: 'Erro',
          message: 'Nao foi possivel carregar usuarios.',
        })
      } finally {
        if (active) setIsLoading(false)
      }
    }
    loadData()
    return () => {
      active = false
    }
  }, [toast])

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
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
    try {
      await persistUserStatus(id, status)
      setUsers((prev) =>
        prev.map((user) => (user.id === id ? { ...user, status } : user))
      )
      toast.success({
        title: 'Status atualizado',
        message: 'Status do usuario atualizado.',
      })
    } catch {
      toast.error({
        title: 'Erro',
        message: 'Nao foi possivel atualizar o status do usuario.',
      })
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

      {!isLoading && !filteredUsers.length ? (
        <section className="ui-empty-state flex flex-col items-center gap-2">
          <Search size={32} className="text-brand-deep" aria-hidden="true" />
          <p className="text-sm font-medium text-ink">
            Nenhum usuario encontrado para este filtro.
          </p>
          <p className="text-sm">Tente outro nome, email ou status.</p>
        </section>
      ) : null}

      <section className="rounded-xl border border-line/45 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-line/35 bg-[#fbfaf7] text-left">
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  ID
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  Nome
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  Email
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  Reputacao
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  Status
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  Acoes
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-line/25 align-middle last:border-b-0"
                >
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-ink">
                    {user.id}
                  </td>
                  <td className="px-4 py-3">
                    <p className="max-w-[240px] truncate font-semibold text-ink">
                      {user.name}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="max-w-[300px] truncate text-ink-dim">
                      {user.email}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-dim">
                    {user.reputation.toFixed(1)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
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
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={(event) => {
                          const rect =
                            event.currentTarget.getBoundingClientRect()
                          const menuWidth = 160
                          const spaceRight = window.innerWidth - rect.right
                          const left =
                            spaceRight >= menuWidth + 12
                              ? rect.right + 8
                              : rect.left - menuWidth - 8

                          setOpenMenu((current) =>
                            current?.id === user.id
                              ? null
                              : {
                                  id: user.id,
                                  top: rect.top + rect.height + 6,
                                  left,
                                }
                          )
                        }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-line/45 bg-white text-ink-dim transition-colors hover:border-accent/35 hover:text-brand-deep"
                        aria-label="Abrir ações do usuário"
                      >
                        <MoreVertical size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {openMenu ? (
        <div
          ref={menuRef}
          className="fixed z-40 w-40 overflow-hidden rounded-lg border border-line/45 bg-white p-1 shadow-lg"
          style={{ top: openMenu.top, left: openMenu.left }}
        >
          <button
            type="button"
            onClick={() => {
              setPendingStatusChange({
                id: openMenu.id,
                status: 'Suspenso',
              })
              setOpenMenu(null)
            }}
            disabled={
              users.find((user) => user.id === openMenu.id)?.status === 'Banido'
            }
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs font-semibold text-ink-dim transition-colors hover:bg-[#fbfaf7] hover:text-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
          >
            <UserX size={14} />
            Suspender
          </button>
          <button
            type="button"
            onClick={() => {
              setPendingStatusChange({
                id: openMenu.id,
                status: 'Banido',
              })
              setOpenMenu(null)
            }}
            disabled={
              users.find((user) => user.id === openMenu.id)?.status === 'Banido'
            }
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs font-semibold text-ink-dim transition-colors hover:bg-[#fbfaf7] hover:text-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Ban size={14} />
            Banir
          </button>
          <button
            type="button"
            onClick={() => {
              setPendingStatusChange({
                id: openMenu.id,
                status: 'Ativo',
              })
              setOpenMenu(null)
            }}
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs font-semibold text-ink-dim transition-colors hover:bg-[#fbfaf7] hover:text-brand-deep"
          >
            <ShieldBan size={14} />
            Reativar
          </button>
        </div>
      ) : null}

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
