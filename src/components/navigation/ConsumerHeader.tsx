import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, LogOut, User as UserIcon, Store, Fuel } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getReleasedCashbackByUser } from '@/services/cashback'
import { formatBRLPlain } from '@/lib/format'
import pb from '@/lib/pocketbase/client'

const PB_URL = import.meta.env.VITE_POCKETBASE_URL

interface CategorizedBalance {
  store: number
  fuel: number
}

export function ConsumerHeader() {
  const { user, signOut, loading } = useAuth()
  const navigate = useNavigate()
  const [balance, setBalance] = useState<CategorizedBalance>({ store: 0, fuel: 0 })
  const [balanceLoading, setBalanceLoading] = useState(true)

  const loadBalance = useCallback(async () => {
    if (!user?.id) return
    try {
      const records: any[] = await getReleasedCashbackByUser(user.id)
      const store = records
        .filter((r) => r.type === 'loja')
        .reduce((sum, r) => sum + (r.amount_available || 0), 0)
      const fuel = records
        .filter((r) => r.type === 'combustivel')
        .reduce((sum, r) => sum + (r.amount_available || 0), 0)
      setBalance({ store, fuel })
    } catch {
      setBalance({ store: 0, fuel: 0 })
    } finally {
      setBalanceLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (!user?.id) {
      setBalanceLoading(false)
      return
    }
    setBalanceLoading(true)
    loadBalance()
  }, [loadBalance, user?.id])

  useRealtime('cashback', () => loadBalance())
  useRealtime('purchases', () => loadBalance())

  const avatarUrl = user?.avatar ? `${PB_URL}/api/files/users/${user.id}/${user.avatar}` : undefined

  const initials = (user?.name || 'U')
    .split(' ')
    .slice(0, 2)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()

  const handleSignOut = () => {
    signOut()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-bold">
            F
          </div>
          <span className="font-bold text-lg hidden sm:inline-block">Fidelidade</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full">
              <Store className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">Loja:</span>
              {balanceLoading ? (
                <Skeleton className="h-4 w-12" />
              ) : (
                <span className="font-semibold text-sm">R$ {formatBRLPlain(balance.store)}</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-full">
              <Fuel className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-medium text-amber-700/80">Postos:</span>
              {balanceLoading ? (
                <Skeleton className="h-4 w-12" />
              ) : (
                <span className="font-semibold text-sm text-amber-700">
                  R$ {formatBRLPlain(balance.fuel)}
                </span>
              )}
            </div>
          </div>

          <div className="flex md:hidden items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 rounded-full">
            <Store className="h-3.5 w-3.5 text-primary" />
            {balanceLoading ? (
              <Skeleton className="h-3 w-8" />
            ) : (
              <span className="font-semibold text-xs">{formatBRLPlain(balance.store)}</span>
            )}
            <Fuel className="h-3.5 w-3.5 text-amber-600 ml-1" />
            {balanceLoading ? (
              <Skeleton className="h-3 w-8" />
            ) : (
              <span className="font-semibold text-xs text-amber-700">
                {formatBRLPlain(balance.fuel)}
              </span>
            )}
          </div>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                {loading ? (
                  <Skeleton className="h-8 w-8 rounded-full" />
                ) : (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={avatarUrl} alt="Avatar" />
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name || 'Usuário'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/perfil">
                  <UserIcon className="h-4 w-4 mr-2" /> Meu Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/admin">Acessar Admin (Demo)</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" /> Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
