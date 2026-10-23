import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Fuel, Menu, X } from 'lucide-react'
import { Sheet, SheetContent, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet'
import { LandingCta } from './LandingCta'
import { scrollToId } from '@/lib/landing-utils'

interface LandingHeaderProps {
  programName: string
  showPrizes: boolean
}

export function LandingHeader({ programName, showPrizes }: LandingHeaderProps) {
  const [open, setOpen] = useState(false)

  const items = [
    { id: 'como-funciona', label: 'Como funciona' },
    { id: 'vantagens', label: 'Vantagens' },
    ...(showPrizes ? [{ id: 'premios', label: 'Prêmios' }] : []),
    { id: 'contato', label: 'Contato' },
  ]

  const handleAnchor = (e: React.MouseEvent, id: string, closeMenu = false) => {
    e.preventDefault()
    if (closeMenu) {
      setOpen(false)
      // Aguarda o menu liberar o bloqueio de rolagem antes de navegar para a âncora
      window.setTimeout(() => scrollToId(id), 150)
    } else {
      scrollToId(id)
    }
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-brand-surface shadow-header">
      <div className="lp-container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5" aria-label={`${programName} - página inicial`}>
          <span className="flex h-10 w-10 items-center justify-center rounded-control bg-brand-primary-dark text-brand-on-primary">
            <Fuel className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="font-heading text-lg font-bold leading-tight text-brand-secondary">
            {programName}
          </span>
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-8 lg:flex">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => handleAnchor(e, item.id)}
              className="font-medium text-brand-text transition-colors hover:text-brand-primary-dark"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LandingCta intent="login" variant="outline">
            Entrar
          </LandingCta>
          <LandingCta intent="signup" variant="primary">
            Cadastre-se
          </LandingCta>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-control border border-brand-border text-brand-secondary lg:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="lp-root w-[85vw] max-w-sm bg-brand-surface p-0">
            <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
            <SheetDescription className="sr-only">
              Acesse as seções da página ou entre na sua conta.
            </SheetDescription>
            <div className="flex h-16 items-center justify-between border-b border-brand-border px-5">
              <span className="font-heading text-lg font-bold text-brand-secondary">{programName}</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-control text-brand-secondary"
                aria-label="Fechar menu"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <nav aria-label="Principal (mobile)" className="flex flex-col px-5 py-4">
              {items.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => handleAnchor(e, item.id, true)}
                  className="border-b border-brand-border py-4 text-lg font-medium text-brand-text"
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="flex flex-col gap-3 px-5 pt-2">
              <LandingCta intent="login" variant="outline" className="lp-btn--block">
                Entrar
              </LandingCta>
              <LandingCta intent="signup" variant="primary" className="lp-btn--block">
                Cadastre-se
              </LandingCta>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
