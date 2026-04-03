import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatLira(n: number): string {
  if (n >= 1_000_000) return `₤${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `₤${(n / 1_000).toFixed(1)}K`
  return `₤${n.toLocaleString()}`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
