import type { FC } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useGameStore } from '@/store/gameStore'
import { useSupabaseAuth } from '@/hooks/useSupabase'
import { formatLira } from '@/lib/utils'

const NAV_ITEMS = [
  { path: '/command',  icon: 'castle',         label: 'Command Center' },
  { path: '/ledger',   icon: 'payments',        label: 'Ledger' },
  { path: '/war-room', icon: 'military_tech',   label: 'War Room' },
  { path: '/dialogue', icon: 'forum',           label: 'Intelligence' },
  { path: '/diplomacy',icon: 'gavel',           label: 'Diplomacy' },
  { path: '/tutorial', icon: 'menu_book',       label: 'Tutorial' },
]

export const SideNav: FC = () => {
  const { player, resetGame } = useGameStore()
  const { signOut } = useSupabaseAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    resetGame()
    sessionStorage.removeItem('il_consigliere_player')
    navigate('/')
  }

  return (
    <aside className="fixed left-0 top-20 h-[calc(100vh-80px)] flex flex-col z-40 bg-[#1c1c1c] w-64 border-r border-[#ffb4ac]/15 shadow-[40px_0_60px_-15px_rgba(0,0,0,0.5)]">
      {/* Family Header */}
      <div className="p-6 border-b border-[#ffb4ac]/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-surface-container-high flex items-center justify-center border border-primary/20">
            <span
              className="material-symbols-outlined text-primary text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              shield
            </span>
          </div>
          <div>
            <h3 className="font-headline text-lg font-bold text-on-surface leading-tight">
              {player?.familyName ?? 'Corleone'} Family
            </h3>
            <p className="font-label text-[10px] text-primary uppercase tracking-tighter">
              Rank: {player?.rank ?? 'Capo dei Capi'}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-6 py-4 font-label uppercase tracking-tighter text-xs active:scale-[0.98] transition-all ${
                isActive
                  ? 'text-[#ffb4ac] bg-[#89070e]/10 border-r-4 border-[#89070e]'
                  : 'text-gray-400 hover:text-white hover:bg-[#252525]'
              }`
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto border-t border-[#ffb4ac]/10 p-4 flex flex-col gap-2">
        <div className="px-2 py-2">
          <p className="font-label text-[9px] uppercase text-gray-500">Treasury</p>
          <p className="font-label text-sm text-secondary font-bold">
            {formatLira(player?.wealth ?? 1200000)}
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="w-full bg-primary/10 border border-primary/20 text-primary py-3 font-label text-[10px] uppercase tracking-widest hover:bg-primary/20 transition-all"
        >
          Expand Territory
        </button>
        <div className="flex justify-between items-center px-2 mt-2">
          <button
            onClick={() => navigate('/auth')}
            className="flex items-center gap-1 text-gray-500 hover:text-on-surface transition-colors"
            title="Account settings"
          >
            <span className="material-symbols-outlined text-sm">manage_accounts</span>
          </button>
          <button
            onClick={() => void handleSignOut()}
            className="flex items-center gap-1 font-label text-[10px] uppercase tracking-widest text-gray-500 hover:text-error transition-colors"
            title="Sign out"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
