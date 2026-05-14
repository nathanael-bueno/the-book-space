import { getToken } from './auth'
import { http } from './http'

type ApiNotificationPreferences = {
  propostas_troca: boolean
  respostas_troca: boolean
  curtidas: boolean
  comentarios: boolean
  confirmacoes_doacao: boolean
  recebe_email: boolean
}

type NotificationPreferencesResponse = {
  data: ApiNotificationPreferences
}

export type NotificationPreferences = {
  tradeUpdates: boolean
  socialLikes: boolean
  socialComments: boolean
  donationUpdates: boolean
  emailEnabled: boolean
}

function mapFromApi(data: ApiNotificationPreferences): NotificationPreferences {
  return {
    tradeUpdates: data.propostas_troca && data.respostas_troca,
    socialLikes: data.curtidas,
    socialComments: data.comentarios,
    donationUpdates: data.confirmacoes_doacao,
    emailEnabled: data.recebe_email,
  }
}

function mapToApi(data: NotificationPreferences): ApiNotificationPreferences {
  return {
    propostas_troca: data.tradeUpdates,
    respostas_troca: data.tradeUpdates,
    curtidas: data.socialLikes,
    comentarios: data.socialComments,
    confirmacoes_doacao: data.donationUpdates,
    recebe_email: data.emailEnabled,
  }
}

export async function getNotificationPreferences() {
  const response = await http<NotificationPreferencesResponse>(
    '/me/notification-preferences',
    {
      token: getToken(),
    }
  )

  return mapFromApi(response.data)
}

export async function updateNotificationPreferences(
  preferences: NotificationPreferences
) {
  const response = await http<NotificationPreferencesResponse>(
    '/me/notification-preferences',
    {
      method: 'PATCH',
      token: getToken(),
      body: mapToApi(preferences),
    }
  )

  return mapFromApi(response.data)
}
