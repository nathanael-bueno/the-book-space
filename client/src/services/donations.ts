import { getToken } from './auth'
import { http } from './http'

export type DonationInstitution = {
  id: string
  name: string
  city: string
}

const fallbackInstitutions: DonationInstitution[] = [
  {
    id: 'inst-1',
    name: 'Biblioteca Comunitaria Aurora',
    city: 'Belo Horizonte, MG',
  },
  {
    id: 'inst-2',
    name: 'Instituto Paginas Abertas',
    city: 'Sao Paulo, SP',
  },
  {
    id: 'inst-3',
    name: 'Casa de Leitura Mar do Norte',
    city: 'Recife, PE',
  },
]

type ApiData<T> = { data: T }

export async function getDonationInstitutionById(institutionId: string) {
  const token = getToken()

  try {
    const response = await http<ApiData<DonationInstitution>>(
      `/institutions/${institutionId}`,
      { token }
    )
    return response.data
  } catch {
    return (
      fallbackInstitutions.find((item) => item.id === institutionId) ?? null
    )
  }
}

export async function submitDonation(payload: {
  institutionId: string
  bookId: string
  notes: string
}) {
  const token = getToken()

  try {
    await http<{ message: string }>('/donations', {
      method: 'POST',
      token,
      body: payload,
    })
    return { persisted: true }
  } catch {
    const key = 'bookspace.local.donations'
    const current = JSON.parse(localStorage.getItem(key) ?? '[]') as Array<{
      id: string
      institutionId: string
      bookId: string
      notes: string
      createdAt: string
    }>

    current.unshift({
      id: crypto.randomUUID(),
      institutionId: payload.institutionId,
      bookId: payload.bookId,
      notes: payload.notes,
      createdAt: new Date().toISOString(),
    })

    localStorage.setItem(key, JSON.stringify(current))
    return { persisted: false }
  }
}
