import { getToken } from './auth'
import { http } from './http'

export type ApiUserLite = {
  id: string
  nome_completo: string
  foto?: string | null
  cidade?: string | null
}

export type ApiTradeBook = {
  id: string
  titulo: string
  autor: string
  estado_conservacao: string
  fotos: string[] | null
  cidade?: string | null
}

export type ApiTrade = {
  id: string
  id_livro_solicitado: string
  id_livro_oferecido: string
  id_usuario_proponente: string
  id_usuario_destinatario: string
  status: 'pendente' | 'aceita' | 'recusada' | 'cancelada' | 'concluida'
  mensagem: string | null
  responded_at: string | null
  confirmado_proponente_at: string | null
  confirmado_destinatario_at: string | null
  created_at?: string
  updated_at?: string
  requested_book?: ApiTradeBook
  offered_book?: ApiTradeBook
  proponent?: ApiUserLite
  recipient?: ApiUserLite
}

export type ApiTradeMessage = {
  id: string
  id_trade: string
  id_remetente: string
  mensagem: string
  created_at: string
  sender?: ApiUserLite
}

type TradeEnvelope = {
  message: string
  data: ApiTrade
}

type TradeMessagesResponse = {
  data: ApiTradeMessage[]
}

type PaginatedTrades = {
  data: ApiTrade[]
}

export async function listMyTrades(perPage = 20) {
  return http<PaginatedTrades>(`/trades?per_page=${perPage}`, {
    token: getToken(),
  })
}

export async function getTrade(tradeId: string) {
  return http<TradeEnvelope>(`/trades/${tradeId}`, { token: getToken() })
}

export async function createTrade(payload: {
  id_livro_solicitado: string
  id_livro_oferecido: string
  mensagem?: string
}) {
  return http<TradeEnvelope>('/trades', {
    method: 'POST',
    body: payload,
    token: getToken(),
  })
}

export async function updateTradeStatus(
  tradeId: string,
  action: 'aceitar' | 'recusar' | 'cancelar' | 'confirmar'
) {
  return http<TradeEnvelope>(`/trades/${tradeId}/status`, {
    method: 'PATCH',
    body: { acao: action },
    token: getToken(),
  })
}

export async function listTradeMessages(tradeId: string) {
  return http<TradeMessagesResponse>(`/trades/${tradeId}/messages`, {
    token: getToken(),
  })
}

export async function sendTradeMessage(tradeId: string, mensagem: string) {
  return http<{ message: string; data: ApiTradeMessage }>(
    `/trades/${tradeId}/messages`,
    {
      method: 'POST',
      body: { mensagem },
      token: getToken(),
    }
  )
}

export async function submitTradeReview(
  tradeId: string,
  payload: { nota: number; comentario?: string }
) {
  return http(`/trades/${tradeId}/reviews`, {
    method: 'POST',
    body: payload,
    token: getToken(),
  })
}
