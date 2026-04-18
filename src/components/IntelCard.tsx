import type { FC } from 'react'
import type { IntelReport } from '@/types'
import { cn } from '@/lib/utils'
import { AppIcon } from '@/components/AppIcon'

interface IntelCardProps {
  report: IntelReport
  compact?: boolean
}

export const IntelCard: FC<IntelCardProps> = ({ report, compact = false }) => {
  const severityStyles = {
    critical: 'border-error text-error bg-error-container/10',
    high: 'border-primary text-primary bg-primary/5',
    medium: 'border-secondary text-secondary bg-secondary/5',
    low: 'border-outline-variant text-on-surface-variant bg-transparent',
  }

  return (
    <div
      className={cn(
        'p-4 border-l-2 transition-all',
        severityStyles[report.severity],
        compact ? 'p-3' : 'p-4'
      )}
      >
      <div className="flex items-center gap-2 mb-1">
        <AppIcon name="warning" className="text-sm" />
        <span className="font-label text-[10px] uppercase font-bold tracking-widest">
          {report.severity.toUpperCase()} ALERT
        </span>
      </div>
      <p className="text-[11px] font-body leading-relaxed opacity-80">{report.description}</p>
      {report.territory && (
        <p className="font-label text-[9px] uppercase mt-2 opacity-60">{report.territory}</p>
      )}
    </div>
  )
}
