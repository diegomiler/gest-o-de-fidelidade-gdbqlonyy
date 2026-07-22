import { useState, useEffect, useCallback, useMemo, Fragment, type HTMLAttributes } from 'react'
import {
  Search,
  Code,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Unlock,
  CheckCircle2,
  Clock,
  XCircle,
  FileJson,
  ChevronRight,
  ChevronDown,
  Package,
  CreditCard,
} from 'lucide-react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import {
  getAdminSales,
  releaseCashback,
  releaseCashbackBatch,
  importSale,
  type AdminSale,
  type AdminSaleItem,
} from '@/services/admin'
import { getCashbackRules, type CashbackRules } from '@/services/settings'
import { getPaymentsBatch, type Payment } from '@/services/payments'
import { formatBRL, formatDateTime } from '@/lib/format'

const DEFAULT_RULES: CashbackRules = {
  min_purchase_amount: 0,
  store_percent: 0,
  fuel_percent: 0,
  min_redemption_amount: 0,
  min_purchase_usage: 0,
}

type SortField = 'date' | 'total_amount'

function SortIcon({
  field,
  sortField,
  sortDir,
  ...rest
}: {
  field: SortField
  sortField: SortField
  sortDir: 'asc' | 'desc'
} & HTMLAttributes<HTMLSpanElement>) {
  return (
    <span {...rest} className="ml-1 inline-flex items-center">
      {sortField !== field ? (
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      ) : sortDir === 'desc' ? (
        <ArrowDown className="h-3 w-3" />
      ) : (
        <ArrowUp className="h-3 w-3" />
      )}
    </span>
  )
}

function calcCashback(total: number, percent: number): number {
  return (total || 0) * ((percent || 0) / 100)
}

function getCashbackIds(sale: AdminSale): string[] {
  return (sale.cashback_records || []).map((r) => r.id)
}

const PAYMENT_LABELS: Record<string, string> = {
  dinheiro: 'Dinheiro',
  cartao_credito: 'Cartão Créd.',
  cartao_debito: 'Cartão Déb.',
  pix: 'PIX',
  voucher: 'Voucher',
  vale: 'Vale',
}

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: typeof Clock }> = {
  pending: {
    label: 'Pendente',
    className: 'bg-amber-100 text-amber-700',
    icon: Clock,
  },
  approved: {
    label: 'Aprovado',
    className: 'bg-emerald-100 text-emerald-700',
    icon: CheckCircle2,
  },
  canceled: {
    label: 'Cancelado',
    className: 'bg-red-100 text-red-700',
    icon: XCircle,
  },
}

export default function AdminSales() {
  const [sales, setSales] = useState<AdminSale[]>([])
  const [rules, setRules] = useState<CashbackRules>(DEFAULT_RULES)
  const [loading, setLoading] = useState(true)
  const [selectedAudit, setSelectedAudit] = useState<AdminSale | null>(null)
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<'date' | 'total_amount'>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [paymentsMap, setPaymentsMap] = useState<Record<string, Payment[]>>({})
  const [importOpen, setImportOpen] = useState(false)
  const [importJson, setImportJson] = useState(
    JSON.stringify(
      {
        event: 'sale_created',
        timestamp: new Date().toISOString(),
        data: {
          transactionId: 'SALE-003',
          customerName: 'Diego Miler',
          customerCpf: '123.456.789-00',
          totalAmount: 848.8,
          status: 'pending',
          payments: [
            { method: 'cartao_credito', amount: 424.4 },
            { method: 'dinheiro', amount: 424.4 },
          ],
          items: [
            {
              codigo: 'PRD-001',
              descricao: 'Item de Exemplo',
              quantidade: 2,
              'preço unitario': 424.4,
              'preço total': 848.8,
            },
          ],
        },
      },
      null,
      2,
    ),
  )
  const [importing, setImporting] = useState(false)
  const { toast } = useToast()

  const loadData = useCallback(async () => {
    try {
      const [salesResult, rulesResult] = await Promise.all([
        getAdminSales(),
        getCashbackRules().catch(() => DEFAULT_RULES),
      ])
      setSales(salesResult.sales)
      setRules(rulesResult)
      const purchaseIds = salesResult.sales.map((s) => s.id)
      const payments = await getPaymentsBatch(purchaseIds)
      setPaymentsMap(payments)
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
  useRealtime('cashback', () => loadData())
  useRealtime('settings', () => loadData())
  useRealtime('purchase_items', () => loadData())
  useRealtime('payments', () => loadData())

  const salesWithCalc = useMemo(
    () =>
      sales.map((s) => ({
        ...s,
        cb_store: s.cb_store || calcCashback(s.total_amount, rules.store_percent),
        cb_fuel: s.cb_fuel || calcCashback(s.total_amount, rules.fuel_percent),
      })),
    [sales, rules],
  )

  const filtered = useMemo(() => {
    let result = salesWithCalc
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (s) =>
          s.client_name?.toLowerCase().includes(q) ||
          s.client_cpf?.includes(q) ||
          s.api_sale_id?.toLowerCase().includes(q),
      )
    }
    result = [...result].sort((a, b) => {
      const cmp =
        sortField === 'total_amount'
          ? (a.total_amount || 0) - (b.total_amount || 0)
          : new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime()
      return sortDir === 'desc' ? -cmp : cmp
    })
    return result
  }, [salesWithCalc, search, sortField, sortDir])

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const toggleSort = (field: 'date' | 'total_amount') => {
    if (sortField === field) {
      setSortDir((p) => (p === 'desc' ? 'asc' : 'desc'))
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const allSelected = filtered.length > 0 && selectedIds.size === filtered.length
  const someSelected = selectedIds.size > 0 && !allSelected

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(filtered.map((s) => s.id)))
  }

  const handleRelease = async (ids: string[]) => {
    if (ids.length === 0) return
    try {
      if (ids.length === 1) {
        await releaseCashback(ids[0])
      } else {
        await releaseCashbackBatch(ids)
      }
      toast({ title: 'Cashback liberado com sucesso!' })
    } catch {
      toast({ title: 'Erro ao liberar cashback', variant: 'destructive' })
    }
  }

  const handleBatchRelease = async () => {
    const ids = filtered
      .filter((s) => selectedIds.has(s.id) && s.status === 'pending')
      .flatMap((s) => getCashbackIds(s))
    if (ids.length === 0) {
      toast({ title: 'Nenhuma venda pendente selecionada', variant: 'destructive' })
      return
    }
    try {
      const result = await releaseCashbackBatch(ids)
      toast({ title: `${result.released.length} cashback(s) liberado(s)!` })
      setSelectedIds(new Set())
    } catch {
      toast({ title: 'Erro ao liberar cashbacks', variant: 'destructive' })
    }
  }

  const handleImport = async () => {
    try {
      const payload = JSON.parse(importJson)
      setImporting(true)
      const result = await importSale(payload)
      toast({ title: result.message || 'Venda importada com sucesso!' })
      setImportOpen(false)
      loadData()
    } catch (err) {
      if (err instanceof SyntaxError) {
        toast({ title: 'JSON inválido', variant: 'destructive' })
      } else {
        toast({ title: 'Erro ao importar venda', variant: 'destructive' })
      }
    } finally {
      setImporting(false)
    }
  }

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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendas API</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Loja: {rules.store_percent}% | Combustível: {rules.fuel_percent}%
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => setImportOpen(true)} className="shrink-0">
            <FileJson className="h-4 w-4 mr-1" />
            Importar
          </Button>
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar CPF, nome, ID..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {selectedIds.size > 0 && (
            <Button onClick={handleBatchRelease} className="shrink-0">
              <Unlock className="h-4 w-4 mr-1" />
              Liberar Selecionados
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>
                  <span
                    className="inline-flex items-center hover:text-foreground transition-colors cursor-pointer select-none"
                    onClick={() => toggleSort('date')}
                  >
                    Data <SortIcon field="date" sortField={sortField} sortDir={sortDir} />
                  </span>
                </TableHead>
                <TableHead>Cliente / CPF</TableHead>
                <TableHead className="text-right">
                  <span
                    className="inline-flex items-center hover:text-foreground transition-colors cursor-pointer select-none"
                    onClick={() => toggleSort('total_amount')}
                  >
                    Valor (R$){' '}
                    <SortIcon field="total_amount" sortField={sortField} sortDir={sortDir} />
                  </span>
                </TableHead>
                <TableHead className="text-right">CB Loja</TableHead>
                <TableHead className="text-right">CB Comb.</TableHead>
                <TableHead>Pagamentos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[120px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                    Nenhuma venda encontrada.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((sale) => {
                const cashbackIds = getCashbackIds(sale)
                const statusConfig = STATUS_CONFIG[sale.status] || {
                  label: sale.status || '—',
                  className: 'bg-slate-100 text-slate-600',
                  icon: Clock,
                }
                const StatusIcon = statusConfig.icon
                const isExpanded = expandedId === sale.id
                const saleItems: AdminSaleItem[] = sale.items || []
                return (
                  <Fragment key={sale.id}>
                    <TableRow data-state={selectedIds.has(sale.id) ? 'selected' : undefined}>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => toggleExpand(sale.id)}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(sale.id)}
                          onCheckedChange={() => toggleSelect(sale.id)}
                        />
                      </TableCell>
                      <TableCell className="text-xs">{formatDateTime(sale.date)}</TableCell>
                      <TableCell>
                        <div className="font-medium text-sm">{sale.client_name || '—'}</div>
                        <div className="text-xs text-muted-foreground">
                          {sale.client_cpf || '—'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatBRL(sale.total_amount)}
                      </TableCell>
                      <TableCell className="text-right text-primary">
                        {formatBRL(sale.cb_store)}
                      </TableCell>
                      <TableCell className="text-right text-amber-600">
                        {formatBRL(sale.cb_fuel)}
                      </TableCell>
                      <TableCell>
                        {paymentsMap[sale.id]?.length ? (
                          <div className="flex flex-wrap gap-1">
                            {paymentsMap[sale.id].map((p, i) => (
                              <Badge key={i} variant="outline" className="text-[10px]">
                                {PAYMENT_LABELS[p.method] || p.method}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] uppercase font-bold rounded-full ${statusConfig.className}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {sale.status === 'pending' && cashbackIds.length > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => handleRelease(cashbackIds)}
                            >
                              <Unlock className="h-3 w-3 mr-1" />
                              Liberar
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setSelectedAudit(sale)}
                          >
                            <Code className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {isExpanded && saleItems.length > 0 && (
                      <TableRow>
                        <TableCell colSpan={10} className="bg-muted/30 p-4">
                          <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Código</TableHead>
                                  <TableHead>Descrição</TableHead>
                                  <TableHead className="text-right">Quantidade</TableHead>
                                  <TableHead className="text-right">Preço Unitário</TableHead>
                                  <TableHead className="text-right">Preço Total</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {saleItems.map((item) => (
                                  <TableRow key={item.id}>
                                    <TableCell className="font-mono text-xs">
                                      {item.product_code || '—'}
                                    </TableCell>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell className="text-right">{item.quantity}</TableCell>
                                    <TableCell className="text-right">
                                      {formatBRL(item.unit_price)}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                      {formatBRL(item.total_price)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    {isExpanded && saleItems.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={10}
                          className="bg-muted/30 py-6 text-center text-sm text-muted-foreground"
                        >
                          <Package className="h-8 w-8 mx-auto mb-2 opacity-30" />
                          Nenhum item associado a esta venda.
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={importOpen} onOpenChange={(o) => !o && setImportOpen(false)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Importar Venda (JSON)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Cole o JSON da venda no formato simplificado (sem campos de cashback). Os valores de
              cashback serão calculados automaticamente.
            </p>
            <Textarea
              className="font-mono text-xs min-h-[300px]"
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setImportOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleImport} disabled={importing}>
                {importing ? 'Importando...' : 'Importar Venda'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedAudit} onOpenChange={(o) => !o && setSelectedAudit(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payload da API (Audit)</DialogTitle>
          </DialogHeader>
          {selectedAudit && (paymentsMap[selectedAudit.id] || []).length > 0 && null}
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
                    payments: (paymentsMap[selectedAudit?.id || ''] || []).map((p) => ({
                      method: p.method,
                      amount: p.amount,
                    })),
                    items: selectedAudit?.items || [],
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
