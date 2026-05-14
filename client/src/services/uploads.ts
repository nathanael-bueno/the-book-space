import { getToken } from './auth'
import { API_BASE_URL, ApiError } from './http'

export type UploadContext = 'avatar' | 'book' | 'post'

export type UploadProgress = {
  loaded: number
  total: number
  percent: number
}

type UploadImageOptions = {
  onProgress?: (progress: UploadProgress) => void
  signal?: AbortSignal
  maxRetries?: number
  retryDelayMs?: number
}

type UploadResponse = { url: string }

function createAbortError() {
  const error = new Error('Upload cancelado.')
  error.name = 'AbortError'
  return error
}

function shouldRetry(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status === 0 || error.status >= 500
  }

  return !(error instanceof Error && error.name === 'AbortError')
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function uploadAttempt(
  file: File,
  context: UploadContext,
  token: string | null,
  onProgress?: (progress: UploadProgress) => void,
  signal?: AbortSignal
): Promise<UploadResponse> {
  return new Promise((resolve, reject) => {
    const body = new FormData()
    body.append('image', file)
    body.append('context', context)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${API_BASE_URL}/upload`)
    xhr.setRequestHeader('Accept', 'application/json')
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)

    const abortHandler = () => xhr.abort()
    if (signal) {
      if (signal.aborted) {
        reject(createAbortError())
        return
      }
      signal.addEventListener('abort', abortHandler, { once: true })
    }

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || !onProgress) return
      onProgress({
        loaded: event.loaded,
        total: event.total,
        percent: Math.round((event.loaded / event.total) * 100),
      })
    }

    xhr.onerror = () => {
      if (signal) signal.removeEventListener('abort', abortHandler)
      reject(new ApiError('Erro ao enviar imagem.', 0))
    }

    xhr.onabort = () => {
      if (signal) signal.removeEventListener('abort', abortHandler)
      reject(createAbortError())
    }

    xhr.onload = () => {
      if (signal) signal.removeEventListener('abort', abortHandler)

      let data: unknown
      try {
        data = xhr.responseText ? JSON.parse(xhr.responseText) : null
      } catch {
        data = null
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve((data ?? {}) as UploadResponse)
        return
      }

      const message =
        typeof data === 'object' &&
        data !== null &&
        'message' in data &&
        typeof data.message === 'string'
          ? data.message
          : 'Erro ao enviar imagem.'

      reject(new ApiError(message, xhr.status, data))
    }

    xhr.send(body)
  })
}

export async function uploadImage(
  file: File,
  context: UploadContext,
  options: UploadImageOptions = {}
): Promise<UploadResponse> {
  const { onProgress, signal, maxRetries = 2, retryDelayMs = 500 } = options

  const maxAttempts = Math.max(1, maxRetries + 1)
  const token = getToken()

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await uploadAttempt(file, context, token, onProgress, signal)
    } catch (error) {
      const isLastAttempt = attempt === maxAttempts
      if (isLastAttempt || !shouldRetry(error)) throw error
      await delay(retryDelayMs * attempt)
    }
  }

  throw new ApiError('Erro ao enviar imagem.', 0)
}
