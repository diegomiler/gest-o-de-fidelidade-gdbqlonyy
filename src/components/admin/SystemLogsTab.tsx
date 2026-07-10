import { Key, Link as LinkIcon, ShieldAlert, Activity, CheckCircle2 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export function SystemLogsTab() {
  const { toast } = useToast()

  const handleCopy = () => {
    navigator.clipboard.writeText('sk_live_1234567890abcdef')
    toast({
      title: 'Chave copiada',
      description: 'A API Key foi copiada para a área de transferência.',
    })
  }

  const handleTestWebhook = () => {
    toast({
      title: 'Testando conexão',
      description: 'Aguarde o resultado do teste de webhook.',
    })
  }

  const handleSaveWebhook = () => {
    toast({
      title: 'Configuração salva',
      description: 'URL do webhook atualizada com sucesso.',
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" /> Status do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-2 rounded-lg border p-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-sm font-medium">Backend</p>
                <p className="text-xs text-muted-foreground">Operacional</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border p-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-sm font-medium">API de Vendas</p>
                <p className="text-xs text-muted-foreground">Sincronizando</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border p-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-sm font-medium">Cashback</p>
                <p className="text-xs text-muted-foreground">Ativo</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" /> Credenciais de API
          </CardTitle>
          <CardDescription>
            Utilize estas chaves para autenticar as requisições de vendas do seu PDV.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>API Key (Produção)</Label>
            <div className="flex gap-2">
              <Input type="password" value="sk_live_1234567890abcdef" readOnly />
              <Button variant="outline" onClick={handleCopy}>
                Copiar
              </Button>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-md flex items-start gap-3 text-sm">
            <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
            <p>
              Mantenha sua API Key em segredo. Caso suspeite de vazamento, gere uma nova chave
              imediatamente.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="destructive">Regerar Chave</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" /> Webhooks
          </CardTitle>
          <CardDescription>
            Receba notificações de eventos em tempo real no seu sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>URL do Webhook</Label>
            <Input
              placeholder="https://seu-sistema.com.br/api/webhooks/cashback"
              defaultValue="https://pdv-interno.loja.com/webhook"
            />
            <p className="text-xs text-muted-foreground">
              Eventos disparados: reward_redeemed, balance_updated
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleTestWebhook}>
            Testar Conexão
          </Button>
          <Button onClick={handleSaveWebhook}>Salvar</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
