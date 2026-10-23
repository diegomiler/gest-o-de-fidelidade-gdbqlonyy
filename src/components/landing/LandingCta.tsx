import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'

interface LandingCtaProps {
  /** Destino para visitantes: cadastro ou login. */
  intent: 'signup' | 'login'
  variant: 'primary' | 'accent' | 'outline' | 'outline-light'
  size?: 'md' | 'lg'
  className?: string
  children: string
}

/**
 * Botão de chamada para ação. Usuário já autenticado vê "Ir para minha conta"
 * em vez das ações de entrar/cadastrar.
 */
export function LandingCta({ intent, variant, size = 'md', className = '', children }: LandingCtaProps) {
  const { isAuthenticated } = useAuth()
  const to = isAuthenticated ? '/conta' : intent === 'signup' ? '/login?modo=cadastro' : '/login'
  const label = isAuthenticated ? 'Ir para minha conta' : children

  return (
    <Link
      to={to}
      className={`lp-btn lp-btn--${variant} ${size === 'lg' ? 'lp-btn--lg' : ''} ${className}`}
    >
      {label}
    </Link>
  )
}
