import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle2, KeyRound } from 'lucide-react'

interface ForgotPasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialIdentifier?: string
}

export function ForgotPasswordDialog({
  open,
  onOpenChange,
  initialIdentifier = '',
}: ForgotPasswordDialogProps) {
  const [identifier, setIdentifier] = useState(initialIdentifier)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!identifier.trim()) return

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 400)
  }

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSubmitted(false)
      setIdentifier('')
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary-tint text-brand-primary-dark">
            <KeyRound className="h-5 w-5" />
          </div>
          <DialogTitle className="text-center font-heading text-lg font-bold text-slate-900">
            Recuperação de Senha
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-slate-600">
            {submitted
              ? 'Instruções de redefinição foram processadas.'
              : 'Informe seu e-mail, CPF ou telefone cadastrado para receber as instruções de recuperação.'}
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="space-y-4 py-2 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="text-sm text-slate-600">
              Se houver uma conta associada a estes dados, você receberá um link ou código de
              verificação para redefinir sua senha com segurança.
            </p>
            <DialogFooter className="sm:justify-center">
              <Button
                onClick={() => handleClose(false)}
                className="w-full sm:w-auto bg-brand-primary-dark hover:bg-brand-primary text-white"
              >
                Voltar para o Login
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-identifier" className="text-xs font-semibold text-slate-700">
                E-mail, CPF ou Telefone
              </Label>
              <Input
                id="forgot-identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Seu identificador de acesso"
                required
                autoFocus
                className="focus-visible:ring-brand-primary"
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || !identifier.trim()}
                className="bg-brand-primary-dark hover:bg-brand-primary text-white"
              >
                {loading ? 'Enviando...' : 'Enviar Instruções'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
