import type { ServiceRequest, StatusKey } from '../types'

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

export function timeRemaining(target: string) {
  const diff = new Date(target).getTime() - Date.now()
  const abs = Math.abs(diff)
  const hours = Math.floor(abs / (1000 * 60 * 60))
  const minutes = Math.max(0, Math.round((abs % (1000 * 60 * 60)) / (1000 * 60)))

  if (diff >= 0) {
    if (hours === 0 && minutes === 0) return 'Còn < 1 phút'
    return `Còn ${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`
  }
  if (hours === 0 && minutes === 0) return 'Vừa quá hạn'
  return `Quá hạn ${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`
}

export function slaSeverity(target: string, status: StatusKey) {
  if (status === 'completed') return 'completed'

  const diff = new Date(target).getTime() - Date.now()
  if (diff < 0) return 'breached'
  if (diff < 1000 * 60 * 60) return 'warning'
  return 'ok'
}

export function slaProgress(request: ServiceRequest) {
  const created = new Date(request.createdAt).getTime()
  const target = new Date(request.targetSla).getTime()
  const duration = target - created
  if (duration <= 0) {
    return 100
  }

  const elapsed = Date.now() - created
  const ratio = (elapsed / duration) * 100
  return Math.min(100, Math.max(10, ratio))
}
