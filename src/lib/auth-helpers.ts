/**
 * Utilitários para detecção, máscara, normalização e validação de
 * E-mail, CPF e Telefone (DDD + número).
 */

export type IdentifierType = 'email' | 'cpf' | 'phone' | 'unknown'

/**
 * Validação de CPF com dígitos verificadores
 */
export function isValidCPF(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, '')
  if (clean.length !== 11) return false

  // Barrar todos os dígitos iguais (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(clean)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean.charAt(i), 10) * (10 - i)
  }
  let rev = 11 - (sum % 11)
  if (rev === 10 || rev === 11) rev = 0
  if (rev !== parseInt(clean.charAt(9), 10)) return false

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean.charAt(i), 10) * (11 - i)
  }
  rev = 11 - (sum % 11)
  if (rev === 10 || rev === 11) rev = 0
  if (rev !== parseInt(clean.charAt(10), 10)) return false

  return true
}

/**
 * Remove código de país 55 se presente em strings com 12 ou 13 dígitos
 */
export function stripCountryCode55(digits: string): string {
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')) {
    return digits.slice(2)
  }
  return digits
}

/**
 * Detecta o tipo de identificador digitado no login:
 * - Contém "@" => email
 * - Só dígitos/pontuação com 11 dígitos e CPF válido => cpf
 * - 10 ou 11 dígitos que não sejam CPF válido => phone
 */
export function detectIdentifierType(value: string): IdentifierType {
  const trimmed = value.trim()
  if (!trimmed) return 'unknown'

  if (trimmed.includes('@')) {
    return 'email'
  }

  let digits = trimmed.replace(/\D/g, '')
  digits = stripCountryCode55(digits)

  if (digits.length === 11) {
    if (isValidCPF(digits)) {
      return 'cpf'
    }
    return 'phone'
  }

  if (digits.length === 10) {
    return 'phone'
  }

  // Enquanto está digitando poucos dígitos numéricos ou pontuações de CPF
  if (digits.length > 0 && digits.length < 10) {
    return 'unknown'
  }

  return 'unknown'
}

/**
 * Aplica máscara dinâmica enquanto o usuário digita no campo de login.
 * Se parecer email (contém letras ou @), não mascara.
 * Se tiver dígitos/pontuações, mascara como CPF ou Telefone conforme o tamanho e padrão.
 */
export function maskLoginIdentifier(value: string): string {
  // Se contiver letras ou arroba, trata como potencial email e não aplica máscara numérica
  if (/[a-zA-Z@]/.test(value)) {
    return value
  }

  let digits = value.replace(/\D/g, '')
  digits = stripCountryCode55(digits)

  if (!digits) return ''

  // Até 11 dígitos: formata progressivamente como CPF por padrão até 11 dígitos
  if (digits.length <= 11) {
    // Se o usuário já tiver 11 dígitos e não for CPF válido mas tiver DDD plausível,
    // ou se tiver 10 dígitos (telefone fixo/celular antigo sem nono dígito)
    if (digits.length === 10) {
      return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
    }

    if (digits.length === 11 && !isValidCPF(digits)) {
      return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }

    // Padrão progressivo de CPF
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return digits.replace(/(\d{3})(\d{0,3})/, '$1.$2')
    if (digits.length <= 9) return digits.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3')
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4')
  }

  return digits.slice(0, 11)
}

/**
 * Máscara estrita para campo de CPF no formulário de cadastro: 000.000.000-00
 */
export function maskCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (!digits) return ''
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return digits.replace(/(\d{3})(\d{0,3})/, '$1.$2')
  if (digits.length <= 9) return digits.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3')
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4')
}

/**
 * Máscara estrita para campo de telefone no formulário de cadastro:
 * (00) 00000-0000 ou (00) 0000-0000
 */
export function maskPhone(value: string): string {
  let digits = value.replace(/\D/g, '')
  digits = stripCountryCode55(digits).slice(0, 11)
  if (!digits) return ''
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 6) return digits.replace(/(\d{2})(\d{0,4})/, '($1) $2')
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
  }
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
}

/**
 * Normaliza o identificador antes de enviar ao serviço:
 * - email: trim + minúsculas
 * - cpf: somente 11 dígitos
 * - phone: somente 10 ou 11 dígitos (sem 55)
 */
export function normalizeIdentifier(value: string): {
  type: 'email' | 'cpf' | 'phone'
  value: string
} | null {
  const trimmed = value.trim()
  if (!trimmed) return null

  if (trimmed.includes('@')) {
    return {
      type: 'email',
      value: trimmed.toLowerCase(),
    }
  }

  let digits = trimmed.replace(/\D/g, '')
  digits = stripCountryCode55(digits)

  if (digits.length === 11 && isValidCPF(digits)) {
    return {
      type: 'cpf',
      value: digits,
    }
  }

  if (digits.length === 10 || digits.length === 11) {
    return {
      type: 'phone',
      value: digits,
    }
  }

  return null
}
