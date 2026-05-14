import { Ban, CheckCircle2, Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import GenreModal from '../components/admin/GenreModal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function loadData() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await listAdminGenres()
        if (!active) return
        setGenres(response)
      } catch {
        if (!active) return
        setError('Nao foi possivel carregar generos.')
      } finally {
        if (active) setIsLoading(false)
      }
    }
    loadData()
    return () => {
      active = false
    }
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

    setError(null)
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
    } catch {
      setError('Nao foi possivel atualizar o genero.')
      toast.error({
        title: 'Erro ao atualizar',
        message: 'Nao foi possivel atualizar o genero.',
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

    setError(null)
    try {
      await persistGenreCreate(payload)
      setGenres((prev) => [{ id: crypto.randomUUID(), ...payload }, ...prev])
      toast.success({
        title: 'Genero criado',
        message: 'Genero criado com sucesso.',
      })
      setCreateName('')
      setIsCreateModalOpen(false)
    } catch {
      setError('Nao foi possivel criar o genero.')
      toast.error({
        title: 'Erro ao criar',
        message: 'Nao foi possivel criar o genero.',
      })
    }
  }

  function onEdit(genre: AdminGenre) {
    setEditingId(genre.id)
    setName(genre.name)
    setIsCreateModalOpen(true)
  }

  async function onDelete(id: string) {
    setError(null)
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
    } catch {
      setError('Nao foi possivel remover o genero.')
      toast.error({
        title: 'Erro ao remover',
        message: 'Nao foi possivel remover o genero.',
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
      {error ? (
        <p className="rounded-xl border border-brand-deep/25 bg-brand-deep/5 p-3 text-sm font-medium text-brand-deep shadow-sm sm:p-3.5">
          {error}
        </p>
      ) : null}
      {!isLoading && !error && !genres.length ? (
        <section className="ui-empty-state flex flex-col items-center gap-2">
          <Plus size={32} className="text-brand-deep" />
          <p className="text-sm font-medium text-ink">
            Nenhum genero cadastrado.
          </p>
          <p className="text-sm">Adicione o primeiro genero para comecar.</p>
        </section>
      ) : null}

      {!isLoading && !error && genres.length ? (
        <section className="overflow-hidden rounded-xl border border-line/45 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[#fbfaf7]">
                <tr className="text-left text-xs uppercase tracking-wide text-ink-muted">
                  <th className="px-3 py-2.5 font-semibold">Genero</th>
                  <th className="px-3 py-2.5 font-semibold">Status</th>
                  <th className="px-3 py-2.5 text-right font-semibold">
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
                      <td className="px-3 py-3 font-medium text-ink">
                        {genre.name}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex rounded-md border border-line/45 bg-[#fbfaf7] px-2 py-0.5 text-xs font-medium ${
                            isInactive ? 'text-ink-dim' : 'text-accent'
                          }`}
                        >
                          {isInactive ? 'Desativado' : 'Ativo'}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onEdit(genre)}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line/45 bg-white px-2.5 text-xs font-semibold text-ink-dim transition-colors hover:border-accent/35 hover:text-brand-deep"
                          >
                            <Pencil size={14} />
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleGenreStatus(genre.id)}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line/45 bg-white px-2.5 text-xs font-semibold text-ink-dim transition-colors hover:border-accent/35 hover:text-brand-deep"
                          >
                            {isInactive ? (
                              <CheckCircle2 size={14} />
                            ) : (
                              <Ban size={14} />
                            )}
                            {isInactive ? 'Ativar' : 'Desativar'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(genre.id)}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line/45 bg-white px-2.5 text-xs font-semibold text-ink-dim transition-colors hover:border-accent/35 hover:text-brand-deep"
                          >
                            <Trash2 size={14} />
                            Excluir
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
