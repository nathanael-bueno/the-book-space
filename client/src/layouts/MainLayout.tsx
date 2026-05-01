import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  BookMarked,
  Building2,
  Library,
  PenSquare,
  Plus,
  Search,
  UserCircle2,
} from 'lucide-react'
import { books } from '../data/books'

export default function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const initialQuery = useMemo(() => {
    const params = new URLSearchParams(location.search)
    return params.get('q') ?? ''
  }, [location.search])
  const [query, setQuery] = useState(initialQuery)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const suggestions = useMemo(() => {
    const trimmed = query.trim().toLowerCase()
    if (!trimmed) return []
    return books
      .filter((book) =>
        [book.title, book.author, book.city, book.isbn].some((field) =>
          field.toLowerCase().includes(trimmed)
        )
      )
      .slice(0, 5)
  }, [query])

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const activeQuery = isSearchFocused ? query : initialQuery
    const trimmed = activeQuery.trim()
    const params = new URLSearchParams()
    if (trimmed) params.set('q', trimmed)
    navigate(`/catalog${params.toString() ? `?${params.toString()}` : ''}`)
  }

  return (
    <div className="min-h-screen w-full bg-[#f8f5ef] text-ink">
      <div className="min-h-screen w-full p-4 sm:p-5 md:p-6">
        <header className="mb-5 grid grid-cols-1 gap-3 rounded-2xl border border-line/45 bg-white p-3 shadow-sm md:grid-cols-[auto_1fr_auto] md:items-center md:gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg px-1 py-1 text-sm font-semibold text-ink"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-accent/15 bg-canvas/55 text-brand-deep shadow-sm">
              <BookMarked size={18} />
            </span>
            <span>The Book Space</span>
          </Link>

          <form className="relative block" onSubmit={handleSearch}>
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-muted">
              <Search size={16} />
            </span>
            <input
              type="search"
              value={isSearchFocused ? query : initialQuery}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => {
                setIsSearchFocused(true)
                setQuery(initialQuery)
              }}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 120)}
              placeholder="Buscar por titulo, autor ou ISBN"
              className="h-11 w-full rounded-lg border border-line/45 bg-[#fbfaf7] px-10 pr-14 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/12"
            />
            <button
              type="submit"
              className="absolute inset-y-0 right-1 my-1 inline-flex w-10 items-center justify-center rounded-md text-ink-muted transition-colors hover:text-brand-deep"
              aria-label="Buscar"
            >
              <Search size={16} />
            </button>

            {isSearchFocused && suggestions.length ? (
              <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-xl border border-line/45 bg-white shadow-lg">
                {suggestions.map((book) => (
                  <button
                    key={book.id}
                    type="button"
                    onMouseDown={() => navigate(`/books/${book.id}`)}
                    className="block w-full border-b border-line/25 px-3 py-2.5 text-left last:border-b-0 hover:bg-[#fbfaf7]"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={book.cover}
                        alt={`Capa do livro ${book.title}`}
                        className="h-12 w-9 rounded-md border border-line/35 object-cover"
                        loading="lazy"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">
                          {book.title}
                        </p>
                        <p className="truncate text-xs text-ink-muted">
                          {book.author} · {book.city} · {book.isbn}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : null}
          </form>

          <div className="flex items-center justify-end gap-2">
            <Link
              to="/catalog"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-line/45 bg-white px-3 text-sm font-medium text-ink-muted transition-colors duration-200 hover:border-accent/35 hover:text-brand-deep"
            >
              <Library size={16} />
              Catalogo
            </Link>
            <Link
              to="/feed"
              className="hidden h-10 items-center justify-center gap-2 rounded-lg border border-line/45 bg-white px-3 text-sm font-medium text-ink-muted transition-colors duration-200 hover:border-accent/35 hover:text-brand-deep sm:inline-flex"
            >
              <PenSquare size={16} />
              Feed
            </Link>
            <Link
              to="/institutions"
              className="hidden h-10 items-center justify-center gap-2 rounded-lg border border-line/45 bg-white px-3 text-sm font-medium text-ink-muted transition-colors duration-200 hover:border-accent/35 hover:text-brand-deep sm:inline-flex"
            >
              <Building2 size={16} />
              Doacao
            </Link>
            <Link
              to="/books/new"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-white shadow-sm shadow-accent/15 transition-colors duration-200 hover:bg-brand-deep"
              aria-label="Cadastrar livro"
            >
              <Plus size={18} />
            </Link>
            <Link
              to="/notifications"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line/45 bg-white text-ink-muted transition-colors duration-200 hover:border-accent/35 hover:text-brand-deep"
              aria-label="Notificacoes"
            >
              <Bell size={18} />
            </Link>
            <Link
              to="/profile"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line/45 bg-white text-ink-muted transition-colors duration-200 hover:border-accent/35 hover:text-brand-deep"
              aria-label="Perfil"
            >
              <UserCircle2 size={18} />
            </Link>
          </div>
        </header>

        <Outlet />
      </div>
    </div>
  )
}
