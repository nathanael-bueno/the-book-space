type IbgeState = {
  sigla: string
  nome: string
}

type IbgeCity = {
  nome: string
}

type NominatimReverseResponse = {
  address?: {
    state?: string
    state_code?: string
    city?: string
    town?: string
    village?: string
    municipality?: string
  }
}

export type StateOption = {
  code: string
  name: string
}

export function formatCityWithState(city: string, stateCode: string) {
  const normalizedCity = city.trim()
  const normalizedStateCode = stateCode.trim().toUpperCase()
  if (!normalizedCity || !normalizedStateCode) return ''
  return `${normalizedCity} - ${normalizedStateCode}`
}

export function parseCityWithState(value: string | null | undefined) {
  if (!value) return { city: '', stateCode: '' }
  const parts = value.split(' - ')
  if (parts.length === 2 && parts[1].length === 2) {
    return { city: parts[0], stateCode: parts[1].toUpperCase() }
  }

  return { city: value, stateCode: '' }
}

const IBGE_BASE_URL = 'https://servicodados.ibge.gov.br/api/v1/localidades'
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/reverse'

export async function listBrazilianStates() {
  const response = await fetch(`${IBGE_BASE_URL}/estados?orderBy=nome`)
  if (!response.ok) {
    throw new Error('Nao foi possivel carregar estados.')
  }

  const data = (await response.json()) as IbgeState[]
  return data.map((state) => ({
    code: state.sigla,
    name: state.nome,
  }))
}

export async function listCitiesByState(stateCode: string) {
  const response = await fetch(
    `${IBGE_BASE_URL}/estados/${encodeURIComponent(stateCode)}/municipios`
  )
  if (!response.ok) {
    throw new Error('Nao foi possivel carregar cidades.')
  }

  const data = (await response.json()) as IbgeCity[]
  return data.map((city) => city.nome)
}

export async function getLocationFromCoordinates(
  latitude: number,
  longitude: number
) {
  const url = new URL(NOMINATIM_BASE_URL)
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('lat', String(latitude))
  url.searchParams.set('lon', String(longitude))
  url.searchParams.set('zoom', '10')
  url.searchParams.set('addressdetails', '1')

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Nao foi possivel identificar sua localizacao.')
  }

  const data = (await response.json()) as NominatimReverseResponse
  const address = data.address
  if (!address) {
    throw new Error('Nao foi possivel identificar sua localizacao.')
  }

  const stateCode = address.state_code?.split('-')[1]?.toUpperCase() ?? ''
  const city =
    address.city ??
    address.town ??
    address.village ??
    address.municipality ??
    ''

  if (!stateCode || !city) {
    throw new Error('Nao foi possivel identificar sua cidade e estado.')
  }

  return { stateCode, city }
}
