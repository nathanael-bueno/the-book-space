import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, BookImage, Save, Trash2 } from 'lucide-react'
import { books } from '../data/books'
import { useToast } from '../stores/useToast'

const genres = [
  'Romance',
  'Fantasia',
  'Ficcao Cientifica',
  'Tecnologia',
  'Biografia',
]
const conditions = ['Novo', 'Muito bom', 'Bom', 'Usado']

export default function BookForm() {
  const toast = useToast()
  const { bookId } = useParams()
  const book = books.find((item) => item.id === bookId)
  const isEditing = Boolean(bookId)
  const [saved, setSaved] = useState(false)
  const [coverFile, setCoverFile] = useState<File | null>(null)

  const localCoverPreview = useMemo(
    () => (coverFile ? URL.createObjectURL(coverFile) : null),
    [coverFile]
  )
  const coverPreview = localCoverPreview ?? book?.cover

  useEffect(
    () => () => {
      if (localCoverPreview) URL.revokeObjectURL(localCoverPreview)
    },
    [localCoverPreview]
  )

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaved(true)
    toast.success({
      title: isEditing ? 'Livro atualizado' : 'Livro cadastrado',
      message: 'Operacao mock concluida. Integrar com API para persistir.',
    })
  }

  if (isEditing && !book) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center rounded-2xl border border-line/45 bg-white p-6 text-center shadow-sm">
        <BookImage size={36} className="text-brand-deep" />
        <h1 className="mt-4 text-xl font-semibold text-ink">
          Livro nao encontrado
        </h1>
        <p className="mt-2 text-sm text-ink-dim">
          Nao foi possivel carregar os dados para edicao.
        </p>
        <Link
          to="/"
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep"
        >
          <ArrowLeft size={16} />
          Voltar para home
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-5xl">
      <Link
        to={book ? `/books/${book.id}` : '/'}
        className="mb-5 inline-flex items-center gap-2 rounded-lg border border-line/55 bg-white px-3 py-2 text-sm font-medium text-ink-dim shadow-sm transition-colors hover:border-accent/35 hover:text-brand-deep"
      >
        <ArrowLeft size={16} />
        Voltar
      </Link>

      <form
        key={bookId ?? 'new-book'}
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl border border-line/45 bg-white shadow-sm"
      >
        <div className="h-1.5 bg-gradient-to-r from-accent via-brand-deep to-accent" />
        <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[1fr_0.75fr]">
          <section>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-deep">
              {isEditing ? 'Editar livro' : 'Novo livro'}
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-ink">
              {isEditing ? 'Atualize os dados do livro' : 'Cadastre um livro'}
            </h1>
            <p className="mt-2 text-sm text-ink-dim">
              Informe os dados principais para que outros leitores encontrem o
              exemplar certo.
            </p>
            {saved ? (
              <p className="mt-3 rounded-lg border border-accent/25 bg-accent/5 px-3 py-2 text-xs font-semibold text-accent">
                Dados salvos localmente (mock). Proximo passo: enviar para API.
              </p>
            ) : null}

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 sm:col-span-2">
                <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                  Titulo
                </span>
                <input
                  defaultValue={book?.title}
                  placeholder="Ex: Dom Casmurro"
                  className="h-11 w-full rounded-lg border border-line/45 bg-[#fbfaf7] px-3.5 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/12"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                  Autor
                </span>
                <input
                  defaultValue={book?.author}
                  placeholder="Nome do autor"
                  className="h-11 w-full rounded-lg border border-line/45 bg-[#fbfaf7] px-3.5 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/12"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                  ISBN
                </span>
                <input
                  placeholder="978-85-..."
                  className="h-11 w-full rounded-lg border border-line/45 bg-[#fbfaf7] px-3.5 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/12"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                  Genero
                </span>
                <select
                  defaultValue={book?.category ?? 'Romance'}
                  className="h-11 w-full rounded-lg border border-line/45 bg-[#fbfaf7] px-3.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/12"
                >
                  {genres.map((genre) => (
                    <option key={genre}>{genre}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                  Estado
                </span>
                <select
                  defaultValue={book?.condition ?? 'Muito bom'}
                  className="h-11 w-full rounded-lg border border-line/45 bg-[#fbfaf7] px-3.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/12"
                >
                  {conditions.map((condition) => (
                    <option key={condition}>{condition}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-1.5 sm:col-span-2">
                <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                  Cidade
                </span>
                <input
                  defaultValue={book?.city}
                  placeholder="Cidade, UF"
                  className="h-11 w-full rounded-lg border border-line/45 bg-[#fbfaf7] px-3.5 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/12"
                />
              </label>

              <label className="space-y-1.5 sm:col-span-2">
                <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                  Descricao
                </span>
                <textarea
                  defaultValue={book?.description}
                  rows={5}
                  placeholder="Conte sobre estado, edicao, marcas de uso e detalhes importantes."
                  className="w-full resize-none rounded-lg border border-line/45 bg-[#fbfaf7] px-3.5 py-3 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/12"
                />
              </label>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-xl border border-line/45 bg-[#fbfaf7] p-4">
              <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-lg border border-line/35 bg-white">
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt={`Capa do livro ${book?.title ?? 'novo livro'}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <BookImage size={40} className="text-brand-deep" />
                )}
              </div>
              <div className="mt-4 space-y-1.5">
                <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                  Foto da capa
                </span>
                <label
                  htmlFor="book-cover-file"
                  className="group flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-line/55 bg-white px-3 py-4 text-center transition-colors hover:border-accent/55 hover:bg-[#fbfaf7]"
                >
                  <input
                    id="book-cover-file"
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      setCoverFile(event.target.files?.[0] ?? null)
                    }
                    className="sr-only"
                  />
                  <span className="text-sm font-medium text-ink-dim group-hover:text-brand-deep">
                    Clique para enviar capa
                  </span>
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep"
              >
                <Save size={17} />
                {isEditing ? 'Salvar alteracoes' : 'Cadastrar livro'}
              </button>
              {isEditing ? (
                <button
                  type="button"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-line/55 bg-white px-4 text-sm font-semibold text-ink-dim shadow-sm transition-colors hover:border-brand-deep/35 hover:text-brand-deep"
                >
                  <Trash2 size={17} />
                  Excluir livro
                </button>
              ) : null}
            </div>
          </aside>
        </div>
      </form>
    </main>
  )
}
