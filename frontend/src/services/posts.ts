import { getToken } from './auth'
import { http } from './http'

export type ApiPost = {
  id: string
  titulo: string
  conteudo: string
  imagem_url: string | null
  id_livro: string | null
  id_usuario: string
  created_at: string
  updated_at: string
  author?: {
    id: string
    nome_completo: string
    foto?: string | null
  }
  book?: {
    id: string
    titulo: string
    autor: string
    id_genero?: string | null
    genre?: {
      id: string
      nome: string
    } | null
    fotos?: string[] | null
  } | null
  likes_count?: number
  comments_count?: number
  liked_by_me?: boolean
  latest_comments?: ApiPostComment[]
}

export type ApiPostComment = {
  id: string
  id_post: string
  id_usuario: string
  conteudo: string
  created_at: string
  updated_at: string
  author?: {
    id: string
    nome_completo: string
    foto?: string | null
  }
}

type PostEnvelope = {
  message: string
  data: ApiPost
}

type PaginatedPosts = {
  data: ApiPost[]
}

type CommentsEnvelope = {
  data: ApiPostComment[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export async function listPosts(params?: {
  id_genero?: string
  per_page?: number
}) {
  const search = new URLSearchParams()
  if (params?.id_genero) search.set('id_genero', params.id_genero)
  if (params?.per_page) search.set('per_page', String(params.per_page))

  const suffix = search.toString() ? `?${search.toString()}` : ''
  return http<PaginatedPosts>(`/posts${suffix}`, { token: getToken() })
}

export async function getPost(postId: string) {
  return http<PostEnvelope>(`/posts/${postId}`, { token: getToken() })
}

export async function createPost(payload: {
  titulo: string
  conteudo: string
  id_livro?: string | null
  imagem_url?: string | null
}) {
  return http<PostEnvelope>('/posts', {
    method: 'POST',
    body: payload,
    token: getToken(),
  })
}

export async function updatePost(
  postId: string,
  payload: {
    titulo?: string
    conteudo?: string
    id_livro?: string | null
    imagem_url?: string | null
  }
) {
  return http<PostEnvelope>(`/posts/${postId}`, {
    method: 'PATCH',
    body: payload,
    token: getToken(),
  })
}

export async function deletePost(postId: string) {
  return http<{ message: string }>(`/posts/${postId}`, {
    method: 'DELETE',
    token: getToken(),
  })
}

export async function likePost(postId: string) {
  return http<{ message: string }>(`/posts/${postId}/likes`, {
    method: 'POST',
    token: getToken(),
  })
}

export async function unlikePost(postId: string) {
  return http<{ message: string }>(`/posts/${postId}/likes`, {
    method: 'DELETE',
    token: getToken(),
  })
}

export async function listPostComments(postId: string, perPage = 20, page = 1) {
  return http<CommentsEnvelope>(
    `/posts/${postId}/comments?per_page=${perPage}&page=${page}`,
    {
      token: getToken(),
    }
  )
}

export async function createPostComment(postId: string, conteudo: string) {
  return http<{ message: string; data: ApiPostComment }>(
    `/posts/${postId}/comments`,
    {
      method: 'POST',
      body: { conteudo },
      token: getToken(),
    }
  )
}

export async function reportPost(postId: string, motivo: string) {
  return http<{ message: string }>(`/posts/${postId}/report`, {
    method: 'POST',
    body: { motivo },
    token: getToken(),
  })
}
