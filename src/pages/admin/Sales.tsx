import { useState, useEffect, useCallback } from 'react'
import { Search, Code } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useRealtime } from '@/hooks/use-realtime'
import { getAdminSales, type AdminSale } from '@/services/admin'
import { formatBRL, formatDateTime } from '@/lib/format'

export default function AdminSales() {
  const [sales, setSales] = useState<AdminSale[]>([])
  const [filtered, setFiltered] = useState<AdminSale[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAudit, setSelectedAudit] = useState<AdminSale | null>(null)
  const [search, setSearch] = useState('')

  const loadData = useCallback(async () => {
    try {
      const { sales: data } = await getAdminSales()
      setSales(data)
      setFiltered(data)
    } catch {
      /* intentionally ignored */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('purchases', () => loadData())

  useEffect(() => {
    if (!search) {
      setFiltered(sales)
      return
    }
    const q = search.toLowerCase()
    setFiltered(
      sales.filter(
        (s) =>
          s.client_name?.toLowerCase().includes(q) ||
          s.client_cpf?.includes(q) ||
          s.api_sale_id?.toLowerCase().includes(q),
      ),
    )
  }, [search, sales])

  if (loading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-16" />
        <Skeleton className="h-96" />
      </div>
    )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Vendas API</h1>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar CPF, nome, ID..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Cliente / CPF</TableHead>
                <TableHead className="text-right">Valor (R$)</TableHead>
                <TableHead className="text-right">CB Loja</TableHead>
                <TableHead className="text-right">CB Comb.</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Nenhuma venda encontrada.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="text-xs">{formatDateTime(sale.date)}</TableCell>
                  <TableCell>
                    <div className="font-medium text-sm">{sale.client_name || '—'}</div>
                    <div className="text-xs text-muted-foreground">{sale.client_cpf || '—'}</div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatBRL(sale.total_amount)}
                  </TableCell>
                  <TableCell className="text-right text-primary">
                    {sale.cb_store > 0 ? `+${formatBRL(sale.cb_store)}` : '-'}
                  </TableCell>
                  <TableCell className="text-right text-amber-600">
                    {sale.cb_fuel > 0 ? `+${formatBRL(sale.cb_fuel)}` : '-'}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex px-2 py-1 text-[10px] uppercase font-bold rounded-full ${sale.cb_store > 0 || sale.cb_fuel > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}
                    >
                      {sale.cb_store > 0 || sale.cb_fuel > 0 ? 'Processado' : 'Sem Cashback'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedAudit(sale)}>
                      <Code className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedAudit} onOpenChange={(o) => !o && setSelectedAudit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payload da API (Audit)</DialogTitle>
          </DialogHeader>
          <div className="bg-slate-950 text-emerald-400 p-4 rounded-md overflow-auto text-xs font-mono max-h-[400px]">
            <pre>
              {JSON.stringify(
                {
                  event: 'sale_created',
                  timestamp: selectedAudit?.date,
                  data: {
                    transactionId: selectedAudit?.api_sale_id,
                    customerName: selectedAudit?.client_name,
                    customerCpf: selectedAudit?.client_cpf,
                    totalAmount: selectedAudit?.total_amount,
                    cashbackStore: selectedAudit?.cb_store,
                    cashbackFuel: selectedAudit?.cb_fuel,
                    status: selectedAudit?.status,
                  },
                },
                null,
                2,
              )}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
