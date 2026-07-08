import { useState } from 'react'
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
import { mockRewards, mockUser } from '@/lib/mock-data'
import { toast } from '@/hooks/use-toast'

export default function ConsumerRewards() {
  const [selectedReward, setSelectedReward] = useState<(typeof mockRewards)[0] | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleRedeem = () => {
    if (!selectedReward) return

    const balanceField = selectedReward.type === 'fuel' ? 'fuel' : 'store'
    if (mockUser.balance[balanceField] < selectedReward.cost) {
      toast({ title: 'Saldo insuficiente', variant: 'destructive' })
      return
    }

    setIsSuccess(true)
    setTimeout(() => {
      toast({ title: 'Prêmio resgatado!', description: 'Verifique seu email para as instruções.' })
      setIsSuccess(false)
      setSelectedReward(null)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Gift className="h-6 w-6 text-primary" /> Catálogo de Prêmios
          </h1>
          <p className="text-muted-foreground">Troque seu cashback por produtos e serviços.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockRewards.map((reward) => (
          <Card
            key={reward.id}
            className="overflow-hidden flex flex-col group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
              <img
                src={reward.image}
                alt={reward.title}
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
              />
              <Badge className="absolute top-3 right-3 bg-white/90 text-foreground hover:bg-white">
                Restam {reward.inventory}
              </Badge>
            </div>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="line-clamp-2 text-lg">{reward.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex-1 flex flex-col justify-end">
              <p
                className={`font-bold text-xl ${reward.type === 'fuel' ? 'text-fuel' : 'text-primary'}`}
              >
                R$ {reward.cost.toFixed(2).replace('.', ',')}
              </p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                Saldo {reward.type === 'fuel' ? 'Combustível' : 'Loja'}
              </p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button className="w-full" onClick={() => setSelectedReward(reward)}>
                Resgatar
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedReward} onOpenChange={(open) => !open && setSelectedReward(null)}>
        <DialogContent className="sm:max-w-md">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-10 text-center animate-confetti">
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
                      src={selectedReward.image}
                      className="w-16 h-16 rounded object-cover"
                      alt=""
                    />
                    <div>
                      <h4 className="font-semibold">{selectedReward.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Custo: R$ {selectedReward.cost.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedReward(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleRedeem}>Confirmar Resgate</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
