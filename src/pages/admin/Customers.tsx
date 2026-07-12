import { useState, useEffect, useCallback } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useRealtime } from '@/hooks/use-realtime'
import { getAdminCustomers, type AdminCustomer } from '@/services/admin'
import { formatBRL, formatDate } from '@/lib/format'

const PB_URL = import.meta.env.VITE_POCKETBASE_URL

function getAvatarUrl(customer: AdminCustomer): string | undefined {
  if (!customer.avatar) return undefined
  return `${PB_URL}/api/files/users/${customer.id}/${customer.avatar}`
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([])
  const [filtered, setFiltered] = useState<AdminCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const loadData = useCallback(async () => {
    try {
      const { customers: data } = await getAdminCustomers()
      setCustomers(data)
      setFiltered(data)
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

  useEffect(() => {
    if (!search) {
      setFiltered(customers)
      return
    }
    const q = search.toLowerCase()
    setFiltered(
      customers.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.cpf?.includes(q) ||
          c.email?.toLowerCase().includes(q),
      ),
    )
  }, [search, customers])

  if (loading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-16" />
        <Skeleton className="h-96" />
      </div>
    )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, CPF, e-mail..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead className="text-right">Compras</TableHead>
                <TableHead className="text-right">Total Gasto</TableHead>
                <TableHead className="text-right">Cashback Disponível</TableHead>
                <TableHead>Cadastro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 shrink-0">
                        <Avatar className="aspect-square h-full w-full">
                          <AvatarImage src={getAvatarUrl(c)} alt={c.name || 'Cliente'} />
                          <AvatarFallback className="text-xs">
                            {c.name?.[0]?.toUpperCase() || 'C'}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{c.name || '—'}</p>
                        <p className="text-xs text-muted-foreground">{c.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{c.cpf || '—'}</TableCell>
                  <TableCell className="text-sm">{c.phone || '—'}</TableCell>
                  <TableCell className="text-right">{c.purchaseCount}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatBRL(c.totalSpent)}
                  </TableCell>
                  <TableCell className="text-right text-primary">
                    {formatBRL(c.cashbackTotal)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {c.created ? formatDate(c.created) : '—'}
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
