export interface FieldErrors {
  [key: string]: string
}

export function extractFieldErrors(error: unknown): FieldErrors {
  if (!error) return {}
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const data = (error as any).data
    if (data && typeof data === 'object') {
      const result: FieldErrors = {}
      for (const [key, val] of Object.entries(data)) {
        if (typeof val === 'object' && val !== null && 'message' in val) {
          result[key] = (val as any).message
        } else if (typeof val === 'string') {
          result[key] = val
        }
      }
      return result
    }
  }
  return {}
}

export function getErrorMessage(error: unknown): string {
  if (!error) return 'Ocorreu um erro inesperado.'
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as any).message)
  }
  return 'Ocorreu um erro na requisição.'
}
