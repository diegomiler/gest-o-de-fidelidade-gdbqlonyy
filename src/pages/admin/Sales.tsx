import { useState } from 'react'
import { Search, Code } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { mockSales } from '@/lib/mock-data'

export default function AdminSales() {
  const [selectedAudit, setSelectedAudit] = useState<any>(null)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Vendas API</h1>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar CPF..." className="pl-8" />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Cliente / CPF</TableHead>
                <TableHead className="text-right">Valor (R$)</TableHead>
                <TableHead className="text-right">CB Loja</TableHead>
                <TableHead className="text-right">CB Comb.</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="text-xs">
                    {new Date(sale.date).toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm">{sale.customer}</div>
                    <div className="text-xs text-muted-foreground">{sale.cpf}</div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {sale.amount.toFixed(2).replace('.', ',')}
                  </TableCell>
                  <TableCell className="text-right text-primary">
                    {sale.cbStore > 0 ? `+${sale.cbStore.toFixed(2)}` : '-'}
                  </TableCell>
                  <TableCell className="text-right text-fuel">
                    {sale.cbFuel > 0 ? `+${sale.cbFuel.toFixed(2)}` : '-'}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex px-2 py-1 text-[10px] uppercase font-bold rounded-full ${sale.cbStore > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}
                    >
                      {sale.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedAudit(sale)}>
                      <Code className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedAudit} onOpenChange={(o) => !o && setSelectedAudit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payload da API (Audit)</DialogTitle>
          </DialogHeader>
          <div className="bg-slate-950 text-emerald-400 p-4 rounded-md overflow-auto text-xs font-mono max-h-[400px]">
            <pre>
              {JSON.stringify(
                {
                  event: 'sale_created',
                  timestamp: selectedAudit?.date,
                  data: {
                    transactionId: selectedAudit?.id,
                    customerCpf: selectedAudit?.cpf,
                    totalAmount: selectedAudit?.amount,
                    storeId: 'STORE-001',
                  },
                },
                null,
                2,
              )}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
