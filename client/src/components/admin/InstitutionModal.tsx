import { Pencil, Plus } from 'lucide-react'
import type { FormEvent } from 'react'
import type { AdminInstitution } from '../../services/admin'

type InstitutionModalProps = {
  open: boolean
  isEditing: boolean
  form: {
    name: string
    city: string
    contact: string
    status: AdminInstitution['status']
    pointType: AdminInstitution['pointType']
  }
  onChange: (
    field: 'name' | 'city' | 'contact' | 'status' | 'pointType',
    value: string
  ) => void
  onCancel: () => void
  onSubmit: (event: FormEvent) => void
}

export default function InstitutionModal({
  open,
  isEditing,
  form,
  onChange,
  onCancel,
  onSubmit,
}: InstitutionModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/35 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-line/45 bg-white p-4 shadow-xl sm:p-5">
        <div>
          <h2 className="text-lg font-semibold text-ink">
            {isEditing ? 'Editar ponto' : 'Criar ponto'}
          </h2>
          <p className="mt-1 text-sm text-ink-dim">
            {isEditing
              ? 'Atualize os dados do ponto de troca ou doacao.'
              : 'Cadastre um novo ponto de troca ou doacao.'}
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="mt-4 grid gap-2.5 md:grid-cols-2 md:gap-3"
        >
          <input
            value={form.name}
            onChange={(event) => onChange('name', event.target.value)}
            placeholder="Nome da instituicao"
            className="h-9 rounded-lg border border-line/45 bg-[#fbfaf7] px-3 text-sm text-ink outline-none transition-colors focus:border-accent"
          />
          <input
            value={form.city}
            onChange={(event) => onChange('city', event.target.value)}
            placeholder="Cidade / Estado"
            className="h-9 rounded-lg border border-line/45 bg-[#fbfaf7] px-3 text-sm text-ink outline-none transition-colors focus:border-accent"
          />
          <input
            value={form.contact}
            onChange={(event) => onChange('contact', event.target.value)}
            placeholder="E-mail de contato"
            className="h-9 rounded-lg border border-line/45 bg-[#fbfaf7] px-3 text-sm text-ink outline-none transition-colors focus:border-accent"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={form.pointType}
              onChange={(event) => onChange('pointType', event.target.value)}
              className="h-9 rounded-lg border border-line/45 bg-[#fbfaf7] px-3 text-sm text-ink outline-none transition-colors focus:border-accent"
            >
              <option>Doacao</option>
              <option>Troca</option>
            </select>
            <select
              value={form.status}
              onChange={(event) => onChange('status', event.target.value)}
              className="h-9 rounded-lg border border-line/45 bg-[#fbfaf7] px-3 text-sm text-ink outline-none transition-colors focus:border-accent"
            >
              <option>Ativa</option>
              <option>Pendente</option>
            </select>
          </div>

          <div className="md:col-span-2 mt-1 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex h-9 items-center rounded-lg border border-line/45 bg-white px-4 text-sm font-semibold text-ink-dim transition-colors hover:border-accent/35 hover:text-brand-deep"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-deep"
            >
              {isEditing ? <Pencil size={16} /> : <Plus size={16} />}
              {isEditing ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
