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

type SidebarProfile = {
  name: string
  email: string
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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isSidebarProfileMenuOpen, setIsSidebarProfileMenuOpen] =
    useState(false)
  const [sidebarProfile, setSidebarProfile] = useState<SidebarProfile | null>(
    null
  )
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0)
  const profileMenuRef = useRef<HTMLDivElement | null>(null)
  const sidebarProfileMenuRef = useRef<HTMLDivElement | null>(null)
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
      if (
        sidebarProfileMenuRef.current &&
        !sidebarProfileMenuRef.current.contains(event.target as Node)
      ) {
        setIsSidebarProfileMenuOpen(false)
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

        setSidebarProfile({
          name: profile.nome_completo ?? 'Usuario',
          email: profile.email ?? '',
        })

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

  useEffect(() => {
    if (!isMobileSidebarOpen) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsMobileSidebarOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isMobileSidebarOpen])

  useEffect(() => {
    if (!isMobileSidebarOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isMobileSidebarOpen])

  function handleLogout() {
    clearToken()
    setIsProfileMenuOpen(false)
    setIsSidebarProfileMenuOpen(false)
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

        <div className="mt-auto pt-5">
          <div className="mb-3 h-px bg-line/45" />
          <div className="relative" ref={sidebarProfileMenuRef}>
            <button
              type="button"
              onClick={() => setIsSidebarProfileMenuOpen((prev) => !prev)}
              className={[
                'ui-sidebar-item inline-flex w-full items-center rounded-lg text-sm font-medium text-ink-muted transition-colors hover:bg-[#fbfaf7] hover:text-brand-deep',
                isSidebarCollapsed ? 'justify-center px-2' : 'gap-2 px-3',
                isSidebarCollapsed ? 'h-9' : 'h-auto py-2',
              ].join(' ')}
              title="Perfil"
              aria-label="Menu de perfil"
              aria-haspopup="menu"
              aria-expanded={isSidebarProfileMenuOpen}
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#f3f0ea] text-xs font-semibold text-brand-deep">
                {(sidebarProfile?.name?.trim()?.[0] ?? 'U').toUpperCase()}
              </span>
              {!isSidebarCollapsed ? (
                <span className="min-w-0 text-left">
                  <span className="block truncate text-sm font-semibold text-ink">
                    {sidebarProfile?.name ?? 'Usuario'}
                  </span>
                  <span className="block truncate text-xs font-medium text-ink-muted">
                    {sidebarProfile?.email ?? ''}
                  </span>
                </span>
              ) : null}
            </button>

            {isSidebarProfileMenuOpen ? (
              <div
                role="menu"
                className={[
                  'absolute bottom-[calc(100%+6px)] z-30 w-44 overflow-hidden rounded-xl border border-line/45 bg-white p-1 shadow-lg',
                  isSidebarCollapsed ? 'left-0' : 'left-0 right-0 w-full',
                ].join(' ')}
              >
                <Link
                  to="/app/settings"
                  role="menuitem"
                  onClick={() => setIsSidebarProfileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-dim transition-colors hover:bg-[#fbfaf7] hover:text-brand-deep"
                >
                  <Settings size={16} />
                  Configuracoes
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
      </aside>

      <div
        className={[
          'fixed inset-0 z-40 bg-black/30 transition-opacity lg:hidden',
          isMobileSidebarOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0',
        ].join(' ')}
        onClick={() => setIsMobileSidebarOpen(false)}
        aria-hidden={!isMobileSidebarOpen}
      />

      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#fcfbf9] p-4 shadow-xl transition-transform duration-300 lg:hidden',
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        aria-hidden={!isMobileSidebarOpen}
      >
        <div className="mb-4 inline-flex items-center justify-between">
          <Link
            to="/app/feed"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="inline-flex items-center text-sm font-semibold text-ink"
          >
            The Book Space
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="inline-flex h-9 w-10 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-[#fbfaf7] hover:text-brand-deep"
            aria-label="Fechar sidebar"
          >
            <PanelLeftClose size={17} />
          </button>
        </div>

        <nav className="space-y-1.5">
          {visibleNavItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.to, item.exact)
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileSidebarOpen(false)}
                className={[
                  'ui-sidebar-item inline-flex h-9 w-full items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors',
                  active
                    ? 'bg-accent text-white shadow-sm shadow-accent/15'
                    : 'text-ink-muted hover:bg-[#fbfaf7] hover:text-brand-deep',
                ].join(' ')}
                title={item.label}
              >
                <Icon size={16} />
                {item.label}
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
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={[
                      'ui-sidebar-item inline-flex h-9 w-full items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors',
                      active
                        ? 'bg-accent text-white shadow-sm shadow-accent/15'
                        : 'text-ink-muted hover:bg-[#fbfaf7] hover:text-brand-deep',
                    ].join(' ')}
                    title={item.label}
                  >
                    <Icon size={16} />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </>
        ) : null}

        <div className="mt-auto pt-5">
          <div className="mb-3 h-px bg-line/45" />
          <div className="space-y-2">
            <Link
              to="/app/settings"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-dim transition-colors hover:bg-[#fbfaf7] hover:text-brand-deep"
            >
              <Settings size={16} />
              Configuracoes
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-ink-dim transition-colors hover:bg-[#fbfaf7] hover:text-brand-deep"
            >
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="grid grid-cols-1 gap-2 bg-[#fcfbf9] px-3 py-2.5 sm:px-4 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="inline-flex h-9 w-10 shrink-0 items-center justify-center rounded-lg border border-line/45 bg-white text-ink-muted transition-colors hover:border-accent/35 hover:text-brand-deep lg:hidden"
              aria-label="Abrir sidebar"
            >
              <PanelLeftOpen size={17} />
            </button>

            <form className="relative block flex-1" onSubmit={handleSearch}>
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
          </div>

          <div className="flex items-center justify-end gap-1.5 sm:gap-2">
            <Link
              to="/app/books/new"
              className="ui-btn inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-accent px-2.5 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors duration-200 hover:bg-brand-deep sm:gap-2 sm:px-3"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Novo livro</span>
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
            <div className="relative lg:hidden" ref={profileMenuRef}>
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
                    to="/app/settings"
                    role="menuitem"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-dim transition-colors hover:bg-[#fbfaf7] hover:text-brand-deep"
                  >
                    <Settings size={16} />
                    Configuracoes
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

        <main className="min-w-0 flex-1 overflow-hidden bg-[#fcfbf9] px-4 py-3 sm:px-5 sm:py-4">
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
    </div>
  )
}
