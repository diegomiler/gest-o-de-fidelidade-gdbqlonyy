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
import { createBanner, updateBanner } from '@/services/banners'
import { bannerImage } from '@/lib/format'

interface BannerFormProps {
  banner?: Record<string, any>
  trigger?: ReactNode
  onSaved?: () => void
}

const toDateInput = (dateStr?: string) => {
  if (!dateStr) return ''
  return dateStr.split(' ')[0].split('T')[0]
}

export function BannerForm({ banner, trigger, onSaved }: BannerFormProps) {
  const isEdit = !!banner
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>(isEdit ? bannerImage(banner) : '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  const [form, setForm] = useState({
    title: banner?.title || '',
    description: banner?.description || '',
    position: banner?.position || '',
    start_date: toDateInput(banner?.start_date),
    end_date: toDateInput(banner?.end_date),
    active: banner?.active ?? true,
    sort_order: banner?.sort_order ?? 0,
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
    if (!form.title.trim()) errs.title = 'Título é obrigatório'
    if (form.sort_order < 0) errs.sort_order = 'Ordem não pode ser negativa'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('description', form.description)
      fd.append('position', form.position)
      fd.append('start_date', form.start_date)
      fd.append('end_date', form.end_date)
      fd.append('active', String(form.active))
      fd.append('sort_order', String(form.sort_order))
      if (imageFile) fd.append('image', imageFile)

      if (isEdit) {
        await updateBanner(banner!.id, fd)
        toast({ title: 'Banner atualizado', description: 'Banner atualizado com sucesso.' })
      } else {
        await createBanner(fd)
        toast({ title: 'Banner criado', description: 'Banner criado com sucesso.' })
      }
      setOpen(false)
      onSaved?.()
    } catch {
      toast({ title: 'Erro', description: 'Falha ao salvar banner.', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Novo Banner
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Banner' : 'Novo Banner'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="Promoção de Verão"
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Detalhes do banner"
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
          <div className="space-y-2">
            <Label>Posição</Label>
            <Input
              value={form.position}
              onChange={(e) => update('position', e.target.value)}
              placeholder="home-top"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data Início</Label>
              <Input
                type="date"
                value={form.start_date}
                onChange={(e) => update('start_date', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Data Fim</Label>
              <Input
                type="date"
                value={form.end_date}
                onChange={(e) => update('end_date', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Ordem</Label>
            <Input
              type="number"
              value={form.sort_order}
              onChange={(e) => update('sort_order', Number(e.target.value))}
            />
            {errors.sort_order && <p className="text-sm text-red-500">{errors.sort_order}</p>}
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
