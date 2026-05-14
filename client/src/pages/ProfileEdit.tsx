import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Camera, MapPin, Save, UserRound } from 'lucide-react'
import { ApiError } from '../services/http'
import { listBrazilianStates, listCitiesByState } from '../services/locations'
import {
  getMyProfile,
  updateMyProfile,
  type Profile as ProfileData,
} from '../services/profile'
import { useToast } from '../stores/useToast'

const ageRanges = [
  { value: '13-17', label: '13 a 17 anos' },
  { value: '18-24', label: '18 a 24 anos' },
  { value: '25-34', label: '25 a 34 anos' },
  { value: '35-44', label: '35 a 44 anos' },
  { value: '45-54', label: '45 a 54 anos' },
  { value: '55+', label: '55 anos ou mais' },
]

export default function ProfileEdit() {
  const toast = useToast()
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
        toast.error({
          title: 'Erro',
          message: 'Nao foi possivel carregar os estados.',
        })
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

    async function loadProfile() {
      setIsLoading(true)
      try {
        const response = await getMyProfile()
        if (!active) return
        const profileData = response.data
        setProfile(profileData)
        setNomeCompleto(profileData.nome_completo ?? '')
        setBio(profileData.bio ?? '')
        setEstado(profileData.estado ?? '')
        setCidade(profileData.cidade ?? '')
        setFaixaEtaria(profileData.faixa_etaria ?? '')
      } catch (err) {
        if (!active) return
        const message =
          err instanceof ApiError
            ? err.message
            : 'Nao foi possivel carregar seu perfil.'
        toast.error({ title: 'Erro', message })
      } finally {
        if (active) setIsLoading(false)
      }
    }

    loadProfile()
    return () => {
      active = false
    }
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

    return () => {
      active = false
    }
  }, [estado])

  async function handleSave() {
    setIsSaving(true)
    try {
      const response = await updateMyProfile({
        nome_completo: nomeCompleto.trim(),
        bio: bio.trim() || null,
        cidade: cidade.trim() || null,
        estado: estado || null,
        faixa_etaria: faixaEtaria || null,
      })
      setProfile(response.data)
      toast.success({
        title: 'Perfil salvo',
        message: response.message,
      })
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Falha ao salvar perfil.'
      toast.error({
        title: 'Erro ao salvar',
        message,
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="mx-auto w-full space-y-3">
      <Link
        to="/app/profile"
        className="inline-flex items-center gap-2 rounded-lg border border-line/55 bg-white px-3 py-2 text-sm font-medium text-ink-dim shadow-sm transition-colors hover:border-accent/35 hover:text-brand-deep"
      >
        <ArrowLeft size={16} />
        Voltar
      </Link>

      <section className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Editar perfil</h1>
          <p className="mt-1 max-w-2xl text-sm leading-5 text-ink-dim">
            Atualize seus dados publicos para facilitar trocas, doacoes e
            contato com outros leitores.
          </p>
        </div>
      </section>

      <form className="grid gap-2.5 rounded-xl border border-line/45 bg-white p-3 shadow-sm sm:p-3.5 lg:grid-cols-[1fr_0.72fr]">
        <section className="space-y-3">
          {isLoading ? (
            <p className="text-sm text-ink-dim">Carregando perfil...</p>
          ) : null}
          <label className="block">
            <span className="text-sm font-semibold text-ink">Nome</span>
            <input
              type="text"
              value={nomeCompleto}
              onChange={(event) => setNomeCompleto(event.target.value)}
              className="mt-2 h-9 w-full rounded-lg border border-line/55 bg-[#fbfaf7] px-3 text-sm text-ink outline-none transition-colors focus:border-accent"
            />
          </label>

          <div className="block">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
              <Camera size={16} className="text-brand-deep" />
              Foto de perfil
            </span>
            <label
              htmlFor="profile-photo-file"
              className="group mt-2 flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-line/55 bg-[#fbfaf7] px-3 py-4 text-center transition-colors hover:border-accent/55 hover:bg-white"
            >
              <input
                id="profile-photo-file"
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setPhotoFile(event.target.files?.[0] ?? null)
                }
                className="sr-only"
              />
              <span className="text-sm font-medium text-ink-dim group-hover:text-brand-deep">
                Clique para enviar foto
              </span>
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-ink">Bio</span>
            <textarea
              rows={5}
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              className="mt-2 w-full resize-none rounded-lg border border-line/55 bg-[#fbfaf7] px-3 py-2.5 text-sm leading-6 text-ink outline-none transition-colors focus:border-accent"
            />
          </label>

          <label className="block">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
              <MapPin size={16} className="text-brand-deep" />
              Estado
            </span>
            <select
              value={estado}
              onChange={(event) => {
                setEstado(event.target.value)
                setCidade('')
                setCities([])
              }}
              disabled={isLoadingStates}
              className="mt-2 h-9 w-full rounded-lg border border-line/55 bg-[#fbfaf7] px-3 text-sm text-ink outline-none transition-colors focus:border-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                {isLoadingStates
                  ? 'Carregando estados...'
                  : 'Selecione o estado'}
              </option>
              {states.map((stateOption) => (
                <option key={stateOption.code} value={stateOption.code}>
                  {stateOption.name} ({stateOption.code})
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
              <MapPin size={16} className="text-brand-deep" />
              Cidade
            </span>
            <select
              value={cidade}
              onChange={(event) => setCidade(event.target.value)}
              disabled={!estado || isLoadingCities}
              className="mt-2 h-9 w-full rounded-lg border border-line/55 bg-[#fbfaf7] px-3 text-sm text-ink outline-none transition-colors focus:border-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                {!estado
                  ? 'Selecione um estado primeiro'
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

          <label className="block">
            <span className="text-sm font-semibold text-ink">Faixa etaria</span>
            <select
              value={faixaEtaria}
              onChange={(event) => setFaixaEtaria(event.target.value)}
              className="mt-2 h-9 w-full rounded-lg border border-line/55 bg-[#fbfaf7] px-3 text-sm text-ink outline-none transition-colors focus:border-accent"
            >
              <option value="">Selecione a faixa etaria</option>
              {ageRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep"
          >
            <Save size={17} />
            {isSaving ? 'Salvando...' : 'Salvar perfil'}
          </button>
        </section>

        <aside className="rounded-xl border border-line/35 bg-[#fbfaf7] p-3 sm:p-3.5">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-accent/15 bg-white text-accent shadow-sm">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Previa da foto de perfil"
                className="h-full w-full object-cover"
              />
            ) : (
              <UserRound size={30} />
            )}
          </div>
          <h2 className="mt-4 text-base font-semibold text-ink">
            Previa publica
          </h2>
          <p className="mt-2 text-sm leading-6 text-ink-dim">
            Nome, foto, bio e cidade aparecem para outros usuarios quando eles
            visitam seu perfil publico ou veem seus livros anunciados.
          </p>
        </aside>
      </form>
    </main>
  )
}
