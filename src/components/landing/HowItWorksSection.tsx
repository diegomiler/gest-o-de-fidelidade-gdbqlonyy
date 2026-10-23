import { Fuel, Gift, Hourglass, Wallet } from 'lucide-react'
import { Reveal } from './Reveal'

const STEPS = [
  {
    icon: Fuel,
    title: 'Abasteça ou compre',
    text: 'Você abastece ou compra no posto.',
  },
  {
    icon: Hourglass,
    title: 'Cashback calculado',
    text: 'O cashback é calculado automaticamente e fica pendente.',
  },
  {
    icon: Wallet,
    title: 'Saldo liberado',
    text: 'Após a liberação, o valor fica disponível no seu saldo.',
  },
  {
    icon: Gift,
    title: 'Acompanhe e resgate',
    text: 'Você acompanha e resgata prêmios ou usa o saldo na hora de pagar.',
  },
]

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="lp-section" aria-labelledby="como-funciona-title">
      <div className="lp-container">
        <Reveal>
          <h2 id="como-funciona-title" className="lp-section-title">
            Como funciona
          </h2>
          <p className="lp-section-subtitle">
            Quatro passos simples entre o abastecimento e o seu cashback no bolso.
          </p>
        </Reveal>

        <ol className="lp-steps mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <Reveal delay={index * 120} className="h-full">
                <div className="lp-card lp-card--hover relative flex h-full flex-col items-center px-6 pb-8 pt-6 text-center">
                  <span className="lp-step-number" aria-hidden="true">
                    {index + 1}
                  </span>
                  <span className="sr-only">Passo {index + 1}: </span>
                  <step.icon className="mt-5 h-7 w-7 text-brand-primary-dark" aria-hidden="true" />
                  <h3 className="mt-3 text-xl font-bold text-brand-secondary">{step.title}</h3>
                  <p className="mt-2 text-brand-muted">{step.text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
