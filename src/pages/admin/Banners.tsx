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
import { mockBanners } from '@/lib/mock-data'

export default function AdminBanners() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Banners</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> Novo Banner
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockBanners.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>
                    <img
                      src={b.image}
                      alt="Banner"
                      className="h-12 w-32 object-cover rounded border"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{b.title}</TableCell>
                  <TableCell>Ativo</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Editar
                    </Button>
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
