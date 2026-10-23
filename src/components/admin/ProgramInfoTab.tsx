import { useState, useEffect, useCallback } from 'react'
import { Save, AlertCircle, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getProgramInfo, updateProgramInfo, type ProgramInfo } from '@/services/settings'
import { useToast } from '@/hooks/use-toast'

const EMPTY: ProgramInfo = {
  nome_programa: '',
  cnpj: '',
  whatsapp: '',
  telefone_atendimento: '',
  email_atendimento: '',
}

const digits = (v: string) => v.replace(/\D/g, '')

export function ProgramInfoTab() {
  const [info, setInfo] = useState<ProgramInfo>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      setInfo(await getProgramInfo())
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Não foi possível carregar os dados.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const update = (field: keyof ProgramInfo, value: string) =>
    setInfo((prev) => ({ ...prev, [field]: value }))

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!info.nome_programa.trim()) e.nome_programa = 'Informe o nome do programa.'
    if (info.cnpj && digits(info.cnpj).length !== 14) e.cnpj = 'O CNPJ deve ter 14 dígitos.'
    if (info.whatsapp && ![10, 11, 12, 13].includes(digits(info.whatsapp).length)) {
      e.whatsapp = 'Informe o número com DDD.'
    }
    if (info.telefone_atendimento && digits(info.telefone_atendimento).length < 8) {
      e.telefone_atendimento = 'Informe um telefone válido.'
    }
    if (info.email_atendimento && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email_atendimento)) {
      e.email_atendimento = 'Informe um e-mail válido.'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      setInfo(await updateProgramInfo(info))
      toast({
        title: 'Dados salvos',
        description: 'A página pública já exibe os novos dados de contato e da empresa.',
      })
    } catch (err) {
      toast({
        title: 'Erro ao salvar',
        description: err instanceof Error ? err.message : 'Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="space-y-4 py-10">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (loadError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between gap-4">
          <span>{loadError}</span>
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw className="mr-1 h-4 w-4" /> Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  const field = (
    id: keyof ProgramInfo,
    label: string,
    placeholder: string,
    hint?: string,
    type = 'text',
  ) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={info[id]}
        placeholder={placeholder}
        onChange={(e) => update(id, e.target.value)}
      />
      {errors[id] && <p className="text-sm text-destructive">{errors[id]}</p>}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Contato e Empresa</h2>
        <p className="text-sm text-muted-foreground">
          Dados exibidos na página inicial pública: cabeçalho, contato e rodapé.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Identificação do programa</CardTitle>
          <CardDescription>Nome e CNPJ usados na marca e no rodapé.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          {field('nome_programa', 'Nome do programa', 'Gestão de Fidelidade')}
          {field('cnpj', 'CNPJ', '00.000.000/0000-00')}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Canais de atendimento</CardTitle>
          <CardDescription>
            Campos em branco ocultam o respectivo canal na página pública.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {field('whatsapp', 'WhatsApp', '(11) 99999-9999', 'Usado no botão de WhatsApp.', 'tel')}
            {field('telefone_atendimento', 'Telefone de atendimento', '(11) 3000-0000', undefined, 'tel')}
          </div>
          {field('email_atendimento', 'E-mail de atendimento', 'atendimento@empresa.com.br', undefined, 'email')}

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar dados
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
