import { getToken } from './auth'
import { http } from './http'

export type ProfileBook = {
  id: string
  titulo: string
  autor: string
  fotos: string[] | null
}

export type Profile = {
  id: string
  nome_completo: string
  email: string
  bio: string | null
  cidade: string | null
  estado?: string | null
  faixa_etaria?: string | null
  nota?: string | number
  status?: string
  foto: string | null
  created_at: string
  books?: ProfileBook[]
}

type ProfileResponse = {
  message: string
  data: Profile
}

export async function getMyProfile() {
  return http<ProfileResponse>('/me/profile', { token: getToken() })
}

export async function updateMyProfile(payload: {
  nome_completo?: string
  bio?: string | null
  cidade?: string | null
  estado?: string | null
  faixa_etaria?: string | null
  foto?: string | null
}) {
  return http<ProfileResponse>('/me/profile', {
    method: 'PATCH',
    body: payload,
    token: getToken(),
  })
}

export async function getPublicProfile(userId: string) {
  return http<ProfileResponse>(`/users/${userId}`)
}
