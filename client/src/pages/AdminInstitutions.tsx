import { MapPin, MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import InstitutionModal from '../components/admin/InstitutionModal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import {
  listAdminInstitutions,
  persistInstitutionCreate,
  persistInstitutionDelete,
  persistInstitutionUpdate,
  type AdminInstitution,
} from '../services/admin'
import { useToast } from '../stores/useToast'

export default function AdminInstitutions() {
  const toast = useToast()
  const [institutions, setInstitutions] = useState<AdminInstitution[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [openMenu, setOpenMenu] = useState<{
    id: string
    top: number
    left: number
  } | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [form, setForm] = useState({
    name: '',
    city: '',
    contact: '',
    status: 'Ativa' as AdminInstitution['status'],
    pointType: 'Doacao' as AdminInstitution['pointType'],
  })

  const isEditing = useMemo(() => editingId !== null, [editingId])

  useEffect(() => {
    let active = true
    async function loadData() {
      setIsLoading(true)
      try {
        const response = await listAdminInstitutions()
        if (!active) return
        setInstitutions(response)
      } catch {
        if (!active) return
        toast.error({
          title: 'Erro',
          message: 'Nao foi possivel carregar instituicoes.',
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
    setForm({
      name: '',
      city: '',
      contact: '',
      status: 'Ativa',
      pointType: 'Doacao',
    })
  }

  function closeModal() {
    setIsModalOpen(false)
    resetForm()
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!form.name.trim() || !form.city.trim() || !form.contact.trim()) return

    const payload = {
      name: form.name.trim(),
      city: form.city.trim(),
      contact: form.contact.trim(),
      status: form.status,
      pointType: form.pointType,
    }

    if (editingId) {
      try {
        await persistInstitutionUpdate(editingId, payload)
        setInstitutions((prev) =>
          prev.map((institution) =>
            institution.id === editingId
              ? { ...institution, ...payload }
              : institution
          )
        )
        toast.success({
          title: 'Instituicao atualizada',
          message: 'Instituicao atualizada com sucesso.',
        })
        setIsModalOpen(false)
        resetForm()
      } catch {
        toast.error({
          title: 'Erro',
          message: 'Nao foi possivel atualizar a instituicao.',
        })
      }
      return
    }

    try {
      const createdInstitution = await persistInstitutionCreate(payload)
      setInstitutions((prev) => [createdInstitution, ...prev])
      toast.success({
        title: 'Instituicao criada',
        message: 'Instituicao criada com sucesso.',
      })
      setIsModalOpen(false)
      resetForm()
    } catch {
      toast.error({
        title: 'Erro',
        message: 'Nao foi possivel criar a instituicao.',
      })
    }
  }

  function onEdit(institution: AdminInstitution) {
    setEditingId(institution.id)
    setForm({
      name: institution.name,
      city: institution.city,
      contact: institution.contact,
      status: institution.status,
      pointType: institution.pointType,
    })
    setIsModalOpen(true)
  }

  async function onDelete(id: string) {
    try {
      await persistInstitutionDelete(id)
      setInstitutions((prev) =>
        prev.filter((institution) => institution.id !== id)
      )
      if (editingId === id) closeModal()
      toast.success({
        title: 'Instituicao removida',
        message: 'Instituicao removida com sucesso.',
      })
    } catch {
      toast.error({
        title: 'Erro',
        message: 'Nao foi possivel remover a instituicao.',
      })
    }
  }

  return (
    <main className="mx-auto w-full space-y-3">
      <section className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Instituicoes</h1>
          <p className="mt-1 max-w-2xl text-sm leading-5 text-ink-dim">
            Cadastro e gestao dos pontos onde ocorrem trocas e doacoes.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            resetForm()
            setIsModalOpen(true)
          }}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-deep"
        >
          <Plus size={16} />
          Criar ponto
        </button>
      </section>

      {isLoading ? (
        <p className="rounded-xl border border-line/45 bg-white p-3 text-sm text-ink-dim shadow-sm sm:p-3.5">
          Carregando instituicoes...
        </p>
      ) : null}

      {!isLoading && !institutions.length ? (
        <section className="ui-empty-state flex flex-col items-center gap-2">
          <MapPin size={32} className="text-brand-deep" />
          <p className="text-sm font-medium text-ink">
            Nenhuma instituicao cadastrada.
          </p>
          <p className="text-sm">
            Cadastre a primeira instituicao para comecar.
          </p>
        </section>
      ) : null}

      {!isLoading && institutions.length ? (
        <section className="rounded-xl border border-line/45 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-[#fbfaf7]">
                <tr className="text-left text-xs uppercase tracking-wide text-ink-muted">
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">
                    Nome
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">
                    Cidade
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">
                    Contato
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">
                    Tipo
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
                {institutions.map((institution) => (
                  <tr
                    key={institution.id}
                    className="border-t border-line/35 align-middle"
                  >
                    <td className="px-4 py-3 font-medium text-ink">
                      <p className="max-w-[260px] truncate">
                        {institution.name}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-ink-dim">
                      {institution.city}
                    </td>
                    <td className="px-4 py-3 text-ink-dim">
                      <p className="max-w-[260px] truncate">
                        {institution.contact}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="inline-flex rounded-md border border-line/45 bg-[#fbfaf7] px-2 py-0.5 text-xs font-medium text-brand-deep">
                        {institution.pointType}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-flex rounded-md border border-line/45 bg-[#fbfaf7] px-2 py-0.5 text-xs font-medium ${
                          institution.status === 'Ativa'
                            ? 'text-accent'
                            : 'text-ink-dim'
                        }`}
                      >
                        {institution.status}
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
                              current?.id === institution.id
                                ? null
                                : {
                                    id: institution.id,
                                    top: rect.top + rect.height + 6,
                                    left,
                                  }
                            )
                          }}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-line/45 bg-white text-ink-dim transition-colors hover:border-accent/35 hover:text-brand-deep"
                          aria-label="Abrir ações da instituição"
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
              const institution = institutions.find(
                (item) => item.id === openMenu.id
              )
              if (!institution) return
              onEdit(institution)
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

      <InstitutionModal
        open={isModalOpen}
        isEditing={isEditing}
        form={form}
        onChange={(field, value) => {
          if (field === 'status') {
            setForm((prev) => ({
              ...prev,
              status: value as AdminInstitution['status'],
            }))
            return
          }

          if (field === 'pointType') {
            setForm((prev) => ({
              ...prev,
              pointType: value as AdminInstitution['pointType'],
            }))
            return
          }

          setForm((prev) => ({ ...prev, [field]: value }))
        }}
        onCancel={closeModal}
        onSubmit={onSubmit}
      />

      <ConfirmDialog
        open={Boolean(confirmDeleteId)}
        title="Excluir instituicao"
        description="Essa acao remove a instituicao permanentemente. Deseja continuar?"
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
