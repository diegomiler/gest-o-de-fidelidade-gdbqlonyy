import { useState, useEffect, useCallback, useMemo } from 'react'
import { Store, Fuel, ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getPurchases } from '@/services/purchases'
import { getCashbackByUser } from '@/services/cashback'
import { formatBRL, formatBRLPlain, formatDate } from '@/lib/format'

interface Transaction {
  id: string
  date: string
  store: string
  value: number
  cashbackStore: number
  cashbackFuel: number
  status: string
}

export default function ConsumerStatement() {
  const { user } = useAuth()
  const [period, setPeriod] = useState('30')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    if (!user?.id) return
    try {
      const [purchases, cashbackRecords] = await Promise.all([
        getPurchases(user.id),
        getCashbackByUser(user.id),
      ])
      const mapped: Transaction[] = purchases.map((p: any) => {
        const cbs = cashbackRecords.filter((c: any) => c.purchase === p.id)
        const cbStore = cbs
          .filter((c: any) => c.type === 'loja')
          .reduce((s: number, c: any) => s + (c.amount_generated || 0), 0)
        const cbFuel = cbs
          .filter((c: any) => c.type === 'combustivel')
          .reduce((s: number, c: any) => s + (c.amount_generated || 0), 0)
        const cashbackStatus = cbs[0]?.status || 'pending'
        const statusMap: Record<string, string> = {
          pending: 'pendente',
          released: 'disponível',
          used: 'utilizado',
          expired: 'expirado',
        }
        return {
          id: p.id,
          date: p.purchase_date || p.created,
          store: p.origin_channel || 'Compra',
          value: p.total_amount || 0,
          cashbackStore: cbStore,
          cashbackFuel: cbFuel,
          status: cbs.length === 0 ? 'sem cashback' : statusMap[cashbackStatus] || cashbackStatus,
        }
      })
      setTransactions(mapped)
    } catch {
      /* intentionally ignored */
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('purchases', () => loadData())
  useRealtime('cashback', () => loadData())

  const filteredTransactions = useMemo(() => {
    const days = parseInt(period)
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    return transactions.filter((tx) => new Date(tx.date) >= cutoff)
  }, [transactions, period])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponível':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'pendente':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'utilizado':
        return 'bg-slate-100 text-slate-800 border-slate-200'
      case 'expirado':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-16" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Extrato de Cashback</h1>
        <p className="text-muted-foreground">Acompanhe seus ganhos e resgates.</p>
      </div>

      <Tabs value={period} onValueChange={setPeriod}>
        <TabsList>
          <TabsTrigger value="30">30 dias</TabsTrigger>
          <TabsTrigger value="90">90 dias</TabsTrigger>
          <TabsTrigger value="365">1 ano</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-4">
        {filteredTransactions.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Nenhuma transação encontrada no período.
            </CardContent>
          </Card>
        )}
        {filteredTransactions.map((tx) => (
          <Card key={tx.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 gap-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`mt-1 h-10 w-10 rounded-full flex items-center justify-center ${tx.status === 'utilizado' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}
                  >
                    {tx.status === 'utilizado' ? (
                      <ArrowUpRight className="h-5 w-5" />
                    ) : (
                      <ArrowDownRight className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Compra: {formatBRL(tx.value)} • {formatDate(tx.date)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className={getStatusColor(tx.status)}>
                        {tx.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-lg sm:rounded-none">
                  <span className="text-sm font-medium text-muted-foreground sm:hidden">
                    Cashback Gerado
                  </span>
                  <div className="text-right">
                    {tx.cashbackStore > 0 && (
                      <p className="text-sm font-bold text-primary flex items-center justify-end gap-1">
                        <Store className="h-3 w-3" /> + R$ {formatBRLPlain(tx.cashbackStore)}
                      </p>
                    )}
                    {tx.cashbackFuel > 0 && (
                      <p className="text-sm font-bold text-amber-600 flex items-center justify-end gap-1">
                        <Fuel className="h-3 w-3" /> + R$ {formatBRLPlain(tx.cashbackFuel)}
                      </p>
                    )}
                    {tx.cashbackStore === 0 && tx.cashbackFuel === 0 && (
                      <p className="text-sm text-muted-foreground">Sem cashback</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
