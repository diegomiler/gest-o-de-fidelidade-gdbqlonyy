import { useState } from 'react'
import { Mail, MessageCircle, Phone } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { PublicLandingData } from '@/services/api'
import { formatBRL } from '@/lib/format'
import { mailUrl, telUrl, whatsappUrl } from '@/lib/landing-utils'
import { LpSkeleton } from './LpSkeleton'

interface LandingFooterProps {
  data: PublicLandingData | null
  loading: boolean
  programName: string
}

type PolicyKind = 'privacy' | 'terms' | null

const MAX_STATIONS = 6

export function LandingFooter({ data, loading, programName }: LandingFooterProps) {
  const [policy, setPolicy] = useState<PolicyKind>(null)

  const contact = data?.contact ?? null
  const company = data?.company ?? null
  const settings = data?.settings ?? null
  const stations = data?.stations ?? []

  const whatsapp = contact ? whatsappUrl(contact.whatsapp) : null
  const tel = contact ? telUrl(contact.phone) : null
  const mail = contact ? mailUrl(contact.email) : null
  const hasContact = Boolean(whatsapp || tel || mail)
  const hasStations = loading || stations.length > 0

  return (
    <footer className="lp-section--dark lp-dark-scope bg-brand-secondary pb-8 pt-14 text-brand-on-dark">
      <div className="lp-container">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h2 className="font-heading text-xl font-bold">{company?.name || programName}</h2>
            <p className="mt-3 text-brand-on-dark-muted">
              Cashback em compras na loja e em abastecimentos, com saldo e extrato sempre à mão.
            </p>
          </div>

          {hasStations && (
            <div>
              <h2 className="font-heading text-lg font-bold">Postos participantes</h2>
              {loading ? (
                <div className="mt-3 space-y-2">
                  <LpSkeleton dark className="h-5 w-40" />
                  <LpSkeleton dark className="h-5 w-32" />
                  <LpSkeleton dark className="h-5 w-36" />
                </div>
              ) : (
                <ul className="mt-3 space-y-2 text-brand-on-dark-muted">
                  {stations.slice(0, MAX_STATIONS).map((station) => (
                    <li key={station.id}>
                      <span className="font-medium text-brand-on-dark">{station.name}</span>
                      {(station.city || station.state) && (
                        <span>
                          {' '}
                          — {[station.city, station.state].filter(Boolean).join('/')}
                        </span>
                      )}
                    </li>
                  ))}
                  {stations.length > MAX_STATIONS && (
                    <li>e mais {stations.length - MAX_STATIONS} postos parceiros</li>
                  )}
                </ul>
              )}
            </div>
          )}

          {hasContact && contact && (
            <div>
              <h2 className="font-heading text-lg font-bold">Atendimento</h2>
              <ul className="mt-3 space-y-3 text-brand-on-dark-muted">
                {tel && (
                  <li className="flex items-center gap-2.5">
                    <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <a href={tel} className="underline-offset-4 hover:text-brand-on-dark hover:underline">
                      {contact.phone}
                    </a>
                  </li>
                )}
                {whatsapp && (
                  <li className="flex items-center gap-2.5">
                    <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <a
                      href={whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline-offset-4 hover:text-brand-on-dark hover:underline"
                    >
                      WhatsApp: {contact.whatsapp}
                      <span className="sr-only"> (abre em nova aba)</span>
                    </a>
                  </li>
                )}
                {mail && (
                  <li className="flex items-center gap-2.5">
                    <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <a
                      href={mail}
                      className="break-all underline-offset-4 hover:text-brand-on-dark hover:underline"
                    >
                      {contact.email}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}

          <div>
            <h2 className="font-heading text-lg font-bold">Políticas</h2>
            <ul className="mt-3 space-y-2 text-brand-on-dark-muted">
              <li>
                <button
                  type="button"
                  onClick={() => setPolicy('privacy')}
                  className="text-left underline-offset-4 hover:text-brand-on-dark hover:underline"
                >
                  Privacidade e tratamento de dados
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setPolicy('terms')}
                  className="text-left underline-offset-4 hover:text-brand-on-dark hover:underline"
                >
                  Termos do programa
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-brand-primary-dark pt-6 text-center text-sm text-brand-on-dark-muted">
          <p>
            © {new Date().getFullYear()} {company?.name || programName}
            {company?.cnpj ? ` · CNPJ ${company.cnpj}` : ''}
          </p>
        </div>
      </div>

      <Dialog open={policy !== null} onOpenChange={(open) => !open && setPolicy(null)}>
        <DialogContent className="lp-root max-h-[85vh] overflow-y-auto bg-brand-surface text-brand-text">
          {policy === 'privacy' && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading text-2xl text-brand-secondary">
                  Privacidade e tratamento de dados
                </DialogTitle>
                <DialogDescription className="text-brand-muted">
                  Como {company?.name || programName} usa as suas informações.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-brand-text">
                <p>
                  Coletamos nome, CPF, telefone, e-mail e o histórico de compras vinculado ao seu
                  cadastro para calcular, liberar e exibir o seu cashback.
                </p>
                <p>
                  Os dados são usados apenas para operar o programa e prestar atendimento, e não
                  são vendidos a terceiros.
                </p>
                <p>
                  Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento
                  pelos canais de atendimento informados nesta página, conforme a LGPD.
                </p>
              </div>
            </>
          )}
          {policy === 'terms' && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading text-2xl text-brand-secondary">
                  Termos do programa
                </DialogTitle>
                <DialogDescription className="text-brand-muted">
                  Regras gerais de participação em {company?.name || programName}.
                </DialogDescription>
              </DialogHeader>
              <ul className="list-disc space-y-2 pl-5 text-brand-text">
                <li>O cashback é gerado automaticamente em compras elegíveis do cliente cadastrado.</li>
                {settings && (
                  <li>
                    A compra mínima para gerar cashback é de {formatBRL(settings.min_purchase_amount)}
                    e o saldo mínimo para resgate é de {formatBRL(settings.min_redemption_amount)}.
                  </li>
                )}
                <li>O valor fica pendente e só pode ser usado após a liberação pelo programa.</li>
                <li>Prêmios estão sujeitos à disponibilidade de estoque do catálogo.</li>
                <li>Compras canceladas têm o cashback correspondente cancelado.</li>
              </ul>
            </>
          )}
        </DialogContent>
      </Dialog>
    </footer>
  )
}
