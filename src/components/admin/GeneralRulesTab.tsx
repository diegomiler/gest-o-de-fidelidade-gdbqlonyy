import { Store, Fuel, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export function GeneralRulesTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Regras de Cashback</h2>
        <p className="text-sm text-muted-foreground">
          Configurações atuais do programa de fidelidade. Os valores são aplicados automaticamente
          sobre cada compra.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-indigo-200 bg-indigo-50/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-indigo-900">Cashback Loja</CardTitle>
                <CardDescription className="text-indigo-700">
                  Compras de mercearia e produtos
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-indigo-700">10%</span>
              <span className="text-sm text-indigo-600">de cashback</span>
            </div>
            <div className="rounded-lg bg-white border border-indigo-200 p-3 text-sm">
              <p className="text-indigo-900">
                <span className="font-semibold">R$ 10,00</span> de cashback a cada{' '}
                <span className="font-semibold">R$ 100,00</span> em compras
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-indigo-600">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Aplicado sobre o valor total da compra na loja</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-600 text-white">
                <Fuel className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-amber-900">Cashback Combustível</CardTitle>
                <CardDescription className="text-amber-700">
                  Abastecimento de veículos
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-amber-700">2%</span>
              <span className="text-sm text-amber-600">de cashback</span>
            </div>
            <div className="rounded-lg bg-white border border-amber-200 p-3 text-sm">
              <p className="text-amber-900">
                <span className="font-semibold">R$ 2,00</span> de cashback a cada{' '}
                <span className="font-semibold">R$ 100,00</span> em combustível
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-amber-600">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Aplicado sobre o valor abastecido nos postos parceiros</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo do Programa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-indigo-600" />
              <span>
                Loja: <strong>10%</strong> por compra
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-amber-600" />
              <span>
                Combustível: <strong>2%</strong> por abastecimento
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
