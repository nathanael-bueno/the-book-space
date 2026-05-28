import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  Bell,
  CheckCircle2,
  Gift,
  Heart,
  Loader2,
  MessageCircle,
  Repeat2,
} from 'lucide-react'
import { ApiError } from '../services/http'
import {
  listNotifications,
  markNotificationAsRead,
  type ApiNotification,
} from '../services/notifications'

type NotificationsCache = {
  data: ApiNotification[]
  fetchedAt: number
}

const NOTIFICATIONS_CACHE_TTL_MS = 45_000
let notificationsCache: NotificationsCache | null = null

const iconByType: Record<string, typeof Repeat2> = {
  troca: Repeat2,
  proposta: Repeat2,
  aceita: CheckCircle2,
  curtida: Heart,
  comentario: MessageCircle,
  doacao: Gift,
}

function getIconByType(type: string) {
  const normalized = type.toLowerCase()
  const key = Object.keys(iconByType).find((item) => normalized.includes(item))
  return key ? iconByType[key] : Bell
}

function toRelativeTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Agora'
  const diffMs = Date.now() - date.getTime()
  if (diffMs < 60_000) return 'Agora'
  if (diffMs < 3_600_000) return `${Math.floor(diffMs / 60_000)} min`
  if (diffMs < 86_400_000) return `${Math.floor(diffMs / 3_600_000)} h`
  if (diffMs < 172_800_000) return 'Ontem'
  return `${Math.floor(diffMs / 86_400_000)} dias`
}

function resolveActionTo(notification: ApiNotification) {
  const metaAction = notification.meta?.action_to?.trim()
  if (metaAction)
    return metaAction.startsWith('/app') ? metaAction : `/app${metaAction}`
  return '/app/notifications'
}

export default function Notifications() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<ApiNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMarkingId, setIsMarkingId] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const cached = notificationsCache
    const hasFreshCache =
      cached !== null &&
      Date.now() - cached.fetchedAt < NOTIFICATIONS_CACHE_TTL_MS

    if (hasFreshCache) {
      queueMicrotask(() => {
        if (!active || !cached) return
        setNotifications(cached.data)
        setIsLoading(false)
      })
    }

    async function loadNotifications(showLoader: boolean) {
      if (showLoader) setIsLoading(true)
      setError(null)
      try {
        const response = await listNotifications()
        if (!active) return
        setNotifications(response.data)
        notificationsCache = {
          data: response.data,
          fetchedAt: Date.now(),
        }
      } catch (err) {
        if (!active) return
        const message =
          err instanceof ApiError
            ? err.message
            : 'Nao foi possivel carregar as notificacoes.'
        setError(message)
      } finally {
        if (active && showLoader) setIsLoading(false)
      }
    }

    void loadNotifications(!hasFreshCache)

    return () => {
      active = false
    }
  }, [])

  async function handleNotificationAction(notification: ApiNotification) {
    const target = resolveActionTo(notification)
    try {
      setIsMarkingId(notification.id)
      if (!notification.lida_em) {
        await markNotificationAsRead(notification.id)
        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id
              ? { ...item, lida_em: new Date().toISOString() }
              : item
          )
        )
      }
    } catch {
      // navega mesmo com erro para nao bloquear o fluxo do usuario.
    } finally {
      setIsMarkingId(null)
      navigate(target)
    }
  }

  return (
    <main className="mx-auto w-full space-y-4">
      <section className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link
            to="/app/feed"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-muted transition-colors hover:text-brand-deep"
          >
            <ChevronLeft size={16} />
            Voltar
          </Link>
          <h1 className="text-2xl font-semibold text-ink">Notificacoes</h1>
        </div>
        <span className="inline-flex h-8 items-center justify-center rounded-md border border-line/35 bg-transparent px-2.5 text-sm font-semibold text-ink-dim">
          {notifications.length} no total
        </span>
      </section>

      <section className="space-y-2">
        {isLoading ? (
          <p className="rounded-lg border border-line/35 bg-white p-3 text-sm text-ink-dim">
            Carregando notificacoes...
          </p>
        ) : null}
        {error ? (
          <p className="rounded-lg border border-brand-deep/25 bg-brand-deep/5 p-3 text-sm font-medium text-brand-deep">
            {error}
          </p>
        ) : null}
        {notifications.map((item) => {
          const Icon = getIconByType(item.tipo)
          const unread = !item.lida_em

          return (
            <article
              key={item.id}
              className={`rounded-lg border bg-white p-3 transition-colors ${
                unread ? 'border-accent/25' : 'border-line/35'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 gap-2.5">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                      unread
                        ? 'border-accent/20 bg-accent/5 text-accent'
                        : 'border-line/35 bg-[#fbfaf7] text-ink-muted'
                    }`}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                        {item.tipo}
                      </p>
                      {unread ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      ) : null}
                    </div>
                    <h2 className="mt-1 truncate text-sm font-semibold text-ink">
                      {item.titulo}
                    </h2>
                    <p className="mt-1.5 text-sm leading-5 text-ink-dim">
                      {item.descricao ?? 'Sem detalhes adicionais.'}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className="text-xs font-medium text-ink-muted">
                    {toRelativeTime(item.created_at)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleNotificationAction(item)}
                    disabled={isMarkingId === item.id}
                    className="inline-flex h-8 items-center justify-center rounded-md border border-line/45 bg-white px-2.5 text-xs font-semibold text-ink-dim transition-colors hover:border-accent/35 hover:text-brand-deep"
                  >
                    {isMarkingId === item.id ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin" />
                        Abrindo...
                      </span>
                    ) : (
                      'Abrir'
                    )}
                  </button>
                </div>
              </div>
            </article>
          )
        })}
        {!isLoading && !error && !notifications.length ? (
          <section className="ui-empty-state flex flex-col items-center gap-2">
            <Bell size={32} className="text-brand-deep" />
            <p className="text-sm font-medium text-ink">
              Nenhuma notificacao no momento.
            </p>
            <p className="text-sm">Novas atualizacoes aparecerao aqui.</p>
          </section>
        ) : null}
      </section>
    </main>
  )
}
