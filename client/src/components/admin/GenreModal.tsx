import { Pencil, Plus } from 'lucide-react'
import type { FormEvent } from 'react'

type GenreModalProps = {
  open: boolean
  isEditing: boolean
  value: string
  onChange: (value: string) => void
  onCancel: () => void
  onSubmit: (event: FormEvent) => void
}

export default function GenreModal({
  open,
  isEditing,
  value,
  onChange,
  onCancel,
  onSubmit,
}: GenreModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/35 p-4">
      <div className="w-full max-w-lg rounded-xl border border-line/45 bg-white p-4 shadow-xl sm:p-5">
        <div>
          <h2 className="text-lg font-semibold text-ink">
            {isEditing ? 'Editar genero' : 'Criar genero'}
          </h2>
          <p className="mt-1 text-sm text-ink-dim">
            {isEditing
              ? 'Atualize o nome do genero.'
              : 'Adicione um novo genero.'}
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-4 grid gap-2.5">
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Genero"
            className="h-9 rounded-lg border border-line/45 bg-[#fbfaf7] px-3 text-sm text-ink outline-none transition-colors focus:border-accent"
          />
          <div className="mt-1 flex justify-end gap-2">
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
