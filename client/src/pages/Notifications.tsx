import { useEffect, useMemo, useState } from 'react'
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
    async function loadNotifications() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await listNotifications()
        if (!active) return
        setNotifications(response.data)
      } catch (err) {
        if (!active) return
        const message =
          err instanceof ApiError
            ? err.message
            : 'Nao foi possivel carregar as notificacoes.'
        setError(message)
      } finally {
        if (active) setIsLoading(false)
      }
    }
    loadNotifications()
    return () => {
      active = false
    }
  }, [])

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.lida_em).length,
    [notifications]
  )

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
    <main className="mx-auto w-full space-y-3">
      <section className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/app/feed"
            className="inline-flex items-center gap-2 rounded-lg border border-line/55 bg-white px-3 py-2 text-sm font-medium text-ink-dim shadow-sm transition-colors hover:border-accent/35 hover:text-brand-deep"
          >
            <ChevronLeft size={16} />
            Voltar
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-ink">Notificacoes</h1>
            <p className="mt-1 max-w-2xl text-sm leading-5 text-ink-dim">
              {unreadCount} novas atualizacoes sobre trocas, interacoes e doacoes.
            </p>
          </div>
        </div>
        <span className="inline-flex h-9 items-center justify-center rounded-lg border border-line/45 bg-[#fbfaf7] px-3 text-sm font-semibold text-brand-deep">
          {notifications.length} no total
        </span>
      </section>

      <section className="space-y-2.5">
        {isLoading ? (
          <p className="rounded-xl border border-line/45 bg-white p-3 text-sm text-ink-dim shadow-sm sm:p-3.5">
            Carregando notificacoes...
          </p>
        ) : null}
        {error ? (
          <p className="rounded-xl border border-brand-deep/25 bg-brand-deep/5 p-3 text-sm font-medium text-brand-deep shadow-sm sm:p-3.5">
            {error}
          </p>
        ) : null}
        {notifications.map((item) => {
          const Icon = getIconByType(item.tipo)
          const unread = !item.lida_em

          return (
            <article
              key={item.id}
              className={`rounded-xl border border-line/45 bg-white p-3 shadow-sm transition-colors sm:p-3.5 ${
                unread ? 'border-accent/30 bg-white' : 'border-line/45 bg-white'
              }`}
            >
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-2.5">
                  <div
                    className={`flex h-9 w-11 shrink-0 items-center justify-center rounded-xl border shadow-sm ${
                      unread
                        ? 'border-accent/20 bg-[#fbfaf7] text-accent'
                        : 'border-line/35 bg-white text-brand-deep'
                    }`}
                  >
                    <Icon size={21} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-brand-deep">
                        {item.tipo}
                      </p>
                      {unread ? (
                        <span className="h-2 w-2 rounded-full bg-accent" />
                      ) : null}
                    </div>
                    <h2 className="mt-1 text-base font-semibold text-ink">
                      {item.titulo}
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-dim">
                      {item.descricao ?? 'Sem detalhes adicionais.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2.5 sm:flex-col sm:items-end">
                  <span className="text-sm font-medium text-ink-muted">
                    {toRelativeTime(item.created_at)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleNotificationAction(item)}
                    disabled={isMarkingId === item.id}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-line/55 bg-white px-3 text-sm font-semibold text-ink-dim shadow-sm transition-colors hover:border-accent/35 hover:text-brand-deep"
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

      <section className="rounded-xl border border-line/45 bg-white p-3 shadow-sm sm:p-3.5">
        <div className="flex items-start gap-2.5">
          <div>
            <h2 className="text-base font-semibold text-ink">
              Preferencias ativas
            </h2>
            <p className="mt-1 text-sm leading-6 text-ink-dim">
              Voce recebe alertas para novas propostas, respostas de troca,
              curtidas, comentarios e confirmacoes de doacao.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
