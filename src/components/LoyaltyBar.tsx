import React from 'react'
import { cn } from '@/lib/utils'

interface LoyaltyBarProps {
  label: string
  value: number
  color?: 'primary' | 'secondary' | 'error' | 'tertiary'
  showValue?: boolean
  valueLabel?: string
}

export const LoyaltyBar: React.FC<LoyaltyBarProps> = ({ label, value, color = 'primary', showValue = true, valueLabel }) => {
  const colorClass = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    error: 'bg-error',
    tertiary: 'bg-tertiary'
  }[color]

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between font-label text-[10px] uppercase text-gray-400">
        <span>{label}</span>
        {showValue && <span>{valueLabel ?? `${value}%`}</span>}
      </div>
      <div className="h-1 bg-surface-container-high w-full">
        <div
          className={cn('h-full transition-all duration-500', colorClass)}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  )
}
