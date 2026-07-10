import { useState, useEffect, useCallback } from 'react'
import { Store, Fuel, Wallet, ShoppingCart, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getCashbackRules, type CashbackRules } from '@/services/settings'
import { formatBRL } from '@/lib/format'

interface ProgramSummaryProps {
  refreshKey: number
}

const DEFAULT_RULES: CashbackRules = {
  min_purchase_amount: 0,
  store_percent: 10,
  fuel_percent: 2,
  min_redemption_amount: 10,
  min_purchase_usage: 0,
}

export function ProgramSummary({ refreshKey }: ProgramSummaryProps) {
  const [rules, setRules] = useState<CashbackRules | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const loadRules = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const data = await getCashbackRules()
      setRules(data)
    } catch {
      setError(true)
      setRules(DEFAULT_RULES)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRules()
  }, [loadRules, refreshKey])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Resumo do Programa</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={loadRules}
          disabled={loading}
          className="h-8 w-8"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <span>Não foi possível carregar os dados salvos. Exibindo valores padrão.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-indigo-600" />
              <span>
                Loja: <strong>{rules?.store_percent ?? 0}%</strong> por compra
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-amber-600" />
              <span>
                Combustível: <strong>{rules?.fuel_percent ?? 0}%</strong> por abastecimento
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-sky-600" />
              <span>
                Compra mínima: <strong>{formatBRL(rules?.min_purchase_amount ?? 0)}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-emerald-600" />
              <span>
                Uso mínimo: <strong>{formatBRL(rules?.min_redemption_amount ?? 0)}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-violet-600" />
              <span>
                Compra mín. p/ uso: <strong>{formatBRL(rules?.min_purchase_usage ?? 0)}</strong>
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
