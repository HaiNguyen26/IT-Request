import type { PriorityKey, StatusKey } from '../types'

export const priorityMeta: Record<
  PriorityKey,
  { label: string; slaHours: number; chipClass: string }
> = {
  urgent: {
    label: 'Khẩn cấp',
    slaHours: 4,
    chipClass:
      'bg-priority-urgent/10 text-priority-urgent border border-priority-urgent/40',
  },
  high: {
    label: 'Cao',
    slaHours: 8,
    chipClass:
      'bg-priority-high/10 text-priority-high border border-priority-high/40',
  },
  medium: {
    label: 'Trung bình',
    slaHours: 48,
    chipClass:
      'bg-priority-medium/10 text-priority-medium border border-priority-medium/40',
  },
  low: {
    label: 'Thấp',
    slaHours: 120,
    chipClass:
      'bg-priority-low/10 text-priority-low border border-priority-low/40',
  },
}

export const statusMeta: Record<
  StatusKey,
  { label: string; chipClass: string }
> = {
  new: {
    label: 'Mới',
    chipClass: 'bg-status-new/10 text-status-new border border-status-new/40',
  },
  inProgress: {
    label: 'Đang xử lý',
    chipClass:
      'bg-status-processing/10 text-status-processing border border-status-processing/40',
  },
  waiting: {
    label: 'Chờ phản hồi',
    chipClass:
      'bg-amber-400/15 text-amber-300 border border-amber-400/40',
  },
  completed: {
    label: 'Hoàn thành',
    chipClass:
      'bg-status-completed/10 text-status-completed border border-status-completed/40',
  },
}

export const avatarPalette = [
  'from-sky-400 to-blue-500',
  'from-violet-400 to-purple-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-rose-400 to-pink-500',
  'from-indigo-400 to-sky-500',
  'from-cyan-400 to-blue-500',
]
