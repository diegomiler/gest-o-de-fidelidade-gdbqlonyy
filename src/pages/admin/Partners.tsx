import { PartnerStationsTab } from '@/components/admin/PartnerStationsTab'

export default function AdminPartners() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Rede Parceira (Postos)</h1>
        <p className="text-muted-foreground">
          Gerencie os postos parceiros de combustível e seus status.
        </p>
      </div>
      <PartnerStationsTab />
    </div>
  )
}
