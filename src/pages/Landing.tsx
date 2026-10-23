import { useEffect, useState } from 'react'
import { apiService, type PublicLandingData } from '@/services/api'
import { usePageMeta } from '@/hooks/use-page-meta'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { HeroSection } from '@/components/landing/HeroSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { ValueBlock } from '@/components/landing/ValueBlock'
import { WhySection } from '@/components/landing/WhySection'
import { PrizesSection } from '@/components/landing/PrizesSection'
import { RulesStrip } from '@/components/landing/RulesStrip'
import { ContactSection } from '@/components/landing/ContactSection'
import { LandingFooter } from '@/components/landing/LandingFooter'

const DEFAULT_PROGRAM_NAME = 'Gestão de Fidelidade'

/**
 * Página inicial pública ("/"). Todos os dados vêm de apiService.getPublicLandingData();
 * quando uma fonte falha, somente a seção correspondente é ocultada.
 */
export default function Landing() {
  const [data, setData] = useState<PublicLandingData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    apiService
      .getPublicLandingData()
      .then((res) => mounted && setData(res))
      .catch(() => mounted && setData(null))
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [])

  const programName = data?.company?.name?.trim() || DEFAULT_PROGRAM_NAME
  const hasPrizes = (data?.featuredPrizes.length ?? 0) > 0
  const showPrizes = loading || hasPrizes
  const showRules = loading || Boolean(data?.settings)

  usePageMeta({
    title: `${programName} | Cashback em loja e combustível`,
    description:
      'Ganhe cashback a cada abastecimento e compra na loja do posto. Acompanhe saldo e extrato em tempo real e troque por prêmios.',
    image: `${window.location.origin}/landing-hero.jpg`,
  })

  return (
    <div className="lp-root min-h-screen">
      <a href="#conteudo" className="lp-skip-link">
        Pular para o conteúdo
      </a>
      <LandingHeader programName={programName} showPrizes={showPrizes} />

      <main id="conteudo" className="pt-16">
        <HeroSection data={data} loading={loading} />
        <HowItWorksSection />
        <ValueBlock />
        <WhySection />
        {showPrizes && <PrizesSection prizes={data?.featuredPrizes ?? []} loading={loading} />}
        {showRules && <RulesStrip settings={data?.settings ?? null} loading={loading} />}
        <ContactSection contact={data?.contact ?? null} />
      </main>

      <LandingFooter data={data} loading={loading} programName={programName} />
    </div>
  )
}
