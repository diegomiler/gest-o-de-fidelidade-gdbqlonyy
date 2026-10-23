import { Activity, Gift, Layers } from 'lucide-react'
import { Reveal } from './Reveal'

const REASONS = [
  {
    icon: Layers,
    title: 'Cashback duplo: loja e combustível',
    text: 'Você ganha de volta nas compras da loja e também nos abastecimentos, com um único cadastro.',
  },
  {
    icon: Activity,
    title: 'Saldo e extrato em tempo real',
    text: 'Veja o cashback pendente e o liberado de cada compra, sem precisar perguntar no caixa.',
  },
  {
    icon: Gift,
    title: 'Troque por prêmios do catálogo',
    text: 'Use o saldo para resgatar prêmios selecionados ou como desconto na hora de pagar.',
  },
]

export function WhySection() {
  return (
    <section id="vantagens" className="lp-section lp-section--alt" aria-labelledby="vantagens-title">
      <div className="lp-container">
        <Reveal>
          <h2 id="vantagens-title" className="lp-section-title">
            Por que participar?
          </h2>
          <p className="lp-section-subtitle">
            Vantagens pensadas para quem passa pelo posto no dia a dia.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {REASONS.map((reason, index) => (
            <Reveal key={reason.title} delay={index * 120} className="h-full">
              <article className="lp-card lp-card--hover h-full p-7">
                <span className="flex h-14 w-14 items-center justify-center rounded-control bg-brand-primary-tint text-brand-primary-dark">
                  <reason.icon className="h-7 w-7" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-xl font-bold text-brand-secondary">{reason.title}</h3>
                <p className="mt-2 text-brand-muted">{reason.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
