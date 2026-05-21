import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, Bell, Check, Mail } from 'lucide-react'
import { ApiError } from '../services/http'
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  type NotificationPreferences,
} from '../services/notificationPreferences'

const DEFAULT_PREFERENCES: NotificationPreferences = {
  tradeUpdates: true,
  socialLikes: true,
  socialComments: true,
  donationUpdates: true,
  emailEnabled: false,
}

export default function ProfileNotifications() {
  const [preferences, setPreferences] =
    useState<NotificationPreferences>(DEFAULT_PREFERENCES)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    let active = true

    async function loadPreferences() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await getNotificationPreferences()
        if (!active) return
        setPreferences(response)
      } catch (err) {
        if (!active) return
        const message =
          err instanceof ApiError
            ? err.message
            : 'Nao foi possivel carregar suas preferencias.'
        setError(message)
      } finally {
        if (active) setIsLoading(false)
      }
    }

    loadPreferences()

    return () => {
      active = false
    }
  }, [])

  const activeCount = useMemo(
    () => Object.values(preferences).filter(Boolean).length,
    [preferences]
  )

  async function togglePreference(key: keyof NotificationPreferences) {
    const next = { ...preferences, [key]: !preferences[key] }
    const previous = preferences

    setPreferences(next)
    setIsSaving(true)
    setError(null)

    try {
      const response = await updateNotificationPreferences(next)
      setPreferences(response)
      setIsSaved(true)
      window.setTimeout(() => setIsSaved(false), 1400)
    } catch (err) {
      setPreferences(previous)
      const message =
        err instanceof ApiError
          ? err.message
          : 'Nao foi possivel salvar suas preferencias.'
      setError(message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="mx-auto w-full space-y-4">
      <section className="py-1">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <Link
              to="/app/profile"
              className="inline-flex items-center gap-1 text-sm font-semibold text-ink-muted transition-colors hover:text-brand-deep"
            >
              <ChevronLeft size={16} />
              Voltar
            </Link>
            <h1 className="text-2xl font-semibold text-ink">
              Preferencias de notificacao
            </h1>
          </div>
          <span className="inline-flex h-8 items-center justify-center rounded-md border border-line/35 bg-transparent px-2.5 text-sm font-semibold text-ink-dim">
            {activeCount} ativos
          </span>
        </div>
      </section>

      <section className="space-y-2">
        {isLoading ? (
          <p className="rounded-lg border border-line/30 bg-white p-3 text-sm text-ink-dim">
            Carregando preferencias...
          </p>
        ) : null}
        {error ? (
          <p className="rounded-lg border border-brand-deep/25 bg-brand-deep/5 p-3 text-sm font-medium text-brand-deep">
            {error}
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => togglePreference('tradeUpdates')}
          disabled={isLoading || isSaving}
          className="flex w-full items-center justify-between rounded-lg border border-line/30 bg-white px-4 py-3 text-left transition-colors hover:border-accent/35"
        >
          <span className="inline-flex items-center gap-2 text-sm font-medium text-ink">
            <Bell size={16} />
            Atualizacoes de trocas e propostas
          </span>
          <span
            className={`inline-flex h-7 min-w-16 items-center justify-center rounded-md px-2 text-xs font-semibold ${
              preferences.tradeUpdates
                ? 'bg-accent/15 text-brand-deep'
                : 'bg-line/35 text-ink-muted'
            }`}
          >
            {preferences.tradeUpdates ? 'Ativo' : 'Pausado'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => togglePreference('socialLikes')}
          disabled={isLoading || isSaving}
          className="flex w-full items-center justify-between rounded-lg border border-line/30 bg-white px-4 py-3 text-left transition-colors hover:border-accent/35"
        >
          <span className="inline-flex items-center gap-2 text-sm font-medium text-ink">
            <Bell size={16} />
            Curtidas no feed
          </span>
          <span
            className={`inline-flex h-7 min-w-16 items-center justify-center rounded-md px-2 text-xs font-semibold ${
              preferences.socialLikes
                ? 'bg-accent/15 text-brand-deep'
                : 'bg-line/35 text-ink-muted'
            }`}
          >
            {preferences.socialLikes ? 'Ativo' : 'Pausado'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => togglePreference('socialComments')}
          disabled={isLoading || isSaving}
          className="flex w-full items-center justify-between rounded-lg border border-line/30 bg-white px-4 py-3 text-left transition-colors hover:border-accent/35"
        >
          <span className="inline-flex items-center gap-2 text-sm font-medium text-ink">
            <Bell size={16} />
            Comentarios no feed
          </span>
          <span
            className={`inline-flex h-7 min-w-16 items-center justify-center rounded-md px-2 text-xs font-semibold ${
              preferences.socialComments
                ? 'bg-accent/15 text-brand-deep'
                : 'bg-line/35 text-ink-muted'
            }`}
          >
            {preferences.socialComments ? 'Ativo' : 'Pausado'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => togglePreference('donationUpdates')}
          disabled={isLoading || isSaving}
          className="flex w-full items-center justify-between rounded-lg border border-line/30 bg-white px-4 py-3 text-left transition-colors hover:border-accent/35"
        >
          <span className="inline-flex items-center gap-2 text-sm font-medium text-ink">
            <Bell size={16} />
            Confirmacoes de doacao
          </span>
          <span
            className={`inline-flex h-7 min-w-16 items-center justify-center rounded-md px-2 text-xs font-semibold ${
              preferences.donationUpdates
                ? 'bg-accent/15 text-brand-deep'
                : 'bg-line/35 text-ink-muted'
            }`}
          >
            {preferences.donationUpdates ? 'Ativo' : 'Pausado'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => togglePreference('emailEnabled')}
          disabled={isLoading || isSaving}
          className="flex w-full items-center justify-between rounded-lg border border-line/30 bg-white px-4 py-3 text-left transition-colors hover:border-accent/35"
        >
          <span className="inline-flex items-center gap-2 text-sm font-medium text-ink">
            <Mail size={16} />
            Receber notificacoes por e-mail
          </span>
          <span
            className={`inline-flex h-7 min-w-16 items-center justify-center rounded-md px-2 text-xs font-semibold ${
              preferences.emailEnabled
                ? 'bg-accent/15 text-brand-deep'
                : 'bg-line/35 text-ink-muted'
            }`}
          >
            {preferences.emailEnabled ? 'Ativo' : 'Pausado'}
          </span>
        </button>
      </section>

      <section className="rounded-lg border border-line/30 bg-white p-3">
        <p className="inline-flex items-center gap-2 text-sm text-ink-dim">
          <Check
            size={16}
            className={isSaved ? 'text-brand-deep' : 'text-ink-muted'}
          />
          {isSaved
            ? 'Preferencias salvas na sua conta.'
            : isSaving
              ? 'Salvando alteracao...'
              : 'As alteracoes sao aplicadas por conta.'}
        </p>
      </section>
    </main>
  )
}
