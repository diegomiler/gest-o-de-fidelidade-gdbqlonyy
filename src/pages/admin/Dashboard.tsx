import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, Users, Wallet, Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useRealtime } from '@/hooks/use-realtime'
import { getAdminStats, type AdminStats } from '@/services/admin'
import { getAllBanners } from '@/services/banners'
import { formatBRL, formatDate, bannerImage, getFileUrl } from '@/lib/format'

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [banners, setBanners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const [s, b] = await Promise.all([getAdminStats(), getAllBanners()])
      setStats(s)
      setBanners(b)
    } catch {
      /* intentionally ignored */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('purchases', () => loadData())
  useRealtime('cashback', () => loadData())

  if (loading || !stats) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    )
  }

  const chartData = stats.chartData.map((d) => ({
    date: new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    sales: d.sales,
    cashback: d.cashback,
  }))

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Totais</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBRL(stats.totalSales)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cashback Gerado</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBRL(stats.totalCashback)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalSales > 0
                ? ((stats.totalCashback / stats.totalSales) * 100).toFixed(1)
                : 0}
              % conversão
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resgates</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.redemptionCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Prêmios solicitados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.userCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Vendas vs Cashback</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <ChartContainer
              config={{
                sales: { label: 'Vendas', color: 'hsl(var(--chart-1))' },
                cashback: { label: 'Cashback', color: 'hsl(var(--chart-2))' },
              }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-sales)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-sales)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.5} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    tickFormatter={(val) => `R$${val}`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="var(--color-sales)"
                    fillOpacity={1}
                    fill="url(#colorSales)"
                  />
                  <Area
                    type="monotone"
                    dataKey="cashback"
                    stroke="var(--color-cashback)"
                    fill="none"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Top Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {stats.topClients.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum cliente encontrado.</p>
              )}
              {stats.topClients.map((c, i) => {
                const avatarUrl = c.avatar
                  ? `${import.meta.env.VITE_POCKETBASE_URL}/api/files/users/${c.id}/${c.avatar}`
                  : `https://img.usecurling.com/ppl/thumbnail?seed=${i + 1}`
                return (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={avatarUrl} />
                        <AvatarFallback>{c.name?.[0] || 'C'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.purchases} compras</p>
                      </div>
                    </div>
                    <div className="text-sm font-bold">{formatBRL(c.total)}</div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance de Banners</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Banner</TableHead>
                <TableHead>Campanha</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Período</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>
                    <img
                      src={bannerImage(b)}
                      alt={b.title}
                      className="w-24 h-8 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{b.title}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${b.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}
                    >
                      {b.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {b.start_date ? formatDate(b.start_date) : '—'} até{' '}
                    {b.end_date ? formatDate(b.end_date) : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
