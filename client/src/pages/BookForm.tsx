import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ChevronLeft,
  BookImage,
  ImagePlus,
  Save,
  Trash2,
  X,
} from 'lucide-react'
import { useToast } from '../stores/useToast'
import { uploadImage } from '../services/uploads'
import {
  createBook,
  deleteBook,
  getBook,
  listGenres,
  updateBook,
  type ApiBook,
} from '../services/books'
import { ApiError } from '../services/http'
import {
  formatCityWithState,
  listBrazilianStates,
  listCitiesByState,
  parseCityWithState,
} from '../services/locations'

const conditions = [
  { value: 'Novo', label: '★★★★★ Novo' },
  { value: 'Muito bom', label: '★★★★☆ Muito bom' },
  { value: 'Bom', label: '★★★☆☆ Bom' },
  { value: 'Usado', label: '★★☆☆☆ Usado' },
]

export default function BookForm() {
  const toast = useToast()
  const navigate = useNavigate()
  const { bookId } = useParams()
  const isEditing = Boolean(bookId)

  const [book, setBook] = useState<ApiBook | null>(null)
  const [isLoading, setIsLoading] = useState(isEditing)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [titulo, setTitulo] = useState('')
  const [autor, setAutor] = useState('')
  const [isbn, setIsbn] = useState('')
  const [estado, setEstado] = useState('Muito bom')
  const [uf, setUf] = useState('')
  const [cidade, setCidade] = useState('')
  const [descricao, setDescricao] = useState('')
  const [tradeOptionInput, setTradeOptionInput] = useState('')
  const [tradeOptions, setTradeOptions] = useState<string[]>([])
  const [photos, setPhotos] = useState<string[]>([])
  const [uploadingCount, setUploadingCount] = useState(0)
  const [selectedGenreId, setSelectedGenreId] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [genres, setGenres] = useState<Array<{ id: string; nome: string }>>([])
  const [states, setStates] = useState<Array<{ code: string; name: string }>>(
    []
  )
  const [cities, setCities] = useState<string[]>([])
  const [isLoadingStates, setIsLoadingStates] = useState(true)
  const [isLoadingCities, setIsLoadingCities] = useState(false)

  useEffect(() => {
    let active = true

    async function loadStates() {
      setIsLoadingStates(true)
      try {
        const data = await listBrazilianStates()
        if (!active) return
        setStates(data)
      } catch {
        if (!active) return
        setStates([])
      } finally {
        if (active) setIsLoadingStates(false)
      }
    }

    loadStates()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    async function loadGenres() {
      try {
        const response = await listGenres()
        if (!active) return
        setGenres(response.data)
      } catch {
        if (!active) return
        setGenres([])
      }
    }

    loadGenres()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!isEditing || !bookId) return
    const safeBookId = bookId
    let active = true

    async function loadBook() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await getBook(safeBookId)
        if (!active) return
        const data = response.data
        setBook(data)
        setTitulo(data.titulo)
        setAutor(data.autor)
        setIsbn(data.isbn ?? '')
        setEstado(data.estado_conservacao)
        const parsed = parseCityWithState(data.cidade)
        setUf(parsed.stateCode)
        setCidade(parsed.city)
        setDescricao(data.descricao ?? '')
        setTradeOptions(data.opcoes_troca ?? [])
        setPhotos(data.fotos ?? [])
        setSelectedGenreId(data.id_genero ?? '')
      } catch (err) {
        if (!active) return
        setError(
          err instanceof ApiError
            ? err.message
            : 'Nao foi possivel carregar os dados do livro.'
        )
      } finally {
        if (active) setIsLoading(false)
      }
    }

    loadBook()
    return () => {
      active = false
    }
  }, [bookId, isEditing])

  useEffect(() => {
    if (!uf) return
    let active = true

    async function loadCities() {
      setIsLoadingCities(true)
      try {
        const data = await listCitiesByState(uf)
        if (!active) return
        setCities(data)
      } catch {
        if (!active) return
        setCities([])
      } finally {
        if (active) setIsLoadingCities(false)
      }
    }

    loadCities()

    return () => {
      active = false
    }
  }, [uf])

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    if (!files.length) return

    event.target.value = ''

    setUploadingCount((n) => n + files.length)

    await Promise.allSettled(
      files.map(async (file) => {
        try {
          const result = await uploadImage(file, 'book')
          setPhotos((prev) => [...prev, result.url])
        } catch {
          toast.error({
            title: 'Erro no upload',
            message: `Nao foi possivel enviar "${file.name}".`,
          })
        } finally {
          setUploadingCount((n) => n - 1)
        }
      })
    )
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  function addTradeOption() {
    const normalized = tradeOptionInput.trim().replace(/\s+/g, ' ')

    if (!normalized) {
      return
    }

    if (tradeOptions.includes(normalized)) {
      setTradeOptionInput('')
      return
    }

    if (tradeOptions.length >= 10) {
      setError('Voce pode informar no maximo 10 opcoes de troca.')
      return
    }

    setTradeOptions((prev) => [...prev, normalized])
    setTradeOptionInput('')
  }

  function removeTradeOption(optionToRemove: string) {
    setTradeOptions((prev) => prev.filter((option) => option !== optionToRemove))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setError(null)

    if (!titulo.trim() || !autor.trim()) {
      setIsSaving(false)
      setError('Preencha titulo e autor para continuar.')
      return
    }

    if (!selectedGenreId) {
      setIsSaving(false)
      setError('Selecione um genero para continuar.')
      return
    }

    if (!estado.trim() || !uf || !cidade) {
      setIsSaving(false)
      setError('Selecione estado de conservacao, UF e cidade.')
      return
    }

    const payload = {
      titulo: titulo.trim(),
      autor: autor.trim(),
      isbn: isbn.trim() || null,
      estado_conservacao: estado,
      descricao: descricao.trim() || null,
      opcoes_troca: tradeOptions.length ? tradeOptions : null,
      cidade: formatCityWithState(cidade, uf) || null,
      id_genero: selectedGenreId,
      fotos: photos.length
        ? photos
        : [
            'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80',
          ],
    }

    try {
      if (isEditing && bookId) {
        const response = await updateBook(bookId, payload)
        toast.success({ title: 'Livro atualizado', message: response.message })
        navigate(`/app/books/${bookId}`)
      } else {
        const response = await createBook(payload)
        toast.success({ title: 'Livro cadastrado', message: response.message })
        navigate(`/app/books/${response.data.id}`)
      }
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Nao foi possivel salvar livro.'
      setError(message)
      toast.error({ title: 'Erro ao salvar', message })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!bookId) return
    const confirmed = window.confirm(
      'Tem certeza que deseja excluir este livro?'
    )
    if (!confirmed) return

    setIsDeleting(true)
    try {
      const response = await deleteBook(bookId)
      toast.success({ title: 'Livro removido', message: response.message })
      navigate('/app/catalog')
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Nao foi possivel excluir livro.'
      toast.error({ title: 'Erro ao excluir', message })
      setError(message)
    } finally {
      setIsDeleting(false)
    }
  }

  if (isEditing && isLoading) {
    return (
      <main className="mx-auto w-full space-y-3">
        <section className="rounded-xl border border-line/45 bg-white p-3 text-sm text-ink-dim shadow-sm sm:p-3.5">
          Carregando livro...
        </section>
      </main>
    )
  }

  if (isEditing && !book && error) {
    return (
      <main className="mx-auto w-full space-y-3">
        <section className="rounded-xl border border-brand-deep/25 bg-brand-deep/5 p-3 text-sm font-medium text-brand-deep shadow-sm sm:p-3.5">
          <BookImage size={36} className="text-brand-deep" />
          <h1 className="mt-4 text-xl font-semibold text-ink">
            Livro nao encontrado
          </h1>
          <p className="mt-2 text-sm text-ink-dim">{error}</p>
          <Link
            to="/app/feed"
            className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep"
          >
            <ChevronLeft size={16} />
            Voltar para home
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full space-y-4 pb-16 lg:pb-0">
      <section className="">
        <div className="space-y-1">
          <Link
            to={book ? `/app/books/${book.id}` : '/app/feed'}
            className="inline-flex items-center gap-1 text-sm font-semibold text-ink-muted transition-colors hover:text-brand-deep"
          >
            <ChevronLeft size={16} />
            Voltar
          </Link>
          <h1 className="text-2xl font-semibold text-ink">
            {isEditing ? 'Editar livro' : 'Cadastrar livro'}
          </h1>
        </div>
      </section>

      <form
        id="book-form"
        key={bookId ?? 'new-book'}
        onSubmit={handleSubmit}
        className="rounded-xl border border-line/45 bg-white p-3 shadow-sm sm:p-3.5"
      >
        {error ? (
          <section className="mb-3 rounded-lg border border-brand-deep/25 bg-brand-deep/5 px-3 py-2.5 text-sm font-semibold text-brand-deep">
            {error}
          </section>
        ) : null}

        <div className="mb-3 flex justify-end lg:hidden">
          <button
            type="submit"
            disabled={isSaving || isDeleting || uploadingCount > 0}
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-accent px-3 text-xs font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-50 lg:hidden"
          >
            <Save size={14} />
            {isSaving ? 'Salvando...' : isEditing ? 'Salvar' : 'Cadastrar'}
          </button>
        </div>

        <div className="grid gap-2.5 lg:grid-cols-[1fr_0.75fr]">
          <section>
            <h2 className="text-sm font-semibold text-ink">Dados do livro</h2>

            <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <label className="space-y-1.5 sm:col-span-2">
                <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                  Titulo <span className="text-danger">*</span>
                </span>
                <input
                  value={titulo}
                  onChange={(event) => setTitulo(event.target.value)}
                  placeholder="Ex: Dom Casmurro"
                  className="h-9 w-full rounded-lg border border-line/45 bg-[#fbfaf7] px-3.5 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/12"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                  Autor <span className="text-danger">*</span>
                </span>
                <input
                  value={autor}
                  onChange={(event) => setAutor(event.target.value)}
                  placeholder="Nome do autor"
                  className="h-9 w-full rounded-lg border border-line/45 bg-[#fbfaf7] px-3.5 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/12"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                  ISBN
                </span>
                <input
                  value={isbn}
                  onChange={(event) => setIsbn(event.target.value)}
                  placeholder="978-85-..."
                  className="h-9 w-full rounded-lg border border-line/45 bg-[#fbfaf7] px-3.5 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/12"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                  Genero <span className="text-danger">*</span>
                </span>
                <select
                  value={selectedGenreId}
                  onChange={(event) => setSelectedGenreId(event.target.value)}
                  className="h-9 w-full rounded-lg border border-line/45 bg-[#fbfaf7] px-3.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/12"
                >
                  <option value="">Selecione</option>
                  {genres.map((genre) => (
                    <option key={genre.id} value={genre.id}>
                      {genre.nome}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                  Estado <span className="text-danger">*</span>
                </span>
                <select
                  value={estado}
                  onChange={(event) => setEstado(event.target.value)}
                  className="h-9 w-full rounded-lg border border-line/45 bg-[#fbfaf7] px-3.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/12"
                >
                  {conditions.map((condition) => (
                    <option key={condition.value} value={condition.value}>
                      {condition.label}
                    </option>
                  ))}
                </select>
              </label>

              <section className="sm:col-span-2 rounded-lg border border-line/35 bg-[#fbfaf7] p-2.5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  Localizacao
                </p>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <label className="space-y-1.5">
                    <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                      UF <span className="text-danger">*</span>
                    </span>
                    <select
                      value={uf}
                      onChange={(event) => {
                        setUf(event.target.value)
                        setCidade('')
                        setCities([])
                      }}
                      disabled={isLoadingStates}
                      className="h-9 w-full rounded-lg border border-line/45 bg-white px-3.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/12 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="">
                        {isLoadingStates
                          ? 'Carregando estados...'
                          : 'Selecione a UF'}
                      </option>
                      {states.map((stateOption) => (
                        <option key={stateOption.code} value={stateOption.code}>
                          {stateOption.name} ({stateOption.code})
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-1.5">
                    <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                      Cidade <span className="text-danger">*</span>
                    </span>
                    <select
                      value={cidade}
                      onChange={(event) => setCidade(event.target.value)}
                      disabled={!uf || isLoadingCities}
                      className="h-9 w-full rounded-lg border border-line/45 bg-white px-3.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/12 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="">
                        {!uf
                          ? 'Selecione a UF primeiro'
                          : isLoadingCities
                            ? 'Carregando cidades...'
                            : 'Selecione a cidade'}
                      </option>
                      {cities.map((cityName) => (
                        <option key={cityName} value={cityName}>
                          {cityName}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </section>

              <label className="space-y-1.5 sm:col-span-2">
                <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                  Descricao
                </span>
                <textarea
                  value={descricao}
                  onChange={(event) => setDescricao(event.target.value)}
                  rows={5}
                  placeholder="Conte sobre estado, edicao, marcas de uso e detalhes importantes."
                  className="w-full resize-none rounded-lg border border-line/45 bg-[#fbfaf7] px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/12"
                />
              </label>

              <section className="space-y-2 rounded-lg border border-line/35 bg-[#fbfaf7] p-2.5 sm:col-span-2">
                <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                  Opcoes de troca (opcional)
                </span>
                <p className="text-xs text-ink-muted">
                  Se preencher, so aceitara propostas com livros destes titulos.
                </p>

                <div className="flex gap-2">
                  <input
                    value={tradeOptionInput}
                    onChange={(event) => setTradeOptionInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key !== 'Enter') return
                      event.preventDefault()
                      addTradeOption()
                    }}
                    placeholder="Ex: O Hobbit"
                    className="h-9 w-full rounded-lg border border-line/45 bg-white px-3.5 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/12"
                  />
                  <button
                    type="button"
                    onClick={addTradeOption}
                    className="inline-flex h-9 items-center rounded-lg border border-line/55 bg-white px-3 text-sm font-semibold text-ink-dim transition-colors hover:border-accent/35 hover:text-brand-deep"
                  >
                    Adicionar
                  </button>
                </div>

                {tradeOptions.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {tradeOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => removeTradeOption(option)}
                        className="inline-flex items-center gap-1 rounded-md border border-accent/25 bg-accent/8 px-2.5 py-1 text-xs font-semibold text-accent"
                      >
                        {option}
                        <X size={12} />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-ink-muted">
                    Sem restricao de titulos. Qualquer livro disponivel pode ser ofertado.
                  </p>
                )}
              </section>
            </div>
          </section>

          <aside className="space-y-3">
            <div className="rounded-xl border border-line/45 bg-[#fbfaf7] p-3 sm:p-3.5">
              <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                Fotos do livro
              </span>

              <div className="mt-2 grid grid-cols-2 gap-2">
                {photos.map((url, index) => (
                  <div
                    key={url}
                    className="group relative aspect-[3/4] overflow-hidden rounded-lg border border-line/35 bg-white"
                  >
                    <img
                      src={url}
                      alt={`Foto ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label="Remover foto"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}

                {uploadingCount > 0
                  ? Array.from({ length: uploadingCount }).map((_, i) => (
                      <div
                        key={i}
                        className="flex aspect-[3/4] animate-pulse items-center justify-center rounded-lg border border-line/35 bg-white"
                      >
                        <BookImage size={24} className="text-line" />
                      </div>
                    ))
                  : null}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex aspect-[3/4] flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-line/45 bg-white text-ink-muted transition-colors hover:border-accent/50 hover:text-accent"
                >
                  <ImagePlus size={22} />
                  <span className="text-xs font-medium">Adicionar</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />

              <p className="mt-2 text-xs text-ink-muted">
                JPG, PNG ou WEBP. A primeira foto e a capa.
              </p>
              {photos.length > 0 ? (
                <span className="mt-2 inline-flex w-fit rounded-md border border-accent/25 bg-accent/10 px-2 py-1 text-[11px] font-semibold text-brand-deep">
                  Capa atual: Foto 1
                </span>
              ) : null}
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                type="submit"
                disabled={isSaving || isDeleting || uploadingCount > 0}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save size={17} />
                {uploadingCount > 0
                  ? 'Enviando fotos...'
                  : isSaving
                    ? 'Salvando...'
                    : isEditing
                      ? 'Salvar alteracoes'
                      : 'Cadastrar livro'}
              </button>
              {isEditing ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSaving || isDeleting}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-line/55 bg-white px-4 text-sm font-semibold text-ink-dim shadow-sm transition-colors hover:border-brand-deep/35 hover:text-brand-deep disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 size={17} />
                  {isDeleting ? 'Excluindo...' : 'Excluir livro'}
                </button>
              ) : null}
            </div>
          </aside>
        </div>
      </form>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line/35 bg-white/95 px-4 py-2 backdrop-blur lg:hidden">
        <button
          type="submit"
          form="book-form"
          disabled={isSaving || isDeleting || uploadingCount > 0}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save size={16} />
          {uploadingCount > 0
            ? 'Enviando fotos...'
            : isSaving
              ? 'Salvando...'
              : isEditing
                ? 'Salvar alteracoes'
                : 'Cadastrar livro'}
        </button>
      </div>
    </main>
  )
}
