import { useNavigate } from 'react-router-dom'
import { useGameStore } from '@/store/gameStore'
import { formatLira } from '@/lib/utils'

export default function TopBar() {
  const { player, notificationsOpen, setNotificationsOpen, intelReports } = useGameStore()
  const navigate = useNavigate()

  const criticalCount = intelReports.filter(
    (r) => r.severity === 'critical' || r.severity === 'high'
  ).length

  const heatColor =
    (player?.heat ?? 0) >= 80
      ? 'text-error'
      : (player?.heat ?? 0) >= 50
      ? 'text-[#ffb4ac]'
      : 'text-secondary'

  return (
    <header className="fixed top-0 left-0 right-0 h-20 z-50 bg-[#131313]/90 backdrop-blur-md border-b border-[#ffb4ac]/10 flex items-center justify-between px-6">
      {/* Logo */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-3 group"
      >
        <div className="w-8 h-8 border border-primary/40 flex items-center justify-center group-hover:border-primary transition-colors">
          <span
            className="material-symbols-outlined text-primary text-lg"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            shield
          </span>
        </div>
        <div>
          <p className="font-headline text-base font-bold text-on-surface leading-none">IL CONSIGLIERE</p>
          <p className="font-label text-[9px] uppercase tracking-widest text-primary/60">Cosa Nostra</p>
        </div>
      </button>

      {/* Centre stats */}
      {player && (
        <div className="hidden md:flex items-center gap-8">
          <Stat label="HEAT" value={`${player.heat}%`} valueClass={heatColor} />
          <Stat label="LOYALTY" value={`${player.loyalty}%`} valueClass="text-secondary" />
          <Stat label="TERRITORY" value={`${player.territoryControl}%`} valueClass="text-on-surface" />
          <Stat label="TREASURY" value={formatLira(player.wealth)} valueClass="text-secondary" />
        </div>
      )}

      {/* Right actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button
          onClick={() => setNotificationsOpen(!notificationsOpen)}
          className="relative w-10 h-10 flex items-center justify-center hover:bg-surface-container transition-colors"
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined text-on-surface-variant hover:text-on-surface text-xl">
            notifications
          </span>
          {criticalCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-error text-on-error text-[9px] font-bold rounded-full flex items-center justify-center">
              {criticalCount}
            </span>
          )}
        </button>

        {/* Player name */}
        {player && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 border border-primary/10 bg-surface-container-low">
            <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            <span className="font-label text-xs text-on-surface-variant">{player.name}</span>
          </div>
        )}
      </div>
    </header>
  )
}

function Stat({ label, value, valueClass }: { label: string; value: string; valueClass: string }) {
  return (
    <div className="text-center">
      <p className="font-label text-[9px] uppercase tracking-widest text-on-surface/40">{label}</p>
      <p className={`font-label text-sm font-bold tabular-nums ${valueClass}`}>{value}</p>
    </div>
  )
}
