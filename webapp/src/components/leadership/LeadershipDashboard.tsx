import { PriorityBadge } from '../common/PriorityBadge'
import { StatusBadge } from '../common/StatusBadge'
import { timeRemaining, slaSeverity } from '../../utils/time'
import type { ServiceRequest, SlaOverview } from '../../types'


import type { Employee } from '../../types'

interface LeadershipDashboardProps {
  requests: ServiceRequest[]
  overview: SlaOverview
  profile: Employee
}

const formatHoursMinutes = (hours: number | null): string => {
  if (hours === null || Number.isNaN(hours)) {
    return '—'
  }
  const wholeHours = Math.floor(hours)
  const minutes = Math.round((hours - wholeHours) * 60)
  const normalizedMinutes = minutes === 60 ? 0 : minutes
  const normalizedHours = minutes === 60 ? wholeHours + 1 : wholeHours
  return `${normalizedHours}h ${normalizedMinutes.toString().padStart(2, '0')}m`
}

const isSlaMet = (request: ServiceRequest) => {
  if (request.status !== 'completed' || !request.completedAt) return false
  const completedAt = new Date(request.completedAt).getTime()
  const slaDeadline = new Date(request.targetSla).getTime()
  return completedAt <= slaDeadline
}

const getQuarterRange = (baseDate: Date) => {
  const quarter = Math.floor(baseDate.getMonth() / 3)
  const start = new Date(baseDate.getFullYear(), quarter * 3, 1)
  const end = new Date(start)
  end.setMonth(end.getMonth() + 3)
  return { start, end }
}

export const LeadershipDashboard = ({ requests, overview, profile }: LeadershipDashboardProps) => {
  const now = new Date()
  const { start: currentQuarterStart, end: currentQuarterEnd } = getQuarterRange(now)
  const previousQuarterStart = new Date(currentQuarterStart)
  previousQuarterStart.setMonth(previousQuarterStart.getMonth() - 3)

  const quarterStats = (start: Date, end: Date) => {
    const total = requests.filter((request) => {
      const createdAt = new Date(request.createdAt)
      return createdAt >= start && createdAt < end
    })
    const slaMetCount = total.filter((request) => isSlaMet(request)).length
    return {
      total: total.length,
      slaRate: total.length === 0 ? null : (slaMetCount / total.length) * 100,
    }
  }

  const currentQuarterStats = quarterStats(currentQuarterStart, currentQuarterEnd)
  const previousQuarterStats = quarterStats(previousQuarterStart, currentQuarterStart)

  const overallSlaRate = overview.total > 0 ? Math.round((overview.slaMet / overview.total) * 100) : 0
  const quarterSlaRate = currentQuarterStats.slaRate ?? overallSlaRate
  const slaQoQDelta =
    currentQuarterStats.slaRate !== null && previousQuarterStats.slaRate !== null
      ? currentQuarterStats.slaRate - previousQuarterStats.slaRate
      : null

  const avgResolutionLabel = formatHoursMinutes(overview.avgResolutionHours)
  const avgResolutionDelta =
    overview.avgResolutionHours === null ? null : overview.avgResolutionHours - 12 /* mục tiêu 12h */

  const avgResolutionSeverity =
    overview.avgResolutionHours === null
      ? 'neutral'
      : overview.avgResolutionHours > 24
        ? 'danger'
        : overview.avgResolutionHours > 18
          ? 'warning'
          : 'success'

  const monthRequestCount = requests.filter((request) => {
    const createdAt = new Date(request.createdAt)
    return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear()
  }).length

  const backlogOver48h = requests.filter((request) => {
    if (request.status === 'completed') return false
    const createdAt = new Date(request.createdAt).getTime()
    return now.getTime() - createdAt > 48 * 60 * 60 * 1000
  }).length

  // Dữ liệu khối lượng yêu cầu theo tháng (6 tháng gần nhất)
  const volumeMonthData: { label: string; count: number }[] = []
  for (let i = 5; i >= 0; i -= 1) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthName = monthDate.toLocaleString('vi-VN', { month: 'long' })
    const monthRequests = requests.filter((request) => {
      const createdAt = new Date(request.createdAt)
      return createdAt.getMonth() === monthDate.getMonth() && createdAt.getFullYear() === monthDate.getFullYear()
    })
    volumeMonthData.push({ label: monthName, count: monthRequests.length })
  }

  // Tính min/max cho scale biểu đồ
  const volumeMax = Math.max(...volumeMonthData.map((d) => d.count), 1)
  const volumeMin = Math.min(...volumeMonthData.map((d) => d.count), 0)
  const volumeRange = volumeMax - volumeMin || 1


  const problemCounts = requests.reduce<Record<string, number>>((acc, request) => {
    const key = request.type || 'Danh mục khác'
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})

  const problemAreas = Object.entries(problemCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, count], index) => {
      const colors = ['#ef4444', '#f97316', '#a855f7', '#22c55e', '#3b82f6'] // Đỏ, Cam, Tím, Xanh lá, Xanh dương
      return {
        label,
        count,
        percent: overview.total === 0 ? 0 : Math.round((count / overview.total) * 1000) / 10,
        color: colors[index] || '#6b7280',
      }
    })

  const kpiCards = [
    {
      title: 'Tỷ lệ đạt SLA',
      value: overview.total === 0 ? '—' : `${quarterSlaRate.toFixed(1)}%`,
      trend:
        slaQoQDelta === null
          ? 'Đang thu thập'
          : `${slaQoQDelta >= 0 ? '+' : ''}${slaQoQDelta.toFixed(1)}% QoQ`,
      accentClass: quarterSlaRate >= 90 ? 'border-emerald-400' : 'border-amber-400',
      badgeText: quarterSlaRate >= 90 ? 'Ổn định' : 'Cần cải thiện',
      badgeClass:
        quarterSlaRate >= 90 ? 'bg-emerald-500/20 text-emerald-100' : 'bg-amber-500/20 text-amber-100',
      gradientClass: quarterSlaRate >= 90
        ? 'bg-gradient-to-br from-emerald-500/20 via-[#0e1522] to-[#080b16]'
        : 'bg-gradient-to-br from-amber-500/20 via-[#0e1522] to-[#080b16]',
    },
    {
      title: 'Thời gian xử lý TB',
      value: avgResolutionLabel,
      trend:
        avgResolutionDelta === null
          ? 'Thiếu dữ liệu'
          : `${avgResolutionDelta >= 0 ? '+' : ''}${avgResolutionDelta.toFixed(1)}h so với mục tiêu 12h`,
      accentClass:
        avgResolutionSeverity === 'danger'
          ? 'border-rose-500'
          : avgResolutionSeverity === 'warning'
            ? 'border-amber-400'
            : 'border-cyan-400',
      badgeText:
        avgResolutionSeverity === 'danger'
          ? 'Quá cao'
          : avgResolutionSeverity === 'warning'
            ? 'Cảnh báo'
            : 'Đạt kỳ vọng',
      badgeClass:
        avgResolutionSeverity === 'danger'
          ? 'bg-rose-500/20 text-rose-100'
          : avgResolutionSeverity === 'warning'
            ? 'bg-amber-500/20 text-amber-100'
            : 'bg-cyan-500/20 text-cyan-100',
      gradientClass:
        avgResolutionSeverity === 'danger'
          ? 'bg-gradient-to-br from-rose-500/25 via-[#0e1522] to-[#080b16]'
          : avgResolutionSeverity === 'warning'
            ? 'bg-gradient-to-br from-orange-500/20 via-[#0e1522] to-[#080b16]'
            : 'bg-gradient-to-br from-cyan-500/20 via-[#0e1522] to-[#080b16]',
    },
    {
      title: 'Tổng yêu cầu (tháng)',
      value: monthRequestCount.toString(),
      trend: 'Khối lượng tháng hiện tại',
      accentClass: 'border-sky-500',
      badgeText: 'Khối lượng',
      badgeClass: 'bg-sky-500/20 text-sky-100',
      gradientClass: 'bg-gradient-to-br from-sky-500/25 via-blue-600/10 to-[#080b16]',
    },
    {
      title: 'Tồn đọng >48h',
      value: backlogOver48h.toString(),
      trend: backlogOver48h === 0 ? 'Không có yêu cầu nguy cấp' : 'Cần ưu tiên giải quyết',
      accentClass: backlogOver48h === 0 ? 'border-emerald-400' : 'border-rose-500',
      badgeText: backlogOver48h === 0 ? 'Ổn định' : 'Nguy cơ',
      badgeClass:
        backlogOver48h === 0 ? 'bg-emerald-500/20 text-emerald-100' : 'bg-rose-500/20 text-rose-100',
      gradientClass: backlogOver48h === 0
        ? 'bg-gradient-to-br from-emerald-500/20 via-[#0e1522] to-[#080b16]'
        : 'bg-gradient-to-br from-rose-600/30 via-red-600/15 to-[#080b16]',
    },
  ]

  // Lấy initials từ tên
  const initials = profile.name
    .split(' ')
    .slice(-2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()

  return (
    <div className="flex min-h-full w-full flex-col bg-[#080A0D]">
      {/* Header */}
      <header className="flex-shrink-0 w-full border-b border-border-dark bg-[#080A0D] px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Tiêu đề với Gradient Text */}
          <h1 className="text-2xl font-extrabold uppercase tracking-wide text-gradient-dashboard">
            LEADERSHIP DASHBOARD
          </h1>

          {/* Ngày hiện tại */}
          <div className="text-sm font-medium text-text-light">
            Ngày: {new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </div>
        </div>
      </header>

      {/* Nhận diện cá nhân */}
      <div className="flex-shrink-0 px-6 pt-6">
        <div className="app-card">
          <div className="flex items-center justify-between gap-6">
            {/* Phần bên trái: Avatar và Thông tin */}
            <div className="flex items-center gap-6 flex-1">
              {/* Avatar với viền gradient xoay 360 độ */}
              <div className="relative flex-shrink-0">
                <div className="avatar-gradient-rotating flex h-20 w-20 items-center justify-center rounded-full text-xl font-semibold text-white relative z-10">
                  {initials}
                  {/* Chấm xanh lá báo trạng thái hoạt động */}
                  <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-[#080A0D] bg-green-500 z-20"></span>
                </div>
              </div>

              {/* Thông tin cá nhân */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-text-light">
                  Chào mừng {profile.name}
                </h2>
                <p className="mt-1 text-lg font-medium text-amber-400">
                  Tổng giám đốc
                </p>
                <p className="mt-1 text-sm text-text-subtle">{profile.email}</p>
                <p className="mt-1 text-sm text-text-subtle">{profile.department}</p>
              </div>
            </div>

            {/* Logo RMG - Bên phải với hiệu ứng gradient lóe sáng chạy chéo */}
            <div className="flex-shrink-0 flex items-center justify-center border-l border-border-dark pl-6 overflow-hidden relative h-full min-h-[100px]">
              <div className="relative flex items-center justify-center rounded-lg px-6 py-4 logo-gradient-container">
                <img
                  src="/Logo-RMG-mới-PNG.png"
                  alt="RMG Logo"
                  className="h-auto w-full max-w-[220px] object-contain relative z-10"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/vite.svg'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nội dung chính */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6">
        <div className="flex flex-col gap-8 pt-6">
          {/* 1. Hàng KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {kpiCards.map((card) => (
              <div
                key={card.title}
                className={`relative overflow-hidden rounded-2xl border border-white/10 ${card.gradientClass} p-5 shadow-xl transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl ${card.accentClass} border-b-4`}
              >
                {/* Glow effect overlay */}
                <div className="pointer-events-none absolute -left-20 -top-20 h-40 w-40 rounded-full bg-white/5 blur-3xl"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/80">{card.title}</p>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${card.badgeClass}`}>
                    {card.badgeText}
                  </span>
                </div>
                <div className="relative z-10">
                  <p className="mt-4 text-4xl font-extrabold text-white">{card.value}</p>
                  <p className="mt-3 text-sm text-white/90">{card.trend}</p>
                </div>
              </div>
            ))}
          </div>
          {/* 2. Khu Vực Theo Dõi Hành Động (Open Ticket Tracker) */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/80">Theo dõi hành động</p>
                <h3 className="mt-1 text-xl font-semibold text-white">Open Ticket Tracker</h3>
              </div>
              <button className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
                Xem Tất Cả...
              </button>
            </div>

            {/* Bảng dữ liệu với chiều cao giới hạn và cuộn */}
            <div className="max-h-[400px] overflow-hidden rounded-2xl border border-white/10 bg-[#0d1422] shadow-xl">
              <div className="h-full max-h-[400px] overflow-y-auto overflow-x-hidden custom-scrollbar">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 z-10 bg-white/5 backdrop-blur-sm">
                    <tr>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-white/90">
                        Mã Yêu Cầu
                      </th>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-white/90">
                        Mô Tả Yêu Cầu
                      </th>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-white/90">
                        Nhân Viên Gửi
                      </th>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-white/90">
                        Người Xử Lý
                      </th>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-white/90">
                        Ưu Tiên
                      </th>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-white/90">
                        Trạng Thái
                      </th>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-white/90">
                        Thời Gian SLA
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {requests
                      .filter((request) => request.status !== 'completed')
                      .map((request) => {
                        const isOverdue = slaSeverity(request.targetSla, request.status) === 'breached'
                        const handler = 'Nguyễn Trung Hải, nhân viên IT'

                        return (
                          <tr
                            key={request.id}
                            className={`transition hover:bg-white/5 ${isOverdue ? 'bg-rose-500/15 text-rose-100' : 'text-white'
                              }`}
                          >
                            <td className="px-3 py-2">
                              <span className={`font-mono text-xs font-semibold ${isOverdue ? 'text-rose-200' : 'text-white'}`}>
                                {request.id.slice(0, 8)}
                              </span>
                            </td>
                            <td className="px-3 py-2">
                              <div className="max-w-xs">
                                <p className={`text-xs font-medium ${isOverdue ? 'text-rose-100' : 'text-white'}`}>
                                  {request.title}
                                </p>
                                <p className={`mt-0.5 text-[10px] line-clamp-1 ${isOverdue ? 'text-rose-200/90' : 'text-white/80'}`}>
                                  {request.description}
                                </p>
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <div>
                                <p className={`text-xs font-medium ${isOverdue ? 'text-rose-100' : 'text-white'}`}>
                                  {request.employeeName}
                                </p>
                                <p className={`text-[10px] ${isOverdue ? 'text-rose-200/90' : 'text-white/70'}`}>
                                  {request.employeeDepartment}
                                </p>
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <span className={`text-xs ${isOverdue ? 'text-rose-100' : 'text-white'}`}>{handler}</span>
                            </td>
                            <td className="px-3 py-2">
                              <PriorityBadge priority={request.priority} />
                            </td>
                            <td className="px-3 py-2">
                              <StatusBadge status={request.status} />
                            </td>
                            <td className="px-3 py-2">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${isOverdue
                                  ? 'bg-rose-500/25 text-rose-100 border border-rose-500/60'
                                  : 'bg-emerald-500/25 text-emerald-100 border border-emerald-500/60'
                                  }`}
                              >
                                {timeRemaining(request.targetSla)}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
                {requests.filter((request) => request.status !== 'completed').length === 0 && (
                  <div className="px-4 py-12 text-center text-white/50">
                    Không có yêu cầu đang mở nào.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 3. Khu vực phân tích gốc rễ & nguồn lực */}
          <div className="grid flex-1 gap-4 xl:grid-cols-2">
            {/* 5 lĩnh vực gây vấn đề lớn nhất */}
            <div className="flex flex-col rounded-2xl border border-white/10 bg-[#0d1422] p-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/80">Quản lý vấn đề</p>
                  <h3 className="mt-1 text-lg font-semibold text-white">5 Lĩnh Vực Gây Vấn Đề Lớn Nhất (Top 5 Incidents)</h3>
                </div>
                <span className="text-xs text-white/70">Top 5 / {overview.total}</span>
              </div>
              <div className="mt-4 space-y-3">
                {problemAreas.map((area, index) => (
                  <div
                    key={area.label}
                    className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/5 p-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white/90">#{index + 1}</span>
                        <p className="text-sm font-semibold text-white">{area.label}</p>
                      </div>
                      <div className="mt-2 h-2.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, Math.max(5, area.percent))}%`,
                            backgroundColor: area.color,
                          }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-white">{area.percent.toFixed(0)}%</p>
                      <p className="text-[10px] uppercase tracking-wider text-white/70">{area.count} yêu cầu</p>
                    </div>
                  </div>
                ))}
                {problemAreas.length === 0 && (
                  <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-white/70">
                    Chưa đủ dữ liệu để thống kê.
                  </div>
                )}
              </div>

              {/* Phân tích */}
              <div className="mt-3 rounded-lg border border-orange-500/20 bg-orange-500/10 p-2.5">
                <p className="text-xs text-orange-100">
                  <span className="font-semibold">Phân tích:</span> {problemAreas.length > 0 && problemAreas[0].label} là nguyên nhân chính gây ra gián đoạn. Cần ưu tiên nâng cấp và ổn định hệ thống.
                </p>
              </div>
            </div>

            {/* Biểu đồ xu hướng khối lượng yêu cầu */}
            <div className="rounded-2xl border border-white/10 bg-[#0d1422] p-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/80">Phân tích xu hướng</p>
                  <h3 className="mt-1 text-lg font-semibold text-white">Xu Hướng Khối Lượng Yêu Cầu (6 tháng)</h3>
                </div>
              </div>

              {/* Area Chart */}
              <div className="mt-4 h-48">
                <div className="relative h-full w-full">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-px w-full bg-white/5" />
                    ))}
                  </div>

                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 flex h-full flex-col justify-between pr-2 text-sm font-semibold text-white/90">
                    {[0, 1, 2, 3, 4].map((i) => {
                      const value = volumeMin + (volumeRange / 4) * (4 - i)
                      return (
                        <span key={i} className="text-right">
                          {Math.round(value)}
                        </span>
                      )
                    })}
                  </div>

                  {/* Chart area */}
                  <div className="ml-12 h-full">
                    <svg className="h-full w-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                      {/* Area fill */}
                      <defs>
                        <linearGradient id="volumeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#a855f7" stopOpacity="0.05" />
                        </linearGradient>
                      </defs>
                      <path
                        d={`M 0,${200 - ((volumeMonthData[0].count - volumeMin) / volumeRange) * 200} ${volumeMonthData
                          .map(
                            (d, i) =>
                              `L ${(i / (volumeMonthData.length - 1)) * 400},${200 - ((d.count - volumeMin) / volumeRange) * 200}`,
                          )
                          .join(' ')} L ${400},200 L 0,200 Z`}
                        fill="url(#volumeGradient)"
                      />
                      {/* Line */}
                      <path
                        d={`M 0,${200 - ((volumeMonthData[0].count - volumeMin) / volumeRange) * 200} ${volumeMonthData
                          .map(
                            (d, i) =>
                              `L ${(i / (volumeMonthData.length - 1)) * 400},${200 - ((d.count - volumeMin) / volumeRange) * 200}`,
                          )
                          .join(' ')}`}
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Data points */}
                      {volumeMonthData.map((d, i) => {
                        const x = (i / (volumeMonthData.length - 1)) * 400
                        const y = 200 - ((d.count - volumeMin) / volumeRange) * 200
                        return (
                          <circle
                            key={i}
                            cx={x}
                            cy={y}
                            r="6"
                            fill="#a855f7"
                            stroke="#0d1422"
                            strokeWidth="3"
                          />
                        )
                      })}
                    </svg>
                  </div>

                  {/* X-axis labels */}
                  <div className="absolute bottom-0 left-12 right-0 flex justify-between pt-2">
                    {volumeMonthData.map((d, i) => (
                      <span key={i} className="text-sm font-medium text-white/90">
                        Tháng {d.label.slice(0, 3)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Phân tích */}
              <div className="mt-3 rounded-lg border border-purple-500/30 bg-purple-500/15 p-2.5">
                <p className="text-xs text-purple-100">
                  <span className="font-semibold">Phân tích:</span> Khối lượng tăng nhẹ vào các tháng cuối năm, cần chuẩn bị nguồn lực.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
