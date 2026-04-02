export const formatLira = (amount: number): string => {
  const abs = Math.abs(amount)
  if (abs >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M Lira`
  if (abs >= 1_000) return `${(amount / 1_000).toFixed(0)}K Lira`
  return `${amount.toLocaleString()} Lira`
}

export const cn = (...classes: (string | undefined | false | null)[]): string =>
  classes.filter(Boolean).join(' ')

export const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'critical': return 'text-error border-error'
    case 'high': return 'text-primary border-primary'
    case 'medium': return 'text-secondary border-secondary'
    default: return 'text-on-surface-variant border-outline-variant'
  }
}

export const getRankLabel = (heat: number): string => {
  if (heat >= 80) return 'BURNED'
  if (heat >= 60) return 'HOT'
  if (heat >= 40) return 'WARM'
  if (heat >= 20) return 'COOL'
  return 'CLEAN'
}

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
