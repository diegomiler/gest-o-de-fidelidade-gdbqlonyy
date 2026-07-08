import { Key, Link as LinkIcon, ShieldAlert } from 'lucide-react'
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

export default function AdminConfig() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações e Integração</h1>
        <p className="text-muted-foreground">
          Gerencie chaves de API e webhooks para integração com o PDV.
        </p>
      </div>

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
              <Button variant="outline">Copiar</Button>
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
              Eventos disparados: `reward_redeemed`, `balance_updated`
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Testar Conexão</Button>
          <Button>Salvar</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
