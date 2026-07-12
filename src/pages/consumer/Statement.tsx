import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Store,
  Fuel,
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  CalendarRange,
  X,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getPurchases } from '@/services/purchases'
import { getCashbackByUser } from '@/services/cashback'
import { PurchaseDetailDialog } from '@/components/consumer/PurchaseDetailDialog'
import { formatBRL, formatBRLPlain, formatDate } from '@/lib/format'

interface Transaction {
  id: string
  date: string
  store: string
  value: number
  calculatedTotal: number
  hasDivergence: boolean
  cashbackStore: number
  cashbackFuel: number
  status: string
  items: any[]
  paymentMethod: string
  raw: any
}

const STATUS_MAP: Record<string, string> = {
  pending: 'pendente',
  released: 'disponível',
  used: 'utilizado',
  expired: 'expirado',
}

const STATUS_COLORS: Record<string, string> = {
  disponível: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  pendente: 'bg-blue-100 text-blue-800 border-blue-200',
  utilizado: 'bg-slate-100 text-slate-800 border-slate-200',
  expirado: 'bg-red-100 text-red-800 border-red-200',
}

function parseItems(raw: any): any[] {
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'string' && raw) {
    try {
      const p = JSON.parse(raw)
      return Array.isArray(p) ? p : []
    } catch {
      return []
    }
  }
  return []
}

export default function ConsumerStatement() {
  const { user } = useAuth()
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

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
        const parsedItems = parseItems(p.items)
        const calculatedTotal = parsedItems.reduce(
          (s: number, item: any) => s + (item.qty || 0) * (item.price || 0),
          0,
        )
        const storedTotal = p.total_amount || 0
        return {
          id: p.id,
          date: p.purchase_date || p.created,
          store: p.origin_channel || 'Compra',
          value: calculatedTotal > 0 ? calculatedTotal : storedTotal,
          calculatedTotal,
          hasDivergence: parsedItems.length > 0 && Math.abs(calculatedTotal - storedTotal) > 0.01,
          cashbackStore: cbStore,
          cashbackFuel: cbFuel,
          status: cbs.length === 0 ? 'sem cashback' : STATUS_MAP[cashbackStatus] || cashbackStatus,
          items: parsedItems,
          paymentMethod: p.payment_method || '',
          raw: p,
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

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const txDate = new Date(tx.date)
      if (dateFrom && txDate < new Date(dateFrom + 'T00:00:00')) return false
      if (dateTo && txDate > new Date(dateTo + 'T23:59:59')) return false
      return true
    })
  }, [transactions, dateFrom, dateTo])

  const setQuickFilter = (days: number) => {
    const to = new Date()
    const from = new Date()
    from.setDate(from.getDate() - days)
    setDateFrom(from.toISOString().split('T')[0])
    setDateTo(to.toISOString().split('T')[0])
  }

  const clearFilter = () => {
    setDateFrom('')
    setDateTo('')
  }

  const openDetail = (tx: Transaction) => {
    setSelectedPurchase(tx.raw)
    setDialogOpen(true)
  }

  if (loading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-16" />
        <Skeleton className="h-20" />
        <Skeleton className="h-64" />
      </div>
    )

  const hasFilter = dateFrom || dateTo

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Extrato de Cashback</h1>
        <p className="text-muted-foreground">Acompanhe seus ganhos e resgates.</p>
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <CalendarRange className="h-4 w-4" /> Filtrar por período
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="sm:max-w-[180px]"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="sm:max-w-[180px]"
            />
            {hasFilter && (
              <Button variant="ghost" size="icon" onClick={clearFilter} className="h-10 w-10">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => setQuickFilter(7)}>
              7 dias
            </Button>
            <Button variant="outline" size="sm" onClick={() => setQuickFilter(30)}>
              30 dias
            </Button>
            <Button variant="outline" size="sm" onClick={() => setQuickFilter(90)}>
              90 dias
            </Button>
            <Button variant="outline" size="sm" onClick={clearFilter}>
              Tudo
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {hasFilter
                ? 'Nenhuma transação encontrada no período selecionado.'
                : 'Nenhuma transação encontrada.'}
            </CardContent>
          </Card>
        )}
        {filtered.map((tx) => (
          <Card
            key={tx.id}
            className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => openDetail(tx)}
          >
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
                      {formatBRL(tx.value)} • {formatDate(tx.date)}
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className={STATUS_COLORS[tx.status] || 'bg-gray-100 text-gray-800'}
                      >
                        {tx.status.toUpperCase()}
                      </Badge>
                      {tx.items.length > 0 && (
                        <Badge
                          variant="outline"
                          className="bg-violet-50 text-violet-700 border-violet-200"
                        >
                          {tx.items.length} {tx.items.length === 1 ? 'item' : 'itens'}
                        </Badge>
                      )}
                      {tx.hasDivergence && null}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4">
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
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <PurchaseDetailDialog
        purchase={selectedPurchase}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  )
}
