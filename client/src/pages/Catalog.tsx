import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Edit3,
  Filter,
  MapPin,
  MoreVertical,
  Search,
  Trash2,
} from 'lucide-react'
import { getCurrentUserId } from '../services/auth'
import { ApiError } from '../services/http'
import {
  formatCityWithState,
  listBrazilianStates,
  listCitiesByState,
  parseCityWithState,
} from '../services/locations'
import {
  deleteBook,
  getMyFavoriteGenres,
  listBooks,
  listGenres,
  type ApiBook,
  type ApiGenre,
} from '../services/books'
import { useToast } from '../stores/useToast'
import BookCard from '../components/books/BookCard'

export default function Catalog() {
  const navigate = useNavigate()
  const toast = useToast()
  const currentUserId = useMemo(() => getCurrentUserId(), [])
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const query = (searchParams.get('q') ?? '').trim()
  const [genre, setGenre] = useState(searchParams.get('genre') ?? 'Todos')
  const [condition, setCondition] = useState(
    searchParams.get('estado') ?? 'Qualquer estado'
  )
  const [locationTerm, setLocationTerm] = useState(
    searchParams.get('cidade') ?? ''
  )
  const parsedLocation = parseCityWithState(searchParams.get('cidade') ?? '')
  const [uf, setUf] = useState(parsedLocation.stateCode)
  const [city, setCity] = useState(parsedLocation.city)
  const [books, setBooks] = useState<ApiBook[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [apiGenres, setApiGenres] = useState<ApiGenre[]>([])
  const [favoriteGenres, setFavoriteGenres] = useState<ApiGenre[]>([])
  const [states, setStates] = useState<Array<{ code: string; name: string }>>(
    []
  )
  const [cities, setCities] = useState<string[]>([])
  const [isLoadingStates, setIsLoadingStates] = useState(true)
  const [isLoadingCities, setIsLoadingCities] = useState(false)
  const selectedGenreId = useMemo(
    () => apiGenres.find((g) => g.nome === genre)?.id,
    [apiGenres, genre]
  )
  const availableGenres = useMemo(() => {
    if (favoriteGenres.length > 0) return favoriteGenres
    return apiGenres
  }, [apiGenres, favoriteGenres])
  const effectiveGenre = useMemo(() => {
    if (genre === 'Todos') return 'Todos'
    return availableGenres.some((item) => item.nome === genre) ? genre : 'Todos'
  }, [availableGenres, genre])

  useEffect(() => {
    listGenres()
      .then((res) => setApiGenres(res.data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    getMyFavoriteGenres()
      .then((res) => setFavoriteGenres(res.data))
      .catch(() => setFavoriteGenres([]))
  }, [])

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

  useEffect(() => {
    let active = true

    async function load() {
      setIsLoading(true)
      try {
        const response = await listBooks({
          q: query || undefined,
          id_genero: selectedGenreId,
          estado_conservacao:
            condition === 'Qualquer estado' ? undefined : condition,
          cidade: locationTerm.trim() || undefined,
          per_page: 30,
        })

        if (!active) return
        const tradeableBooks = response.data.filter(
          (book) => book.id_usuario_dono !== currentUserId
        )

        setBooks(tradeableBooks)
      } catch (err) {
        if (!active) return
        toast.error({
          title: 'Erro',
          message:
            err instanceof ApiError
              ? err.message
              : 'Nao foi possivel carregar o catalogo.',
        })
      } finally {
        if (active) setIsLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [query, condition, locationTerm, selectedGenreId, currentUserId])

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  async function handleDelete(book: ApiBook) {
    const confirmed = window.confirm(`Excluir "${book.titulo}"?`)
    if (!confirmed) return
    setOpenMenuId(null)
    try {
      const response = await deleteBook(book.id)
      toast.success({ title: 'Livro removido', message: response.message })
      setBooks((prev) => prev.filter((b) => b.id !== book.id))
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Nao foi possivel excluir o livro.'
      toast.error({ title: 'Erro ao excluir', message })
    }
  }

  function handleApplyFilters() {
    const params = new URLSearchParams(searchParams)
    if (effectiveGenre !== 'Todos') {
      params.set('genre', effectiveGenre)
    } else {
      params.delete('genre')
    }

    if (condition && condition !== 'Qualquer estado') {
      params.set('estado', condition)
    } else {
      params.delete('estado')
    }

    const normalizedLocation = formatCityWithState(city, uf)

    if (normalizedLocation) {
      params.set('cidade', normalizedLocation)
    } else {
      params.delete('cidade')
    }

    setLocationTerm(normalizedLocation)

    setSearchParams(params)
  }

  return (
    <main className="mx-auto w-full space-y-3">
      <section className="">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-ink">
              Trocas Disponiveis
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-5 text-ink-dim">
              Descubra livros para troca com filtros por genero, conservacao e
              localizacao.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-line/45 bg-white p-3 shadow-sm sm:p-3.5">
        <div className="grid gap-2.5 md:grid-cols-[1fr_1fr_1.35fr_auto]">
          <label className="block">
            <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-deep">
              <Filter size={14} />
              Genero
            </span>
            <select
              value={effectiveGenre}
              onChange={(event) => setGenre(event.target.value)}
              className="h-9 w-full rounded-lg border border-line/55 bg-[#fbfaf7] px-3 text-sm text-ink outline-none transition-colors focus:border-accent"
            >
              <option>Todos</option>
              {availableGenres.map((g) => (
                <option key={g.id}>{g.nome}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-brand-deep">
              Estado
            </span>
            <select
              value={condition}
              onChange={(event) => setCondition(event.target.value)}
              className="h-9 w-full rounded-lg border border-line/55 bg-[#fbfaf7] px-3 text-sm text-ink outline-none transition-colors focus:border-accent"
            >
              <option value="">Qualquer estado</option>
              <option value="Novo">★★★★★ Novo</option>
              <option value="Muito bom">★★★★☆ Muito bom</option>
              <option value="Bom">★★★☆☆ Bom</option>
              <option value="Usado">★★☆☆☆ Usado</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-deep">
              <MapPin size={14} />
              Estado
            </span>
            <select
              value={uf}
              onChange={(event) => {
                setUf(event.target.value)
                setCity('')
                setCities([])
              }}
              disabled={isLoadingStates}
              className="h-9 w-full rounded-lg border border-line/55 bg-[#fbfaf7] px-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-accent"
            >
              <option value="">
                {isLoadingStates ? 'Carregando estados...' : 'Selecione a UF'}
              </option>
              {states.map((stateOption) => (
                <option key={stateOption.code} value={stateOption.code}>
                  {stateOption.name} ({stateOption.code})
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-deep">
              <MapPin size={14} />
              Cidade
            </span>
            <select
              value={city}
              onChange={(event) => setCity(event.target.value)}
              disabled={!uf || isLoadingCities}
              className="h-9 w-full rounded-lg border border-line/55 bg-[#fbfaf7] px-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-accent"
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

          <button
            type="button"
            onClick={handleApplyFilters}
            className="inline-flex h-9 items-center justify-center gap-2 self-end rounded-lg border border-line/55 bg-white px-4 text-sm font-semibold text-ink-dim shadow-sm transition-colors hover:border-accent/35 hover:text-brand-deep"
          >
            <Search size={16} />
            Filtrar
          </button>
        </div>
      </section>

      {isLoading ? (
        <section className="rounded-xl border border-line/45 bg-white p-3 text-sm text-ink-dim shadow-sm sm:p-3.5">
          Carregando catalogo...
        </section>
      ) : null}

      <section className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {books.map((book) => {
          const isOwner = book.id_usuario_dono === currentUserId
          const isMenuOpen = openMenuId === book.id
          return (
            <div
              key={book.id}
              className="group relative overflow-hidden rounded-xl border border-line/45 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-md"
            >
              <Link to={`/app/books/${book.id}`} className="block">
                <div className="transition-transform duration-300 group-hover:scale-[1.02]">
                  <BookCard
                    title={book.titulo}
                    cover={book.fotos?.[0]}
                    coverAlt={`Capa do livro ${book.titulo}`}
                    metadata={[
                      book.autor,
                      book.estado_conservacao || 'Estado nao informado',
                      book.cidade ?? 'Localizacao nao informada',
                    ]}
                    status={book.status}
                  />
                </div>
              </Link>

              {isOwner ? (
                <div
                  className="absolute right-1.5 top-1.5"
                  ref={isMenuOpen ? menuRef : null}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      setOpenMenuId(isMenuOpen ? null : book.id)
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/40 text-white backdrop-blur-sm transition-opacity hover:bg-black/60"
                    aria-label="Opções do livro"
                  >
                    <MoreVertical size={14} />
                  </button>

                  {isMenuOpen ? (
                    <div className="absolute right-0 top-8 z-20 w-40 overflow-hidden rounded-xl border border-line/45 bg-white p-1 shadow-lg">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          setOpenMenuId(null)
                          navigate(`/app/books/${book.id}/edit`)
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-ink-dim transition-colors hover:bg-[#fbfaf7] hover:text-brand-deep"
                      >
                        <Edit3 size={14} />
                        Editar livro
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          void handleDelete(book)
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-danger transition-colors hover:bg-danger/5"
                      >
                        <Trash2 size={14} />
                        Excluir livro
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          )
        })}
      </section>
      {!isLoading && !books.length ? (
        <section className="ui-empty-state flex flex-col items-center gap-2">
          <Search size={32} className="text-brand-deep" />
          <p className="text-sm font-medium text-ink">
            Nenhum livro encontrado para essa busca.
          </p>
          <p className="text-sm">
            Tente ajustar os filtros ou buscar por outro termo.
          </p>
        </section>
      ) : null}
    </main>
  )
}
