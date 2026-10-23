import { useEffect, useMemo, useState } from 'react'
import Autoplay from 'embla-carousel-autoplay'
import { Fuel, Store } from 'lucide-react'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import type { PublicLandingData } from '@/services/api'
import { bannerImage } from '@/lib/format'
import { prefersReducedMotion } from '@/lib/landing-utils'
import { LandingCta } from './LandingCta'
import { LpSkeleton } from './LpSkeleton'
import { Reveal } from './Reveal'

const STATIC_HERO_IMAGE = '/landing-hero.jpg'

interface HeroSectionProps {
  data: PublicLandingData | null
  loading: boolean
}

type EmblaApi = Parameters<NonNullable<React.ComponentProps<typeof Carousel>['setApi']>>[0]

function formatPercent(value: number): string {
  return `${Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`
}

/** Carrossel com os banners ativos; sem banners, mostra a ilustração padrão. */
function HeroVisual({ data, loading }: HeroSectionProps) {
  const banners = data?.activeBanners ?? []
  const [api, setApi] = useState<EmblaApi>()
  const [selected, setSelected] = useState(0)

  const plugins = useMemo(
    () =>
      banners.length > 1 && !prefersReducedMotion()
        ? [Autoplay({ delay: 5500, stopOnMouseEnter: true, stopOnInteraction: false })]
        : [],
    [banners.length],
  )

  useEffect(() => {
    if (!api) return
    const onSelect = () => setSelected(api.selectedScrollSnap())
    onSelect()
    api.on('select', onSelect)
    return () => {
      api.off('select', onSelect)
    }
  }, [api])

  if (loading) {
    return <LpSkeleton dark className="aspect-[4/3] w-full rounded-brand" />
  }

  if (banners.length === 0) {
    return (
      <img
        src={STATIC_HERO_IMAGE}
        alt="Ilustração de uma bomba de combustível, celular com carteira de cashback e sacola de compras"
        width={1200}
        height={900}
        className="lp-float aspect-[4/3] w-full rounded-brand object-cover shadow-card-hover"
      />
    )
  }

  return (
    <div className="relative" role="region" aria-roledescription="carrossel" aria-label="Campanhas ativas">
      <Carousel opts={{ loop: banners.length > 1 }} plugins={plugins} setApi={setApi}>
        <CarouselContent>
          {banners.map((banner, index) => (
            <CarouselItem
              key={banner.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} de ${banners.length}`}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-brand shadow-card-hover">
                <img
                  src={bannerImage(banner)}
                  alt={banner.title}
                  className="h-full w-full object-cover"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
                <div className="absolute inset-x-0 bottom-0 bg-brand-overlay p-4 text-brand-on-dark sm:p-5">
                  <p className="font-heading text-lg font-bold leading-tight">{banner.title}</p>
                  {banner.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-brand-on-dark-muted">
                      {banner.description}
                    </p>
                  )}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {banners.length > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {banners.map((banner, index) => (
            <button
              key={banner.id}
              type="button"
              onClick={() => api?.scrollTo(index)}
              aria-label={`Ir para o banner ${index + 1}`}
              aria-current={selected === index}
              className={`h-2.5 rounded-pill transition-all ${
                selected === index ? 'w-8 bg-brand-accent' : 'w-2.5 bg-brand-on-dark-muted'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function HeroSection({ data, loading }: HeroSectionProps) {
  const settings = data?.settings ?? null

  return (
    <section
      id="topo"
      className="lp-section lp-section--dark overflow-hidden pt-10 lg:pt-16"
      aria-labelledby="hero-title"
    >
      <div className="lp-container grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <Reveal>
          <p className="lp-seal lp-seal--dark mb-5 text-sm">Programa de cashback para clientes do posto</p>
          <h1 id="hero-title" className="text-4xl font-extrabold leading-[1.08] sm:text-5xl lg:text-6xl">
            Ganhe dinheiro de volta a cada abastecimento e compra na loja
          </h1>
          <p className="mt-5 max-w-xl text-lg text-brand-on-dark-muted">
            Cadastre-se, acumule cashback sempre que passar pelo posto e use o saldo como quiser.
          </p>

          <div className="mt-7 flex flex-wrap gap-3" aria-live="polite">
            {loading ? (
              <>
                <LpSkeleton dark className="h-12 w-44" />
                <LpSkeleton dark className="h-12 w-56" />
              </>
            ) : (
              settings && (
                <>
                  <span className="lp-seal">
                    <Store className="h-5 w-5" aria-hidden="true" />
                    {formatPercent(settings.store_percent)} na loja
                  </span>
                  <span className="lp-seal">
                    <Fuel className="h-5 w-5" aria-hidden="true" />
                    {formatPercent(settings.fuel_percent)} em combustível
                  </span>
                </>
              )
            )}
          </div>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <LandingCta intent="signup" variant="accent" size="lg">
              Quero meu cashback
            </LandingCta>
            <LandingCta intent="login" variant="outline-light" size="lg">
              Já sou cliente
            </LandingCta>
          </div>
        </Reveal>

        <Reveal delay={150}>
          <HeroVisual data={data} loading={loading} />
        </Reveal>
      </div>
    </section>
  )
}
