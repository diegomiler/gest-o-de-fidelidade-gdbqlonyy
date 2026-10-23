import { apiService } from './api'
import type { ContactLeadPayload } from './api'

export type { ContactLeadPayload }

export const submitContactLead = (data: ContactLeadPayload) => apiService.submitContactLead(data)

export const getContactLeads = () => apiService.getContactLeads()
