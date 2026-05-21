import {
  Ban,
  CheckCircle2,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import GenreModal from '../components/admin/GenreModal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { ApiError } from '../services/http'
import { useToast } from '../stores/useToast'
import {
  listAdminGenres,
  persistGenreCreate,
  persistGenreDelete,
  persistGenreUpdate,
  type AdminGenre,
} from '../services/admin'

export default function AdminGenres() {
  const toast = useToast()
  const [genres, setGenres] = useState<AdminGenre[]>([])
  const [inactiveGenreIds, setInactiveGenreIds] = useState<Set<string>>(
    new Set()
  )
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createName, setCreateName] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [openMenu, setOpenMenu] = useState<{
    id: string
    top: number
    left: number
  } | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  function getApiMessage(err: unknown, fallback: string): string {
    return err instanceof ApiError ? err.message : fallback
  }

  useEffect(() => {
    let active = true
    async function loadData() {
      setIsLoading(true)
      try {
        const response = await listAdminGenres()
        if (!active) return
        setGenres(response)
      } catch (err) {
        if (!active) return
        toast.error({
          title: 'Erro',
          message: getApiMessage(err, 'Nao foi possivel carregar generos.'),
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

  function resetForm() {
    setEditingId(null)
    setName('')
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!editingId || !name.trim()) return

    const currentGenre = genres.find((genre) => genre.id === editingId)
    if (!currentGenre) return

    const payload = { name: name.trim(), category: currentGenre.category }

    try {
      await persistGenreUpdate(editingId, payload)
      setGenres((prev) =>
        prev.map((genre) =>
          genre.id === editingId ? { ...genre, ...payload } : genre
        )
      )
      toast.success({
        title: 'Genero atualizado',
        message: 'Genero atualizado com sucesso.',
      })
      setIsCreateModalOpen(false)
      resetForm()
    } catch (err) {
      toast.error({
        title: 'Erro ao atualizar',
        message: getApiMessage(err, 'Nao foi possivel atualizar o genero.'),
      })
    }
  }

  async function onCreateSubmit(event: FormEvent) {
    event.preventDefault()
    if (!createName.trim()) return

    const payload = {
      name: createName.trim(),
      category: 'Geral',
    }

    try {
      const createdGenre = await persistGenreCreate(payload)
      setGenres((prev) => [createdGenre, ...prev])
      toast.success({
        title: 'Genero criado',
        message: 'Genero criado com sucesso.',
      })
      setCreateName('')
      setIsCreateModalOpen(false)
    } catch (err) {
      toast.error({
        title: 'Erro ao criar',
        message: getApiMessage(err, 'Nao foi possivel criar o genero.'),
      })
    }
  }

  function onEdit(genre: AdminGenre) {
    setEditingId(genre.id)
    setName(genre.name)
    setIsCreateModalOpen(true)
  }

  async function onDelete(id: string) {
    try {
      await persistGenreDelete(id)
      setGenres((prev) => prev.filter((genre) => genre.id !== id))
      if (editingId === id) {
        setIsCreateModalOpen(false)
        resetForm()
      }
      toast.success({
        title: 'Genero removido',
        message: 'Genero removido com sucesso.',
      })
    } catch (err) {
      toast.error({
        title: 'Erro ao remover',
        message: getApiMessage(err, 'Nao foi possivel remover o genero.'),
      })
    }
  }

  function toggleGenreStatus(id: string) {
    setInactiveGenreIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        toast.success({
          title: 'Genero ativado',
          message: 'Genero ativado com sucesso.',
        })
      } else {
        next.add(id)
        toast.success({
          title: 'Genero desativado',
          message: 'Genero desativado com sucesso.',
        })
      }
      return next
    })
  }

  return (
    <main className="mx-auto w-full space-y-3">
      <section className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Generos</h1>
          <p className="mt-1 max-w-2xl text-sm leading-5 text-ink-dim">
            Gestao dos generos usados no catalogo de livros.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            resetForm()
            setCreateName('')
            setIsCreateModalOpen(true)
          }}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-deep"
        >
          <Plus size={16} />
          Criar genero
        </button>
      </section>

      {isLoading ? (
        <p className="rounded-xl border border-line/45 bg-white p-3 text-sm text-ink-dim shadow-sm sm:p-3.5">
          Carregando generos...
        </p>
      ) : null}
      {!isLoading && !genres.length ? (
        <section className="ui-empty-state flex flex-col items-center gap-2">
          <Plus size={32} className="text-brand-deep" />
          <p className="text-sm font-medium text-ink">
            Nenhum genero cadastrado.
          </p>
          <p className="text-sm">Adicione o primeiro genero para comecar.</p>
        </section>
      ) : null}

      {!isLoading && genres.length ? (
        <section className="rounded-xl border border-line/45 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-[#fbfaf7]">
                <tr className="text-left text-xs uppercase tracking-wide text-ink-muted">
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">
                    Genero
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">
                    Status
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-right font-semibold">
                    Acoes
                  </th>
                </tr>
              </thead>
              <tbody>
                {genres.map((genre) => {
                  const isInactive = inactiveGenreIds.has(genre.id)
                  return (
                    <tr
                      key={genre.id}
                      className="border-t border-line/35 align-middle"
                    >
                      <td className="px-4 py-3 font-medium text-ink">
                        <p className="max-w-[340px] truncate">{genre.name}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className={`inline-flex rounded-md border border-line/45 bg-[#fbfaf7] px-2 py-0.5 text-xs font-medium ${
                            isInactive ? 'text-ink-dim' : 'text-accent'
                          }`}
                        >
                          {isInactive ? 'Desativado' : 'Ativo'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={(event) => {
                              const rect =
                                event.currentTarget.getBoundingClientRect()
                              const menuWidth = 168
                              const spaceRight = window.innerWidth - rect.right
                              const left =
                                spaceRight >= menuWidth + 12
                                  ? rect.right + 8
                                  : rect.left - menuWidth - 8

                              setOpenMenu((current) =>
                                current?.id === genre.id
                                  ? null
                                  : {
                                      id: genre.id,
                                      top: rect.top + rect.height + 6,
                                      left,
                                    }
                              )
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-line/45 bg-white text-ink-dim transition-colors hover:border-accent/35 hover:text-brand-deep"
                            aria-label="Abrir ações do gênero"
                          >
                            <MoreVertical size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {openMenu ? (
        <div
          ref={menuRef}
          className="fixed z-40 w-44 overflow-hidden rounded-lg border border-line/45 bg-white p-1 shadow-lg"
          style={{ top: openMenu.top, left: openMenu.left }}
        >
          <button
            type="button"
            onClick={() => {
              const genre = genres.find((item) => item.id === openMenu.id)
              if (!genre) return
              onEdit(genre)
              setOpenMenu(null)
            }}
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs font-semibold text-ink-dim transition-colors hover:bg-[#fbfaf7] hover:text-brand-deep"
          >
            <Pencil size={14} />
            Editar
          </button>
          <button
            type="button"
            onClick={() => {
              toggleGenreStatus(openMenu.id)
              setOpenMenu(null)
            }}
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs font-semibold text-ink-dim transition-colors hover:bg-[#fbfaf7] hover:text-brand-deep"
          >
            {inactiveGenreIds.has(openMenu.id) ? (
              <CheckCircle2 size={14} />
            ) : (
              <Ban size={14} />
            )}
            {inactiveGenreIds.has(openMenu.id) ? 'Ativar' : 'Desativar'}
          </button>
          <button
            type="button"
            onClick={() => {
              setConfirmDeleteId(openMenu.id)
              setOpenMenu(null)
            }}
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs font-semibold text-ink-dim transition-colors hover:bg-[#fbfaf7] hover:text-brand-deep"
          >
            <Trash2 size={14} />
            Excluir
          </button>
        </div>
      ) : null}

      <GenreModal
        open={isCreateModalOpen}
        isEditing={Boolean(editingId)}
        value={editingId ? name : createName}
        onChange={(value) => {
          if (editingId) {
            setName(value)
            return
          }
          setCreateName(value)
        }}
        onCancel={() => {
          setIsCreateModalOpen(false)
          resetForm()
        }}
        onSubmit={editingId ? onSubmit : onCreateSubmit}
      />

      <ConfirmDialog
        open={Boolean(confirmDeleteId)}
        title="Excluir genero"
        description="Essa acao remove o genero permanentemente. Deseja continuar?"
        confirmLabel="Excluir"
        danger
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (!confirmDeleteId) return
          void onDelete(confirmDeleteId)
          setConfirmDeleteId(null)
        }}
      />
    </main>
  )
}
