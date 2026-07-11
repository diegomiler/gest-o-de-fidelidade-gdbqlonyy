import { useState, type ReactNode } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { createPrize, updatePrize } from '@/services/prizes'
import { prizeImage } from '@/lib/format'

interface PrizeFormProps {
  prize?: Record<string, any>
  trigger?: ReactNode
  onSaved?: () => void
}

const toDateInput = (dateStr?: string) => {
  if (!dateStr) return ''
  return dateStr.split(' ')[0].split('T')[0]
}

export function PrizeForm({ prize, trigger, onSaved }: PrizeFormProps) {
  const isEdit = !!prize
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>(isEdit ? prizeImage(prize) : '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  const [form, setForm] = useState({
    name: prize?.name || '',
    description: prize?.description || '',
    stock: prize?.stock ?? 0,
    required_amount: prize?.required_amount ?? 0,
    active: prize?.active ?? true,
    campaign_end: toDateInput(prize?.campaign_end),
  })

  const update = (field: string, value: unknown) => setForm((f) => ({ ...f, [field]: value }))

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Nome é obrigatório'
    if (form.stock < 0) errs.stock = 'Estoque não pode ser negativo'
    if (form.required_amount < 0) errs.required_amount = 'Custo não pode ser negativo'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('description', form.description)
      fd.append('stock', String(form.stock))
      fd.append('required_amount', String(form.required_amount))
      fd.append('active', String(form.active))
      fd.append('campaign_end', form.campaign_end)
      if (imageFile) fd.append('image', imageFile)

      if (isEdit) {
        await updatePrize(prize!.id, fd)
        toast({ title: 'Prêmio atualizado', description: 'Prêmio atualizado com sucesso.' })
      } else {
        await createPrize(fd)
        toast({ title: 'Prêmio criado', description: 'Prêmio criado com sucesso.' })
      }
      setOpen(false)
      onSaved?.()
    } catch {
      toast({ title: 'Erro', description: 'Falha ao salvar prêmio.', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Novo Prêmio
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Prêmio' : 'Novo Prêmio'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Nome *</Label>
            <Input
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Café Espresso"
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Detalhes do prêmio"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Imagem</Label>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="h-32 w-full object-cover rounded border mb-2"
              />
            )}
            <Input type="file" accept="image/*" onChange={handleImageChange} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Estoque</Label>
              <Input
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) => update('stock', Number(e.target.value))}
              />
              {errors.stock && <p className="text-sm text-red-500">{errors.stock}</p>}
            </div>
            <div className="space-y-2">
              <Label>Custo (R$)</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.required_amount}
                onChange={(e) => update('required_amount', Number(e.target.value))}
              />
              {errors.required_amount && (
                <p className="text-sm text-red-500">{errors.required_amount}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Fim da Campanha</Label>
            <Input
              type="date"
              value={form.campaign_end}
              onChange={(e) => update('campaign_end', e.target.value)}
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
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
