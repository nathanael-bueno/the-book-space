import { API_BASE_URL, http } from './http'

const TOKEN_KEY = 'book-space.token'

type LoginResponse = {
  message: string
  token: string
}

type RegisterResponse = {
  message: string
}

type LoginStartResponse = {
  message: string
  method: 'password' | 'google_code'
  email: string
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getCurrentUserId(): string | null {
  const token = getToken()
  if (!token) return null
  const payloadPart = token.split('.')[1]
  if (!payloadPart) return null
  try {
    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(
      normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    )
    const payload = JSON.parse(json) as { sub?: string }
    return payload.sub ?? null
  } catch {
    return null
  }
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function startGoogleLogin() {
  window.location.href = `${API_BASE_URL}/auth/google`
}

export async function login(payload: { email: string; senha: string }) {
  const data = await http<LoginResponse>('/login', {
    method: 'POST',
    body: payload,
  })
  setToken(data.token)
  return data
}

export async function loginStart(email: string) {
  return http<LoginStartResponse>('/login/start', {
    method: 'POST',
    body: { email },
  })
}

export async function loginWithCode(payload: { email: string; code: string }) {
  const data = await http<LoginResponse>('/login/code', {
    method: 'POST',
    body: payload,
  })
  setToken(data.token)
  return data
}

export async function register(payload: {
  nome_completo: string
  email: string
  senha: string
  cidade: string
  estado: string
  faixa_etaria: string
}) {
  return http<RegisterResponse>('/register', {
    method: 'POST',
    body: payload,
  })
}

export async function verifyEmailCode(payload: {
  email: string
  code: string
}) {
  const data = await http<{ message: string; token: string }>('/email/verify', {
    method: 'POST',
    body: payload,
  })
  setToken(data.token)
  return data
}

export async function resendEmailCode() {
  return http<{ message: string }>('/email/resend', {
    method: 'POST',
    token: getToken(),
  })
}

export async function resendEmailCodeByEmail(email: string) {
  return http<{ message: string }>('/email/resend', {
    method: 'POST',
    body: { email },
  })
}

export async function forgotPassword(email: string) {
  return http<{ message: string }>('/forgot-password', {
    method: 'POST',
    body: { email },
  })
}

export async function resetPassword(payload: {
  email: string
  token: string
  senha: string
  senha_confirmation: string
}) {
  return http<{ message: string }>('/reset-password', {
    method: 'POST',
    body: payload,
  })
}
