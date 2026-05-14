import { beginGlobalLoading, endGlobalLoading } from '../stores/loadingBus'

export const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ??
  'http://localhost:8000/api'

const TOKEN_KEY = 'book-space.token'
let refreshRequest: Promise<string | null> | null = null

export class ApiError extends Error {
  status: number
  details: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  token?: string | null
  skipRefresh?: boolean
  trackLoading?: boolean
}

type RefreshResponse = {
  token: string
}

function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY)
}

function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY)
}

async function requestTokenRefresh(
  currentToken: string
): Promise<string | null> {
  if (!refreshRequest) {
    refreshRequest = (async () => {
      try {
        const data = await http<RefreshResponse>('/refresh', {
          method: 'POST',
          token: currentToken,
          skipRefresh: true,
          trackLoading: false,
        })
        setStoredToken(data.token)
        return data.token
      } catch {
        clearStoredToken()
        return null
      } finally {
        refreshRequest = null
      }
    })()
  }

  return refreshRequest
}

export async function http<T>(
  path: string,
  {
    method = 'GET',
    body,
    token,
    skipRefresh = false,
    trackLoading = true,
  }: RequestOptions = {}
): Promise<T> {
  if (trackLoading) beginGlobalLoading()

  try {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    }

    const isFormData = body instanceof FormData

    if (body !== undefined && !isFormData)
      headers['Content-Type'] = 'application/json'
    if (token) headers.Authorization = `Bearer ${token}`

    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body:
        body === undefined
          ? undefined
          : isFormData
            ? body
            : JSON.stringify(body),
    })

    const raw = await response.text()
    const data = raw ? JSON.parse(raw) : null

    if (!response.ok) {
      if (response.status === 401 && !skipRefresh) {
        const currentToken = token ?? getStoredToken()

        if (currentToken && path !== '/refresh') {
          const refreshedToken = await requestTokenRefresh(currentToken)

          if (refreshedToken) {
            return http<T>(path, {
              method,
              body,
              token: refreshedToken,
              skipRefresh: true,
              trackLoading,
            })
          }
        }
      }

      const message = data?.message ?? 'Erro ao comunicar com a API.'
      throw new ApiError(message, response.status, data)
    }

    return data as T
  } finally {
    if (trackLoading) endGlobalLoading()
  }
}
