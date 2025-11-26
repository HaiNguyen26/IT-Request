import type { FC } from 'react'
import { priorityMeta } from '../../constants/meta'
import type { PriorityKey } from '../../types'

interface PriorityBadgeProps {
    priority: PriorityKey
}

export const PriorityBadge: FC<PriorityBadgeProps> = ({ priority }) => {
    const meta = priorityMeta[priority]

    // Màu sắc bão hòa cao và Box Shadow cùng màu cho từng priority
    const priorityGlowColors: Record<PriorityKey, string> = {
        urgent: 'shadow-[0_2px_8px_rgba(239,68,68,0.5)]', // Đỏ rực (#ef4444)
        high: 'shadow-[0_2px_8px_rgba(239,68,68,0.5)]', // Đỏ rực
        medium: 'shadow-[0_2px_8px_rgba(250,204,21,0.5)]', // Vàng rực
        low: 'shadow-[0_2px_8px_rgba(34,197,94,0.5)]', // Xanh lá rực
    }

    return (
        <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold transition ${meta.chipClass} ${priorityGlowColors[priority]}`}
        >
            <span className="size-2 rounded-full bg-current" />
            {meta.label}
        </span>
    )
}
