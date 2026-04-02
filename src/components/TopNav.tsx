import React from 'react'
import { Link } from 'react-router-dom'
import { useGameStore } from '@/store/gameStore'
import { formatLira } from '@/lib/utils'

interface TopNavProps {
  showGameStats?: boolean
}

export const TopNav: React.FC<TopNavProps> = ({ showGameStats = true }) => {
  const { player } = useGameStore()

  return (
    <header className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-20 bg-[#131313]">
      <div className="flex items-center gap-6">
        <Link to="/" className="text-2xl font-black uppercase tracking-widest text-[#ffb4ac] font-headline">
          Il Consigliere
        </Link>
        <div className="h-8 w-px bg-outline-variant/30 hidden md:block" />
        <div className="hidden md:flex gap-8">
          {[['Dossier', '/dossier'], ['Command', '/command'], ['War Room', '/war-room'], ['Ledger', '/ledger']].map(([label, path]) => (
            <Link
              key={label}
              to={path}
              className="text-gray-500 font-medium font-headline tracking-tight hover:text-[#ffb4ac] transition-colors duration-300"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {showGameStats && (
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary">account_balance_wallet</span>
            <div className="flex flex-col">
              <span className="font-label text-[10px] uppercase text-gray-500 leading-none">Wealth</span>
              <span className="font-label text-sm text-on-surface font-bold">{formatLira(player?.wealth ?? 1200000)}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">military_tech</span>
            <div className="flex flex-col">
              <span className="font-label text-[10px] uppercase text-gray-500 leading-none">Army</span>
              <span className="font-label text-sm text-on-surface font-bold">{(player?.soldiers ?? 450).toLocaleString()} Soldiers</span>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="material-symbols-outlined text-gray-400 hover:text-[#ffb4ac] cursor-pointer transition-colors">notifications</span>
            <Link
              to="/command"
              className="bg-[#89070e] text-on-primary-container px-6 py-2 font-label text-xs uppercase tracking-widest active:translate-y-px active:translate-x-px transition-all"
            >
              Execute Order
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
