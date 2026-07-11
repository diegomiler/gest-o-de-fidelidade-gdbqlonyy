import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Package, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useRealtime } from '@/hooks/use-realtime'
import { getAllPrizes } from '@/services/prizes'
import { formatBRL, prizeImage, formatDate } from '@/lib/format'

export default function AdminCampaigns() {
  const [prizes, setPrizes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      setPrizes(await getAllPrizes())
    } catch {
      /* intentionally ignored */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('prizes', () => loadData())

  const today = new Date().toISOString().split('T')[0]
  const campaigns = prizes.filter((p) => p.campaign_end)
  const active = campaigns.filter((p) => p.active && p.campaign_end >= today)
  const expired = campaigns.filter((p) => !p.active || p.campaign_end < today)

  const renderCard = (p: any, isActive: boolean) => (
    <Card key={p.id} className={isActive ? 'border-emerald-200' : 'opacity-75'}>
      <CardContent className="flex gap-4 p-4">
        <img
          src={prizeImage(p)}
          alt={p.name}
          className="h-20 w-20 object-cover rounded-lg border flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold truncate">{p.name}</h3>
            <Badge variant={isActive ? 'default' : 'secondary'} className="flex-shrink-0">
              {isActive ? (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Ativa
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 mr-1" /> Encerrada
                </>
              )}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {p.description || 'Sem descrição'}
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Package className="h-3 w-3" /> Estoque: {p.stock || 0}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Custo: {formatBRL(p.required_amount || 0)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> Encerra: {formatDate(p.campaign_end)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-16" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campanhas</h1>
          <p className="text-muted-foreground">
            Gerencie campanhas ativas e o catálogo de prêmios.
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/premios">Gerenciar Prêmios</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campanhas Ativas</CardTitle>
          <CardDescription>
            Prêmios com campanha em andamento. Configure prazos e estoque no catálogo de prêmios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {active.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-4">Nenhuma campanha ativa no momento.</p>
              <Button asChild variant="outline">
                <Link to="/admin/premios">Criar primeira campanha</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {active.map((p) => renderCard(p, true))}
            </div>
          )}
        </CardContent>
      </Card>

      {expired.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Campanhas Encerradas</CardTitle>
            <CardDescription>Prêmios com campanha expirada ou inativa.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {expired.map((p) => renderCard(p, false))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
