import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { getPurchaseItems, type PurchaseItem } from '@/services/purchase-items'
import { formatBRL, formatDateTime } from '@/lib/format'

interface PurchaseDetailDialogProps {
  purchase: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

const statusLabels: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' }
> = {
  approved: { label: 'Aprovado', variant: 'default' },
  pending: { label: 'Pendente', variant: 'secondary' },
  canceled: { label: 'Cancelado', variant: 'destructive' },
}

export function PurchaseDetailDialog({ purchase, open, onOpenChange }: PurchaseDetailDialogProps) {
  const [items, setItems] = useState<PurchaseItem[]>([])
  const [loading, setLoading] = useState(false)

  const loadItems = useCallback(async () => {
    if (!purchase?.id) return
    setLoading(true)
    try {
      const data = await getPurchaseItems(purchase.id)
      setItems(data)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [purchase?.id])

  useEffect(() => {
    if (open && purchase?.id) {
      loadItems()
    }
  }, [open, purchase?.id, loadItems])

  const statusInfo = statusLabels[purchase?.status] || statusLabels.pending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalhes da Compra</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">ID da Venda</p>
              <p className="font-medium">{purchase?.api_sale_id || '—'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Data</p>
              <p className="font-medium">
                {purchase?.purchase_date ? formatDateTime(purchase.purchase_date) : '—'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Pagamento</p>
              <p className="font-medium">{purchase?.payment_method || '—'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold">Itens</h4>
            {loading ? (
              <Skeleton className="h-32" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Qtd</TableHead>
                    <TableHead className="text-right">Preço Unit.</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                        Nenhum item encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatBRL(item.unit_price)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatBRL(item.total_price)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <div className="flex justify-end border-t pt-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total da Compra</p>
              <p className="text-2xl font-bold">{formatBRL(purchase?.total_amount || 0)}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
