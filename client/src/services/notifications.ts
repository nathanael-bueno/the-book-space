import { getToken } from './auth'
import { http } from './http'

export type ApiNotification = {
  id: string
  tipo: string
  titulo: string
  descricao: string | null
  meta: { action_to?: string; trade_id?: string } | null
  lida_em: string | null
  created_at: string
}

type PaginatedNotifications = {
  data: ApiNotification[]
}

export async function listNotifications() {
  return http<PaginatedNotifications>('/notifications', { token: getToken() })
}

export async function markNotificationAsRead(notificationId: string) {
  return http<{ message: string; data: ApiNotification }>(
    `/notifications/${notificationId}/read`,
    {
      method: 'PATCH',
      token: getToken(),
    }
  )
}
