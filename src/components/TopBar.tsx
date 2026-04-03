import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '@/store/gameStore'
import { useSupabaseAuth } from '@/hooks/useSupabase'
import { formatLira } from '@/lib/utils'

export default function TopBar() {
  const { player, notificationsOpen, setNotificationsOpen, intelReports, resetGame, userId } = useGameStore()
  const { signOut } = useSupabaseAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const criticalCount = intelReports.filter(
    (r) => r.severity === 'critical' || r.severity === 'high'
  ).length

  const heatColor =
    (player?.heat ?? 0) >= 80
      ? 'text-error'
      : (player?.heat ?? 0) >= 50
      ? 'text-[#ffb4ac]'
      : 'text-secondary'

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleSignOut() {
    setMenuOpen(false)
    await signOut()
    resetGame()
    sessionStorage.removeItem('il_consigliere_player')
    navigate('/')
  }

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

        {/* Player menu */}
        {player && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 px-3 py-2 border border-primary/10 bg-surface-container-low hover:border-primary/30 transition-colors"
            >
              <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
              <span className="hidden sm:block font-label text-xs text-on-surface-variant">{player.name}</span>
              <span className="material-symbols-outlined text-on-surface/30 text-sm">
                {menuOpen ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-[#1c1c1c] border border-[#ffb4ac]/15 shadow-lg z-50">
                {/* User info */}
                <div className="px-4 py-3 border-b border-[#ffb4ac]/10">
                  <p className="font-label text-[10px] uppercase tracking-widest text-on-surface/60">Signed in as</p>
                  <p className="font-label text-xs text-on-surface mt-0.5 truncate">
                    {userId ? 'Authenticated' : 'Guest Session'}
                  </p>
                </div>
                {/* Auth actions */}
                {!userId && (
                  <button
                    onClick={() => { setMenuOpen(false); navigate('/auth') }}
                    className="w-full flex items-center gap-3 px-4 py-3 font-label text-xs text-on-surface hover:bg-surface-container transition-colors text-left"
                  >
                    <span className="material-symbols-outlined text-sm">login</span>
                    Sign In to Save
                  </button>
                )}
                <button
                  onClick={() => void handleSignOut()}
                  className="w-full flex items-center gap-3 px-4 py-3 font-label text-xs text-error hover:bg-error/10 transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-sm">logout</span>
                  Sign Out
                </button>
              </div>
            )}
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
