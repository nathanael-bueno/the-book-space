import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  AlertTriangle,
  Bell,
  BookMarked,
  Camera,
  Check,
  ChevronLeft,
  Gift,
  Globe,
  Heart,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  RefreshCw,
  Save,
  Send,
  UserRound,
} from 'lucide-react'
import { ApiError } from '../services/http'
import { listBrazilianStates, listCitiesByState } from '../services/locations'
import {
  getMyProfile,
  updateMyProfile,
  type Profile as ProfileData,
} from '../services/profile'
import { forgotPassword, startGoogleLogin } from '../services/auth'
import { uploadImage } from '../services/uploads'
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  type NotificationPreferences,
} from '../services/notificationPreferences'
import {
  listGenres,
  getMyFavoriteGenres,
  updateMyFavoriteGenres,
  type ApiGenre,
} from '../services/genres'
import { useToast } from '../stores/useToast'
import { useAuth } from '../stores/authStore'

const AGE_RANGES = [
  { value: '13-17', label: '13 a 17 anos' },
  { value: '18-24', label: '18 a 24 anos' },
  { value: '25-34', label: '25 a 34 anos' },
  { value: '35-44', label: '35 a 44 anos' },
  { value: '45-54', label: '45 a 54 anos' },
  { value: '55+', label: '55 anos ou mais' },
]

const DEFAULT_PREFS: NotificationPreferences = {
  tradeUpdates: true,
  socialLikes: true,
  socialComments: true,
  donationUpdates: true,
  emailEnabled: false,
}

type Tab = 'perfil' | 'notificacoes' | 'generos' | 'conta'

const TABS: {
  id: Tab
  label: string
  icon: typeof UserRound
  description: string
}[] = [
  {
    id: 'perfil',
    label: 'Perfil',
    icon: UserRound,
    description: 'Informacoes publicas',
  },
  {
    id: 'notificacoes',
    label: 'Notificacoes',
    icon: Bell,
    description: 'Alertas e avisos',
  },
  {
    id: 'generos',
    label: 'Generos',
    icon: BookMarked,
    description: 'Preferencias literarias',
  },
  {
    id: 'conta',
    label: 'Conta',
    icon: Lock,
    description: 'Seguranca e acesso',
  },
]

const inputClass = 'w-full px-3'

const selectClass = 'w-full px-3'

// ─── Shared primitives ───────────────────────────────────────────────────────

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">{label}</span>
      {hint && <span className="ml-2 text-xs text-ink-muted">{hint}</span>}
      <div className="mt-1.5">{children}</div>
    </label>
  )
}

function SectionHeader({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="mb-6 border-b border-line/30 pb-5">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <p className="mt-1 text-sm text-ink-muted">{description}</p>
    </div>
  )
}

function SubSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-muted/70">
        {title}
      </p>
      {children}
    </div>
  )
}

function AccountRow({
  title,
  description,
  action,
  variant = 'default',
}: {
  title: string
  description: string
  action?: React.ReactNode
  variant?: 'default' | 'danger'
}) {
  return (
    <div
      className={`flex items-start justify-between gap-6 py-3.5 ${variant === 'danger' ? '' : ''}`}
    >
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-medium ${variant === 'danger' ? 'text-danger' : 'text-ink'}`}
        >
          {title}
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">
          {description}
        </p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

function NotifRow({
  label,
  description,
  icon: Icon,
  checked,
  disabled,
  onToggle,
}: {
  label: string
  description: string
  icon: typeof Bell
  checked: boolean
  disabled: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onToggle}
      disabled={disabled}
      className="flex w-full items-center justify-between gap-4 border-b border-line/20 py-3 text-left last:border-0 transition-colors hover:bg-[#faf9f6] disabled:opacity-60"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f3f0ea] text-ink-muted">
          <Icon size={13} />
        </div>
        <div>
          <p className="text-sm font-medium text-ink">{label}</p>
          <p className="text-xs text-ink-muted">{description}</p>
        </div>
      </div>
      <span
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ${
          checked ? 'bg-accent' : 'bg-line/40'
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </span>
    </button>
  )
}

// ─── Tab: Perfil ─────────────────────────────────────────────────────────────

function TabPerfil() {
  const toast = useToast()
  const { refreshUser } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [nomeCompleto, setNomeCompleto] = useState('')
  const [bio, setBio] = useState('')
  const [estado, setEstado] = useState('')
  const [cidade, setCidade] = useState('')
  const [faixaEtaria, setFaixaEtaria] = useState('')
  const [cities, setCities] = useState<string[]>([])
  const [states, setStates] = useState<Array<{ code: string; name: string }>>(
    []
  )
  const [isLoadingCities, setIsLoadingCities] = useState(false)
  const [isLoadingStates, setIsLoadingStates] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)

  const photoObjectUrl = useMemo(
    () => (photoFile ? URL.createObjectURL(photoFile) : null),
    [photoFile]
  )
  const photoPreview = useMemo(
    () => photoObjectUrl ?? profile?.foto ?? null,
    [photoObjectUrl, profile?.foto]
  )

  useEffect(
    () => () => {
      if (photoObjectUrl) URL.revokeObjectURL(photoObjectUrl)
    },
    [photoObjectUrl]
  )

  useEffect(() => {
    let active = true
    listBrazilianStates()
      .then((data) => {
        if (active) setStates(data)
      })
      .catch(() => {
        if (active)
          toast.error({
            title: 'Erro',
            message: 'Nao foi possivel carregar os estados.',
          })
      })
      .finally(() => {
        if (active) setIsLoadingStates(false)
      })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    let active = true
    getMyProfile()
      .then((res) => {
        if (!active) return
        const d = res.data
        setProfile(d)
        setNomeCompleto(d.nome_completo ?? '')
        setBio(d.bio ?? '')
        setEstado(d.estado ?? '')
        setCidade(d.cidade ?? '')
        setFaixaEtaria(d.faixa_etaria ?? '')
      })
      .catch((err) => {
        if (!active) return
        const message =
          err instanceof ApiError
            ? err.message
            : 'Nao foi possivel carregar seu perfil.'
        toast.error({ title: 'Erro', message })
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!estado) return
    let active = true
    async function loadCities() {
      setIsLoadingCities(true)
      try {
        const data = await listCitiesByState(estado)
        if (active) setCities(data)
      } catch {
        if (active) setCities([])
      } finally {
        if (active) setIsLoadingCities(false)
      }
    }
    loadCities()
    return () => {
      active = false
    }
  }, [estado])

  async function handleSave() {
    setIsSaving(true)
    try {
      let fotoUrl: string | null | undefined = undefined
      if (photoFile) {
        const uploaded = await uploadImage(photoFile, 'avatar')
        fotoUrl = uploaded.url
      }
      const response = await updateMyProfile({
        nome_completo: nomeCompleto.trim(),
        bio: bio.trim() || null,
        cidade: cidade.trim() || null,
        estado: estado || null,
        faixa_etaria: faixaEtaria || null,
        ...(fotoUrl !== undefined && { foto: fotoUrl }),
      })
      setProfile(response.data)
      setPhotoFile(null)
      await refreshUser()
      toast.success({ title: 'Perfil salvo com sucesso!' })
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Falha ao salvar perfil.'
      toast.error({ title: 'Erro ao salvar', message })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-5">
        <div className="mb-6 space-y-1.5 border-b border-line/30 pb-5">
          <div className="h-4 w-32 rounded bg-line/40" />
          <div className="h-3 w-56 rounded bg-line/30" />
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-3 w-20 rounded bg-line/40" />
            <div className="h-9 w-full rounded-lg bg-line/30" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <SectionHeader
        title="Informacoes do perfil"
        description="Estas informacoes serao visiveis para outros usuarios na plataforma."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_200px]">
        <div className="space-y-5">
          <SubSection title="Dados pessoais">
            <div className="space-y-4">
              <Field label="Nome completo">
                <input
                  type="text"
                  value={nomeCompleto}
                  onChange={(e) => setNomeCompleto(e.target.value)}
                  className={inputClass}
                  placeholder="Seu nome"
                />
              </Field>

              <Field label="Bio" hint="opcional">
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Conte um pouco sobre voce e seus gostos literarios..."
                  className="w-full resize-none leading-6 px-3"
                />
              </Field>

              <Field label="Faixa etaria" hint="opcional">
                <select
                  value={faixaEtaria}
                  onChange={(e) => setFaixaEtaria(e.target.value)}
                  className={selectClass}
                >
                  <option value="">Selecione a faixa etaria</option>
                  {AGE_RANGES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </SubSection>

          <SubSection title="Localizacao">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Estado">
                <select
                  value={estado}
                  onChange={(e) => {
                    setEstado(e.target.value)
                    setCidade('')
                    setCities([])
                  }}
                  disabled={isLoadingStates}
                  className={selectClass}
                >
                  <option value="">
                    {isLoadingStates ? 'Carregando...' : 'Selecione o estado'}
                  </option>
                  {states.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Cidade">
                <select
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  disabled={!estado || isLoadingCities}
                  className={selectClass}
                >
                  <option value="">
                    {!estado
                      ? 'Selecione um estado primeiro'
                      : isLoadingCities
                        ? 'Carregando...'
                        : 'Selecione a cidade'}
                  </option>
                  {cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </SubSection>

          <div className="flex items-center gap-4 border-t border-line/25 pt-5">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary h-10 px-6 text-sm"
            >
              <Save size={15} />
              {isSaving ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </div>

        {/* Foto de perfil */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Foto de perfil
          </p>
          <div className="rounded-xl border border-line/35 bg-[#faf9f6] p-4">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="h-24 w-24 overflow-hidden rounded-2xl border border-accent/15 bg-white text-accent shadow-sm">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Foto de perfil"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <UserRound size={32} />
                    </div>
                  )}
                </div>
                <label
                  htmlFor="settings-photo-file"
                  className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-line/40 bg-white shadow-md transition-colors hover:border-accent/35 hover:text-brand-deep"
                >
                  <Camera size={13} />
                  <input
                    id="settings-photo-file"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                    className="sr-only"
                  />
                </label>
              </div>

              <label
                htmlFor="settings-photo-file"
                className="cursor-pointer text-xs font-medium text-accent underline-offset-2 hover:underline"
              >
                Alterar foto
              </label>

              <p className="text-center text-xs text-ink-muted">
                JPG ou PNG, max 5 MB
              </p>

              {photoFile && (
                <p className="text-center text-xs text-ink-dim">
                  <span className="font-medium text-brand-deep">
                    {photoFile.name}
                  </span>
                  <br />
                  sera enviada ao salvar
                </p>
              )}
            </div>

            <div className="mt-4 overflow-hidden rounded-lg border border-line/30 bg-white">
              <p className="border-b border-line/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted/60">
                Prévia pública
              </p>
              <div className="flex items-center gap-2.5 px-3 py-2.5">
                <div className="h-8 w-8 shrink-0 overflow-hidden rounded-xl border border-accent/15 bg-[#f5f3ee] text-accent">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <UserRound size={16} />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-ink">
                    {nomeCompleto || 'Seu nome'}
                  </p>
                  {cidade && (
                    <p className="flex items-center gap-0.5 text-xs text-ink-muted">
                      <MapPin size={9} /> {cidade}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Tab: Notificações ────────────────────────────────────────────────────────

function TabNotificacoes() {
  const [preferences, setPreferences] =
    useState<NotificationPreferences>(DEFAULT_PREFS)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    getNotificationPreferences()
      .then((prefs) => {
        if (active) setPreferences(prefs)
      })
      .catch((err) => {
        if (!active) return
        setError(
          err instanceof ApiError
            ? err.message
            : 'Nao foi possivel carregar suas preferencias.'
        )
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  async function togglePreference(key: keyof NotificationPreferences) {
    const next = { ...preferences, [key]: !preferences[key] }
    const prev = preferences
    setPreferences(next)
    setIsSaving(true)
    setError(null)
    try {
      const saved = await updateNotificationPreferences(next)
      setPreferences(saved)
      setIsSaved(true)
      window.setTimeout(() => setIsSaved(false), 1400)
    } catch (err) {
      setPreferences(prev)
      setError(
        err instanceof ApiError
          ? err.message
          : 'Nao foi possivel salvar suas preferencias.'
      )
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-5">
        <div className="mb-6 space-y-1.5 border-b border-line/30 pb-5">
          <div className="h-4 w-36 rounded bg-line/40" />
          <div className="h-3 w-64 rounded bg-line/30" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-lg bg-line/30" />
              <div className="space-y-1">
                <div className="h-3 w-36 rounded bg-line/40" />
                <div className="h-2.5 w-48 rounded bg-line/30" />
              </div>
            </div>
            <div className="h-5 w-9 rounded-full bg-line/30" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <SectionHeader
        title="Preferencias de notificacao"
        description="Escolha quais eventos geram alertas. As alteracoes sao salvas automaticamente."
      />

      {error && (
        <p className="mb-4 rounded-xl border border-brand-deep/25 bg-brand-deep/5 p-3 text-sm font-medium text-brand-deep">
          {error}
        </p>
      )}

      <div className="space-y-5">
        <SubSection title="Atividade na plataforma">
          <div>
            <NotifRow
              label="Trocas e propostas"
              description="Novas propostas, aceites e recusas de troca"
              icon={RefreshCw}
              checked={preferences.tradeUpdates}
              disabled={isSaving}
              onToggle={() => togglePreference('tradeUpdates')}
            />
            <NotifRow
              label="Curtidas no feed"
              description="Quando alguém curte suas publicações"
              icon={Heart}
              checked={preferences.socialLikes}
              disabled={isSaving}
              onToggle={() => togglePreference('socialLikes')}
            />
            <NotifRow
              label="Comentários no feed"
              description="Respostas e comentários nas suas postagens"
              icon={MessageCircle}
              checked={preferences.socialComments}
              disabled={isSaving}
              onToggle={() => togglePreference('socialComments')}
            />
            <NotifRow
              label="Confirmações de doação"
              description="Atualizações sobre suas doações a instituições"
              icon={Gift}
              checked={preferences.donationUpdates}
              disabled={isSaving}
              onToggle={() => togglePreference('donationUpdates')}
            />
          </div>
        </SubSection>

        <SubSection title="Canal de entrega">
          <div>
            <NotifRow
              label="Notificacoes por e-mail"
              description="Receba um resumo dos alertas no seu e-mail"
              icon={Mail}
              checked={preferences.emailEnabled}
              disabled={isSaving}
              onToggle={() => togglePreference('emailEnabled')}
            />
          </div>
        </SubSection>
      </div>

      <p
        className={`mt-5 inline-flex items-center gap-2 text-xs transition-colors ${
          isSaved ? 'text-brand-deep' : 'text-ink-muted'
        }`}
      >
        <Check size={13} />
        {isSaved
          ? 'Preferencias salvas.'
          : isSaving
            ? 'Salvando...'
            : 'Sincronizado.'}
      </p>
    </div>
  )
}

// ─── Tab: Gêneros favoritos ───────────────────────────────────────────────────

function TabGeneros() {
  const toast = useToast()
  const [allGenres, setAllGenres] = useState<ApiGenre[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([listGenres(), getMyFavoriteGenres()])
      .then(([allRes, myRes]) => {
        if (!active) return
        setAllGenres(allRes.data)
        setSelected(new Set(myRes.data.map((g) => g.id)))
      })
      .catch(() => {
        if (!active) return
        toast.error({
          title: 'Erro',
          message: 'Nao foi possivel carregar os generos.',
        })
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function toggleGenre(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  async function handleSave() {
    setIsSaving(true)
    try {
      await updateMyFavoriteGenres([...selected])
      setIsSaved(true)
      window.setTimeout(() => setIsSaved(false), 1400)
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Nao foi possivel salvar seus generos.'
      toast.error({ title: 'Erro', message })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="mb-6 space-y-1.5 border-b border-line/30 pb-5">
          <div className="h-4 w-40 rounded bg-line/40" />
          <div className="h-3 w-72 rounded bg-line/30" />
        </div>
        <div className="flex flex-wrap gap-2">
          {[...Array(14)].map((_, i) => (
            <div
              key={i}
              className="h-8 rounded-full bg-line/30"
              style={{ width: `${64 + (i % 5) * 18}px` }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <SectionHeader
        title="Generos favoritos"
        description="Selecione os generos que voce mais aprecia. Eles personalizam seu catalogo e suas recomendacoes."
      />

      {allGenres.length === 0 ? (
        <p className="text-sm text-ink-muted">
          Nenhum genero disponivel no momento.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {allGenres.map((genre) => {
            const isSelected = selected.has(genre.id)
            return (
              <button
                key={genre.id}
                type="button"
                onClick={() => toggleGenre(genre.id)}
                className={`inline-flex h-8 items-center rounded-full border px-3.5 text-sm font-medium transition-all ${
                  isSelected
                    ? 'border-accent bg-accent/10 text-brand-deep shadow-sm shadow-accent/10'
                    : 'border-line/55 bg-white text-ink-dim hover:border-accent/45 hover:text-ink'
                }`}
              >
                {genre.nome}
              </button>
            )
          })}
        </div>
      )}

      <div className="mt-6 flex items-center gap-3 border-t border-line/25 pt-5">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary h-10 px-6 text-sm"
        >
          <Save size={15} />
          {isSaving ? 'Salvando...' : 'Salvar gêneros'}
        </button>

        {isSaved && (
          <span className="inline-flex items-center gap-1.5 text-sm text-brand-deep">
            <Check size={14} /> Salvo!
          </span>
        )}

        {selected.size > 0 && (
          <span className="ml-auto text-xs text-ink-muted">
            {selected.size} selecionado{selected.size !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Tab: Conta ───────────────────────────────────────────────────────────────

function TabConta() {
  const toast = useToast()
  const { user } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [isSendingReset, setIsSendingReset] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')

  const isGoogleAccount = profile?.auth_provider === 'google'

  useEffect(() => {
    let active = true
    getMyProfile()
      .then((res) => {
        if (active) setProfile(res.data)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  async function handleSendPasswordReset() {
    if (!profile?.email) return
    setIsSendingReset(true)
    try {
      await forgotPassword(profile.email)
      setResetSent(true)
      toast.success({
        title: 'Link enviado!',
        message: `Verifique sua caixa de entrada em ${profile.email}.`,
      })
    } catch (err) {
      toast.error({
        title: 'Erro ao enviar',
        message:
          err instanceof ApiError
            ? err.message
            : 'Tente novamente em instantes.',
      })
    } finally {
      setIsSendingReset(false)
    }
  }

  return (
    <div>
      <SectionHeader
        title="Conta e seguranca"
        description="Gerencie suas credenciais de acesso e dados da conta."
      />

      <div className="space-y-6">
        <SubSection title="Acesso">
          <div className="divide-y divide-line/20">
            <AccountRow
              title="Endereco de e-mail"
              description={profile?.email ?? user?.email ?? 'Carregando...'}
            />
            <AccountRow
              title="Senha"
              description={
                isGoogleAccount
                  ? 'Sua conta usa autenticacao pelo Google, sem senha definida.'
                  : 'Enviaremos um link de redefinicao para seu e-mail cadastrado.'
              }
              action={
                !isGoogleAccount ? (
                  <button
                    type="button"
                    onClick={handleSendPasswordReset}
                    disabled={isSendingReset || resetSent}
                    className="btn-secondary h-8 px-3 text-xs"
                  >
                    {resetSent ? (
                      <>
                        <Check size={12} className="text-brand-deep" /> Link
                        enviado
                      </>
                    ) : (
                      <>
                        <Send size={12} />
                        {isSendingReset ? 'Enviando...' : 'Enviar link'}
                      </>
                    )}
                  </button>
                ) : undefined
              }
            />
            <AccountRow
              title="Conta Google"
              description={
                isGoogleAccount
                  ? 'Voce acessa o The Book Space com sua conta Google.'
                  : 'Vincule sua conta Google para entrar sem senha.'
              }
              action={
                isGoogleAccount ? (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-line/45 bg-[#fbfaf7] px-3 py-1.5 text-xs font-semibold text-ink-dim">
                    <Check size={12} className="text-brand-deep" /> Vinculada
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={startGoogleLogin}
                    className="btn-secondary h-8 px-3 text-xs"
                  >
                    <Globe size={12} /> Vincular Google
                  </button>
                )
              }
            />
          </div>
        </SubSection>

        <SubSection title="Zona de perigo">
          <div className="rounded-xl border border-danger/25 bg-danger/[0.03] p-5">
            <AccountRow
              title="Excluir conta"
              description="Remove permanentemente seu perfil, livros, historico e todos os dados associados. Esta acao nao pode ser desfeita."
              variant="danger"
              action={
                !showDeleteConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-danger/35 px-3 py-1.5 text-xs font-semibold text-danger/80 transition-colors hover:border-danger hover:bg-danger/5 hover:text-danger"
                  >
                    <AlertTriangle size={12} /> Excluir conta
                  </button>
                ) : undefined
              }
            />

            {showDeleteConfirm && (
              <div className="mt-3 space-y-3 rounded-lg border border-danger/30 bg-white p-4">
                <p className="text-xs text-danger">
                  Para confirmar, digite{' '}
                  <span className="font-bold">excluir</span> abaixo:
                </p>
                <input
                  type="text"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  placeholder="excluir"
                  className="w-full px-3"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={deleteInput.toLowerCase() !== 'excluir'}
                    className="btn-primary bg-danger hover:bg-danger/90 h-9 text-xs"
                    onClick={() =>
                      toast.error({
                        title: 'Funcionalidade em desenvolvimento',
                        message:
                          'A exclusao de conta sera implementada em breve.',
                      })
                    }
                  >
                    <AlertTriangle size={12} /> Confirmar exclusao
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteConfirm(false)
                      setDeleteInput('')
                    }}
                    className="btn-secondary h-9 text-xs"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </SubSection>
      </div>
    </div>
  )
}

// ─── Settings (raiz) ──────────────────────────────────────────────────────────

export default function Settings() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentTab = searchParams.get('tab')
  const activeTab: Tab =
    currentTab === 'perfil' ||
    currentTab === 'notificacoes' ||
    currentTab === 'generos' ||
    currentTab === 'conta'
      ? currentTab
      : 'perfil'

  useEffect(() => {
    if (currentTab) return
    setSearchParams({ tab: 'perfil' }, { replace: true })
  }, [currentTab, setSearchParams])

  function setTab(tab: Tab) {
    setSearchParams({ tab }, { replace: true })
  }

  return (
    <main className="mx-auto w-full max-w-6xl">
      {/* Page header */}
      <div className="mb-8 space-y-1">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Voltar"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-muted transition-colors hover:text-brand-deep"
        >
          <ChevronLeft size={16} className="shrink-0" />
          Voltar
        </button>
        <h1 className="text-2xl font-semibold text-ink">Configuracoes</h1>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar nav */}
        <nav
          aria-label="Secoes de configuracoes"
          className="w-full shrink-0 lg:w-64"
        >
          <div className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:gap-1.5 lg:pb-0">
            {TABS.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`group flex shrink-0 items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-all lg:w-full ${
                    isActive
                      ? 'bg-accent/10 font-bold text-brand-deep shadow-sm shadow-accent/5'
                      : 'font-medium text-ink-dim hover:bg-surface-alt hover:text-ink'
                  }`}
                >
                  <Icon
                    size={18}
                    className={
                      isActive
                        ? 'text-accent'
                        : 'text-ink-muted group-hover:text-ink'
                    }
                  />
                  {label}
                </button>
              )
            })}
          </div>
        </nav>

        {/* Content panel */}
        <section className="min-w-0 flex-1 lg:border-l lg:border-line/40 lg:pl-10">
          {activeTab === 'perfil' && <TabPerfil />}
          {activeTab === 'notificacoes' && <TabNotificacoes />}
          {activeTab === 'generos' && <TabGeneros />}
          {activeTab === 'conta' && <TabConta />}
        </section>
      </div>
    </main>
  )
}
