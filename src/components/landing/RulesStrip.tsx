import { Clock, ShieldCheck, ShoppingBag, Wallet } from 'lucide-react'
import type { CashbackRules } from '@/services/settings'
import { formatBRL } from '@/lib/format'
import { LpSkeleton } from './LpSkeleton'
import { Reveal } from './Reveal'

interface RulesStripProps {
  settings: CashbackRules | null
  loading: boolean
}

/** Faixa de transparência: todos os valores vêm de settings. */
export function RulesStrip({ settings, loading }: RulesStripProps) {
  return (
    <section className="lp-section lp-section--alt py-12 lg:py-16" aria-labelledby="regras-title">
      <div className="lp-container">
        <Reveal>
          <h2 id="regras-title" className="lp-section-title !text-2xl sm:!text-3xl">
            Transparência das regras
          </h2>
        </Reveal>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {loading || !settings ? (
            [0, 1, 2].map((i) => <LpSkeleton key={i} className="h-36 rounded-brand" />)
          ) : (
            <>
              <Reveal className="h-full">
                <div className="lp-card flex h-full items-start gap-4 p-6">
                  <ShoppingBag className="mt-1 h-7 w-7 shrink-0 text-brand-primary-dark" aria-hidden="true" />
                  <div>
                    <h3 className="font-bold text-brand-secondary">Compra mínima</h3>
                    <p className="font-heading text-2xl font-bold text-brand-primary-dark">
                      {formatBRL(settings.min_purchase_amount)}
                    </p>
                    <p className="mt-1 text-sm text-brand-muted">
                      Valor mínimo da compra para gerar cashback.
                    </p>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={100} className="h-full">
                <div className="lp-card flex h-full items-start gap-4 p-6">
                  <Wallet className="mt-1 h-7 w-7 shrink-0 text-brand-primary-dark" aria-hidden="true" />
                  <div>
                    <h3 className="font-bold text-brand-secondary">Resgate mínimo</h3>
                    <p className="font-heading text-2xl font-bold text-brand-primary-dark">
                      {formatBRL(settings.min_redemption_amount)}
                    </p>
                    <p className="mt-1 text-sm text-brand-muted">
                      Saldo mínimo para resgatar. Para usar como desconto, a compra deve ter no
                      mínimo {formatBRL(settings.min_purchase_usage)}.
                    </p>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={200} className="h-full">
                <div className="lp-card flex h-full items-start gap-4 p-6">
                  <Clock className="mt-1 h-7 w-7 shrink-0 text-brand-primary-dark" aria-hidden="true" />
                  <div>
                    <h3 className="font-bold text-brand-secondary">Liberação do cashback</h3>
                    <p className="mt-1 flex items-start gap-2 text-sm text-brand-muted">
                      <ShieldCheck
                        className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary-dark"
                        aria-hidden="true"
                      />
                      O cashback só fica disponível para uso após a liberação. Até lá, ele aparece
                      como pendente no seu extrato.
                    </p>
                  </div>
                </div>
              </Reveal>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
