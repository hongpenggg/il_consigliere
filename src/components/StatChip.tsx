import React from 'react'
import { cn } from '@/lib/utils'

interface StatChipProps {
  icon: string
  label: string
  value: string
  iconColor?: string
}

export const StatChip: React.FC<StatChipProps> = ({ icon, label, value, iconColor = 'text-secondary' }) => {
  return (
    <div className="flex items-center gap-3">
      <span className={cn('material-symbols-outlined', iconColor)}>{icon}</span>
      <div className="flex flex-col">
        <span className="font-label text-[10px] uppercase text-gray-500 leading-none">{label}</span>
        <span className="font-label text-sm text-on-surface font-bold">{value}</span>
      </div>
    </div>
  )
}
