import pb from '@/lib/pocketbase/client'

export const getPartnerStations = () =>
  pb.collection('partner_stations').getFullList({
    filter: 'active = true',
  })

export const getAllPartnerStations = () =>
  pb.collection('partner_stations').getFullList({ sort: '-created' })
