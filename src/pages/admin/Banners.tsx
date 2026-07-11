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
import { getAllBanners, updateBannerFields, deleteBanner } from '@/services/banners'
import { formatDate, bannerImage } from '@/lib/format'
import { BannerForm } from '@/components/admin/BannerForm'
import { ConfirmDelete } from '@/components/admin/ConfirmDelete'

export default function AdminBanners() {
  const [banners, setBanners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const loadData = useCallback(async () => {
    try {
      setBanners(await getAllBanners())
    } catch {
      /* intentionally ignored */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('banners', () => loadData())

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await updateBannerFields(id, { active: !current })
      toast({ title: 'Status atualizado' })
    } catch {
      toast({ title: 'Erro', description: 'Falha ao atualizar status.', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    await deleteBanner(id)
    toast({ title: 'Banner excluído' })
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
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Banners</h1>
        <BannerForm onSaved={loadData} />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Ordem</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Nenhum banner encontrado.
                  </TableCell>
                </TableRow>
              )}
              {banners.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>
                    <img
                      src={bannerImage(b)}
                      alt="Banner"
                      className="h-12 w-32 object-cover rounded border"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{b.title}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {b.start_date ? formatDate(b.start_date) : '—'} até{' '}
                    {b.end_date ? formatDate(b.end_date) : '—'}
                  </TableCell>
                  <TableCell>{b.sort_order ?? 0}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={b.active}
                        onCheckedChange={() => handleToggle(b.id, b.active)}
                      />
                      <span
                        className={`text-xs font-medium ${b.active ? 'text-emerald-600' : 'text-muted-foreground'}`}
                      >
                        {b.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <BannerForm
                        banner={b}
                        onSaved={loadData}
                        trigger={
                          <Button variant="ghost" size="sm">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <ConfirmDelete
                        title="Excluir banner"
                        description={`Deseja excluir "${b.title}"? Esta ação não pode ser desfeita.`}
                        onConfirm={() => handleDelete(b.id)}
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
