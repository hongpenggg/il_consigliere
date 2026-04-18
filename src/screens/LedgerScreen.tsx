import { useMemo, useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { GlassPanel } from '@/components/GlassPanel'
import { AppIcon } from '@/components/AppIcon'
import { formatLira } from '@/lib/utils'
import type { LedgerType } from '@/types'

const TYPE_STYLE: Record<LedgerType, { badge: string; sign: string }> = {
  income:     { badge: 'bg-secondary/10 text-secondary border-secondary/30', sign: '+' },
  tribute:    { badge: 'bg-secondary/10 text-secondary border-secondary/30', sign: '+' },
  investment: { badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20', sign: '-' },
  expense:    { badge: 'bg-on-surface/10 text-on-surface/50 border-outline-variant/20', sign: '' },
  bribe:      { badge: 'bg-error/10 text-error border-error/20', sign: '-' },
  penalty:    { badge: 'bg-error/10 text-error border-error/20', sign: '-' },
}

export default function LedgerScreen() {
  const { ledgerEntries, player } = useGameStore()
  const [filter, setFilter] = useState<LedgerType | 'all'>('all')

  const filtered = useMemo(() =>
    filter === 'all' ? ledgerEntries : ledgerEntries.filter(e => e.type === filter),
  [ledgerEntries, filter])

  const totalIn = ledgerEntries
    .filter(e => e.amount > 0)
    .reduce((s, e) => s + e.amount, 0)
  const totalOut = ledgerEntries
    .filter(e => e.amount < 0)
    .reduce((s, e) => s + e.amount, 0)

  const TYPES: Array<LedgerType | 'all'> = ['all', 'income', 'tribute', 'bribe', 'expense', 'investment', 'penalty']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-label text-[10px] uppercase tracking-[0.4em] text-primary/60">Financial Records</p>
          <h1 className="font-headline text-3xl italic text-on-surface">The Ledger</h1>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard label="Current Wealth" value={formatLira(player?.wealth ?? 0)} valueClass="text-secondary" icon="account_balance" />
        <SummaryCard label="Total Inflows" value={formatLira(totalIn)} valueClass="text-secondary" icon="trending_up" />
        <SummaryCard label="Total Outflows" value={formatLira(Math.abs(totalOut))} valueClass="text-error" icon="trending_down" />
        <SummaryCard label="Transactions" value={String(ledgerEntries.length)} valueClass="text-on-surface" icon="receipt_long" />
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`font-label text-[10px] uppercase tracking-widest px-4 py-2 border transition-all ${
              filter === t
                ? 'border-primary bg-primary-container/40 text-primary'
                : 'border-outline-variant/20 text-on-surface/40 hover:text-on-surface hover:border-outline-variant/50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Entries */}
      <GlassPanel className="p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-outline-variant/20">
              {['Description', 'Type', 'Territory', 'Amount'].map((h) => (
                <th key={h} className="px-5 py-4 text-left font-label text-[9px] uppercase tracking-widest text-on-surface/30">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center">
                  <AppIcon name="receipt_long" className="text-on-surface/20 text-4xl mb-2" />
                  <p className="font-label text-xs uppercase tracking-widest text-on-surface/30">No entries found</p>
                </td>
              </tr>
            ) : (
              filtered.map((entry, i) => {
                const style = TYPE_STYLE[entry.type] ?? TYPE_STYLE.expense
                const amountStr = entry.amount === 0 ? '—' : `${style.sign}${formatLira(Math.abs(entry.amount))}`
                const amountClass = entry.amount > 0 ? 'text-secondary' : entry.amount < 0 ? 'text-error' : 'text-on-surface/40'
                return (
                  <tr
                    key={entry.id}
                    className={`border-b border-outline-variant/10 hover:bg-surface-container/50 transition-colors ${
                      i % 2 === 0 ? '' : 'bg-surface-container-low/30'
                    }`}
                  >
                    <td className="px-5 py-4">
                      <p className="font-body text-sm text-on-surface">{entry.description}</p>
                      <p className="font-label text-[10px] text-on-surface/30 mt-0.5">
                        {new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`font-label text-[9px] uppercase tracking-widest px-2 py-1 border rounded-sm ${style.badge}`}>
                        {entry.type}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-label text-xs text-on-surface/40">{entry.territory ?? '—'}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className={`font-label text-sm font-bold tabular-nums ${amountClass}`}>{amountStr}</span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </GlassPanel>
    </div>
  )
}

function SummaryCard({ label, value, valueClass, icon }: { label: string; value: string; valueClass: string; icon: string }) {
  return (
    <div className="bg-surface-container-low border border-outline-variant/15 p-5 flex items-start justify-between">
      <div>
        <p className="font-label text-[10px] uppercase tracking-widest text-on-surface/40 mb-2">{label}</p>
        <p className={`font-label text-xl font-bold tabular-nums ${valueClass}`}>{value}</p>
      </div>
      <AppIcon name={icon} className="text-on-surface/20 text-2xl" />
    </div>
  )
}
