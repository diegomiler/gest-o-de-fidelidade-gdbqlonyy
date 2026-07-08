import { useState } from 'react'
import { Store, Fuel, ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { mockTransactions } from '@/lib/mock-data'

export default function ConsumerStatement() {
  const [period, setPeriod] = useState('30')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponível':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'pendente':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'utilizado':
        return 'bg-slate-100 text-slate-800 border-slate-200'
      case 'expirado':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Extrato de Cashback</h1>
        <p className="text-muted-foreground">Acompanhe seus ganhos e resgates.</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Tabs value={period} onValueChange={setPeriod} className="w-full sm:w-auto">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="30" className="flex-1">
              30 dias
            </TabsTrigger>
            <TabsTrigger value="90" className="flex-1">
              90 dias
            </TabsTrigger>
            <TabsTrigger value="365" className="flex-1">
              1 ano
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-4">
        {mockTransactions.map((tx) => (
          <Card key={tx.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 gap-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`mt-1 h-10 w-10 rounded-full flex items-center justify-center ${tx.status === 'utilizado' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}
                  >
                    {tx.status === 'utilizado' ? (
                      <ArrowUpRight className="h-5 w-5" />
                    ) : (
                      <ArrowDownRight className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{tx.store}</h3>
                    <p className="text-sm text-muted-foreground">
                      Compra: R$ {tx.value.toFixed(2).replace('.', ',')} •{' '}
                      {new Date(tx.date).toLocaleDateString('pt-BR')}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className={getStatusColor(tx.status)}>
                        {tx.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-lg sm:rounded-none">
                  <span className="text-sm font-medium text-muted-foreground sm:hidden">
                    Cashback Gerado
                  </span>
                  <div className="text-right">
                    {tx.cashbackStore > 0 && (
                      <p className="text-sm font-bold text-primary flex items-center justify-end gap-1">
                        <Store className="h-3 w-3" /> + R${' '}
                        {tx.cashbackStore.toFixed(2).replace('.', ',')}
                      </p>
                    )}
                    {tx.cashbackFuel > 0 && (
                      <p className="text-sm font-bold text-fuel flex items-center justify-end gap-1">
                        <Fuel className="h-3 w-3" /> + R${' '}
                        {tx.cashbackFuel.toFixed(2).replace('.', ',')}
                      </p>
                    )}
                    {tx.status === 'utilizado' && (
                      <p className="text-sm font-bold text-red-500">
                        - R$ {tx.value.toFixed(2).replace('.', ',')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
