import { statusMeta } from '../../constants/meta'
import type { StatusKey } from '../../types'

interface StatusBadgeProps {
  status: StatusKey
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const meta = statusMeta[status]
  
  // Màu sắc bão hòa cao và Box Shadow cùng màu cho từng status
  const statusGlowColors: Record<StatusKey, string> = {
    new: 'shadow-[0_2px_8px_rgba(99,102,241,0.5)]', // Indigo glow
    inProgress: 'shadow-[0_2px_8px_rgba(59,130,246,0.5)]', // Blue glow
    waiting: 'shadow-[0_2px_8px_rgba(251,191,36,0.5)]', // Amber glow
    completed: 'shadow-[0_2px_8px_rgba(34,197,94,0.5)]', // Green glow
  }
  
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold transition ${meta.chipClass} ${statusGlowColors[status]}`}
    >
      <span className="size-2 rounded-full bg-current" />
      {meta.label}
    </span>
  )
}
