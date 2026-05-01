import { BookCopy, Pencil, Plus, Tag, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'

type Genre = {
  id: string
  name: string
  category: string
}

const initialGenres: Genre[] = [
  { id: 'g-1', name: 'Fantasia', category: 'Ficcao' },
  { id: 'g-2', name: 'Biografia', category: 'Nao ficcao' },
  { id: 'g-3', name: 'Tecnologia', category: 'Estudos' },
]

export default function AdminGenres() {
  const [genres, setGenres] = useState<Genre[]>(initialGenres)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')

  function resetForm() {
    setEditingId(null)
    setName('')
    setCategory('')
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim() || !category.trim()) return

    if (editingId) {
      setGenres((prev) =>
        prev.map((genre) =>
          genre.id === editingId
            ? { ...genre, name: name.trim(), category: category.trim() }
            : genre
        )
      )
      resetForm()
      return
    }

    setGenres((prev) => [
      { id: crypto.randomUUID(), name: name.trim(), category: category.trim() },
      ...prev,
    ])
    resetForm()
  }

  function onEdit(genre: Genre) {
    setEditingId(genre.id)
    setName(genre.name)
    setCategory(genre.category)
  }

  function onDelete(id: string) {
    setGenres((prev) => prev.filter((genre) => genre.id !== id))
    if (editingId === id) resetForm()
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-2xl border border-line/45 bg-white shadow-sm">
        <div className="h-1.5 bg-gradient-to-r from-accent via-brand-deep to-accent" />
        <div className="p-4 sm:p-5">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-deep">
            <BookCopy size={14} />
            Admin {'>'} Generos
          </p>
          <h1 className="mt-1 text-xl font-semibold text-ink sm:text-2xl">
            CRUD de generos e categorias
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Gestao mock para taxonomia de livros.
          </p>
        </div>
      </section>

      <form
        onSubmit={onSubmit}
        className="grid gap-3 rounded-2xl border border-line/45 bg-white p-4 shadow-sm sm:p-5 md:grid-cols-[1fr_1fr_auto]"
      >
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Genero"
          className="h-11 rounded-lg border border-line/55 bg-[#fbfaf7] px-3 text-sm text-ink outline-none transition-colors focus:border-accent"
        />
        <input
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          placeholder="Categoria"
          className="h-11 rounded-lg border border-line/55 bg-[#fbfaf7] px-3 text-sm text-ink outline-none transition-colors focus:border-accent"
        />
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep"
        >
          <Plus size={16} />
          {editingId ? 'Salvar' : 'Adicionar'}
        </button>
      </form>

      <section className="grid gap-3 sm:grid-cols-2">
        {genres.map((genre) => (
          <article
            key={genre.id}
            className="rounded-2xl border border-line/45 bg-white p-4 shadow-sm sm:p-5"
          >
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-deep">
              <Tag size={14} />
              {genre.category}
            </p>
            <h2 className="mt-1 text-base font-semibold text-ink">
              {genre.name}
            </h2>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => onEdit(genre)}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-line/55 bg-white px-3 text-sm font-medium text-ink-dim transition-colors hover:border-accent/35 hover:text-brand-deep"
              >
                <Pencil size={16} />
                Editar
              </button>
              <button
                type="button"
                onClick={() => onDelete(genre.id)}
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
