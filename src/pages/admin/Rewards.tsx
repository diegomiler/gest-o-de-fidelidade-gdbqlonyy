import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { mockRewards } from '@/lib/mock-data'

export default function AdminRewards() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Catálogo de Prêmios</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> Novo Prêmio
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imagem</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Custo</TableHead>
                <TableHead className="text-right">Estoque</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRewards.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <img src={r.image} alt="" className="h-10 w-10 object-cover rounded" />
                  </TableCell>
                  <TableCell className="font-medium">{r.title}</TableCell>
                  <TableCell className="capitalize">{r.type}</TableCell>
                  <TableCell className="text-right font-medium">R$ {r.cost.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{r.inventory}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
