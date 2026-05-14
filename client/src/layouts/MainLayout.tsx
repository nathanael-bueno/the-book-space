import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  Building2,
  HandHeart,
  PanelLeftClose,
  PanelLeftOpen,
  PenSquare,
  Plus,
  Repeat2,
  Search,
  LogOut,
  Settings,
  Shield,
  Users,
  UserCircle2,
} from 'lucide-react'
import { clearToken, getToken } from '../services/auth'
import { listBooks } from '../services/books'
import { listNotifications } from '../services/notifications'
import { getMyProfile } from '../services/profile'

type JwtPayload = {
  role?: string
}

type UserRole = 'administrador' | 'usuario'

type SidebarItem = {
  to: string
  label: string
  icon: typeof PenSquare
  exact?: boolean
  roles: UserRole[]
}

type SearchSuggestion = {
  id: string
  title: string
  author: string
  city: string
  isbn: string
  cover: string
}

const NAV_ITEMS: SidebarItem[] = [
  {
    to: '/app/feed',
    label: 'Feed',
    icon: PenSquare,
    roles: ['administrador', 'usuario'],
  },
  {
    to: '/app/catalog',
    label: 'Explorar livros',
    icon: Search,
    roles: ['administrador', 'usuario'],
  },
  {
    to: '/app/trades',
    label: 'Minhas trocas',
    icon: Repeat2,
    exact: true,
    roles: ['administrador', 'usuario'],
  },
  {
    to: '/app/institutions',
    label: 'Instituicoes',
    icon: Building2,
    roles: ['administrador', 'usuario'],
  },
  {
    to: '/app/donations',
    label: 'Doacoes',
    icon: HandHeart,
    roles: ['administrador', 'usuario'],
  },
]

const ADMIN_ITEMS: SidebarItem[] = [
  {
    to: '/app/admin/painel',
    label: 'Painel',
    icon: Shield,
    exact: true,
    roles: ['administrador'],
  },
  {
    to: '/app/admin/institutions',
    label: 'Instituicoes',
    icon: Building2,
    roles: ['administrador'],
  },
  {
    to: '/app/admin/reports',
    label: 'Denuncias',
    icon: Bell,
    roles: ['administrador'],
  },
  {
    to: '/app/admin/users',
    label: 'Usuarios',
    icon: Users,
    roles: ['administrador'],
  },
  {
    to: '/app/admin/genres',
    label: 'Generos',
    icon: Settings,
    roles: ['administrador'],
  },
]

function readJwtPayload(token: string): JwtPayload | null {
  const parts = token.split('.')
  if (parts.length < 2) return null

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const normalized = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const json = atob(normalized)
    return JSON.parse(json) as JwtPayload
  } catch {
    return null
  }
}

export default function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const initialQuery = useMemo(() => {
    const params = new URLSearchParams(location.search)
    return params.get('q') ?? ''
  }, [location.search])
  const [query, setQuery] = useState(initialQuery)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0)
  const profileMenuRef = useRef<HTMLDivElement | null>(null)
  const userRole = useMemo<UserRole>(() => {
    const token = getToken()
    if (!token) return 'usuario'
    const payload = readJwtPayload(token)

    const normalizedRole = (payload?.role ?? '').toString().trim().toLowerCase()

    if (normalizedRole === 'administrador') {
      return 'administrador'
    }

    return 'usuario'
  }, [])
  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const activeQuery = isSearchFocused ? query : initialQuery
    const trimmed = activeQuery.trim()
    const params = new URLSearchParams()
    if (trimmed) params.set('q', trimmed)
    navigate(`/app/catalog${params.toString() ? `?${params.toString()}` : ''}`)
  }

  const visibleNavItems = useMemo(
    () => NAV_ITEMS.filter((item) => item.roles.includes(userRole)),
    [userRole]
  )
  const visibleAdminItems = useMemo(
    () => ADMIN_ITEMS.filter((item) => item.roles.includes(userRole)),
    [userRole]
  )
  const mobileNavItems = useMemo(() => {
    const baseItems = visibleNavItems.slice(0, 4)
    const adminEntry = visibleAdminItems[0]

    if (adminEntry) {
      return [...baseItems, adminEntry]
    }

    return [...baseItems, visibleNavItems[4]].filter(Boolean)
  }, [visibleAdminItems, visibleNavItems])

  const isActive = (to: string, exact?: boolean) => {
    if (exact) return location.pathname === to
    return location.pathname === to || location.pathname.startsWith(`${to}/`)
  }

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  useEffect(() => {
    const trimmed = query.trim()
    if (!isSearchFocused || !trimmed) {
      const timeoutId = window.setTimeout(() => {
        setIsSearching(false)
        setSuggestions([])
      }, 0)

      return () => window.clearTimeout(timeoutId)
    }

    let active = true
    const startSearchingTimeoutId = window.setTimeout(() => {
      setIsSearching(true)
    }, 0)
    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await listBooks({ q: trimmed, per_page: 5 })
        if (!active) return

        setSuggestions(
          response.data.map((book) => ({
            id: book.id,
            title: book.titulo,
            author: book.autor,
            city: book.cidade ?? '',
            isbn: book.isbn ?? '',
            cover:
              book.fotos?.[0] ??
              'https://placehold.co/72x96/f3f4f6/94a3b8?text=Livro',
          }))
        )
      } catch {
        if (!active) return
        setSuggestions([])
      } finally {
        if (active) setIsSearching(false)
      }
    }, 250)

    return () => {
      active = false
      window.clearTimeout(startSearchingTimeoutId)
      window.clearTimeout(timeoutId)
    }
  }, [isSearchFocused, query])

  useEffect(() => {
    let active = true

    async function enforceProfileCompletion() {
      const token = getToken()
      if (!token) return

      try {
        const response = await getMyProfile()
        if (!active) return
        const profile = response.data
        const incomplete =
          !profile.cidade || !profile.estado || !profile.faixa_etaria

        if (incomplete) {
          navigate('/auth/complete-profile', { replace: true })
        }
      } catch {
        if (!active) return
        clearToken()
        navigate('/auth/login', { replace: true })
      }
    }

    void enforceProfileCompletion()

    return () => {
      active = false
    }
  }, [navigate])

  useEffect(() => {
    let active = true

    async function loadNotificationsSummary() {
      try {
        const response = await listNotifications()
        if (!active) return
        setUnreadNotificationsCount(
          response.data.filter((item) => !item.lida_em).length
        )
      } catch {
        if (!active) return
        setUnreadNotificationsCount(0)
      }
    }

    loadNotificationsSummary()
    const intervalId = window.setInterval(loadNotificationsSummary, 15000)

    return () => {
      active = false
      window.clearInterval(intervalId)
    }
  }, [location.pathname])

  function handleLogout() {
    clearToken()
    setIsProfileMenuOpen(false)
    navigate('/auth/login', { replace: true })
  }

  return (
    <div
      className="flex h-screen w-full overflow-hidden bg-white text-ink shadow-sm"
      style={{ borderRadius: 'var(--radius-modal)' }}
    >
      <aside
        className={[
          'hidden flex-col bg-[#fcfbf9] p-4 transition-all duration-300 lg:flex',
          isSidebarCollapsed ? 'w-[72px]' : 'w-60',
        ].join(' ')}
      >
        <div
          className={[
            'mb-4 inline-flex items-center',
            isSidebarCollapsed ? 'justify-center' : 'justify-between',
          ].join(' ')}
        >
          {isSidebarCollapsed ? (
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(false)}
              className="inline-flex h-9 w-10 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-[#fbfaf7] hover:text-brand-deep"
              aria-label="Expandir sidebar"
              title="Expandir sidebar"
            >
              <PanelLeftOpen size={17} />
            </button>
          ) : (
            <>
              <Link
                to="/app/feed"
                className="inline-flex items-center text-sm font-semibold text-ink"
              >
                The Book Space
              </Link>
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(true)}
                className="inline-flex h-9 w-10 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-[#fbfaf7] hover:text-brand-deep"
                aria-label="Recolher sidebar"
                title="Recolher sidebar"
              >
                <PanelLeftClose size={17} />
              </button>
            </>
          )}
        </div>

        <nav className="space-y-1.5">
          {visibleNavItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.to, item.exact)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={[
                  'ui-sidebar-item inline-flex h-9 w-full items-center rounded-lg text-sm font-medium transition-colors',
                  isSidebarCollapsed ? 'justify-center px-2' : 'gap-2 px-3',
                  active
                    ? 'bg-accent text-white shadow-sm shadow-accent/15'
                    : 'text-ink-muted hover:bg-[#fbfaf7] hover:text-brand-deep',
                ].join(' ')}
                title={item.label}
              >
                <Icon size={16} />
                {!isSidebarCollapsed ? item.label : null}
              </Link>
            )
          })}
        </nav>

        {visibleAdminItems.length ? (
          <>
            <div className="my-5 h-px bg-line/45" />
            <nav className="space-y-1.5">
              {visibleAdminItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.to)
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={[
                      'ui-sidebar-item inline-flex h-9 w-full items-center rounded-lg text-sm font-medium transition-colors',
                      isSidebarCollapsed ? 'justify-center px-2' : 'gap-2 px-3',
                      active
                        ? 'bg-accent text-white shadow-sm shadow-accent/15'
                        : 'text-ink-muted hover:bg-[#fbfaf7] hover:text-brand-deep',
                    ].join(' ')}
                    title={item.label}
                  >
                    <Icon size={16} />
                    {!isSidebarCollapsed ? item.label : null}
                  </Link>
                )
              })}
            </nav>
          </>
        ) : null}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="grid grid-cols-1 gap-3 bg-[#fcfbf9] px-4 py-2.5 lg:grid-cols-[1fr_auto] lg:items-center">
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
              className="h-9 w-full rounded-lg border border-line/45 bg-[#fbfaf7] px-10 pr-14 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/12"
            />
            <button
              type="submit"
              className="absolute inset-y-0 right-1 my-1 inline-flex w-10 items-center justify-center rounded-md text-ink-muted transition-colors hover:text-brand-deep"
              aria-label="Buscar"
            >
              <Search size={16} />
            </button>

            {isSearchFocused && query.trim() ? (
              <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-xl border border-line/45 bg-white shadow-lg">
                {suggestions.length
                  ? suggestions.map((book) => (
                      <button
                        key={book.id}
                        type="button"
                        onMouseDown={() => navigate(`/app/books/${book.id}`)}
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
                    ))
                  : !isSearching && (
                      <div className="px-3 py-3 text-sm text-ink-dim">
                        Nenhum livro encontrado para essa busca.
                      </div>
                    )}
              </div>
            ) : null}
          </form>

          <div className="flex items-center justify-end gap-2">
            <Link
              to="/app/books/new"
              className="ui-btn inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-accent px-3 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors duration-200 hover:bg-brand-deep"
            >
              <Plus size={16} />
              Novo livro
            </Link>
            <Link
              to="/app/notifications"
              className="ui-btn relative inline-flex h-9 w-10 items-center justify-center rounded-lg border border-line/45 bg-white text-ink-muted transition-colors duration-200 hover:border-accent/35 hover:text-brand-deep"
              aria-label="Notificacoes"
            >
              <Bell size={18} />
              {unreadNotificationsCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white">
                  {unreadNotificationsCount > 9
                    ? '9+'
                    : unreadNotificationsCount}
                </span>
              ) : null}
            </Link>
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                className="ui-btn inline-flex h-9 w-10 items-center justify-center rounded-lg border border-line/45 bg-white text-ink-muted transition-colors duration-200 hover:border-accent/35 hover:text-brand-deep"
                aria-label="Menu de perfil"
                aria-haspopup="menu"
                aria-expanded={isProfileMenuOpen}
              >
                <UserCircle2 size={18} />
              </button>

              {isProfileMenuOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 z-30 mt-2 w-44 overflow-hidden rounded-xl border border-line/45 bg-white p-1 shadow-lg"
                >
                  <Link
                    to="/app/profile"
                    role="menuitem"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-dim transition-colors hover:bg-[#fbfaf7] hover:text-brand-deep"
                  >
                    <UserCircle2 size={16} />
                    Perfil
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-ink-dim transition-colors hover:bg-[#fbfaf7] hover:text-brand-deep"
                  >
                    <LogOut size={16} />
                    Sair
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-hidden bg-[#fcfbf9] px-4 py-3 pb-20 sm:px-5 sm:py-4 sm:pb-24 lg:pb-4">
          <div
            className="h-full overflow-y-auto bg-white p-5 sm:p-6"
            style={{
              borderRadius: 'var(--radius-modal)',
              boxShadow:
                '0 1px 2px rgba(16,24,40,0.06), 0 8px 20px rgba(16,24,40,0.08)',
            }}
          >
            <Outlet />
          </div>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line/45 bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-3xl grid-cols-5 gap-1">
          {mobileNavItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.to, item.exact)

            return (
              <Link
                key={item.to}
                to={item.to}
                className={[
                  'inline-flex h-12 flex-col items-center justify-center rounded-lg text-[11px] font-semibold transition-colors',
                  active
                    ? 'bg-accent text-white shadow-sm shadow-accent/15'
                    : 'text-ink-muted hover:bg-[#fbfaf7] hover:text-brand-deep',
                ].join(' ')}
              >
                <Icon size={16} />
                <span className="mt-1 truncate px-1">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
