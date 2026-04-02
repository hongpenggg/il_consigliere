import React from 'react'
import { cn } from '@/lib/utils'

interface GlassPanelProps {
  children: React.ReactNode
  className?: string
  border?: 'left' | 'top' | 'none'
  borderColor?: string
}

export const GlassPanel: React.FC<GlassPanelProps> = ({ children, className, border = 'none', borderColor = 'border-primary/30' }) => {
  const borderClass = border === 'left'
    ? `border-l-2 ${borderColor}`
    : border === 'top'
    ? `border-t ${borderColor}`
    : ''

  return (
    <div className={cn('glass-panel', borderClass, className)}>
      {children}
    </div>
  )
}
