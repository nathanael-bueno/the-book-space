import { http } from './http'

export type PublicInstitution = {
  id: string
  name: string
  city: string
  contact: string
  phone: string
  needs: string
}

type PublicInstitutionsResponse = {
  data: PublicInstitution[]
}

export async function listPublicInstitutions() {
  return http<PublicInstitutionsResponse>('/institutions')
}
