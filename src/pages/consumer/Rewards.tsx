import { useState, useEffect, useCallback } from 'react'
import { Gift, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getPrizes } from '@/services/prizes'
import { getCashbackByUser } from '@/services/cashback'
import { createRedemption } from '@/services/redemptions'
import { formatBRL, formatBRLPlain, prizeImage } from '@/lib/format'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { toast } from '@/hooks/use-toast'

export default function ConsumerRewards() {
  const { user } = useAuth()
  const [prizes, setPrizes] = useState<any[]>([])
  const [storeBalance, setStoreBalance] = useState(0)
  const [fuelBalance, setFuelBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedReward, setSelectedReward] = useState<any>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [redeeming, setRedeeming] = useState(false)

  const loadData = useCallback(async () => {
    if (!user?.id) return
    try {
      const [prizeRecords, cashbackRecords] = await Promise.all([
        getPrizes(),
        getCashbackByUser(user.id),
      ])
      setPrizes(prizeRecords)
      setStoreBalance(
        cashbackRecords
          .filter((c: any) => c.type === 'loja' && c.status === 'released')
          .reduce((s: number, c: any) => s + (c.amount_available || 0), 0),
      )
      setFuelBalance(
        cashbackRecords
          .filter((c: any) => c.type === 'combustivel' && c.status === 'released')
          .reduce((s: number, c: any) => s + (c.amount_available || 0), 0),
      )
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

  const handleRedeem = async () => {
    if (!selectedReward || !user?.id) return
    const cost = selectedReward.required_amount || 0
    if (storeBalance < cost && fuelBalance < cost) {
      toast({ title: 'Saldo insuficiente', variant: 'destructive' })
      return
    }
    setRedeeming(true)
    try {
      await createRedemption({
        client: user.id,
        prize: selectedReward.id,
        quantity: 1,
        total_cost: cost,
      })
      setIsSuccess(true)
      setTimeout(() => {
        toast({
          title: 'Prêmio resgatado!',
          description: 'Verifique seu email para as instruções.',
        })
        setIsSuccess(false)
        setSelectedReward(null)
        loadData()
      }, 2000)
    } catch (err) {
      toast({ title: 'Erro', description: getErrorMessage(err), variant: 'destructive' })
    } finally {
      setRedeeming(false)
    }
  }

  if (loading)
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-80" />
        ))}
      </div>
    )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Gift className="h-6 w-6 text-primary" /> Catálogo de Prêmios
        </h1>
        <p className="text-muted-foreground">Troque seu cashback por produtos e serviços.</p>
        <div className="flex gap-4 mt-3">
          <Badge variant="outline" className="text-primary">
            Saldo Loja: {formatBRL(storeBalance)}
          </Badge>
          <Badge variant="outline" className="text-amber-600">
            Saldo Combustível: {formatBRL(fuelBalance)}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {prizes.map((prize) => {
          const cost = prize.required_amount || 0
          const canRedeem = storeBalance >= cost || fuelBalance >= cost
          return (
            <Card
              key={prize.id}
              className="overflow-hidden flex flex-col group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
                <img
                  src={prizeImage(prize)}
                  alt={prize.name}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                />
                <Badge className="absolute top-3 right-3 bg-white/90 text-foreground hover:bg-white">
                  Restam {prize.stock || 0}
                </Badge>
              </div>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="line-clamp-2 text-lg">{prize.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex-1 flex flex-col justify-end">
                <p className="font-bold text-xl text-primary">{formatBRL(cost)}</p>
                {prize.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {prize.description}
                  </p>
                )}
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button
                  className="w-full"
                  disabled={!canRedeem || (prize.stock || 0) <= 0}
                  onClick={() => setSelectedReward(prize)}
                >
                  {canRedeem ? 'Resgatar' : 'Saldo insuficiente'}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <Dialog open={!!selectedReward} onOpenChange={(open) => !open && setSelectedReward(null)}>
        <DialogContent className="sm:max-w-md">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-4" />
              <DialogTitle className="text-2xl">Parabéns!</DialogTitle>
              <DialogDescription className="text-lg mt-2">
                Seu prêmio foi resgatado com sucesso.
              </DialogDescription>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Confirmar Resgate</DialogTitle>
                <DialogDescription>
                  Deseja utilizar seu saldo para resgatar este prêmio?
                </DialogDescription>
              </DialogHeader>
              {selectedReward && (
                <div className="py-4">
                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-lg">
                    <img
                      src={prizeImage(selectedReward)}
                      className="w-16 h-16 rounded object-cover"
                      alt=""
                    />
                    <div>
                      <h4 className="font-semibold">{selectedReward.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Custo: {formatBRL(selectedReward.required_amount || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedReward(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleRedeem} disabled={redeeming}>
                  {redeeming ? 'Processando...' : 'Confirmar Resgate'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
