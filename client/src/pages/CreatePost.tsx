import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Image, Link2, PenSquare, Send } from 'lucide-react'
import { books } from '../data/books'
import { useToast } from '../stores/useToast'

export default function CreatePost() {
  const toast = useToast()
  const [title, setTitle] = useState('')
  const [bookId, setBookId] = useState('')
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const imagePreview = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : null),
    [imageFile]
  )

  useEffect(
    () => () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    },
    [imagePreview]
  )

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    toast.success({
      title: 'Post publicado',
      message: 'Publicacao mock criada. Integrar com API para salvar.',
    })
  }

  return (
    <main className="mx-auto w-full max-w-4xl space-y-5">
      <section className="overflow-hidden rounded-2xl border border-line/45 bg-white shadow-sm">
        <div className="h-1.5 bg-gradient-to-r from-accent via-brand-deep to-accent" />
        <div className="p-4 sm:p-5">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-deep">
            <PenSquare size={15} />
            Nova conversa
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-ink">Criar post</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-dim">
            Publique uma recomendacao, pedido de troca ou relato de leitura para
            a comunidade.
          </p>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-line/45 bg-white p-4 shadow-sm sm:p-5"
      >
        <div className="grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-ink">Titulo</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              type="text"
              placeholder="Ex.: Quem topa ler Machado este mes?"
              className="h-11 rounded-lg border border-line/55 bg-[#fbfaf7] px-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-accent/55 focus:bg-white"
            />
          </label>

          <label className="grid gap-2">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
              <Link2 size={16} className="text-brand-deep" />
              Livro vinculado
            </span>
            <select
              value={bookId}
              onChange={(event) => setBookId(event.target.value)}
              className="h-11 rounded-lg border border-line/55 bg-[#fbfaf7] px-3 text-sm text-ink outline-none transition-colors focus:border-accent/55 focus:bg-white"
            >
              <option value="">Sem livro vinculado</option>
              {books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title} - {book.author}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-ink">Conteudo</span>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={8}
              placeholder="Escreva sua recomendacao, duvida ou convite..."
              className="resize-none rounded-lg border border-line/55 bg-[#fbfaf7] px-3 py-3 text-sm leading-6 text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-accent/55 focus:bg-white"
            />
          </label>

          <div className="grid gap-2">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
              <Image size={16} className="text-brand-deep" />
              Imagem opcional
            </span>
            <label
              htmlFor="post-image-file"
              className="group flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-line/55 bg-[#fbfaf7] px-3 py-4 text-center transition-colors hover:border-accent/55 hover:bg-white"
            >
              <input
                id="post-image-file"
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setImageFile(event.target.files?.[0] ?? null)
                }
                className="sr-only"
              />
              <span className="text-sm font-medium text-ink-dim group-hover:text-brand-deep">
                Clique para enviar imagem
              </span>
            </label>
          </div>
          {imagePreview ? (
            <div className="overflow-hidden rounded-lg border border-line/35 bg-white p-2">
              <img
                src={imagePreview}
                alt="Previa da imagem do post"
                className="max-h-56 w-full rounded object-cover"
              />
            </div>
          ) : null}
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-accent px-5 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep"
          >
            <Send size={17} />
            Publicar
          </button>
        </div>
      </form>
    </main>
  )
}
