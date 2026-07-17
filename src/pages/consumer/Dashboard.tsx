import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Info, ArrowRight, Store, Fuel, ScanLine, Receipt } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { Skeleton } from '@/components/ui/skeleton'
import { PurchaseDetailDialog } from '@/components/consumer/PurchaseDetailDialog'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getCashbackByUser } from '@/services/cashback'
import { getPurchases } from '@/services/purchases'
import { getBanners } from '@/services/banners'
import { getCashbackRules } from '@/services/settings'
import { formatBRL, formatDate, bannerImage } from '@/lib/format'
import { toast } from '@/hooks/use-toast'

interface Balance {
  store: number
  fuel: number
  pendingStore: number
  pendingFuel: number
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  approved: 'Aprovado',
  canceled: 'Cancelado',
}

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive'> = {
  pending: 'secondary',
  approved: 'default',
  canceled: 'destructive',
}

export default function ConsumerDashboard() {
  const { user } = useAuth()
  const [balance, setBalance] = useState<Balance>({
    store: 0,
    fuel: 0,
    pendingStore: 0,
    pendingFuel: 0,
  })
  const [purchases, setPurchases] = useState<any[]>([])
  const [banners, setBanners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [purchaseAmount, setPurchaseAmount] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [minPurchaseUsage, setMinPurchaseUsage] = useState(0)
  const [selectedPurchase, setSelectedPurchase] = useState<any | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const loadData = useCallback(async () => {
    if (!user?.id) return
    try {
      const [cashbackRecords, purchaseRecords, bannerRecords, usageData] = await Promise.all([
        getCashbackByUser(user.id),
        getPurchases(user.id),
        getBanners(),
        getCashbackRules(),
      ])
      setMinPurchaseUsage(usageData.min_purchase_usage)
      setBalance({
        store: cashbackRecords
          .filter((c: any) => c.type === 'loja' && c.status === 'released')
          .reduce((s: number, c: any) => s + (c.amount_available || 0), 0),
        fuel: cashbackRecords
          .filter((c: any) => c.type === 'combustivel' && c.status === 'released')
          .reduce((s: number, c: any) => s + (c.amount_available || 0), 0),
        pendingStore: cashbackRecords
          .filter((c: any) => c.type === 'loja' && c.status === 'pending')
          .reduce((s: number, c: any) => s + (c.amount_generated || 0), 0),
        pendingFuel: cashbackRecords
          .filter((c: any) => c.type === 'combustivel' && c.status === 'pending')
          .reduce((s: number, c: any) => s + (c.amount_generated || 0), 0),
      })
      setPurchases(purchaseRecords.slice(0, 5))
      setBanners(bannerRecords)
    } catch {
      /* intentionally ignored */
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('cashback', () => loadData())
  useRealtime('purchases', () => loadData())

  const handleUseCashback = () => {
    const val = parseFloat(purchaseAmount.replace(',', '.'))
    if (isNaN(val) || val < minPurchaseUsage) {
      toast({
        title: 'Valor da compra insuficiente',
        description: `Valor da compra insuficiente para utilizar cashback (Mínimo: R$ ${minPurchaseUsage
          .toFixed(2)
          .replace('.', ',')})`,
        variant: 'destructive',
      })
      return
    }
    toast({ title: 'Sucesso', description: 'Cashback aplicado na sua compra!' })
    setIsDialogOpen(false)
    setPurchaseAmount('')
  }

  const handlePurchaseClick = (tx: any) => {
    setSelectedPurchase(tx)
    setDetailOpen(true)
  }

  if (loading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    )

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-none shadow-elevation">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center justify-between">
              Saldo em Loja <Info className="h-4 w-4 opacity-70" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{formatBRL(balance.store)}</div>
            <p className="text-sm opacity-80">
              + {formatBRL(balance.pendingStore)} liberando no próximo mês
            </p>
            <div className="mt-4 flex gap-2">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary" className="w-full">
                    <ScanLine className="mr-2 h-4 w-4" /> Usar Cashback
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Utilizar Cashback de Loja</DialogTitle>
                    <DialogDescription>
                      {minPurchaseUsage > 0
                        ? `O valor da compra deve ser igual ou superior a R$ ${minPurchaseUsage
                            .toFixed(2)
                            .replace('.', ',')}.`
                        : 'Insira o valor da compra para aplicar o cashback.'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="amount">Valor da Compra (R$)</Label>
                      <Input
                        id="amount"
                        placeholder="Ex: 150,00"
                        value={purchaseAmount}
                        onChange={(e) => setPurchaseAmount(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleUseCashback}>Validar e Usar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-400 text-white border-none shadow-elevation">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center justify-between">
              Saldo Combustível <Fuel className="h-4 w-4 opacity-70" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{formatBRL(balance.fuel)}</div>
            <p className="text-sm opacity-80">+ {formatBRL(balance.pendingFuel)} pendente</p>
            <div className="mt-4">
              <Button
                variant="secondary"
                className="w-full bg-white text-amber-600 hover:bg-white/90"
                asChild
              >
                <Link to="/premios">
                  <ScanLine className="mr-2 h-4 w-4" /> Ver Postos
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {banners.length > 0 && (
        <div className="pt-2">
          <h3 className="font-semibold text-lg mb-3">Ofertas para você</h3>
          <Carousel className="w-full" opts={{ loop: true }}>
            <CarouselContent>
              {banners.map((banner) => (
                <CarouselItem key={banner.id} className="md:basis-1/2">
                  <div className="relative aspect-[21/9] rounded-xl overflow-hidden shadow-sm group">
                    <img
                      src={bannerImage(banner)}
                      alt={banner.title}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                      <div>
                        <h4 className="text-white font-medium">{banner.title}</h4>
                        {banner.description && (
                          <p className="text-white/80 text-sm">{banner.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Suas últimas transações</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/extrato">
              Ver todas <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {purchases.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Receipt className="h-10 w-10 text-muted-foreground/50 mb-2" />
                <p className="text-muted-foreground text-sm">Nenhuma transação encontrada.</p>
              </div>
            )}
            {purchases.map((tx) => {
              const isFuel = (tx.origin_channel || '').includes('posto')
              const channelLabel = isFuel ? 'Combustível' : 'Loja'
              return (
                <button
                  key={tx.id}
                  onClick={() => handlePurchaseClick(tx)}
                  className="flex items-center justify-between w-full border rounded-lg p-3 text-left transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        isFuel ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {isFuel ? <Fuel className="h-5 w-5" /> : <Store className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{channelLabel}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(tx.purchase_date || tx.created)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600">
                      {formatBRL(tx.total_amount || 0)}
                    </p>
                    <Badge variant={STATUS_VARIANTS[tx.status] || 'secondary'} className="mt-0.5">
                      {STATUS_LABELS[tx.status] || tx.status}
                    </Badge>
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <PurchaseDetailDialog
        purchase={selectedPurchase}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  )
}
