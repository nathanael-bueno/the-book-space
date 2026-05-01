import { Building2, MapPin, Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'

type Institution = {
  id: string
  name: string
  city: string
  contact: string
  status: 'Ativa' | 'Pendente'
}

const initialInstitutions: Institution[] = [
  {
    id: '1',
    name: 'Biblioteca Comunitaria Aurora',
    city: 'Sao Paulo - SP',
    contact: 'aurora@livros.org',
    status: 'Ativa',
  },
  {
    id: '2',
    name: 'Casa de Leitura Girassol',
    city: 'Recife - PE',
    contact: 'contato@girassol.org',
    status: 'Ativa',
  },
  {
    id: '3',
    name: 'Instituto Pontes de Papel',
    city: 'Belo Horizonte - MG',
    contact: 'equipe@pontes.org',
    status: 'Pendente',
  },
]

export default function AdminInstitutions() {
  const [institutions, setInstitutions] =
    useState<Institution[]>(initialInstitutions)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    city: '',
    contact: '',
    status: 'Ativa' as Institution['status'],
  })

  const isEditing = useMemo(() => editingId !== null, [editingId])

  function resetForm() {
    setEditingId(null)
    setForm({ name: '', city: '', contact: '', status: 'Ativa' })
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!form.name.trim() || !form.city.trim() || !form.contact.trim()) return

    if (editingId) {
      setInstitutions((prev) =>
        prev.map((institution) =>
          institution.id === editingId
            ? {
                ...institution,
                ...form,
                name: form.name.trim(),
                city: form.city.trim(),
                contact: form.contact.trim(),
              }
            : institution
        )
      )
      resetForm()
      return
    }

    setInstitutions((prev) => [
      {
        id: crypto.randomUUID(),
        name: form.name.trim(),
        city: form.city.trim(),
        contact: form.contact.trim(),
        status: form.status,
      },
      ...prev,
    ])
    resetForm()
  }

  function onEdit(institution: Institution) {
    setEditingId(institution.id)
    setForm({
      name: institution.name,
      city: institution.city,
      contact: institution.contact,
      status: institution.status,
    })
  }

  function onDelete(id: string) {
    setInstitutions((prev) =>
      prev.filter((institution) => institution.id !== id)
    )
    if (editingId === id) resetForm()
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-2xl border border-line/45 bg-white shadow-sm">
        <div className="h-1.5 bg-gradient-to-r from-accent via-brand-deep to-accent" />
        <div className="p-4 sm:p-5">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-deep">
            <Building2 size={14} />
            Admin {'>'} Instituicoes
          </p>
          <h1 className="mt-1 text-xl font-semibold text-ink sm:text-2xl">
            Gerenciar instituicoes parceiras
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Fluxo mock de cadastro, edicao e exclusao.
          </p>
        </div>
      </section>

      <form
        onSubmit={onSubmit}
        className="grid gap-4 rounded-2xl border border-line/45 bg-white p-4 shadow-sm sm:p-5 lg:grid-cols-4"
      >
        <input
          value={form.name}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, name: event.target.value }))
          }
          placeholder="Nome da instituicao"
          className="h-11 rounded-lg border border-line/55 bg-[#fbfaf7] px-3 text-sm text-ink outline-none transition-colors focus:border-accent"
        />
        <input
          value={form.city}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, city: event.target.value }))
          }
          placeholder="Cidade / Estado"
          className="h-11 rounded-lg border border-line/55 bg-[#fbfaf7] px-3 text-sm text-ink outline-none transition-colors focus:border-accent"
        />
        <input
          value={form.contact}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, contact: event.target.value }))
          }
          placeholder="E-mail de contato"
          className="h-11 rounded-lg border border-line/55 bg-[#fbfaf7] px-3 text-sm text-ink outline-none transition-colors focus:border-accent"
        />
        <div className="flex gap-2">
          <select
            value={form.status}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                status: event.target.value as Institution['status'],
              }))
            }
            className="h-11 w-full rounded-lg border border-line/55 bg-[#fbfaf7] px-3 text-sm text-ink outline-none transition-colors focus:border-accent"
          >
            <option>Ativa</option>
            <option>Pendente</option>
          </select>
          <button
            type="submit"
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep"
          >
            <Plus size={16} />
            {isEditing ? 'Salvar' : 'Criar'}
          </button>
        </div>
      </form>

      <section className="grid gap-3">
        {institutions.map((institution) => (
          <article
            key={institution.id}
            className="rounded-2xl border border-line/45 bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-ink">
                  {institution.name}
                </h2>
                <p className="mt-1 inline-flex items-center gap-1 text-sm text-ink-muted">
                  <MapPin size={14} className="text-brand-deep" />
                  {institution.city}
                </p>
                <p className="mt-1 text-sm text-ink-muted">
                  {institution.contact}
                </p>
              </div>
              <span
                className={`inline-flex rounded-lg border px-2 py-1 text-xs font-semibold ${
                  institution.status === 'Ativa'
                    ? 'border-accent/25 bg-[#fbfaf7] text-accent'
                    : 'border-line/40 bg-white text-ink-dim'
                }`}
              >
                {institution.status}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onEdit(institution)}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-line/55 bg-white px-3 text-sm font-medium text-ink-dim transition-colors hover:border-accent/35 hover:text-brand-deep"
              >
                <Pencil size={16} />
                Editar
              </button>
              <button
                type="button"
                onClick={() => onDelete(institution.id)}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-line/55 bg-white px-3 text-sm font-medium text-ink-dim transition-colors hover:border-accent/35 hover:text-brand-deep"
              >
                <Trash2 size={16} />
                Excluir
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
