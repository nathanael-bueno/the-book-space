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
    fotos?: string[] | null
  } | null
}

type PostEnvelope = {
  message: string
  data: ApiPost
}

type PaginatedPosts = {
  data: ApiPost[]
}

export async function listPosts() {
  return http<PaginatedPosts>('/posts', { token: getToken() })
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
