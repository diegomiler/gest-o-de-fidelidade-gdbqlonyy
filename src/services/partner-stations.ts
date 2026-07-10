import pb from '@/lib/pocketbase/client'

export const getPartnerStations = () =>
  pb.collection('partner_stations').getFullList({
    filter: 'active = true',
  })

export const getAllPartnerStations = () =>
  pb.collection('partner_stations').getFullList({ sort: '-created' })

export const updatePartnerStation = (
  id: string,
  data: Partial<{
    name: string
    address: string
    city: string
    state: string
    phone: string
    active: boolean
  }>,
) =>
  pb.send(`/backend/v1/partner-stations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })

export const createPartnerStation = (data: {
  name: string
  address?: string
  city?: string
  state?: string
  phone?: string
  active?: boolean
}) =>
  pb.send('/backend/v1/partner-stations', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
