import type { FC, ReactNode, CSSProperties } from 'react'
import { cn } from '@/lib/utils'

interface GlassPanelProps {
  children: ReactNode
  className?: string
  border?: 'left' | 'top' | 'none'
  borderColor?: string
  style?: CSSProperties
}

export const GlassPanel: FC<GlassPanelProps> = ({
  children,
  className,
  border = 'none',
  borderColor = 'border-primary/30',
  style,
}) => {
  const borderClass =
    border === 'left'
      ? `border-l-2 ${borderColor}`
      : border === 'top'
      ? `border-t ${borderColor}`
      : ''

  return (
    <div className={cn('glass-panel', borderClass, className)} style={style}>
      {children}
    </div>
  )
}
