import { useEffect, useRef } from 'react'
import { MockStore } from '@/services/mock/store'

/**
 * Hook de reatividade local para dados mockados.
 * Substitui o listen do PocketBase realtime sem realizar nenhuma chamada remota,
 * disparando os callbacks sempre que ocorrem alterações na store mock.
 */
export function useRealtime<TRecord = unknown>(
  collectionName: string,
  callback: (data: { action: string; record: TRecord }) => void,
  enabled: boolean = true,
) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    if (!enabled) return

    const unsubscribe = MockStore.subscribe((key) => {
      // Dispara se a coleção alterada for a observada ou um evento global ('all'/'reset')
      if (
        key === collectionName ||
        key === 'all' ||
        key === 'reset' ||
        (collectionName === 'purchases' && key === 'cashback') ||
        (collectionName === 'cashback' && key === 'purchases')
      ) {
        callbackRef.current({
          action: 'update',
          record: {} as TRecord,
        })
      }
    })

    return () => {
      unsubscribe()
    }
  }, [collectionName, enabled])
}

export default useRealtime
