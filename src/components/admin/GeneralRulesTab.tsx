import { useState, useEffect, useCallback } from 'react'
import {
  Store,
  Fuel,
  Save,
  TrendingUp,
  Wallet,
  ShoppingCart,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getCashbackRules, updateCashbackRules, type CashbackRules } from '@/services/settings'
import { useToast } from '@/hooks/use-toast'
import { ProgramSummary } from '@/components/admin/ProgramSummary'

const DEFAULT_RULES: CashbackRules = {
  min_purchase_amount: 100,
  store_percent: 8,
  fuel_percent: 2,
  min_redemption_amount: 50,
  min_purchase_usage: 500,
}

export function GeneralRulesTab() {
  const [rules, setRules] = useState<CashbackRules>(DEFAULT_RULES)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loadError, setLoadError] = useState<string | null>(null)
  const [summaryRefreshKey, setSummaryRefreshKey] = useState(0)
  const { toast } = useToast()

  const loadRules = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const data = await getCashbackRules()
      setRules(data)
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? err.message
          : 'Não foi possível conectar ao banco de dados para carregar as configurações.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRules()
  }, [loadRules])

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (rules.min_purchase_amount == null || isNaN(rules.min_purchase_amount)) {
      e.min_purchase_amount = 'Informe um valor válido.'
    } else if (rules.min_purchase_amount < 0) {
      e.min_purchase_amount = 'O valor mínimo deve ser maior ou igual a zero.'
    }
    if (rules.store_percent == null || isNaN(rules.store_percent)) {
      e.store_percent = 'Informe uma porcentagem válida.'
    } else if (rules.store_percent < 0 || rules.store_percent > 100) {
      e.store_percent = 'A porcentagem deve estar entre 0 e 100.'
    }
    if (rules.fuel_percent == null || isNaN(rules.fuel_percent)) {
      e.fuel_percent = 'Informe uma porcentagem válida.'
    } else if (rules.fuel_percent < 0 || rules.fuel_percent > 100) {
      e.fuel_percent = 'A porcentagem deve estar entre 0 e 100.'
    }
    if (rules.min_redemption_amount == null || isNaN(rules.min_redemption_amount)) {
      e.min_redemption_amount = 'Informe um valor válido.'
    } else if (rules.min_redemption_amount <= 0) {
      e.min_redemption_amount = 'O valor deve ser maior que zero.'
    }
    if (rules.min_purchase_usage == null || isNaN(rules.min_purchase_usage)) {
      e.min_purchase_usage = 'Informe um valor válido.'
    } else if (rules.min_purchase_usage < 0) {
      e.min_purchase_usage = 'O valor deve ser maior ou igual a zero.'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      const confirmed = await updateCashbackRules(rules)
      setRules(confirmed)
      setSummaryRefreshKey((k) => k + 1)
      toast({
        title: 'Configurações atualizadas com sucesso!',
        description:
          'As novas regras de cashback foram salvas e confirmadas no banco de dados. Serão aplicadas nas próximas compras.',
      })
    } catch (err) {
      toast({
        title: 'Erro ao salvar',
        description:
          err instanceof Error
            ? err.message
            : 'Não foi possível atualizar as configurações. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const update = (field: keyof CashbackRules, value: string) => {
    const num = parseFloat(value)
    setRules((prev) => ({ ...prev, [field]: isNaN(num) ? 0 : num }))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Regras de Cashback</h2>
          <p className="text-sm text-muted-foreground">Carregando configurações...</p>
        </div>
        <Card>
          <CardContent className="py-10 space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-10 w-full" />
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Regras de Cashback</h2>
          <p className="text-sm text-muted-foreground">
            Não foi possível carregar os dados do banco de dados.
          </p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between gap-4">
            <span>{loadError}</span>
            <Button variant="outline" size="sm" onClick={loadRules} className="shrink-0">
              <RefreshCw className="h-4 w-4 mr-1" />
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Regras de Cashback</h2>
        <p className="text-sm text-muted-foreground">
          Configure os percentuais e limites do programa de fidelidade. As alterações são aplicadas
          automaticamente sobre as novas transações.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuração de Cashback</CardTitle>
          <CardDescription>
            Defina os percentuais de cashback por categoria e o valor mínimo de compra para geração
            de benefícios.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="min_purchase">Limite Mínimo de Compra</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                R$
              </span>
              <Input
                id="min_purchase"
                type="number"
                min={0}
                step="0.01"
                className="pl-10"
                value={rules.min_purchase_amount}
                onChange={(e) => update('min_purchase_amount', e.target.value)}
                placeholder="0,00"
              />
            </div>
            {errors.min_purchase_amount && (
              <p className="text-sm text-destructive">{errors.min_purchase_amount}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Compras abaixo deste valor não gerarão cashback.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="store_percent" className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 text-white">
                  <Store className="h-4 w-4" />
                </div>
                Porcentagem Loja
              </Label>
              <div className="relative">
                <Input
                  id="store_percent"
                  type="number"
                  min={0}
                  max={100}
                  step="0.1"
                  className="pr-8"
                  value={rules.store_percent}
                  onChange={(e) => update('store_percent', e.target.value)}
                  placeholder="10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                  %
                </span>
              </div>
              {errors.store_percent && (
                <p className="text-sm text-destructive">{errors.store_percent}</p>
              )}
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                Aplicado sobre o valor total de compras na loja
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuel_percent" className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-600 text-white">
                  <Fuel className="h-4 w-4" />
                </div>
                Porcentagem Posto/Combustível
              </Label>
              <div className="relative">
                <Input
                  id="fuel_percent"
                  type="number"
                  min={0}
                  max={100}
                  step="0.1"
                  className="pr-8"
                  value={rules.fuel_percent}
                  onChange={(e) => update('fuel_percent', e.target.value)}
                  placeholder="2"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                  %
                </span>
              </div>
              {errors.fuel_percent && (
                <p className="text-sm text-destructive">{errors.fuel_percent}</p>
              )}
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                Aplicado sobre o valor total de compras na loja, para parceiros
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="min_redemption" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-600 text-white">
                <Wallet className="h-4 w-4" />
              </div>
              Valor mínimo para uso de cashback
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                R$
              </span>
              <Input
                id="min_redemption"
                type="number"
                min={0}
                step="0.01"
                className="pl-10"
                value={rules.min_redemption_amount}
                onChange={(e) => update('min_redemption_amount', e.target.value)}
                placeholder="10,00"
              />
            </div>
            {errors.min_redemption_amount && (
              <p className="text-sm text-destructive">{errors.min_redemption_amount}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Saldo mínimo que o cliente deve ter acumulado para utilizar o cashback em compras.
            </p>
          </div>

          <div className="space-y-2 border-t pt-6">
            <Label htmlFor="min_purchase_usage" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-600 text-white">
                <ShoppingCart className="h-4 w-4" />
              </div>
              Valor mínimo da compra para uso de cashback
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                R$
              </span>
              <Input
                id="min_purchase_usage"
                type="number"
                min={0}
                step="0.01"
                className="pl-10"
                value={rules.min_purchase_usage}
                onChange={(e) => update('min_purchase_usage', e.target.value)}
                placeholder="0,00"
              />
            </div>
            {errors.min_purchase_usage && (
              <p className="text-sm text-destructive">{errors.min_purchase_usage}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Define o valor total mínimo que uma compra deve ter para que o cliente possa aplicar
              seu saldo de cashback como desconto.
            </p>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Configurações
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <ProgramSummary refreshKey={summaryRefreshKey} />
    </div>
  )
}
