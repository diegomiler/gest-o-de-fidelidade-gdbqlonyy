import { useEffect, useState } from 'react'
import {
  CheckCircle2,
  ShoppingBag,
  Clock,
  Sparkles,
  AlertCircle,
  Gift,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { apiService, type PublicLandingData } from '@/services/api'
import { formatBRL, bannerImage, prizeImage } from '@/lib/format'

interface BenefitsPanelProps {
  compact?: boolean // se true, exibe a versão mobile-first compacta
}

export function BenefitsPanel({ compact = false }: BenefitsPanelProps) {
  const [data, setData] = useState<PublicLandingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let isMounted = true
    apiService
      .getPublicLandingData()
      .then((res) => {
        if (isMounted) {
          setData(res)
          setLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) {
          setError(true)
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const storePercent = data?.settings?.store_percent ?? 8
  const fuelPercent = data?.settings?.fuel_percent ?? 2
  const minPurchase = data?.settings?.min_purchase_amount ?? 100
  const activeBanners = data?.activeBanners ?? []
  const featuredPrizes = data?.featuredPrizes ?? []

  // Versão compacta para Mobile (< 1024px)
  if (compact) {
    return (
      <div className="space-y-3">
        {/* Bloco compacto de benefícios com destaque para cashback */}
        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 text-white p-4 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 bg-white/20 px-2.5 py-0.5 rounded-full text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Programa Fidelidade
            </span>
          </div>

          <h2 className="text-lg font-bold leading-tight">
            Ganhe até <span className="text-amber-300">{storePercent}%</span> de volta na loja e{' '}
            <span className="text-amber-300">{fuelPercent}%</span> no combustível
          </h2>

          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/15 text-center text-xs">
            <div className="bg-white/10 rounded-lg p-1.5">
              <p className="font-semibold text-white">1. Compre</p>
              <p className="text-[10px] text-white/80">Identifique com CPF</p>
            </div>
            <div className="bg-white/10 rounded-lg p-1.5">
              <p className="font-semibold text-white">2. Acumule</p>
              <p className="text-[10px] text-white/80">Cashback pendente</p>
            </div>
            <div className="bg-white/10 rounded-lg p-1.5">
              <p className="font-semibold text-white">3. Resgate</p>
              <p className="text-[10px] text-white/80">Prêmios e vales</p>
            </div>
          </div>
        </div>

        {/* Banners ativos no mobile se existirem */}
        {activeBanners.length > 0 && (
          <div className="pt-1">
            <Carousel className="w-full" opts={{ loop: true }}>
              <CarouselContent>
                {activeBanners.map((banner) => (
                  <CarouselItem key={banner.id} className="basis-full">
                    <div className="relative aspect-[21/9] rounded-xl overflow-hidden shadow-sm bg-slate-100">
                      <img
                        src={bannerImage(banner)}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-2.5">
                        <p className="text-white text-xs font-semibold line-clamp-1">
                          {banner.title}
                        </p>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        )}
      </div>
    )
  }

  // Versão rica para Desktop (>= 1024px)
  return (
    <div className="space-y-6 text-slate-800">
      {/* Cabeçalho de Boas-Vindas */}
      <div className="space-y-2">
        <Badge
          variant="outline"
          className="border-primary/30 text-primary bg-primary/5 px-3 py-1 text-xs"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1 text-primary" />
          Vantagens Exclusivas para Você
        </Badge>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Suas compras do dia a dia viram dinheiro de volta e prêmios.
        </h1>
        <p className="text-slate-600 text-sm">
          Acompanhe seu saldo em tempo real, consulte extratos detalhados e troque pontos por
          prêmios na nossa rede de lojas e postos parceiros.
        </p>
      </div>

      {/* Destaque de Cashback Dinâmico */}
      <Card className="border-none shadow-md bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 text-white overflow-hidden relative">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
                <ShoppingBag className="w-5 h-5 text-amber-300" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-wider text-indigo-200 font-semibold">
                  Taxas Atuais de Retorno
                </p>
                <h3 className="text-lg font-bold">Cashback Garantido</h3>
              </div>
            </div>
            <Badge className="bg-amber-400 text-slate-950 font-bold hover:bg-amber-400 border-none">
              Ativo
            </Badge>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-16 bg-white/20 rounded-xl" />
              <Skeleton className="h-16 bg-white/20 rounded-xl" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                <p className="text-xs text-indigo-100">Compras na Loja</p>
                <p className="text-2xl font-black text-amber-300">{storePercent}% de volta</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                <p className="text-xs text-indigo-100">Abastecimento</p>
                <p className="text-2xl font-black text-amber-300">{fuelPercent}% no combustível</p>
              </div>
            </div>
          )}

          <p className="text-xs text-indigo-200 mt-4 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            Saldo, extrato e histórico de compras centralizados em um só lugar.
          </p>
        </CardContent>
      </Card>

      {/* Como funciona em 3 passos */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
          Como funciona o programa
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs mb-2">
              1
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-xs">Você compra</p>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Informe seu CPF na loja ou posto parceiro credenciado.
              </p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs mb-2">
              2
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-xs">Fica pendente</p>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                O cashback é gerado e fica aguardando o prazo de liberação.
              </p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs mb-2">
              3
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-xs">Disponível para usar</p>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Após a liberação, use como desconto ou resgate prêmios.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Prévia de 2 a 3 prêmios reais do catálogo */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
            <Gift className="w-4 h-4 text-primary" />
            Prêmios do Catálogo
          </h3>
          <span className="text-xs text-slate-500">Troque seu saldo</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </div>
        ) : featuredPrizes.length > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {featuredPrizes.map((prize) => (
              <div
                key={prize.id}
                className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-sm flex flex-col"
              >
                <div className="aspect-[4/3] bg-slate-100 overflow-hidden relative">
                  <img
                    src={prizeImage(prize)}
                    alt={prize.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold">
                    {formatBRL(prize.required_amount)}
                  </div>
                </div>
                <div className="p-2 flex-1 flex flex-col justify-between">
                  <p className="text-xs font-semibold text-slate-800 line-clamp-1">{prize.name}</p>
                  <p className="text-[10px] text-slate-500 line-clamp-1">{prize.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Banners ativos em carrossel se houver */}
      {activeBanners.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
            Campanhas & Ofertas
          </h3>
          <Carousel className="w-full" opts={{ loop: true }}>
            <CarouselContent>
              {activeBanners.map((banner) => (
                <CarouselItem key={banner.id} className="basis-full">
                  <div className="relative aspect-[21/8] rounded-xl overflow-hidden shadow-sm bg-slate-100">
                    <img
                      src={bannerImage(banner)}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3">
                      <div>
                        <h4 className="text-white text-xs font-bold">{banner.title}</h4>
                        {banner.description && (
                          <p className="text-white/80 text-[11px] line-clamp-1">
                            {banner.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      )}

      {/* Nota de transparência (valores lidos de settings) */}
      <div className="rounded-xl bg-slate-100/90 p-3 text-[11px] text-slate-600 flex items-start gap-2 border border-slate-200">
        <Clock className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
        <div>
          <span className="font-semibold text-slate-700">Regras de transparência: </span>
          Compra mínima de {formatBRL(minPurchase)} para geração de cashback. O saldo gerado
          permanece pendente para conferência fiscal e fica disponível para resgate ou desconto após
          sua liberação no sistema.
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>
            Não foi possível atualizar as regras em tempo real. O acesso continua disponível.
          </span>
        </div>
      )}
    </div>
  )
}
