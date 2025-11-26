import { useState } from 'react'
import { priorityMeta } from '../../constants/meta'
import { PriorityBadge } from '../common/PriorityBadge'
import { StatusBadge } from '../common/StatusBadge'
import { formatDateTime, timeRemaining } from '../../utils/time'
import { RequestDetailModal } from './RequestDetailModal'
import { ITRequestModal } from './ITRequestModal'
import { api } from '../../api'
import { mapNote } from '../../utils/mappers'
import { formatVND, parseCostInput } from '../../utils/format'
import type {
  CreationFeedback,
  Employee,
  PriorityKey,
  ServiceRequest,
} from '../../types'

interface EmployeeDashboardProps {
  selectedEmployee: Employee
  formState: {
    title: string
    type: string
    description: string
    priority: PriorityKey
    estimatedCost: number | null
  }
  onFormFieldChange: (field: 'title' | 'type' | 'description' | 'estimatedCost', value: string | number | null) => void
  onPrioritySelect: (priority: PriorityKey) => void
  onCreateRequest: () => void
  creationFeedback: CreationFeedback | null | undefined
  isEmployeeRole: boolean
  searchKeyword: string
  onSearchKeywordChange: (value: string) => void
  filteredEmployees: Employee[]
  onSelectEmployee: (id: string) => void
  selectedEmployeeId: string
  myRequests: ServiceRequest[]
  onMyRequestsUpdate?: (updatedRequests: ServiceRequest[]) => void
  notesLoadingId: string | null
  isLoadingRequests: boolean
  onRequestUpdate?: (updatedRequest: ServiceRequest) => void
  onDeleteRequest?: (id: string, employeeId: string) => void
}

type TabType = 'create' | 'myRequests'

export const EmployeeDashboard = ({
  selectedEmployee,
  formState,
  onFormFieldChange,
  onPrioritySelect,
  onCreateRequest,
  creationFeedback,
  myRequests,
  isLoadingRequests,
  onMyRequestsUpdate,
  onDeleteRequest,
}: EmployeeDashboardProps) => {
  // State quản lý tab active (mặc định: 'create')
  const [activeTab, setActiveTab] = useState<TabType>('create')
  // State quản lý modal chi tiết
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)
  const [messageDraft, setMessageDraft] = useState('')
  // State để trigger animation nhấp nháy khi click priority
  const [blinkingPriority, setBlinkingPriority] = useState<PriorityKey | null>(null)
  // State quản lý modal yêu cầu từ IT
  const [itRequestModalOpen, setItRequestModalOpen] = useState(false)
  const [itRequestModalRequest, setItRequestModalRequest] = useState<ServiceRequest | null>(null)

  // Handler gửi tin nhắn
  const handleSendMessage = async (message: string) => {
    if (!selectedRequest || !message.trim()) return

    try {
      const created = await api.addRequestNote(selectedRequest.id, {
        message: message.trim(),
        visibility: 'public',
        author: selectedEmployee.name,
      })

      const mapped = mapNote(created)
      // Cập nhật request trong danh sách
      const updatedRequest = {
        ...selectedRequest,
        notes: [mapped, ...selectedRequest.notes],
        lastUpdated: new Date().toISOString(),
      }
      setSelectedRequest(updatedRequest)
      setMessageDraft('')
    } catch (error) {
      console.error('Không thể gửi tin nhắn', error)
    }
  }
  // Lấy initials từ tên
  const initials = selectedEmployee.name
    .split(' ')
    .slice(-2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()

  // Màu nền và màu số giờ cho các SLA cards - Nền tối với màu sắc rõ ràng
  const slaCardColors: Record<PriorityKey, { bg: string; text: string; hourColor: string; hoverBg: string; hoverBorder: string }> = {
    urgent: {
      bg: 'bg-red-950/60 border-red-800/40', // Nền đỏ tối
      text: 'text-white',
      hourColor: 'text-white', // Màu trắng
      hoverBg: 'bg-red-950/80',
      hoverBorder: 'border-red-600/60',
    },
    high: {
      bg: 'bg-orange-950/60 border-orange-800/40', // Nền cam/nâu tối
      text: 'text-white',
      hourColor: 'text-white', // Màu trắng
      hoverBg: 'bg-orange-950/80',
      hoverBorder: 'border-orange-600/60',
    },
    medium: {
      bg: 'bg-blue-950/60 border-blue-800/40', // Nền xanh dương tối
      text: 'text-white',
      hourColor: 'text-white', // Màu trắng
      hoverBg: 'bg-blue-950/80',
      hoverBorder: 'border-blue-600/60',
    },
    low: {
      bg: 'bg-gray-900/60 border-gray-700/40', // Nền xám tối
      text: 'text-white',
      hourColor: 'text-white', // Màu trắng
      hoverBg: 'bg-gray-900/80',
      hoverBorder: 'border-gray-600/60',
    },
  }

  return (
    <div className="flex h-full max-h-full min-h-0 flex-col overflow-hidden bg-[#080A0D]">
      {/* I. Header (Tràn Full Width) */}
      <header className="flex-shrink-0 w-full border-b border-border-dark bg-[#080A0D] px-2 py-4">
        <div className="flex items-center justify-between">
          {/* Tiêu đề với Gradient Text (Xanh Lam/Cyan) */}
          <h1 className="text-2xl font-extrabold uppercase tracking-wide text-gradient-dashboard">
            IT SUPPORT DASHBOARD
          </h1>

          {/* Ngày hiện tại */}
          <div className="text-sm font-medium text-white">
            Ngày: {new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </div>
        </div>
      </header>

      {/* II. Main Container (Giới hạn và Căn giữa) */}
      <div className="flex-1 min-h-0 max-h-full overflow-hidden">
        <div className="mx-auto h-full max-h-full w-full px-2">
          {/* Grid 12 cột - Đảm bảo fit trong viewport */}
          <div className="grid h-full max-h-full min-h-0 grid-cols-1 lg:grid-cols-12 overflow-hidden">
            {/* A. Sidebar (Cột Trái - Thông tin Tĩnh): Chiếm 4/12 (4 cột) */}
            <aside className="flex h-full max-h-full min-h-0 flex-col gap-3 overflow-hidden lg:col-span-4 px-3 pt-3 pb-3" style={{ maxHeight: '100%' }}>
              {/* 1. Card Nhận diện Người dùng */}
              <div className="app-card flex-shrink-0 gradient-user-card">
                <h4 className="mb-3 text-base font-semibold uppercase tracking-wider text-white">
                  NHẬN DIỆN NGƯỜI DÙNG
                </h4>
                <div className="flex items-center gap-4">
                  {/* Avatar với viền Gradient Neon (Xanh Lá -> Cyan) và Box Shadow Glow */}
                  <div className="avatar-gradient relative flex h-16 w-16 items-center justify-center rounded-full text-xl font-semibold text-white z-0">
                    <span className="relative z-10">{initials}</span>
                    {/* Chấm xanh lá báo trạng thái hoạt động với viền #080A0D dày */}
                    <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-[#080A0D] bg-green-500 z-10"></span>
                  </div>

                  {/* Thông tin cá nhân */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">
                      {selectedEmployee.name}
                    </h3>
                    <p className="text-base text-white/80">{selectedEmployee.email}</p>
                    <p className="mt-1 text-base text-white/80">
                      Phòng ban: {selectedEmployee.department}
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Card SLA theo Mức độ Ưu tiên */}
              <div className="app-card flex-shrink-0 flex flex-col gradient-sla-card">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white">
                  SLA THEO MỨC ĐỘ ƯU TIÊN
                </h4>

                {/* Danh sách SLA - mỗi mục là một dòng riêng biệt với màu sắc tương ứng - Vừa với nội dung */}
                <div className="space-y-1.5">
                  {/* Mỗi mục SLA là một dòng riêng biệt, highlight bằng màu sắc tương ứng */}
                  {(Object.keys(priorityMeta) as PriorityKey[]).map((priority) => {
                    const meta = priorityMeta[priority]
                    const colors = slaCardColors[priority]

                    return (
                      <div
                        key={priority}
                        className={`rounded-lg border p-2 transition-all duration-300 ${colors.text} relative overflow-hidden`}
                        style={{
                          background: priority === 'urgent'
                            ? 'linear-gradient(135deg, rgba(127, 29, 29, 0.25) 0%, rgba(153, 27, 27, 0.3) 50%, rgba(127, 29, 29, 0.25) 100%)'
                            : priority === 'high'
                              ? 'linear-gradient(135deg, rgba(113, 63, 18, 0.25) 0%, rgba(146, 64, 14, 0.3) 50%, rgba(113, 63, 18, 0.25) 100%)'
                              : priority === 'medium'
                                ? 'linear-gradient(135deg, rgba(30, 58, 138, 0.25) 0%, rgba(37, 99, 235, 0.3) 50%, rgba(30, 58, 138, 0.25) 100%)'
                                : 'linear-gradient(135deg, rgba(31, 41, 55, 0.25) 0%, rgba(55, 65, 81, 0.3) 50%, rgba(31, 41, 55, 0.25) 100%)',
                          borderColor: priority === 'urgent'
                            ? 'rgba(220, 38, 38, 0.4)'
                            : priority === 'high'
                              ? 'rgba(202, 138, 4, 0.4)'
                              : priority === 'medium'
                                ? 'rgba(37, 99, 235, 0.4)'
                                : 'rgba(75, 85, 99, 0.4)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = priority === 'urgent'
                            ? 'linear-gradient(135deg, rgba(127, 29, 29, 0.35) 0%, rgba(153, 27, 27, 0.4) 50%, rgba(127, 29, 29, 0.35) 100%)'
                            : priority === 'high'
                              ? 'linear-gradient(135deg, rgba(113, 63, 18, 0.35) 0%, rgba(146, 64, 14, 0.4) 50%, rgba(113, 63, 18, 0.35) 100%)'
                              : priority === 'medium'
                                ? 'linear-gradient(135deg, rgba(30, 58, 138, 0.35) 0%, rgba(37, 99, 235, 0.4) 50%, rgba(30, 58, 138, 0.35) 100%)'
                                : 'linear-gradient(135deg, rgba(31, 41, 55, 0.35) 0%, rgba(55, 65, 81, 0.4) 50%, rgba(31, 41, 55, 0.35) 100%)'
                          e.currentTarget.style.borderColor = priority === 'urgent' ? 'rgba(220, 38, 38, 0.7)' :
                            priority === 'high' ? 'rgba(202, 138, 4, 0.7)' :
                              priority === 'medium' ? 'rgba(37, 99, 235, 0.7)' :
                                'rgba(75, 85, 99, 0.7)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = priority === 'urgent'
                            ? 'linear-gradient(135deg, rgba(127, 29, 29, 0.25) 0%, rgba(153, 27, 27, 0.3) 50%, rgba(127, 29, 29, 0.25) 100%)'
                            : priority === 'high'
                              ? 'linear-gradient(135deg, rgba(113, 63, 18, 0.25) 0%, rgba(146, 64, 14, 0.3) 50%, rgba(113, 63, 18, 0.25) 100%)'
                              : priority === 'medium'
                                ? 'linear-gradient(135deg, rgba(30, 58, 138, 0.25) 0%, rgba(37, 99, 235, 0.3) 50%, rgba(30, 58, 138, 0.25) 100%)'
                                : 'linear-gradient(135deg, rgba(31, 41, 55, 0.25) 0%, rgba(55, 65, 81, 0.3) 50%, rgba(31, 41, 55, 0.25) 100%)'
                          e.currentTarget.style.borderColor = priority === 'urgent'
                            ? 'rgba(220, 38, 38, 0.4)'
                            : priority === 'high'
                              ? 'rgba(202, 138, 4, 0.4)'
                              : priority === 'medium'
                                ? 'rgba(37, 99, 235, 0.4)'
                                : 'rgba(75, 85, 99, 0.4)'
                        }}
                      >
                        <div className="space-y-0.5">
                          <div className="text-[13px] font-semibold text-white">
                            {meta.label}
                          </div>
                          <div className="text-[11px] text-white/80">
                            SLA cam kết
                          </div>
                          <div className={`text-[15px] font-bold text-white ${colors.hourColor}`}>
                            {meta.slaHours}h
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 3. Logo RMG - Nằm giữa container với hiệu ứng gradient lóe sáng */}
              <div className="flex-1 min-h-0 flex flex-col">
                <div className="flex-1 rounded-lg bg-[#0D1219] px-6 pt-6 pb-3 flex items-center justify-center relative overflow-hidden logo-gradient-container">
                  <div className="relative z-10">
                    <img
                      src="/Logo-RMG-mới-PNG.png"
                      alt="RMG Logo"
                      className="h-auto w-full max-w-[200px] object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/vite.svg'
                      }}
                    />
                  </div>
                </div>
              </div>
            </aside>

            {/* B. Nội dung Chính (Cột Phải - Tương tác): Chiếm 8/12 (8 cột) */}
            <main className="flex h-full max-h-full min-h-0 flex-col overflow-hidden lg:col-span-8" style={{ maxHeight: '100%' }}>
              <div className="flex h-full max-h-full min-h-0 flex-col overflow-hidden px-3 pt-3 pb-3" style={{ maxHeight: '100%' }}>
                {/* 1. Thanh điều hướng Tab - Tab Navigation với thiết kế đẹp hơn */}
                <div className="mb-6 flex-shrink-0 relative">
                  {/* Background gradient cho toàn bộ navigation */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-blue-500/5 rounded-t-lg"></div>

                  {/* Border bottom với gradient */}
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>

                  <div className="relative flex gap-1">
                    {/* Tab: + TẠO YÊU CẦU MỚI */}
                    <button
                      type="button"
                      onClick={() => setActiveTab('create')}
                      className={`relative px-6 py-3.5 text-sm font-bold transition-all duration-300 rounded-t-lg flex items-center gap-2 ${activeTab === 'create'
                          ? 'text-blue-300 bg-gradient-to-b from-blue-500/20 via-blue-500/15 to-transparent shadow-lg shadow-blue-500/20'
                          : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                        }`}
                    >
                      {/* Icon plus với animation */}
                      <span className={`text-lg transition-transform duration-300 ${activeTab === 'create' ? 'scale-110' : ''}`}>
                        ✨
                      </span>
                      <span className="tracking-wide">TẠO YÊU CẦU MỚI</span>
                      {/* Active indicator line */}
                      {activeTab === 'create' && (
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 rounded-full"></div>
                      )}
                    </button>

                    {/* Tab: YÊU CẦU CỦA TÔI */}
                    <button
                      type="button"
                      onClick={() => setActiveTab('myRequests')}
                      className={`relative px-6 py-3.5 text-sm font-bold transition-all duration-300 rounded-t-lg flex items-center gap-2 ${activeTab === 'myRequests'
                          ? 'text-blue-300 bg-gradient-to-b from-blue-500/20 via-blue-500/15 to-transparent shadow-lg shadow-blue-500/20'
                          : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                        }`}
                    >
                      {/* Icon document */}
                      <span className={`text-lg transition-transform duration-300 ${activeTab === 'myRequests' ? 'scale-110' : ''}`}>
                        📋
                      </span>
                      <span className="tracking-wide">YÊU CẦU CỦA TÔI</span>

                      {/* Badge số lượng với gradient */}
                      {myRequests.length > 0 && (
                        <span className={`ml-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold transition-all duration-300 ${activeTab === 'myRequests'
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/50'
                            : 'bg-white/10 text-white/80'
                          }`}>
                          {myRequests.length}
                        </span>
                      )}

                      {/* Icon refresh với animation */}
                      <span className={`text-base transition-transform duration-300 hover:rotate-180 ${activeTab === 'myRequests' ? 'text-cyan-400' : 'text-white/50'
                        }`}>
                        🔄
                      </span>

                      {/* Active indicator line */}
                      {activeTab === 'myRequests' && (
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 rounded-full"></div>
                      )}
                    </button>
                  </div>
                </div>

                {/* 2. Tab: TẠO YÊU CẦU MỚI (Form) */}
                {activeTab === 'create' && (
                  <div className="mt-6 flex-1 min-h-0 overflow-hidden">
                    {/* Card container với chiều cao 100% để vừa với responsive */}
                    <div className="relative flex h-full w-full min-h-0 max-h-full flex-col rounded-lg border border-border-dark gradient-card-blue px-6 pt-6 pb-3 overflow-hidden">
                      {/* Tiêu đề - Màu xanh sáng */}
                      <h2 className="mb-6 flex-shrink-0 text-3xl font-extrabold uppercase text-blue-400">
                        TẠO YÊU CẦU MỚI
                      </h2>
                      {/* Form chia thành 2 cột - Container với scroll nếu cần */}
                      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-1 custom-scrollbar">
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                          {/* Cột Trái */}
                          <div className="space-y-4">
                            {/* Tiêu đề yêu cầu */}
                            <div>
                              <label htmlFor="title" className="mb-2 block text-sm font-medium text-white">
                                Tiêu đề yêu cầu <span className="text-red-400">*</span>
                              </label>
                              <input
                                id="title"
                                type="text"
                                value={formState.title}
                                onChange={(e) => onFormFieldChange('title', e.target.value)}
                                placeholder="Ví dụ: Laptop không khởi động được"
                                className="app-input"
                              />
                            </div>

                            {/* Loại Yêu cầu (Dropdown) */}
                            <div>
                              <label htmlFor="type" className="mb-2 block text-sm font-medium text-white">
                                Loại yêu cầu <span className="text-red-400">*</span>
                              </label>
                              <div className="relative">
                                <select
                                  id="type"
                                  value={formState.type}
                                  onChange={(e) => {
                                    onFormFieldChange('type', e.target.value)
                                    // Reset giá thành khi đổi loại yêu cầu
                                    if (e.target.value !== 'Mua sắm thiết bị') {
                                      onFormFieldChange('estimatedCost', null)
                                    }
                                  }}
                                  className="app-input appearance-none pr-10"
                                >
                                  <option value="">Chọn loại...</option>
                                  <option value="Mua sắm thiết bị">Mua sắm thiết bị</option>
                                  <option value="Sửa chữa thiết bị">Sửa chữa thiết bị</option>
                                  <option value="Hỗ trợ phần mềm">Hỗ trợ phần mềm</option>
                                  <option value="Bảo trì định kỳ">Bảo trì định kỳ</option>
                                  <option value="Khác">Khác</option>
                                </select>
                                {/* Icon mũi tên xuống */}
                                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/80">
                                  ▼
                                </div>
                              </div>
                            </div>

                            {/* Giá thành đề xuất (chỉ hiển thị khi chọn "Mua sắm thiết bị") */}
                            {formState.type === 'Mua sắm thiết bị' && (
                              <div>
                                <label htmlFor="estimatedCost" className="mb-2 block text-sm font-medium text-white">
                                  Giá thành đề xuất (VND)
                                </label>
                                <input
                                  id="estimatedCost"
                                  type="text"
                                  value={formState.estimatedCost ? formState.estimatedCost.toLocaleString('vi-VN') : ''}
                                  onChange={(e) => {
                                    const parsed = parseCostInput(e.target.value)
                                    onFormFieldChange('estimatedCost', parsed)
                                  }}
                                  placeholder="Ví dụ: 5000000 hoặc 5.000.000"
                                  className="app-input"
                                />
                                {formState.estimatedCost && (
                                  <p className="mt-2 text-sm font-medium text-green-400">
                                    {formatVND(formState.estimatedCost)}
                                  </p>
                                )}
                                <p className="mt-1 text-xs text-white/70">
                                  Nhập số tiền ước tính cho thiết bị cần mua. IT sẽ xem xét và có thể điều chỉnh.
                                </p>
                              </div>
                            )}

                            {/* Mục tiêu SLA (Tự động cập nhật) */}
                            <div>
                              <label className="mb-2 block text-sm font-medium text-white">
                                Mục tiêu SLA cam kết:
                              </label>
                              <div className="rounded-lg border-2 border-blue-500 bg-blue-500/10 px-4 py-4">
                                <div className="text-2xl font-bold text-blue-400">
                                  {priorityMeta[formState.priority].slaHours}h ({priorityMeta[formState.priority].label})
                                </div>
                                <p className="mt-2 text-xs text-white/80">
                                  Đây là thời gian tối đa IT cam kết phản hồi/xử lý yêu cầu của bạn.
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Cột Phải */}
                          <div className="space-y-4">
                            {/* Mức độ Ưu tiên (Radio Cards) */}
                            <div>
                              <label className="mb-3 block text-sm font-medium text-text-light">
                                Mức độ ưu tiên <span className="text-red-400">*</span>
                              </label>
                              <div className="grid grid-cols-2 gap-3">
                                {(Object.keys(priorityMeta) as PriorityKey[]).map((priority) => {
                                  const meta = priorityMeta[priority]
                                  const isSelected = formState.priority === priority

                                  // Màu nền và border theo priority - Luôn dùng border-2 để tránh dịch chuyển
                                  const getPriorityCardStyle = () => {
                                    if (priority === 'urgent') {
                                      return isSelected
                                        ? 'bg-red-500/20 border-2 border-red-500'
                                        : 'bg-red-500/10 border-2 border-red-500/50'
                                    }
                                    if (priority === 'high') {
                                      return isSelected
                                        ? 'bg-yellow-500/20 border-2 border-yellow-500'
                                        : 'bg-yellow-500/10 border-2 border-yellow-500/50'
                                    }
                                    if (priority === 'medium') {
                                      return isSelected
                                        ? 'bg-blue-500/20 border-2 border-blue-400'
                                        : 'bg-blue-500/10 border-2 border-blue-500/50'
                                    }
                                    // low
                                    return isSelected
                                      ? 'bg-gray-700/20 border-2 border-gray-500'
                                      : 'bg-gray-800/50 border-2 border-gray-600/50'
                                  }

                                  const getPriorityGlow = () => {
                                    if (!isSelected) return 'shadow-none'
                                    if (priority === 'urgent') return 'shadow-[0_0_25px_rgba(239,68,68,0.6)]'
                                    if (priority === 'high') return 'shadow-[0_0_25px_rgba(251,191,36,0.6)]'
                                    if (priority === 'medium') return 'shadow-[0_0_30px_rgba(59,130,246,0.6)]'
                                    return 'shadow-[0_0_20px_rgba(148,163,184,0.5)]'
                                  }

                                  // Kiểm tra nếu đang nhấp nháy
                                  const isBlinking = blinkingPriority === priority

                                  return (
                                    <label
                                      key={priority}
                                      className={`cursor-pointer rounded-lg p-4 transition-all duration-300 ${getPriorityCardStyle()} ${getPriorityGlow()} ${isBlinking ? 'animate-pulse-warning' : ''}`}
                                      onClick={() => {
                                        setBlinkingPriority(priority)
                                        onPrioritySelect(priority)
                                        // Xóa animation sau 1 giây
                                        setTimeout(() => setBlinkingPriority(null), 1000)
                                      }}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <div className="text-sm font-semibold text-white">
                                            {meta.label}
                                          </div>
                                          <div className="mt-1 text-xs text-white/80">
                                            SLA {meta.slaHours} giờ
                                          </div>
                                        </div>
                                        {/* Radio button bên phải */}
                                        <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white">
                                          {isSelected && (
                                            <div className="h-3 w-3 rounded-full bg-blue-400"></div>
                                          )}
                                        </div>
                                      </div>
                                    </label>
                                  )
                                })}
                              </div>
                            </div>

                            {/* Mô tả Chi tiết (Textarea) */}
                            <div>
                              <label htmlFor="description" className="mb-2 block text-sm font-medium text-text-light">
                                Mô tả chi tiết <span className="text-red-400">*</span>
                              </label>
                              <textarea
                                id="description"
                                rows={6}
                                value={formState.description}
                                onChange={(e) => onFormFieldChange('description', e.target.value)}
                                placeholder="Mô tả vấn đề, thời điểm xảy ra, ảnh hưởng tới công việc..."
                                className="app-input resize-y"
                              />
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Footer cố định: Feedback và Nút Gửi */}
                      <div className="flex-shrink-0 mt-6 space-y-4">
                        {/* Feedback Message */}
                        {creationFeedback && (
                          <div
                            className={`rounded-lg border px-4 py-3 text-sm ${creationFeedback.type === 'success'
                              ? 'border-green-500/50 bg-green-500/15 text-green-100'
                              : 'border-red-500/50 bg-red-500/15 text-red-100'
                              }`}
                          >
                            {creationFeedback.message}
                          </div>
                        )}

                        {/* Nút Gửi - Gradient xanh dương/cyan với icon máy bay giấy */}
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={onCreateRequest}
                            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:from-blue-600 hover:to-cyan-600 hover:shadow-xl"
                          >
                            <span>✈️</span>
                            <span>GỬI YÊU CẦU MỚI NGAY</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Tab: YÊU CẦU CỦA TÔI (Danh sách) */}
                {activeTab === 'myRequests' && (
                  <div className="mt-6 flex-1 min-h-0 overflow-hidden">
                    {/* Card container với chiều cao giới hạn giống Form Card */}
                    <div className="relative flex h-full min-h-0 max-h-full flex-col rounded-lg border border-border-dark gradient-card-blue p-6 overflow-hidden">
                      {/* Tiêu đề - Màu xanh sáng */}
                      <h2 className="mb-2 flex-shrink-0 text-3xl font-extrabold uppercase text-blue-400">
                        YÊU CẦU CỦA TÔI
                      </h2>

                      {/* Text hiển thị số lượng */}
                      <p className="mb-6 flex-shrink-0 text-sm text-white/80">
                        Hiển thị {myRequests.length} yêu cầu gần nhất
                      </p>

                      {/* Container với scroll - chỉ phần này cuộn */}
                      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-1 custom-scrollbar">
                        {isLoadingRequests ? (
                          <div className="text-center py-12">
                            <p className="text-white/80">Đang tải yêu cầu...</p>
                          </div>
                        ) : myRequests.length === 0 ? (
                          <div className="text-center py-12">
                            <p className="text-white/80">Bạn chưa có yêu cầu nào.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {myRequests.map((request) => {
                              return (
                                <div
                                  key={request.id}
                                  className="request-card-hover rounded-xl border border-border-dark bg-[#141922] p-4"
                                >
                                  {/* Tiêu đề */}
                                  <h3 className="mb-1.5 text-base font-semibold text-white">
                                    {request.title}
                                  </h3>

                                  {/* Mô tả */}
                                  <p className="mb-3 text-xs text-white/80 line-clamp-2">
                                    {request.description}
                                  </p>

                                  {/* Status và Priority Badges - Căn phải */}
                                  <div className="mb-3 flex items-center justify-end gap-1.5">
                                    {/* Badge và nút yêu cầu từ IT - Chỉ hiển thị khi có employee_request chưa được phản hồi */}
                                    {request.notes.some(note =>
                                      note.noteType === 'employee_request' &&
                                      !request.notes.some((n) => n.parentNoteId === note.id)
                                    ) && (
                                        <div className="relative flex items-center">
                                          {/* Mũi tên di chuyển */}
                                          <span className="absolute -left-7 text-orange-400 text-xl font-semibold animate-arrow-bounce">
                                            →
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setItRequestModalRequest(request)
                                              setItRequestModalOpen(true)
                                            }}
                                            className="relative rounded-full bg-orange-500/25 px-2.5 py-1 text-xs font-semibold text-orange-300 border-2 border-orange-500/70 hover:bg-orange-500/35 transition animate-blink-notice shadow-lg shadow-orange-500/40"
                                          >
                                            ⚠️ Có yêu cầu từ IT
                                          </button>
                                        </div>
                                      )}
                                    <StatusBadge status={request.status} />
                                    <PriorityBadge priority={request.priority} />
                                  </div>

                                  {/* Footer: SLA Information và Chi tiết */}
                                  <div className="flex items-center justify-between border-t border-border-dark pt-3">
                                    <div className="text-[11px] text-blue-300">
                                      SLA: {timeRemaining(request.targetSla).toUpperCase()}
                                      <span className="mx-2 text-white/70">•</span>
                                      Cập nhật: {formatDateTime(request.lastUpdated)}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {/* Nút xóa - chỉ hiển thị khi request ở trạng thái new hoặc waiting */}
                                      {(request.status === 'new' || request.status === 'waiting') && onDeleteRequest && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (window.confirm('Bạn có chắc chắn muốn xóa yêu cầu này? Hành động này không thể hoàn tác.')) {
                                              onDeleteRequest(request.id, request.employeeId)
                                            }
                                          }}
                                          className="flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold text-red-400 hover:bg-red-500/20 hover:text-red-300 transition border border-red-500/50"
                                          title="Xóa yêu cầu (chỉ khi chưa được xử lý)"
                                        >
                                          🗑️ Xóa
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => setSelectedRequest(request)}
                                        className="flex items-center gap-1 text-xs font-semibold text-accent-cyan hover:text-accent-cyan/80 transition"
                                      >
                                        Chi tiết <span>→</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Modal Chi tiết Yêu cầu */}
      <RequestDetailModal
        request={selectedRequest}
        isOpen={selectedRequest !== null}
        onClose={() => {
          setSelectedRequest(null)
          setMessageDraft('')
        }}
        onSendMessage={handleSendMessage}
        messageDraft={messageDraft}
        onMessageDraftChange={setMessageDraft}
        selectedEmployee={selectedEmployee}
        onRequestUpdate={(updatedRequest) => {
          // Chỉ cập nhật selectedRequest nếu modal đang mở (selectedRequest không null)
          if (selectedRequest && selectedRequest.id === updatedRequest.id) {
            setSelectedRequest(updatedRequest)
          }
          // Cập nhật trong danh sách myRequests
          if (onMyRequestsUpdate) {
            const updatedRequests = myRequests.map((req) =>
              req.id === updatedRequest.id ? updatedRequest : req,
            )
            onMyRequestsUpdate(updatedRequests)
          }
        }}
      />

      {/* Modal Yêu cầu từ IT */}
      <ITRequestModal
        request={itRequestModalRequest}
        isOpen={itRequestModalOpen}
        onClose={() => {
          setItRequestModalOpen(false)
          setItRequestModalRequest(null)
        }}
        selectedEmployee={selectedEmployee}
        onRequestUpdate={(updatedRequest) => {
          // Cập nhật trong danh sách myRequests
          if (onMyRequestsUpdate) {
            const updatedRequests = myRequests.map((req) =>
              req.id === updatedRequest.id ? updatedRequest : req,
            )
            onMyRequestsUpdate(updatedRequests)
          }
          // Cập nhật itRequestModalRequest nếu đang mở
          if (itRequestModalRequest && itRequestModalRequest.id === updatedRequest.id) {
            setItRequestModalRequest(updatedRequest)
          }
        }}
      />
    </div>
  )
}
