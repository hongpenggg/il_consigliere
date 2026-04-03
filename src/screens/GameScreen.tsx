import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '@/store/gameStore'
import { useAIGenerator } from '@/hooks/useAIGenerator'
import { SideNav } from '@/components/SideNav'
import { TopNav } from '@/components/TopNav'
import { GlassPanel } from '@/components/GlassPanel'
import { IntelCard } from '@/components/IntelCard'
import { LoyaltyBar } from '@/components/LoyaltyBar'
import { StatChip } from '@/components/StatChip'
import type { FamilyMember } from '@/types'

// ── Map FamilyMember loyalty → LoyaltyBar color ───────────────────────────────
function memberColor(
  loyalty: number
): 'primary' | 'secondary' | 'error' | 'tertiary' {
  if (loyalty >= 75) return 'primary'
  if (loyalty >= 50) return 'secondary'
  if (loyalty >= 25) return 'tertiary'
  return 'error'
}

function FamilyMemberBar({ member }: { member: FamilyMember }) {
  const statusLabel =
    member.status === 'active'
      ? ''
      : ` · ${member.status.charAt(0).toUpperCase() + member.status.slice(1)}`

  return (
    <LoyaltyBar
      label={`${member.name} — ${member.role}${statusLabel}`}
      value={member.loyalty}
      color={memberColor(member.loyalty)}
      showValue
    />
  )
}

export default function GameScreen() {
  const navigate = useNavigate()
  const { player, currentEvent, isGenerating, familyMembers, intelReports } =
    useGameStore()
  const { generateNarrative, handleChoice } = useAIGenerator()

  useEffect(() => {
    if (!player) {
      navigate('/setup', { replace: true })
    }
  }, [player, navigate])

  useEffect(() => {
    if (player && !currentEvent) {
      generateNarrative(
        `Opening scene. ${player.name} of the ${
          player.familyName
        } family begins their rise to power in ${
          player.territory === 'italy' ? 'Italy, 1947' : 'New York, 1947'
        }.`,
        'game_start'
      )
    }
  }, [player, currentEvent, generateNarrative])

  if (!player) return null

  const heatColor =
    player.heat >= 75
      ? 'text-error'
      : player.heat >= 50
      ? 'text-secondary'
      : 'text-on-surface'

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNav />

      <div className="flex flex-1 overflow-hidden">
        <SideNav />

        <main className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
          {/* Stat chips row */}
          <div className="flex flex-wrap gap-6">
            <StatChip
              icon="payments"
              label="Wealth"
              value={`$${(player.wealth / 1_000_000).toFixed(2)}M`}
            />
            <StatChip
              icon="handshake"
              label="Loyalty"
              value={`${player.loyalty}%`}
            />
            <StatChip
              icon="groups"
              label="Soldiers"
              value={String(player.soldiers)}
            />
            <StatChip
              icon="map"
              label="Territory"
              value={`${player.territoryControl}%`}
            />
            <StatChip
              icon="local_fire_department"
              label="Heat"
              value={`${player.heat}%`}
              iconColor={heatColor}
              valueClassName={heatColor}
            />
          </div>

          {/* Narrative panel */}
          <GlassPanel>
            {isGenerating ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-surface-container-high rounded w-3/4" />
                <div className="h-4 bg-surface-container-high rounded w-full" />
                <div className="h-4 bg-surface-container-high rounded w-5/6" />
              </div>
            ) : currentEvent ? (
              <div className="space-y-6">
                <p className="font-body text-on-surface leading-relaxed text-base">
                  {currentEvent.content}
                </p>

                {currentEvent.choices.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <p className="font-label text-[10px] uppercase tracking-widest text-primary/60">
                      Your Move
                    </p>
                    {currentEvent.choices.map((choice) => (
                      <button
                        key={choice.id}
                        onClick={() => handleChoice(choice, currentEvent)}
                        className="group w-full text-left p-4 border border-outline-variant/20 bg-surface-container-low hover:border-primary/40 hover:bg-primary-container/30 transition-all"
                      >
                        <p className="font-body text-sm text-on-surface group-hover:text-primary transition-colors">
                          {choice.text}
                        </p>
                        {choice.label && (
                          <p className="font-label text-[10px] uppercase tracking-wide text-on-surface/40 mt-1">
                            {choice.label}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="font-body text-on-surface-variant italic text-sm">
                The city stirs. Your story is about to begin...
              </p>
            )}
          </GlassPanel>

          {/* Intel reports */}
          {intelReports.length > 0 && (
            <div className="space-y-3">
              <p className="font-label text-[10px] uppercase tracking-widest text-primary/60">
                Intel Briefing
              </p>
              {intelReports.slice(0, 3).map((report) => (
                <IntelCard key={report.id} report={report} />
              ))}
            </div>
          )}

          {/* Family loyalty bars */}
          {familyMembers.length > 0 && (
            <div className="space-y-3">
              <p className="font-label text-[10px] uppercase tracking-widest text-primary/60">
                Family Status
              </p>
              {familyMembers.map((member) => (
                <FamilyMemberBar key={member.id} member={member} />
              ))}
            </div>
          )}

          {/* Conclude story CTA */}
          <div className="pt-4">
            <button
              onClick={() => navigate('/conclude')}
              className="font-label text-[10px] uppercase tracking-widest text-on-surface/30 hover:text-on-surface/60 transition-colors"
            >
              → Conclude Story
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}
