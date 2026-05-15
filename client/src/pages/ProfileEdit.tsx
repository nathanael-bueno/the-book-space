import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, Camera, MapPin, Save, UserRound } from 'lucide-react'
import { ApiError } from '../services/http'
import { listBrazilianStates, listCitiesByState } from '../services/locations'
import {
  getMyProfile,
  updateMyProfile,
  type Profile as ProfileData,
} from '../services/profile'
import { uploadImage } from '../services/uploads'
import { useToast } from '../stores/useToast'

const ageRanges = [
  { value: '13-17', label: '13 a 17 anos' },
  { value: '18-24', label: '18 a 24 anos' },
  { value: '25-34', label: '25 a 34 anos' },
  { value: '35-44', label: '35 a 44 anos' },
  { value: '45-54', label: '45 a 54 anos' },
  { value: '55+', label: '55 anos ou mais' },
]

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-ink">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  )
}

const inputClass =
  'h-9 w-full rounded-lg border border-line/55 bg-[#fbfaf7] px-3 text-sm text-ink outline-none transition-colors focus:border-accent'

const selectClass =
  'h-9 w-full rounded-lg border border-line/55 bg-[#fbfaf7] px-3 text-sm text-ink outline-none transition-colors focus:border-accent disabled:cursor-not-allowed disabled:opacity-60'

export default function ProfileEdit() {
  const toast = useToast()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [nomeCompleto, setNomeCompleto] = useState('')
  const [bio, setBio] = useState('')
  const [estado, setEstado] = useState('')
  const [cidade, setCidade] = useState('')
  const [faixaEtaria, setFaixaEtaria] = useState('')
  const [cities, setCities] = useState<string[]>([])
  const [states, setStates] = useState<Array<{ code: string; name: string }>>([])
  const [isLoadingCities, setIsLoadingCities] = useState(false)
  const [isLoadingStates, setIsLoadingStates] = useState(true)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

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
    async function loadStates() {
      setIsLoadingStates(true)
      try {
        const data = await listBrazilianStates()
        if (!active) return
        setStates(data)
      } catch {
        if (!active) return
        toast.error({ title: 'Erro', message: 'Nao foi possivel carregar os estados.' })
      } finally {
        if (active) setIsLoadingStates(false)
      }
    }
    loadStates()
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    async function loadProfile() {
      setIsLoading(true)
      try {
        const response = await getMyProfile()
        if (!active) return
        const d = response.data
        setProfile(d)
        setNomeCompleto(d.nome_completo ?? '')
        setBio(d.bio ?? '')
        setEstado(d.estado ?? '')
        setCidade(d.cidade ?? '')
        setFaixaEtaria(d.faixa_etaria ?? '')
      } catch (err) {
        if (!active) return
        const message = err instanceof ApiError ? err.message : 'Nao foi possivel carregar seu perfil.'
        toast.error({ title: 'Erro', message })
      } finally {
        if (active) setIsLoading(false)
      }
    }
    loadProfile()
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!estado) return
    let active = true
    async function loadCities() {
      setIsLoadingCities(true)
      try {
        const data = await listCitiesByState(estado)
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
    return () => { active = false }
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
      toast.success({ title: 'Perfil salvo', message: response.message })
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Falha ao salvar perfil.'
      toast.error({ title: 'Erro ao salvar', message })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="mx-auto w-full space-y-3">
      <div className="grid gap-3 xl:grid-cols-[1fr_260px]">
        {/* Form */}
        <section className="rounded-xl border border-line/45 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-3">
            <Link
              to="/app/profile"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line/55 bg-[#fbfaf7] px-3 py-2 text-sm font-medium text-ink-dim shadow-sm transition-colors hover:border-accent/35 hover:text-brand-deep"
            >
              <ChevronLeft size={15} />
              Voltar
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-ink">Editar perfil</h1>
              <p className="text-sm text-ink-dim">
                Suas informacoes publicas aparecem para outros usuarios no catalogo e nas trocas.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="mt-6 space-y-4 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-20 rounded bg-line/40" />
                  <div className="h-9 w-full rounded-lg bg-line/30" />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              <Field label="Nome completo">
                <input
                  type="text"
                  value={nomeCompleto}
                  onChange={(e) => setNomeCompleto(e.target.value)}
                  className={inputClass}
                  placeholder="Seu nome"
                />
              </Field>

              <Field label="Bio">
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Conte um pouco sobre voce e seus gostos literarios..."
                  className="w-full resize-none rounded-lg border border-line/55 bg-[#fbfaf7] px-3 py-2.5 text-sm leading-6 text-ink outline-none transition-colors focus:border-accent"
                />
              </Field>

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
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Faixa etaria">
                <select
                  value={faixaEtaria}
                  onChange={(e) => setFaixaEtaria(e.target.value)}
                  className={selectClass}
                >
                  <option value="">Selecione a faixa etaria</option>
                  {ageRanges.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </Field>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-5 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep disabled:opacity-60"
              >
                <Save size={15} />
                {isSaving ? 'Salvando...' : 'Salvar perfil'}
              </button>
            </div>
          )}
        </section>

        {/* Foto */}
        <section className="rounded-xl border border-line/45 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-base font-semibold text-ink">Foto de perfil</h2>
          <p className="mt-1 text-xs text-ink-muted">JPG ou PNG, max 5 MB</p>

          <div className="mt-4 flex flex-col items-center gap-4">
            <div className="relative">
              <div className="h-28 w-28 overflow-hidden rounded-2xl border border-accent/15 bg-[#f5f3ee] text-accent shadow-sm">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Foto de perfil"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <UserRound size={44} />
                  </div>
                )}
              </div>
              <label
                htmlFor="profile-photo-file"
                className="absolute -bottom-2 -right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-line/55 bg-white shadow-sm transition-colors hover:border-accent/35 hover:text-brand-deep"
                title="Alterar foto"
              >
                <Camera size={14} />
                <input
                  id="profile-photo-file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                  className="sr-only"
                />
              </label>
            </div>

            {photoFile && (
              <p className="text-center text-xs text-ink-dim">
                <span className="font-medium text-brand-deep">{photoFile.name}</span>
                <br />
                sera enviada ao salvar
              </p>
            )}

            <label
              htmlFor="profile-photo-file"
              className="cursor-pointer text-xs font-medium text-accent underline-offset-2 hover:underline"
            >
              Alterar foto
            </label>
          </div>

          <div className="mt-6 rounded-lg border border-line/35 bg-[#fbfaf7] p-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-accent/15 bg-white text-accent">
                {photoPreview ? (
                  <img src={photoPreview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <UserRound size={20} />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">
                  {nomeCompleto || 'Seu nome'}
                </p>
                {cidade && (
                  <p className="flex items-center gap-1 text-xs text-ink-muted">
                    <MapPin size={10} />
                    {cidade}
                  </p>
                )}
              </div>
            </div>
            <p className="mt-2 text-xs text-ink-muted">Previa publica</p>
          </div>
        </section>
      </div>
    </main>
  )
}
