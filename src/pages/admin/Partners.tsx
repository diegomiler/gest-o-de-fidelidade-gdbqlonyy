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
import { mockPartners } from '@/lib/mock-data'

export default function AdminPartners() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Rede Parceira (Postos)</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> Adicionar Posto
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Logo</TableHead>
                <TableHead>Nome da Unidade</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPartners.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <img
                      src={p.logo}
                      alt=""
                      className="h-8 w-8 rounded-full object-cover border bg-slate-100"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{p.address}</TableCell>
                  <TableCell>
                    <span className="inline-flex rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                      Ativo
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
