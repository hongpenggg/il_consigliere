import type { FC } from 'react'
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  Castle,
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  Flag,
  Flame,
  Gavel,
  HandCoins,
  Handshake,
  Landmark,
  LogIn,
  LogOut,
  Map,
  MessageSquare,
  OctagonAlert,
  Play,
  ReceiptText,
  RefreshCw,
  Scale,
  Send,
  Shield,
  Sword,
  TriangleAlert,
  UserCog,
  UserRound,
  Users,
  Wallet,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ICON_MAP: Record<string, LucideIcon> = {
  account_balance: Landmark,
  account_circle: UserRound,
  arrow_back: ArrowLeft,
  arrow_forward: ArrowRight,
  attach_money: HandCoins,
  autorenew: RefreshCw,
  balance: Scale,
  bolt: Zap,
  castle: Castle,
  check: Check,
  close: X,
  crisis_alert: OctagonAlert,
  expand_less: ChevronUp,
  expand_more: ChevronDown,
  flag: Flag,
  forum: MessageSquare,
  gavel: Gavel,
  groups: Users,
  handshake: Handshake,
  local_fire_department: Flame,
  login: LogIn,
  logout: LogOut,
  manage_accounts: UserCog,
  map: Map,
  menu_book: BookOpen,
  military_tech: Sword,
  notifications: Bell,
  payments: Wallet,
  person: UserRound,
  play_arrow: Play,
  receipt_long: ReceiptText,
  refresh: RefreshCw,
  send: Send,
  shield: Shield,
  trending_down: ArrowDownLeft,
  trending_up: ArrowUpRight,
  visibility: Eye,
  warning: TriangleAlert,
}

const warnedMissingIcons = new Set<string>()

interface AppIconProps {
  name: string
  className?: string
}

export const AppIcon: FC<AppIconProps> = ({ name, className }) => {
  const mappedIcon = ICON_MAP[name]
  const Icon = mappedIcon ?? Shield
  if (!mappedIcon && import.meta.env.DEV && !warnedMissingIcons.has(name)) {
    warnedMissingIcons.add(name)
    console.warn(`Unknown icon name "${name}" passed to <AppIcon />`)
  }
  return <Icon aria-hidden className={cn('inline-block h-[1em] w-[1em] shrink-0 align-middle', className)} />
}
