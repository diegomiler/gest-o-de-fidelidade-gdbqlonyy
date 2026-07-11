import pb from '@/lib/pocketbase/client'

export const getPartnerStations = () =>
  pb.collection('partner_stations').getFullList({
    filter: 'active = true',
  })

export const getAllPartnerStations = () =>
  pb.collection('partner_stations').getFullList({ sort: '-created' })

export const createPartnerStation = (data: {
  name: string
  address?: string
  city?: string
  state?: string
  phone?: string
  active?: boolean
}) => pb.collection('partner_stations').create(data)

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
) => pb.collection('partner_stations').update(id, data)

export const deletePartnerStation = (id: string) => pb.collection('partner_stations').delete(id)
