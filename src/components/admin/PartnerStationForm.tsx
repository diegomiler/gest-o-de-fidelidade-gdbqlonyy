import { useState, type ReactNode } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { createPartnerStation, updatePartnerStation } from '@/services/partner-stations'
import { useToast } from '@/hooks/use-toast'

interface PartnerStationFormProps {
  station?: Record<string, any>
  trigger?: ReactNode
  onSaved?: () => void
}

export function PartnerStationForm({ station, trigger, onSaved }: PartnerStationFormProps) {
  const isEdit = !!station
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  const [form, setForm] = useState({
    name: station?.name || '',
    address: station?.address || '',
    city: station?.city || '',
    state: station?.state || '',
    phone: station?.phone || '',
    active: station?.active ?? true,
  })

  const update = (field: string, value: unknown) => setForm((f) => ({ ...f, [field]: value }))

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Nome é obrigatório'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)
    try {
      if (isEdit) {
        await updatePartnerStation(station!.id, form)
        toast({ title: 'Posto atualizado', description: 'Posto parceiro atualizado com sucesso.' })
      } else {
        await createPartnerStation({ ...form, active: form.active })
        toast({ title: 'Posto adicionado', description: 'Novo posto parceiro criado com sucesso.' })
      }
      setForm({ name: '', address: '', city: '', state: '', phone: '', active: true })
      setOpen(false)
      onSaved?.()
    } catch {
      toast({
        title: 'Erro',
        description: 'Falha ao salvar posto parceiro.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Adicionar Posto
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Posto Parceiro' : 'Novo Posto Parceiro'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Nome *</Label>
            <Input
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Posto Shell Centro"
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label>Endereço</Label>
            <Input
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
              placeholder="Av. Brasil, 1000"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
                placeholder="São Paulo"
              />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Input
                value={form.state}
                onChange={(e) => update('state', e.target.value)}
                placeholder="SP"
                maxLength={2}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              placeholder="(11) 1234-5678"
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.active} onCheckedChange={(v) => update('active', v)} />
            <Label>Ativo</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !form.name.trim()}>
            {submitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
