import { http } from './http'

export type ApiReview = {
  id: string
  id_trade: string
  id_avaliador: string
  id_avaliado: string
  nota: number
  comentario: string | null
  created_at: string
  reviewer?: {
    id: string
    nome_completo: string
    foto?: string | null
  }
}

export async function listUserReviews(userId: string) {
  return http<{ data: ApiReview[] }>(`/users/${userId}/reviews`)
}
