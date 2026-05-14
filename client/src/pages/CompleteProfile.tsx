import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../services/http'
import { listBrazilianStates, listCitiesByState } from '../services/locations'
import { clearToken } from '../services/auth'
import { getMyProfile, updateMyProfile } from '../services/profile'
import {
  getMyFavoriteGenres,
  listGenres,
  saveMyFavoriteGenres,
  type ApiGenre,
} from '../services/books'
import { useToast } from '../stores/useToast'

const ageRanges = [
  { value: '13-17', label: '13 a 17 anos' },
  { value: '18-24', label: '18 a 24 anos' },
  { value: '25-34', label: '25 a 34 anos' },
  { value: '35-44', label: '35 a 44 anos' },
  { value: '45-54', label: '45 a 54 anos' },
  { value: '55+', label: '55 anos ou mais' },
]

export default function CompleteProfile() {
  const navigate = useNavigate()
  const toast = useToast()
  const [estado, setEstado] = useState('')
  const [cidade, setCidade] = useState('')
  const [faixaEtaria, setFaixaEtaria] = useState('')
  const [states, setStates] = useState<Array<{ code: string; name: string }>>(
    []
  )
  const [cities, setCities] = useState<string[]>([])
  const [isLoadingStates, setIsLoadingStates] = useState(true)
  const [isLoadingCities, setIsLoadingCities] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [genres, setGenres] = useState<ApiGenre[]>([])
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])

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

    void loadStates()
    return () => {
      active = false
    }
  }, [toast])

  useEffect(() => {
    let active = true

    async function loadGenres() {
      try {
        const [genresResponse, favoritesResponse] = await Promise.all([
          listGenres(),
          getMyFavoriteGenres(),
        ])
        if (!active) return
        setGenres(genresResponse.data)
        setSelectedGenres(favoritesResponse.data.map((genre) => genre.id))
      } catch {
        if (!active) return
        toast.error({
          title: 'Erro',
          message: 'Nao foi possivel carregar os generos favoritos.',
        })
      }
    }

    void loadGenres()

    return () => {
      active = false
    }
  }, [toast])

  useEffect(() => {
    let active = true

    async function loadProfile() {
      setIsLoading(true)
      try {
        const response = await getMyProfile()
        if (!active) return
        const profile = response.data
        const favoritesResponse = await getMyFavoriteGenres()
        if (!active) return
        const hasFavoriteGenres = favoritesResponse.data.length >= 3

        if (
          profile.cidade &&
          profile.estado &&
          profile.faixa_etaria &&
          hasFavoriteGenres
        ) {
          navigate('/app/feed', { replace: true })
          return
        }
        setEstado(profile.estado ?? '')
        setCidade(profile.cidade ?? '')
        setFaixaEtaria(profile.faixa_etaria ?? '')
      } catch {
        if (!active) return
        navigate('/auth/login', { replace: true })
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void loadProfile()
    return () => {
      active = false
    }
  }, [navigate])

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

    void loadCities()
    return () => {
      active = false
    }
  }, [estado])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (selectedGenres.length < 3 || selectedGenres.length > 5) {
      toast.error({
        title: 'Generos invalidos',
        message: 'Selecione entre 3 e 5 generos para continuar.',
      })
      return
    }

    setIsSaving(true)

    try {
      await updateMyProfile({
        estado,
        cidade,
        faixa_etaria: faixaEtaria,
      })
      await saveMyFavoriteGenres(selectedGenres)
      navigate('/app/feed', { replace: true })
    } catch (error) {
      toast.error({
        title: 'Erro',
        message:
          error instanceof ApiError
            ? error.message
            : 'Nao foi possivel salvar seu perfil.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = () => {
    clearToken()
    navigate('/auth/login', { replace: true })
  }

  function toggleGenre(genreId: string) {
    setSelectedGenres((current) => {
      const exists = current.includes(genreId)
      if (exists) return current.filter((id) => id !== genreId)
      if (current.length >= 5) return current
      return [...current, genreId]
    })
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-5 overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=1920")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-neutral-950/55 backdrop-blur-[1px]" />
      </div>

      <div className="ui-auth-card relative z-10 w-full max-w-md p-8 backdrop-blur-md">
        <h1 className="text-neutral-950 text-2xl font-semibold tracking-tight text-center">
          Complete seu perfil
        </h1>
        <p className="text-neutral-500 text-sm mt-1.5 font-normal text-center">
          Para continuar, precisamos de alguns dados obrigatorios.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <div className="space-y-1.5">
            <label
              htmlFor="state"
              className="block text-neutral-600 text-xs font-medium ml-0.5"
            >
              Estado
            </label>
            <select
              id="state"
              required
              value={estado}
              onChange={(e) => {
                setEstado(e.target.value)
                setCidade('')
                setCities([])
              }}
              disabled={isLoading || isLoadingStates}
              className="ui-auth-input w-full h-9 px-3.5 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/12 transition-all duration-200"
            >
              <option value="">
                {isLoadingStates ? 'Carregando estados...' : 'Selecione'}
              </option>
              {states.map((stateOption) => (
                <option key={stateOption.code} value={stateOption.code}>
                  {stateOption.name} ({stateOption.code})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="city"
              className="block text-neutral-600 text-xs font-medium ml-0.5"
            >
              Cidade
            </label>
            <select
              id="city"
              required
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              disabled={isLoading || !estado || isLoadingCities}
              className="ui-auth-input w-full h-9 px-3.5 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/12 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                {!estado
                  ? 'Selecione um estado primeiro'
                  : isLoadingCities
                    ? 'Carregando cidades...'
                    : 'Selecione'}
              </option>
              {cities.map((cityName) => (
                <option key={cityName} value={cityName}>
                  {cityName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="ageRange"
              className="block text-neutral-600 text-xs font-medium ml-0.5"
            >
              Faixa etaria
            </label>
            <select
              id="ageRange"
              required
              value={faixaEtaria}
              onChange={(e) => setFaixaEtaria(e.target.value)}
              disabled={isLoading}
              className="ui-auth-input w-full h-9 px-3.5 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/12 transition-all duration-200"
            >
              <option value="">Selecione</option>
              {ageRanges.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <div>
              <p className="block text-neutral-600 text-xs font-medium ml-0.5">
                Generos favoritos
              </p>
              <p className="mt-1 text-[11px] text-neutral-500">
                Selecione de 3 a 5 para personalizar recomendacoes.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {genres.map((genre) => {
                const selected = selectedGenres.includes(genre.id)
                const disabled = !selected && selectedGenres.length >= 5

                return (
                  <button
                    key={genre.id}
                    type="button"
                    onClick={() => toggleGenre(genre.id)}
                    disabled={isLoading || disabled}
                    className={[
                      'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                      selected
                        ? 'border-accent bg-accent text-white'
                        : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-accent/45 hover:text-brand-deep',
                      disabled ? 'cursor-not-allowed opacity-50' : '',
                    ].join(' ')}
                  >
                    {genre.nome}
                  </button>
                )
              })}
            </div>

            <p className="text-xs font-semibold text-neutral-500">
              Selecionados: {selectedGenres.length}/5
            </p>
          </div>

          <button
            type="submit"
            disabled={isSaving || isLoading}
            className="ui-auth-primary-btn w-full bg-accent hover:bg-brand-deep disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm py-2.5 transition-all duration-300 mt-2"
          >
            {isSaving ? 'Salvando...' : 'Concluir cadastro'}
          </button>
        </form>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 w-full text-xs font-medium text-neutral-500 transition-colors hover:text-brand-deep"
        >
          Sair
        </button>
      </div>
    </div>
  )
}
