const PB_URL = import.meta.env.VITE_POCKETBASE_URL

export function formatBRL(value: number): string {
  return (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatBRLPlain(value: number): string {
  return (value || 0).toFixed(2).replace('.', ',')
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('pt-BR')
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getFileUrl(record: any, field: string, fallback?: string): string {
  const filename = record?.[field]
  if (!filename) return fallback || ''
  const collectionId = record?.collectionId || record?.collectionName || ''
  return `${PB_URL}/api/files/${collectionId}/${record.id}/${filename}`
}

export function prizeImage(prize: any): string {
  return (
    getFileUrl(prize, 'image') ||
    `https://img.usecurling.com/p/400/300?q=${encodeURIComponent(prize?.name?.slice(0, 20) || 'prize')}`
  )
}

export function bannerImage(banner: any): string {
  return (
    getFileUrl(banner, 'image') ||
    `https://img.usecurling.com/p/800/300?q=${encodeURIComponent(banner?.title?.slice(0, 20) || 'promotion')}`
  )
}

export function partnerLogo(partner: any): string {
  return `https://img.usecurling.com/i?q=${encodeURIComponent(partner?.name?.slice(0, 15) || 'gas')}`
}

export function calculatePurchaseTotal(purchase: any): number {
  return purchase?.total_amount || 0
}
