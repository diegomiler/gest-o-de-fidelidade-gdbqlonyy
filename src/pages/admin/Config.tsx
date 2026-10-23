import { Store, Building2, ScrollText, Contact, Inbox } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { GeneralRulesTab } from '@/components/admin/GeneralRulesTab'
import { PartnerStationsTab } from '@/components/admin/PartnerStationsTab'
import { ProgramInfoTab } from '@/components/admin/ProgramInfoTab'
import { LeadsTab } from '@/components/admin/LeadsTab'
import { SystemLogsTab } from '@/components/admin/SystemLogsTab'

export default function AdminConfig() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações e Integração</h1>
        <p className="text-muted-foreground">
          Gerencie regras do programa, postos parceiros e integrações do sistema.
        </p>
      </div>

      <Tabs defaultValue="rules">
        <TabsList>
          <TabsTrigger value="rules" className="gap-2">
            <Store className="h-4 w-4" /> Regras Gerais
          </TabsTrigger>
          <TabsTrigger value="partners" className="gap-2">
            <Building2 className="h-4 w-4" /> Postos Parceiros
          </TabsTrigger>
          <TabsTrigger value="program" className="gap-2">
            <Contact className="h-4 w-4" /> Contato e Empresa
          </TabsTrigger>
          <TabsTrigger value="leads" className="gap-2">
            <Inbox className="h-4 w-4" /> Leads
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2">
            <ScrollText className="h-4 w-4" /> Logs do Sistema
          </TabsTrigger>
        </TabsList>
        <TabsContent value="rules" className="mt-6">
          <GeneralRulesTab />
        </TabsContent>
        <TabsContent value="partners" className="mt-6">
          <PartnerStationsTab />
        </TabsContent>
        <TabsContent value="program" className="mt-6">
          <ProgramInfoTab />
        </TabsContent>
        <TabsContent value="leads" className="mt-6">
          <LeadsTab />
        </TabsContent>
        <TabsContent value="logs" className="mt-6">
          <SystemLogsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
