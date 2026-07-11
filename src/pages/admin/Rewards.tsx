import { useState, useEffect, useCallback } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { getAllPrizes, updatePrizeFields, deletePrize } from '@/services/prizes'
import { formatBRL, prizeImage, formatDate } from '@/lib/format'
import { PrizeForm } from '@/components/admin/PrizeForm'
import { ConfirmDelete } from '@/components/admin/ConfirmDelete'

export default function AdminRewards() {
  const [prizes, setPrizes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const loadData = useCallback(async () => {
    try {
      setPrizes(await getAllPrizes())
    } catch {
      /* intentionally ignored */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('prizes', () => loadData())

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await updatePrizeFields(id, { active: !current })
      toast({ title: 'Status atualizado' })
    } catch {
      toast({ title: 'Erro', description: 'Falha ao atualizar status.', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    await deletePrize(id)
    toast({ title: 'Prêmio excluído' })
    loadData()
  }

  if (loading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-16" />
        <Skeleton className="h-96" />
      </div>
    )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Catálogo de Prêmios</h1>
        <PrizeForm onSaved={loadData} />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imagem</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Custo</TableHead>
                <TableHead className="text-right">Estoque</TableHead>
                <TableHead>Campanha</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prizes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    Nenhum prêmio encontrado.
                  </TableCell>
                </TableRow>
              )}
              {prizes.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <img src={prizeImage(p)} alt="" className="h-10 w-10 object-cover rounded" />
                  </TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm max-w-xs truncate">
                    {p.description || '—'}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatBRL(p.required_amount || 0)}
                  </TableCell>
                  <TableCell className="text-right">{p.stock || 0}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {p.campaign_end ? formatDate(p.campaign_end) : '—'}
                  </TableCell>
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
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <PrizeForm
                        prize={p}
                        onSaved={loadData}
                        trigger={
                          <Button variant="ghost" size="sm">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <ConfirmDelete
                        title="Excluir prêmio"
                        description={`Deseja excluir "${p.name}"? Esta ação não pode ser desfeita.`}
                        onConfirm={() => handleDelete(p.id)}
                        trigger={
                          <Button variant="ghost" size="sm" className="text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        }
                      />
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
