import type { FC } from 'react'
import { cn } from '@/lib/utils'

export interface StatChipProps {
  icon?: string
  label: string
  value: string
  iconColor?: string
  valueClassName?: string
}

export const StatChip: FC<StatChipProps> = ({
  icon,
  label,
  value,
  iconColor = 'text-secondary',
  valueClassName,
}) => {
  return (
    <div className="flex items-center gap-3">
      {icon && (
        <span className={cn('material-symbols-outlined', iconColor)}>{icon}</span>
      )}
      <div className="flex flex-col">
        <span className="font-label text-[10px] uppercase text-gray-500 leading-none">{label}</span>
        <span className={cn('font-label text-sm text-on-surface font-bold', valueClassName)}>
          {value}
        </span>
      </div>
    </div>
  )
}
