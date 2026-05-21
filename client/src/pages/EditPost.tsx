import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { ChevronLeft, Image, Link2, Save } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useToast } from '../stores/useToast'
import { getPost, updatePost } from '../services/posts'
import { uploadImage } from '../services/uploads'
import { listBooks } from '../services/books'
import type { ApiBook } from '../services/books'
import { ApiError } from '../services/http'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MIN_DIMENSION = 320

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

export default function EditPost() {
  const { postId } = useParams<{ postId: string }>()
  const toast = useToast()
  const navigate = useNavigate()

  const [titulo, setTitulo] = useState('')
  const [idLivro, setIdLivro] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [imagemUrlAtual, setImagemUrlAtual] = useState('')
  const [imagemFile, setImagemFile] = useState<File | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const abortControllerRef = useRef<AbortController | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingPost, setIsLoadingPost] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [books, setBooks] = useState<ApiBook[]>([])
  const [booksLoading, setBooksLoading] = useState(true)
  const imagePreviewUrl = useMemo(
    () => (imagemFile ? URL.createObjectURL(imagemFile) : null),
    [imagemFile]
  )

  useEffect(() => {
    if (!postId) return

    let active = true

    async function load() {
      setIsLoadingPost(true)
      setLoadError(null)
      try {
        const [postRes] = await Promise.all([
          getPost(postId!),
          listBooks({ per_page: 100 })
            .then((res) => {
              if (active) setBooks(res.data)
            })
            .catch(() => {
              if (active) setBooks([])
            })
            .finally(() => {
              if (active) setBooksLoading(false)
            }),
        ])
        if (!active) return
        setTitulo(postRes.data.titulo)
        setConteudo(postRes.data.conteudo)
        setIdLivro(postRes.data.id_livro ?? '')
        setImagemUrlAtual(postRes.data.imagem_url ?? '')
      } catch (err) {
        if (!active) return
        setLoadError(
          err instanceof ApiError
            ? err.message
            : 'Não foi possível carregar o post.'
        )
      } finally {
        if (active) setIsLoadingPost(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [postId])

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
    if (file.size > 5 * 1024 * 1024) {
      setImageError('A imagem deve ter no máximo 5 MB.')
      return
    }
    const dimError = await validateImageDimensions(file)
    if (dimError) {
      setImageError(dimError)
      return
    }
    setRemoveCurrentImage(false)
    setUploadProgress(0)
    setImagemFile(file)
  }

  function handleCancelUpload() {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    setIsUploadingImage(false)
    setUploadProgress(0)
    setIsSubmitting(false)
    toast.error({
      title: 'Upload cancelado',
      message: 'Selecione a imagem novamente para atualizar o post.',
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!postId || !titulo.trim() || !conteudo.trim()) return
    setIsSubmitting(true)
    try {
      let uploadedImageUrl: string | null =
        removeCurrentImage && !imagemFile ? null : imagemUrlAtual || null

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

      await updatePost(postId, {
        titulo: titulo.trim(),
        conteudo: conteudo.trim(),
        id_livro: idLivro || null,
        imagem_url: uploadedImageUrl,
      })
      toast.success({ title: 'Post atualizado com sucesso!' })
      navigate('/app/feed')
    } catch (err) {
      setIsUploadingImage(false)
      abortControllerRef.current = null
      if (err instanceof Error && err.name === 'AbortError') return
      toast.error({
        title: 'Não foi possível atualizar',
        message:
          err instanceof ApiError
            ? err.message
            : 'Tente novamente em instantes.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingPost) {
    return (
      <main className="mx-auto w-full space-y-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="ui-btn inline-flex items-center gap-2 rounded-lg border border-line/55 bg-white px-3 py-2 text-sm font-medium text-ink-dim shadow-sm transition-colors hover:border-accent/35 hover:text-brand-deep"
        >
          <ChevronLeft size={16} />
          Voltar
        </button>
        <div className="rounded-xl border border-line/45 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 text-ink-dim">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-line/45 border-t-brand-deep" />
            <span className="text-sm">Carregando post...</span>
          </div>
        </div>
      </main>
    )
  }

  if (loadError) {
    return (
      <main className="mx-auto w-full space-y-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-sm font-semibold text-ink-muted transition-colors hover:text-brand-deep"
        >
          <ChevronLeft size={16} />
          Voltar
        </button>
        <h1 className="text-2xl font-semibold text-ink">Editar post</h1>
        <div className="rounded-xl border border-brand-deep/25 bg-brand-deep/5 p-4 shadow-sm">
          <p className="text-sm font-medium text-brand-deep">{loadError}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full space-y-3">
      <section>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 text-sm font-semibold text-ink-muted transition-colors hover:text-brand-deep"
          >
            <ChevronLeft size={16} />
            Voltar
          </button>
          <h1 className="text-2xl font-semibold text-ink">Editar post</h1>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-line/45 bg-white p-3 shadow-sm sm:p-3.5"
      >
        <div className="grid gap-2.5">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-ink">Título</span>
            <input
              value={titulo}
              onChange={(event) => setTitulo(event.target.value)}
              type="text"
              required
              placeholder="Ex.: Quem topa ler Machado este mês?"
              className="h-9 rounded-lg border border-line/55 bg-[#fbfaf7] px-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-accent/55 focus:bg-white"
            />
          </label>

          <label className="grid gap-2">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
              <Link2 size={16} className="text-brand-deep" />
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

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-ink">Conteúdo</span>
            <textarea
              value={conteudo}
              onChange={(event) => setConteudo(event.target.value)}
              required
              rows={8}
              placeholder="Escreva sua recomendação, dúvida ou convite..."
              className="resize-none rounded-lg border border-line/55 bg-[#fbfaf7] px-3 py-2.5 text-sm leading-6 text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-accent/55 focus:bg-white"
            />
          </label>

          <div className="grid gap-2">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
              <Image size={16} className="text-brand-deep" />
              Imagem (opcional)
            </span>
            <label className="group grid cursor-pointer gap-2 rounded-lg border border-dashed border-line/60 bg-[#fbfaf7] p-3 transition-colors hover:border-accent/40 hover:bg-white">
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) {
                    void applyFile(file)
                  }
                }}
                className="hidden"
              />
              <span className="text-sm font-semibold text-ink">
                {imagePreviewUrl || (imagemUrlAtual && !removeCurrentImage)
                  ? 'Trocar imagem selecionada'
                  : 'Clique para selecionar uma imagem'}
              </span>
              <span className="text-xs text-ink-muted">
                JPG, PNG ou WEBP ate 5 MB.
              </span>
            </label>
            {imageError ? (
              <p className="text-xs font-medium text-brand-deep">
                {imageError}
              </p>
            ) : null}
          </div>

          {imagePreviewUrl || (imagemUrlAtual && !removeCurrentImage) ? (
            <div className="space-y-2 overflow-hidden rounded-lg border border-line/35 bg-white p-2">
              <img
                src={imagePreviewUrl ?? imagemUrlAtual}
                alt="Prévia da imagem do post"
                className="max-h-56 w-full rounded object-cover"
              />
              <div className="rounded-md bg-[#f6f4ef] px-2 py-1.5 text-xs text-ink-dim">
                {imagemFile?.name ?? 'Imagem atual do post'}
              </div>
              {isUploadingImage ? (
                <div className="space-y-1">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-line/40">
                    <div
                      className="h-full rounded-full bg-accent transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs font-medium text-ink-dim">
                    Enviando imagem: {uploadProgress}%
                  </p>
                </div>
              ) : null}
              <div className="flex justify-end">
                {isUploadingImage ? (
                  <button
                    type="button"
                    onClick={handleCancelUpload}
                    className="ui-btn mr-2 inline-flex h-8 items-center rounded-lg border border-brand-deep/40 px-3 text-xs font-semibold text-brand-deep transition-colors hover:bg-brand-deep/10"
                  >
                    Cancelar upload
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    setImagemFile(null)
                    setImageError(null)
                    setUploadProgress(0)
                    setRemoveCurrentImage(true)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  className="ui-btn inline-flex h-8 items-center rounded-lg border border-line/55 px-3 text-xs font-semibold text-ink-dim transition-colors hover:border-accent/35 hover:text-brand-deep"
                >
                  Excluir imagem
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={
              isSubmitting ||
              isUploadingImage ||
              !titulo.trim() ||
              !conteudo.trim() ||
              Boolean(imageError)
            }
            className="ui-btn inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-accent px-5 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                {isUploadingImage ? 'Enviando imagem...' : 'Salvando...'}
              </>
            ) : (
              <>
                <Save size={17} />
                Salvar alterações
              </>
            )}
          </button>
        </div>
      </form>
    </main>
  )
}
