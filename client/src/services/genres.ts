import { getToken } from './auth'
import { http } from './http'

export type ApiGenre = {
  id: string
  nome: string
}

type GenresResponse = {
  data: ApiGenre[]
}

export async function listGenres() {
  return http<GenresResponse>('/genres')
}

export async function getMyFavoriteGenres() {
  return http<GenresResponse>('/me/favorite-genres', { token: getToken() })
}

export async function updateMyFavoriteGenres(genreIds: string[]) {
  return http<GenresResponse>('/me/favorite-genres', {
    method: 'PUT',
    token: getToken(),
    body: { genre_ids: genreIds },
  })
}
