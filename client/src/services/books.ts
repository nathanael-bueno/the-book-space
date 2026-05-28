import { getToken } from './auth'
import { http } from './http'

export type ApiBook = {
  id: string
  titulo: string
  autor: string
  isbn: string | null
  fotos: string[] | null
  estado_conservacao: string
  status: string
  descricao: string | null
  opcoes_troca?: string[] | null
  cidade: string | null
  id_usuario_dono: string
  id_genero: string | null
  owner?: {
    id: string
    nome_completo: string
    cidade?: string | null
    foto?: string | null
  }
  genre?: {
    id: string
    nome: string
  } | null
  created_at?: string
  updated_at?: string
}

type PaginatedBooks = {
  data: ApiBook[]
}

type GenreListResponse = {
  data: Array<{ id: string; nome: string }>
}

export type ApiGenre = {
  id: string
  nome: string
}

type BookEnvelope = {
  message: string
  data: ApiBook
}

export async function listBooks(params?: {
  q?: string
  id_genero?: string
  estado_conservacao?: string
  cidade?: string
  per_page?: number
}) {
  const search = new URLSearchParams()
  if (params?.q) search.set('q', params.q)
  if (params?.id_genero) search.set('id_genero', params.id_genero)
  if (params?.estado_conservacao)
    search.set('estado_conservacao', params.estado_conservacao)
  if (params?.cidade) search.set('cidade', params.cidade)
  if (params?.per_page) search.set('per_page', String(params.per_page))

  const suffix = search.toString() ? `?${search.toString()}` : ''
  return http<PaginatedBooks>(`/books${suffix}`)
}

export async function getBook(bookId: string) {
  return http<BookEnvelope>(`/books/${bookId}`)
}

export async function listGenres() {
  return http<GenreListResponse>('/genres')
}

export async function saveMyFavoriteGenres(genreIds: string[]) {
  return http<{ message: string; data: ApiGenre[] }>('/me/favorite-genres', {
    method: 'PUT',
    body: { genre_ids: genreIds },
    token: getToken(),
  })
}

export async function getMyFavoriteGenres() {
  return http<{ data: ApiGenre[] }>('/me/favorite-genres', {
    token: getToken(),
  })
}

export async function createBook(payload: {
  titulo: string
  autor: string
  isbn?: string | null
  fotos: string[]
  estado_conservacao: string
  descricao?: string | null
  opcoes_troca?: string[] | null
  cidade?: string | null
  id_genero: string
}) {
  return http<BookEnvelope>('/books', {
    method: 'POST',
    body: payload,
    token: getToken(),
  })
}

export async function updateBook(
  bookId: string,
  payload: {
    titulo?: string
    autor?: string
    isbn?: string | null
    fotos?: string[]
    estado_conservacao?: string
    status?: string
    descricao?: string | null
    opcoes_troca?: string[] | null
    cidade?: string | null
    id_genero?: string | null
  }
) {
  return http<BookEnvelope>(`/books/${bookId}`, {
    method: 'PATCH',
    body: payload,
    token: getToken(),
  })
}

export async function deleteBook(bookId: string) {
  return http<{ message: string }>(`/books/${bookId}`, {
    method: 'DELETE',
    token: getToken(),
  })
}

export async function getMyBooks() {
  return http<{ message: string; data: ApiBook[] }>('/me/books', {
    token: getToken(),
  })
}
