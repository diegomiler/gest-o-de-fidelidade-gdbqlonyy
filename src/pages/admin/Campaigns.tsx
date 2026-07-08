import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function AdminCampaigns() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Campanhas</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> Nova Campanha
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Campanhas Ativas</CardTitle>
          <CardDescription>
            Configure multiplicadores de cashback para períodos específicos.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground mb-4">Nenhuma campanha ativa no momento.</p>
          <Button variant="outline">Criar primeira campanha</Button>
        </CardContent>
      </Card>
    </div>
  )
}
