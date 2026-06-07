import { getToken } from './auth'
import { http } from './http'

export type AdminInstitutionStatus = 'Ativa' | 'Pendente'
export type AdminPointType = 'Doacao' | 'Troca'

export type AdminInstitution = {
  id: string
  name: string
  city: string
  contact: string
  status: AdminInstitutionStatus
  pointType: AdminPointType
}

export type AdminReportStatus = 'Pendente' | 'Aprovada' | 'Rejeitada'

export type AdminReport = {
  id: string
  reason: string
  target: string
  author: string
  createdAt: string
  status: AdminReportStatus
  contextPath?: string | null
}

export type AdminUserStatus = 'Ativo' | 'Suspenso' | 'Banido'

export type AdminUser = {
  id: string
  name: string
  email: string
  reputation: number
  status: AdminUserStatus
}

export type AdminGenre = {
  id: string
  name: string
  category: string
  active: boolean
}

export type AdminDashboardRecentUser = {
  id: string
  name: string
  email: string
  created_at: string
}

export type AdminDashboardStats = {
  activeUsers: number
  completedTrades: number
  donations: number
  pendingReports: number
  recentUsers: AdminDashboardRecentUser[]
}

export type AdminDonationByInstitution = {
  institutionId: string
  institutionName: string
  totalDonations: number
}

type ApiData<T> = { data: T }
async function apiGet<T>(path: string): Promise<T> {
  const token = getToken()
  const response = await http<ApiData<T>>(path, { token })
  return response.data
}

async function apiSend(
  method: 'POST' | 'PATCH' | 'PUT' | 'DELETE',
  path: string,
  body?: unknown
): Promise<void> {
  const token = getToken()
  await http<{ message: string }>(path, { method, body, token })
}

async function apiSendWithData<T>(
  method: 'POST' | 'PATCH' | 'PUT' | 'DELETE',
  path: string,
  body?: unknown
): Promise<T> {
  const token = getToken()
  const response = await http<ApiData<T>>(path, { method, body, token })
  return response.data
}

function toClientInstitutionStatus(value: string): AdminInstitutionStatus {
  return value.toLowerCase() === 'pendente' ? 'Pendente' : 'Ativa'
}

function toApiInstitutionStatus(
  value: AdminInstitutionStatus
): 'ativa' | 'pendente' {
  return value === 'Pendente' ? 'pendente' : 'ativa'
}

function toClientPointType(value?: string): AdminPointType {
  return value?.toLowerCase() === 'troca' ? 'Troca' : 'Doacao'
}

function toApiPointType(value: AdminPointType): 'doacao' | 'troca' {
  return value === 'Troca' ? 'troca' : 'doacao'
}

export async function listAdminInstitutions(): Promise<AdminInstitution[]> {
  const data = await apiGet<AdminInstitution[]>('/admin/institutions')
  return data.map((institution) => ({
    ...institution,
    status: toClientInstitutionStatus(institution.status),
    pointType: toClientPointType(institution.pointType),
  }))
}

export async function listAdminReports(): Promise<AdminReport[]> {
  return apiGet<AdminReport[]>('/admin/reports')
}

export async function listAdminUsers(): Promise<AdminUser[]> {
  return apiGet<AdminUser[]>('/admin/users')
}

export async function listAdminGenres(): Promise<AdminGenre[]> {
  return apiGet<AdminGenre[]>('/admin/genres')
}

export async function persistInstitutionCreate(payload: {
  name: string
  city: string
  contact: string
  status: AdminInstitutionStatus
  pointType: AdminPointType
}) {
  const data = await apiSendWithData<AdminInstitution>(
    'POST',
    '/admin/institutions',
    {
      ...payload,
      status: toApiInstitutionStatus(payload.status),
      pointType: toApiPointType(payload.pointType),
    }
  )
  return {
    ...data,
    status: toClientInstitutionStatus(data.status),
    pointType: toClientPointType(data.pointType),
  }
}

export async function persistInstitutionUpdate(
  id: string,
  payload: {
    name: string
    city: string
    contact: string
    status: AdminInstitutionStatus
    pointType: AdminPointType
  }
) {
  await apiSend('PATCH', `/admin/institutions/${id}`, {
    ...payload,
    status: toApiInstitutionStatus(payload.status),
    pointType: toApiPointType(payload.pointType),
  })
}

export async function persistInstitutionDelete(id: string) {
  await apiSend('DELETE', `/admin/institutions/${id}`)
}

export async function persistReportStatus(
  id: string,
  status: AdminReportStatus
) {
  await apiSend('PATCH', `/admin/reports/${id}/status`, { status })
}

export async function submitReport(payload: {
  motivo: string
  alvo: string
}): Promise<void> {
  await apiSend('POST', '/reports', payload)
}

export async function persistUserStatus(id: string, status: AdminUserStatus) {
  await apiSend('PATCH', `/admin/users/${id}/status`, { status })
}

export async function persistGenreCreate(payload: {
  name: string
  category: string
}) {
  return apiSendWithData<AdminGenre>('POST', '/admin/genres', payload)
}

export async function persistGenreUpdate(
  id: string,
  payload: { name: string; category: string }
) {
  await apiSend('PATCH', `/admin/genres/${id}`, payload)
}

export async function persistGenreDelete(id: string) {
  await apiSend('DELETE', `/admin/genres/${id}`)
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const raw = await apiGet<{
    active_users: number
    completed_trades: number
    donations: number
    pending_reports: number
    recent_users: AdminDashboardRecentUser[]
  }>('/admin/stats')

  return {
    activeUsers: raw.active_users,
    completedTrades: raw.completed_trades,
    donations: raw.donations,
    pendingReports: raw.pending_reports,
    recentUsers: raw.recent_users,
  }
}

export async function getAdminDonationsByInstitution(params?: {
  from?: string
  to?: string
}): Promise<AdminDonationByInstitution[]> {
  const search = new URLSearchParams()
  if (params?.from) search.set('from', params.from)
  if (params?.to) search.set('to', params.to)
  const query = search.toString()

  const raw = await apiGet<
    Array<{
      institution_id: string
      institution_name: string
      total_donations: number
    }>
  >(`/admin/reports/donations-by-institution${query ? `?${query}` : ''}`)

  return raw.map((row) => ({
    institutionId: row.institution_id,
    institutionName: row.institution_name,
    totalDonations: row.total_donations,
  }))
}
