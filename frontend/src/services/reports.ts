import { getToken } from './auth'
import { http } from './http'

export async function createReport(payload: { alvo: string; motivo: string }) {
  return http<{ message: string }>('/reports', {
    method: 'POST',
    body: payload,
    token: getToken(),
  })
}
