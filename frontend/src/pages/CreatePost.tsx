import { useEffect, useMemo, useRef, useState } from 'react'
import type { DragEvent, FormEvent, KeyboardEvent } from 'react'
import {
  BookOpen,
  Send,
  ChevronLeft,
  Image,
  X,
  UploadCloud,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../stores/useToast'
import { createPost } from '../services/posts'
import { uploadImage } from '../services/uploads'
import { listBooks } from '../services/books'
import type { ApiBook } from '../services/books'
import { ApiError } from '../services/http'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_BYTES = 5 * 1024 * 1024
const MIN_DIMENSION = 320

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function validateImageDimensions(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new window.Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      if (img.width < MIN_DIMENSION || img.height < MIN_DIMENSION) {
        resolve(
          `A imagem deve ter pelo menos ${MIN_DIMENSION}×${MIN_DIMENSION} pixels`
        )
      } else {
        resolve(null)
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve('Não foi possível ler a imagem.')
    }
    img.src = url
  })
}

export default function CreatePost() {
  const toast = useToast()
  const navigate = useNavigate()
  const [titulo, setTitulo] = useState('')
  const [idLivro, setIdLivro] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [imagemFile, setImagemFile] = useState<File | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const abortControllerRef = useRef<AbortController | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [books, setBooks] = useState<ApiBook[]>([])
  const [booksLoading, setBooksLoading] = useState(true)
  const imagePreviewUrl = useMemo(
    () => (imagemFile ? URL.createObjectURL(imagemFile) : null),
    [imagemFile]
  )

  useEffect(() => {
    let active = true
    listBooks({ per_page: 100 })
      .then((res) => {
        if (active) setBooks(res.data)
      })
      .catch(() => {
        if (active) setBooks([])
      })
      .finally(() => {
        if (active) setBooksLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl)
      }
    }
  }, [imagePreviewUrl])

  async function applyFile(file: File) {
    setImageError(null)
    setImagemFile(null)
    if (!ALLOWED_TYPES.includes(file.type)) {
      setImageError('Formato inválido. Use apenas JPG, JPEG, PNG ou WEBP.')
      return
    }
    if (file.size > MAX_BYTES) {
      setImageError('A imagem deve ter no máximo 5 MB.')
      return
    }
    const dimError = await validateImageDimensions(file)
    if (dimError) {
      setImageError(dimError)
      return
    }
    setUploadProgress(0)
    setImagemFile(file)
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) void applyFile(file)
  }

  function handleDropzoneKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      fileInputRef.current?.click()
    }
  }

  function handleRemoveImage() {
    setImagemFile(null)
    setImageError(null)
    setUploadProgress(0)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleCancelUpload() {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    setIsUploadingImage(false)
    setUploadProgress(0)
    setIsSubmitting(false)
    toast.error({
      title: 'Upload cancelado',
      message: 'Selecione a imagem novamente para publicar o post.',
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!titulo.trim() || !conteudo.trim()) return
    setIsSubmitting(true)
    try {
      let uploadedImageUrl: string | null = null
      if (imagemFile) {
        const controller = new AbortController()
        abortControllerRef.current = controller
        setIsUploadingImage(true)
        setUploadProgress(0)
        const upload = await uploadImage(imagemFile, 'post', {
          signal: controller.signal,
          maxRetries: 2,
          onProgress: ({ percent }) => setUploadProgress(percent),
        })
        uploadedImageUrl = upload.url
        abortControllerRef.current = null
        setIsUploadingImage(false)
        setUploadProgress(100)
      }

      await createPost({
        titulo: titulo.trim(),
        conteudo: conteudo.trim(),
        id_livro: idLivro || null,
        imagem_url: uploadedImageUrl,
      })
      toast.success({ title: 'Post publicado com sucesso!' })
      navigate('/app/feed')
    } catch (err) {
      setIsUploadingImage(false)
      abortControllerRef.current = null
      if (err instanceof Error && err.name === 'AbortError') return
      toast.error({
        title: 'Não foi possível publicar',
        message:
          err instanceof ApiError
            ? err.message
            : 'Tente novamente em instantes.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl space-y-4">
      <section className="">
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-muted transition-colors hover:text-brand-deep"
          >
            <ChevronLeft size={16} />
            Voltar
          </button>
          <h1 className="text-2xl font-semibold text-ink">Criar post</h1>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-line/45 bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="grid gap-5">
          <div className="grid gap-2">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-ink">Título</span>
              <span
                className={`text-xs tabular-nums transition-colors ${
                  titulo.length > 90
                    ? 'font-semibold text-danger'
                    : titulo.length > 70
                      ? 'font-semibold text-amber-500'
                      : 'text-ink-muted'
                }`}
              >
                {titulo.length} / 100
              </span>
            </div>
            <input
              value={titulo}
              onChange={(event) => setTitulo(event.target.value)}
              type="text"
              required
              maxLength={100}
              placeholder="Ex.: Quem topa ler Machado este mês?"
              className="h-9 rounded-lg border border-line/55 bg-[#fbfaf7] px-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-accent/55 focus:bg-white"
            />
          </div>

          <label className="grid gap-2">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
              <BookOpen size={16} className="text-brand-deep" />
              Livro vinculado
            </span>
            <select
              value={idLivro}
              onChange={(event) => setIdLivro(event.target.value)}
              disabled={booksLoading}
              className="h-9 rounded-lg border border-line/55 bg-[#fbfaf7] px-3 text-sm text-ink outline-none transition-colors focus:border-accent/55 focus:bg-white disabled:opacity-60"
            >
              <option value="">
                {booksLoading ? 'Carregando livros...' : 'Sem livro vinculado'}
              </option>
              {books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.titulo} — {book.autor}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-2">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-ink">Conteúdo</span>
              <span
                className={`text-xs tabular-nums transition-colors ${
                  conteudo.length > 2800
                    ? 'font-semibold text-danger'
                    : conteudo.length > 2400
                      ? 'font-semibold text-amber-500'
                      : 'text-ink-muted'
                }`}
              >
                {conteudo.length} / 3000
              </span>
            </div>
            <textarea
              value={conteudo}
              onChange={(event) => setConteudo(event.target.value)}
              required
              maxLength={3000}
              rows={8}
              placeholder="Escreva sua recomendação, dúvida ou convite..."
              className="resize-none rounded-lg border border-line/55 bg-[#fbfaf7] px-3 py-2.5 text-sm leading-6 text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-accent/55 focus:bg-white"
            />
          </div>

          {/* Imagem */}
          <div className="grid gap-2">
            <span
              id="create-post-image-label"
              className="inline-flex items-center gap-2 text-sm font-semibold text-ink"
            >
              <Image size={16} className="text-brand-deep" />
              Imagem (opcional)
            </span>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              id="create-post-image-input"
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              aria-labelledby="create-post-image-label"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) void applyFile(file)
              }}
              className="sr-only"
            />

            {/* Dropzone — only when no file is selected */}
            {!imagemFile && (
              <div
                role="button"
                tabIndex={0}
                aria-label="Área para soltar imagem. Pressione Enter ou Espaço para abrir o seletor de arquivo."
                aria-describedby="create-post-image-hint"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={handleDropzoneKeyDown}
                className={[
                  'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2',
                  isDragging
                    ? 'border-accent bg-accent-dim/40 text-accent'
                    : 'border-line/55 bg-[#fbfaf7] text-ink-muted hover:border-accent/55 hover:bg-white hover:text-ink-dim',
                ].join(' ')}
              >
                <UploadCloud size={28} strokeWidth={1.5} />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">
                    Arraste e solte ou{' '}
                    <span className="text-accent">clique para selecionar</span>
                  </p>
                  <p
                    id="create-post-image-hint"
                    className="text-xs text-ink-ghost"
                  >
                    JPG, JPEG, PNG ou WEBP · máx. 5 MB · mín. 320×320 px
                  </p>
                </div>
              </div>
            )}

            {/* Error / status live region */}
            <div
              aria-live="polite"
              aria-atomic="true"
              className="min-h-[1.25rem]"
            >
              {imageError && (
                <p role="alert" className="text-xs font-medium text-danger">
                  {imageError}
                </p>
              )}
            </div>
          </div>

          {/* Preview card */}
          {imagemFile && imagePreviewUrl && (
            <div className="overflow-hidden rounded-lg border border-line/35 bg-white">
              <img
                src={imagePreviewUrl}
                alt="Prévia da imagem do post"
                className="max-h-60 w-full rounded-t-lg object-cover"
              />

              {/* File meta + actions */}
              <div className="flex items-center gap-3 border-t border-line/35 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-ink">
                    {imagemFile.name}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {formatBytes(imagemFile.size)}
                  </p>
                </div>

                {isUploadingImage ? (
                  <button
                    type="button"
                    onClick={handleCancelUpload}
                    className="ui-btn inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-danger-line/60 bg-danger/5 px-2.5 py-1.5 text-xs font-semibold text-danger transition-colors hover:bg-danger/10"
                  >
                    <X size={13} />
                    Cancelar
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="ui-btn inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line/55 px-2.5 py-1.5 text-xs font-semibold text-ink-dim transition-colors hover:border-accent/35 hover:text-brand-deep"
                  >
                    <X size={13} />
                    Remover
                  </button>
                )}
              </div>

              {/* Progress bar */}
              {isUploadingImage && (
                <div className="px-3 pb-2.5">
                  <div
                    role="progressbar"
                    aria-valuenow={uploadProgress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Enviando imagem: ${uploadProgress}%`}
                    className="overflow-hidden rounded-full bg-line/30"
                  >
                    <div
                      className="h-1.5 rounded-full bg-accent transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-right text-xs text-ink-muted">
                    {uploadProgress}%
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between border-t border-line/25 pt-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary h-9 px-4 text-sm"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={
              isSubmitting ||
              isUploadingImage ||
              !titulo.trim() ||
              !conteudo.trim() ||
              Boolean(imageError)
            }
            className="btn-primary h-9 px-6 text-sm"
          >
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                {isUploadingImage
                  ? `Enviando... ${uploadProgress}%`
                  : 'Publicando...'}
              </>
            ) : (
              <>
                <Send size={15} />
                Publicar
              </>
            )}
          </button>
        </div>
      </form>
    </main>
  )
}
