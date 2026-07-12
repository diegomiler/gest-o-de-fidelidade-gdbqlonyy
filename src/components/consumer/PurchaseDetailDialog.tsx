import { CreditCard, ShoppingBag, Calendar, AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatBRL, formatDateTime } from '@/lib/format'

interface PurchaseItem {
  name: string
  qty: number
  price: number
}

interface PurchaseDetailDialogProps {
  purchase: any | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function parseItems(raw: any): PurchaseItem[] {
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'string' && raw) {
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

export function PurchaseDetailDialog({ purchase, open, onOpenChange }: PurchaseDetailDialogProps) {
  if (!purchase) return null

  const items = parseItems(purchase.items)
  const calculatedTotal = items.reduce((sum, item) => sum + item.qty * item.price, 0)
  const hasItems = items.length > 0
  const storedTotal = purchase.total_amount || 0
  const hasDivergence = hasItems && Math.abs(calculatedTotal - storedTotal) > 0.01

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Detalhes da Compra
          </DialogTitle>
          <DialogDescription className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {formatDateTime(purchase.purchase_date || purchase.created)}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[55vh] pr-4">
          <div className="space-y-4">
            {hasDivergence && null}

            <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2.5">
              <span className="text-sm text-muted-foreground">Forma de Pagamento</span>
              <Badge variant="secondary" className="gap-1">
                <CreditCard className="h-3 w-3" />
                {purchase.payment_method || 'Não informado'}
              </Badge>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-semibold">Itens</h4>
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  Nenhum item detalhado disponível para esta compra.
                </p>
              ) : (
                <div className="space-y-1">
                  {items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-3 py-2.5 border-b last:border-0"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.qty} {item.qty === 1 ? 'unidade' : 'unidades'} ×{' '}
                          {formatBRL(item.price)}
                        </p>
                      </div>
                      <span className="text-sm font-semibold whitespace-nowrap">
                        {formatBRL(item.qty * item.price)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {hasItems && (
              <div className="flex items-center justify-between rounded-lg bg-primary/5 px-3 py-2.5">
                <span className="text-sm font-medium text-primary">Total Calculado (Itens)</span>
                <span className="text-sm font-bold text-primary">{formatBRL(calculatedTotal)}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t-2">
              <span className="font-semibold">Total da Compra</span>
              <div className="text-right">
                <span
                  className={`text-lg font-bold ${hasDivergence ? 'text-amber-600' : 'text-primary'}`}
                >
                  {formatBRL(storedTotal)}
                </span>
                {hasDivergence && null}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
