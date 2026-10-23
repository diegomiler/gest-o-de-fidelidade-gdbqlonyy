import { Link } from 'react-router-dom'
import { PackageCheck } from 'lucide-react'
import type { MockPrize } from '@/services/mock/store'
import { useAuth } from '@/hooks/use-auth'
import { formatBRL, prizeImage } from '@/lib/format'
import { LpSkeleton } from './LpSkeleton'
import { Reveal } from './Reveal'

interface PrizesSectionProps {
  prizes: MockPrize[]
  loading: boolean
}

function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-warning-tint px-3 py-1 text-sm font-semibold text-brand-danger">
        Esgotado
      </span>
    )
  }
  if (stock <= 5) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-warning-tint px-3 py-1 text-sm font-semibold text-brand-danger">
        <PackageCheck className="h-4 w-4" aria-hidden="true" />
        Restam {stock}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-primary-tint px-3 py-1 text-sm font-semibold text-brand-primary-dark">
      <PackageCheck className="h-4 w-4" aria-hidden="true" />
      Em estoque
    </span>
  )
}

/** Vitrine com prêmios reais do catálogo. O pai oculta a seção quando o catálogo está vazio. */
export function PrizesSection({ prizes, loading }: PrizesSectionProps) {
  const { isAuthenticated } = useAuth()

  return (
    <section id="premios" className="lp-section" aria-labelledby="premios-title">
      <div className="lp-container">
        <Reveal>
          <h2 id="premios-title" className="lp-section-title">
            O que você pode fazer com o seu saldo
          </h2>
          <p className="lp-section-subtitle">
            Troque o cashback por prêmios do catálogo ou use como desconto nas próximas compras.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? [0, 1, 2, 3].map((i) => <LpSkeleton key={i} className="h-80 rounded-brand" />)
            : prizes.map((prize, index) => (
                <Reveal key={prize.id} delay={index * 100} className="h-full">
                  <article className="lp-card lp-card--hover flex h-full flex-col overflow-hidden">
                    <img
                      src={prizeImage(prize)}
                      alt={prize.name}
                      loading="lazy"
                      width={400}
                      height={300}
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <div className="flex flex-1 flex-col gap-3 p-5">
                      <h3 className="text-lg font-bold leading-snug text-brand-secondary">
                        {prize.name}
                      </h3>
                      <p className="line-clamp-2 text-sm text-brand-muted">{prize.description}</p>
                      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
                        <p className="text-brand-text">
                          <span className="block text-xs font-medium text-brand-muted">Custo</span>
                          <span className="font-heading text-xl font-bold text-brand-primary-dark">
                            {formatBRL(prize.required_amount)}
                          </span>
                        </p>
                        <StockBadge stock={prize.stock} />
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link to={isAuthenticated ? '/premios' : '/login'} className="lp-btn lp-btn--outline lp-btn--lg">
            Ver todos
          </Link>
        </div>
      </div>
    </section>
  )
}
