import { Link, useLocation } from 'react-router-dom'
import { Home, List, Gift, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { href: '/', icon: Home, label: 'Início' },
  { href: '/extrato', icon: List, label: 'Extrato' },
  { href: '/premios', icon: Gift, label: 'Prêmios' },
  { href: '/perfil', icon: User, label: 'Perfil' },
]

export function ConsumerBottomNav() {
  const location = useLocation()

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-white px-2 pb-safe">
      {items.map((item) => {
        const isActive = location.pathname === item.href
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              'flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className={cn('h-5 w-5', isActive && 'fill-primary/20')} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
