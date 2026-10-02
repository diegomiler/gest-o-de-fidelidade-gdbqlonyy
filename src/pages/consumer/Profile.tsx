import { useState, useEffect, useRef } from 'react'
import { User, Mail, Phone, CreditCard, LogOut, Save, Camera, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/use-auth'
import { MockStore } from '@/services/mock/store'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { formatDate } from '@/lib/format'
import { toast } from '@/hooks/use-toast'

export default function ConsumerProfile() {
  const { user, signOut } = useAuth()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [cpf, setCpf] = useState('')
  const [saving, setSaving] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setPhone(user.phone || '')
      setCpf(user.cpf || '')
    }
  }, [user])

  const currentAvatarUrl = user?.avatar || undefined

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.id) return

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Arquivo muito grande', description: 'Máximo 5MB.', variant: 'destructive' })
      return
    }

    setUploadingAvatar(true)
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setAvatarPreview(dataUrl)
      try {
        MockStore.updateUser(user.id, { avatar: dataUrl })
        toast({
          title: 'Foto atualizada',
          description: 'Sua foto de perfil foi atualizada com sucesso.',
        })
      } catch (err) {
        toast({ title: 'Erro', description: getErrorMessage(err), variant: 'destructive' })
      } finally {
        setUploadingAvatar(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    }
    reader.onerror = () => {
      setUploadingAvatar(false)
      toast({ title: 'Erro ao ler arquivo', variant: 'destructive' })
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!user?.id) return
    setSaving(true)
    try {
      MockStore.updateUser(user.id, { name, phone, cpf })
      toast({ title: 'Perfil atualizado', description: 'Seus dados foram salvos com sucesso.' })
    } catch (err) {
      toast({ title: 'Erro', description: getErrorMessage(err), variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Meu Perfil</h1>
        <p className="text-muted-foreground">Gerencie suas informações pessoais.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative group">
              {uploadingAvatar ? (
                <Skeleton className="h-16 w-16 rounded-full" />
              ) : (
                <Avatar className="h-16 w-16">
                  <AvatarImage src={avatarPreview || currentAvatarUrl} />
                  <AvatarFallback>
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
                aria-label="Alterar foto"
              >
                {uploadingAvatar ? (
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                ) : (
                  <Camera className="h-6 w-6 text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarSelect}
              />
            </div>
            <div>
              <CardTitle>{name || user?.name || 'Usuário'}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
              {user?.created && (
                <p className="text-xs text-muted-foreground mt-1">
                  Membro desde {formatDate(user.created)}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4" /> Nome
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> E-mail
            </Label>
            <Input id="email" value={user?.email || ''} disabled />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> Telefone
            </Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(00) 00000-0000"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cpf" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> CPF
            </Label>
            <Input
              id="cpf"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              placeholder="000.000.000-00"
            />
          </div>
          <div className="flex justify-between pt-4">
            <Button variant="destructive" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" /> Sair
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" /> {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
