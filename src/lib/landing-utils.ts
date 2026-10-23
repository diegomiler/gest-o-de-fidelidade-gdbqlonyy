/** Utilidades de apresentação e links de contato da landing pública. */

export const digitsOnly = (value: string): string => (value || '').replace(/\D/g, '')

/** Normaliza para DDI 55 quando o número vier só com DDD + telefone. */
function withCountryCode(digits: string): string {
  return digits.length <= 11 ? `55${digits}` : digits
}

export function whatsappUrl(number: string, text?: string): string | null {
  const digits = digitsOnly(number)
  if (digits.length < 10) return null
  const query = text ? `?text=${encodeURIComponent(text)}` : ''
  return `https://wa.me/${withCountryCode(digits)}${query}`
}

export function telUrl(number: string): string | null {
  const digits = digitsOnly(number)
  if (digits.length < 8) return null
  return `tel:+${withCountryCode(digits)}`
}

export function mailUrl(email: string): string | null {
  const value = (email || '').trim()
  return value.includes('@') ? `mailto:${value}` : null
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Rolagem suave para uma âncora, respeitando prefers-reduced-motion. */
export function scrollToId(id: string): void {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
  history.replaceState(null, '', `#${id}`)
  el.setAttribute('tabindex', '-1')
  el.focus({ preventScroll: true })
}
