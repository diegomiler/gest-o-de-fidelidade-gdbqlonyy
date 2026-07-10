import { useState, useEffect, useCallback } from 'react'
import { Search, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { getAllPartnerStations, updatePartnerStation } from '@/services/partner-stations'
import { partnerLogo } from '@/lib/format'
import { PartnerStationForm } from './PartnerStationForm'

export function PartnerStationsTab() {
  const [stations, setStations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const { toast } = useToast()

  const loadData = useCallback(async () => {
    try {
      setStations(await getAllPartnerStations())
    } catch {
      /* intentionally ignored */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('partner_stations', () => loadData())

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await updatePartnerStation(id, { active: !current })
      toast({
        title: 'Status atualizado',
        description: `Posto ${!current ? 'ativado' : 'desativado'} com sucesso.`,
      })
    } catch {
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar status do posto.',
        variant: 'destructive',
      })
    }
  }

  const filtered = stations.filter(
    (s) =>
      !search ||
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.city?.toLowerCase().includes(search.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (stations.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-1">Nenhum posto encontrado</p>
          <p className="text-sm text-muted-foreground mb-4">
            Comece adicionando seu primeiro posto parceiro.
          </p>
          <PartnerStationForm
            trigger={
              <Button>
                <Building2 className="h-4 w-4 mr-2" /> Adicionar Primeiro Posto
              </Button>
            }
            onCreated={loadData}
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou cidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <PartnerStationForm onCreated={loadData} />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Logo</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>Cidade/UF</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Nenhum posto encontrado para &ldquo;{search}&rdquo;.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <img
                      src={partnerLogo(p)}
                      alt=""
                      className="h-8 w-8 rounded-full object-cover border bg-slate-100"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {p.address || '—'}
                  </TableCell>
                  <TableCell className="text-sm">
                    {p.city || '—'}
                    {p.state ? `/${p.state}` : ''}
                  </TableCell>
                  <TableCell className="text-sm">{p.phone || '—'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={p.active}
                        onCheckedChange={() => handleToggle(p.id, p.active)}
                      />
                      <span
                        className={`text-xs font-medium ${p.active ? 'text-emerald-600' : 'text-muted-foreground'}`}
                      >
                        {p.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
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
