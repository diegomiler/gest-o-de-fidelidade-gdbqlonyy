interface LpSkeletonProps {
  className?: string
  /** Use em seções de fundo escuro. */
  dark?: boolean
}

/** Skeleton de carregamento usando apenas tokens da landing. */
export function LpSkeleton({ className = '', dark = false }: LpSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-control ${dark ? 'bg-brand-primary-dark' : 'bg-brand-border'} ${className}`}
    />
  )
}
