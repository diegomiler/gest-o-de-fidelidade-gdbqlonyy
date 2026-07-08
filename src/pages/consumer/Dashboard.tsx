import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Info, ArrowRight, Store, Fuel, ScanLine } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { mockUser, mockTransactions, mockBanners } from '@/lib/mock-data'
import { toast } from '@/hooks/use-toast'

export default function ConsumerDashboard() {
  const [purchaseAmount, setPurchaseAmount] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleUseCashback = () => {
    const val = parseFloat(purchaseAmount.replace(',', '.'))
    if (isNaN(val) || val < 100) {
      toast({
        title: 'Valor insuficiente',
        description: 'A compra deve ser maior que R$ 100,00 para utilizar o saldo de loja.',
        variant: 'destructive',
      })
      return
    }
    toast({ title: 'Sucesso', description: 'Cashback aplicado na sua compra!' })
    setIsDialogOpen(false)
    setPurchaseAmount('')
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-none shadow-elevation">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center justify-between">
              Saldo em Loja
              <Info className="h-4 w-4 opacity-70" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">
              R$ {mockUser.balance.store.toFixed(2).replace('.', ',')}
            </div>
            <p className="text-sm opacity-80">
              + R$ {mockUser.balance.pendingStore.toFixed(2).replace('.', ',')} liberando no próximo
              mês
            </p>
            <div className="mt-4 flex gap-2">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="secondary"
                    className="w-full bg-white text-primary hover:bg-white/90"
                  >
                    Usar na Loja
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Utilizar Cashback de Loja</DialogTitle>
                    <DialogDescription>
                      Para utilizar seu saldo, o valor total da compra deve ser superior a R$
                      100,00.
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

        <Card className="bg-gradient-to-br from-fuel to-amber-400 text-fuel-foreground border-none shadow-elevation">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center justify-between">
              Saldo Combustível
              <Fuel className="h-4 w-4 opacity-70" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">
              R$ {mockUser.balance.fuel.toFixed(2).replace('.', ',')}
            </div>
            <p className="text-sm opacity-80">
              + R$ {mockUser.balance.pendingFuel.toFixed(2).replace('.', ',')} pendente
            </p>
            <div className="mt-4">
              <Button
                variant="secondary"
                className="w-full bg-white text-fuel hover:bg-white/90"
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

      <div className="pt-2">
        <h3 className="font-semibold text-lg mb-3">Ofertas para você</h3>
        <Carousel className="w-full" opts={{ loop: true }}>
          <CarouselContent>
            {mockBanners.map((banner) => (
              <CarouselItem key={banner.id} className="md:basis-1/2">
                <div className="relative aspect-[21/9] rounded-xl overflow-hidden shadow-sm group">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                    <h4 className="text-white font-medium">{banner.title}</h4>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

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
          <div className="space-y-4">
            {mockTransactions.slice(0, 3).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                    {tx.store.includes('Posto') ? (
                      <Fuel className="h-5 w-5" />
                    ) : (
                      <Store className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{tx.store}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">
                    + R$ {(tx.cashbackStore + tx.cashbackFuel).toFixed(2).replace('.', ',')}
                  </p>
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground">
                    {tx.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
