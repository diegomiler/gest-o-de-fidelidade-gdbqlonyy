import { LandingCta } from './LandingCta'
import { Reveal } from './Reveal'

/** Bloco de proposta de valor entre "Como funciona" e "Por que participar". */
export function ValueBlock() {
  return (
    <section
      className="lp-section bg-gradient-to-r from-brand-primary-dark to-brand-secondary text-brand-on-dark"
      aria-labelledby="valor-title"
    >
      <div className="lp-container">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 id="valor-title" className="text-3xl font-bold leading-tight sm:text-4xl">
            Ganhe de volta em tudo o que você já compra
          </h2>
          <p className="mt-4 text-lg text-brand-on-dark-muted">
            Abastecer, passar na loja de conveniência, levar o de sempre: cada compra no posto
            devolve uma parte do valor para você.
          </p>
          <div className="mt-8 flex justify-center">
            <LandingCta intent="signup" variant="accent" size="lg">
              Criar minha conta
            </LandingCta>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
