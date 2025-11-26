import { useState, useEffect } from 'react'
import type { ChangeEvent, RefObject } from 'react'
import { StatusBadge } from '../common/StatusBadge'
import { formatDateTime, slaSeverity, timeRemaining } from '../../utils/time'
import { formatVND, parseCostInput, formatFileSize, getFileIcon } from '../../utils/format'
import { EmployeeRequestModal } from './EmployeeRequestModal'
import type {
    CreationFeedback,
    Employee,
    ServiceRequest,
    StatusKey,
} from '../../types'

// Component quản lý giá thành cho IT Manager
const CostManagementSection = ({ request, onCostUpdate }: { request: ServiceRequest; onCostUpdate: (id: string, cost: number | null) => void }) => {
    const [costInput, setCostInput] = useState<string>('')
    const [isEditing, setIsEditing] = useState(false)

    // Sync costInput khi request thay đổi
    useEffect(() => {
        if (!isEditing) {
            const cost = request.confirmedCost ?? request.estimatedCost
            setCostInput(cost ? cost.toLocaleString('vi-VN') : '')
        }
    }, [request.confirmedCost, request.estimatedCost, isEditing])

    const handleSave = () => {
        const parsed = parseCostInput(costInput)
        onCostUpdate(request.id, parsed)
        setIsEditing(false)
    }

    const handleCancel = () => {
        setCostInput(request.confirmedCost ? request.confirmedCost.toLocaleString('vi-VN') : (request.estimatedCost ? request.estimatedCost.toLocaleString('vi-VN') : ''))
        setIsEditing(false)
    }

    return (
        <div className="rounded-lg border-2 border-amber-500/40 bg-amber-500/10 p-4">
            <h4 className="mb-3 text-sm font-semibold text-amber-300">
                💰 Giá thành
            </h4>
            {!isEditing ? (
                <div className="space-y-2">
                    {request.estimatedCost && (
                        <div>
                            <span className="text-xs text-white/70">Giá đề xuất:</span>
                            <p className="text-base font-bold text-white">{formatVND(request.estimatedCost)}</p>
                        </div>
                    )}
                    {request.confirmedCost ? (
                        <div>
                            <span className="text-xs text-white/70">Giá đã xác nhận:</span>
                            <p className="text-lg font-bold text-green-400">{formatVND(request.confirmedCost)}</p>
                        </div>
                    ) : (
                        <p className="text-sm text-white/70">Chưa xác nhận giá</p>
                    )}
                    <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="mt-2 rounded-lg bg-blue-500/20 px-3 py-1.5 text-xs font-semibold text-blue-300 transition hover:bg-blue-500/30"
                    >
                        {request.confirmedCost ? 'Chỉnh sửa giá' : 'Xác nhận giá'}
                    </button>
                </div>
            ) : (
                <div className="space-y-2">
                    <input
                        type="text"
                        value={costInput}
                        onChange={(e) => setCostInput(e.target.value)}
                        placeholder="Nhập giá thành (VND)"
                        className="w-full rounded-lg border border-amber-500/50 bg-gray-700 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:border-amber-400 focus:outline-none"
                    />
                    {parseCostInput(costInput) && (
                        <p className="text-xs text-green-400">
                            Xác nhận: {formatVND(parseCostInput(costInput))}
                        </p>
                    )}
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={!parseCostInput(costInput)}
                            className="flex-1 rounded-lg bg-green-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-600 disabled:opacity-50"
                        >
                            Xác nhận
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="flex-1 rounded-lg bg-gray-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-gray-500"
                        >
                            Hủy
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

interface EmployeeFormState {
    id: string
    name: string
    email: string
    department: string
}

interface ItManagerDashboardProps {
    requests: ServiceRequest[]
    selectedRequestId: string | null
    onSelectRequest: (id: string) => void
    onStatusUpdate: (id: string, status: StatusKey) => void
    onCostUpdate: (id: string, confirmedCost: number | null) => void
    onSendEmployeeRequest: (id: string, message: string) => Promise<void>
    noteDraft: string
    onNoteDraftChange: (value: string) => void
    onAddNote: (id: string, visibility: 'internal' | 'public') => void
    selectedRequest: ServiceRequest | null
    employeeDirectorySearch: string
    onEmployeeDirectorySearchChange: (value: string) => void
    filteredEmployeeDirectory: Employee[]
    onSelectEmployeeForEdit: (employee: Employee) => void
    onDeleteEmployee: (id: string) => void
    employeeForm: EmployeeFormState
    onEmployeeFormChange: (field: keyof EmployeeFormState, value: string) => void
    onSaveEmployee: () => void
    employeeFormFeedback: CreationFeedback | null | undefined
    editingEmployeeId: string | null
    onCancelEdit: () => void
    importFeedback: string | null
    onImportEmployees: (event: ChangeEvent<HTMLInputElement>) => void
    importInputRef: RefObject<HTMLInputElement | null>
}

export const ItManagerDashboard = ({
    requests,
    selectedRequestId,
    onSelectRequest,
    onStatusUpdate,
    onCostUpdate,
    onSendEmployeeRequest,
    noteDraft,
    onNoteDraftChange,
    onAddNote,
    selectedRequest,
    filteredEmployeeDirectory,
    employeeDirectorySearch,
    onEmployeeDirectorySearchChange,
}: ItManagerDashboardProps) => {
    // State cho employee request modal
    const [isEmployeeRequestModalOpen, setIsEmployeeRequestModalOpen] = useState(false)
    const [isSendingEmployeeRequest, setIsSendingEmployeeRequest] = useState(false)

    const handleSendEmployeeRequestClick = async (message: string) => {
        if (!selectedRequest || !message.trim() || isSendingEmployeeRequest) return
        setIsSendingEmployeeRequest(true)
        try {
            await onSendEmployeeRequest(selectedRequest.id, message)
        } catch (error) {
            console.error('Không thể gửi yêu cầu', error)
            alert('Không thể gửi yêu cầu. Vui lòng thử lại.')
            throw error
        } finally {
            setIsSendingEmployeeRequest(false)
        }
    }

    // Tính toán các metrics
    const newRequestsCount = requests.filter((r) => r.status === 'new').length
    // Đếm số yêu cầu mới đã được gán (giả định: nếu có note từ IT thì đã được gán)
    const assignedNewRequests = requests.filter((r) => {
        if (r.status !== 'new') return false
        if (!r.notes || !Array.isArray(r.notes)) return false
        return r.notes.some(
            (note) =>
                note.author?.includes('IT') ||
                note.author?.includes('Manager') ||
                note.author?.includes('Support') ||
                note.author?.includes('HR'),
        )
    }).length

    const inProgressRequests = requests.filter((r) => r.status === 'inProgress').length
    // Đếm số request đang xử lý có SLA sắp hết hạn (warning)
    const nearExpiryInProgress = requests.filter((r) => {
        if (r.status !== 'inProgress') return false
        return slaSeverity(r.targetSla, r.status) === 'warning'
    }).length

    const overdueOrUrgentCount = requests.filter((r) => {
        const severity = slaSeverity(r.targetSla, r.status)
        return severity === 'breached' || r.priority === 'urgent'
    }).length
    // Tìm request quá hạn đầu tiên để hiển thị chi tiết
    const overdueRequest = requests.find((r) => {
        const severity = slaSeverity(r.targetSla, r.status)
        return severity === 'breached'
    })

    return (
        <div className="flex w-full flex-col bg-[#080A0D]">
            {/* 1. Khu vực Header và Metrics (Trên cùng) */}
            <div className="flex-shrink-0 space-y-6 p-6">
                {/* Tiêu đề chính */}
                <h1 className="text-4xl font-extrabold uppercase tracking-wider text-gradient-dashboard">
                    DASHBOARD IT SUPPORT
                </h1>

                {/* Metrics Box (3 Hộp) */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* Card 1: YÊU CẦU MỚI - Yellow/Orange */}
                    <div className="relative overflow-hidden rounded-lg border-l-4 border-yellow-500 bg-[#161b22] p-6 shadow-lg">
                        <div className="relative z-10">
                            {/* Icon chuông vàng ở góc trên phải */}
                            <div className="absolute right-4 top-4 text-2xl">🔔</div>

                            {/* Title - Màu vàng */}
                            <p className="mb-3 text-sm font-bold uppercase tracking-wider text-yellow-400">
                                YÊU CẦU MỚI
                            </p>

                            {/* Số lớn - Màu trắng */}
                            <p className="mb-2 text-5xl font-extrabold text-white">
                                {newRequestsCount}
                            </p>

                            {/* Chi tiết - Màu xám */}
                            <p className="text-sm text-text-subtle">
                                Đã gán cho bạn: {assignedNewRequests}
                            </p>
                        </div>
                    </div>

                    {/* Card 2: ĐANG XỬ LÝ (IN SLA) - Green */}
                    <div className="relative overflow-hidden rounded-lg border-l-4 border-green-500 gradient-card-green p-6 shadow-lg">
                        <div className="relative z-10">
                            {/* Icon đồng hồ xanh lá ở góc trên phải */}
                            <div className="absolute right-4 top-4 text-2xl">🕐</div>

                            {/* Title - Màu xanh lá */}
                            <p className="mb-3 text-sm font-bold uppercase tracking-wider text-green-400">
                                ĐANG XỬ LÝ (IN SLA)
                            </p>

                            {/* Số lớn - Màu trắng */}
                            <p className="mb-2 text-5xl font-extrabold text-white">
                                {inProgressRequests}
                            </p>

                            {/* Chi tiết - Màu xám */}
                            <p className="text-sm text-text-subtle">
                                SLA Sắp hết hạn: {nearExpiryInProgress}
                            </p>
                        </div>
                    </div>

                    {/* Card 3: QUÁ HẠN / KHẨN CẤP - Red */}
                    <div className="relative overflow-hidden rounded-lg border-l-4 border-red-500 gradient-card p-6 shadow-lg">
                        <div className="relative z-10">
                            {/* Icon cảnh báo đỏ ở góc trên phải */}
                            <div className="absolute right-4 top-4 text-2xl">⚠️</div>

                            {/* Title - Màu đỏ */}
                            <p className="mb-3 text-sm font-bold uppercase tracking-wider text-red-400">
                                QUÁ HẠN / KHẨN CẤP
                            </p>

                            {/* Số lớn - Màu trắng */}
                            <p className="mb-2 text-5xl font-extrabold text-white">
                                {overdueOrUrgentCount}
                            </p>

                            {/* Chi tiết - Màu xám */}
                            <p className="text-sm text-text-subtle">
                                {overdueRequest
                                    ? `${overdueRequest.id.slice(0, 6)} đã quá ${Math.floor(
                                        (Date.now() - new Date(overdueRequest.targetSla).getTime()) /
                                        (1000 * 60 * 60),
                                    )} giờ`
                                    : 'Không có yêu cầu quá hạn'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Khu vực Chính (Chia đôi - Dưới Metrics) */}
            <div className="flex-shrink-0 px-6 pb-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* 2.1. Cột Trái: Hàng đợi yêu cầu - 7/12 cột */}
                    <div className="flex flex-col lg:col-span-7" style={{ minHeight: '600px', maxHeight: '600px' }}>
                        {/* Container với shadow */}
                        <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-border-dark gradient-card p-4 shadow-lg shadow-black/50">
                            <h2 className="mb-4 text-xl font-semibold text-text-light">
                                Hàng đợi yêu cầu
                            </h2>
                            <div className="flex-1 min-h-0 overflow-y-auto rounded-lg bg-gray-800 p-4 custom-scrollbar">
                                <div className="space-y-3">
                                    {requests.length === 0 ? (
                                        <div className="py-12 text-center text-text-subtle">
                                            Không có yêu cầu nào.
                                        </div>
                                    ) : (
                                        requests.map((request) => {
                                            const severity = slaSeverity(request.targetSla, request.status)
                                            const remaining = timeRemaining(request.targetSla)
                                            const isOverdue = severity === 'breached'
                                            const isSelected = selectedRequestId === request.id

                                            // Xác định màu viền trái theo priority và status
                                            const getBorderColor = () => {
                                                if (request.priority === 'urgent' || isOverdue) return 'border-l-red-500' // Đỏ
                                                if (request.status === 'new') return 'border-l-orange-500' // Cam
                                                if (request.status === 'inProgress') return 'border-l-blue-500' // Xanh dương
                                                if (isOverdue) return 'border-l-purple-500' // Tím (quá hạn)
                                                return 'border-l-gray-500' // Mặc định
                                            }

                                            // Format priority text
                                            const getPriorityText = () => {
                                                if (request.priority === 'urgent') return 'Critical Priority'
                                                if (request.priority === 'high') return 'High Priority'
                                                if (request.priority === 'medium') return 'Medium Priority'
                                                return 'Low Priority'
                                            }

                                            // Format thời gian
                                            const getTimeDisplay = () => {
                                                if (isOverdue) {
                                                    const hours = Math.floor(
                                                        (Date.now() - new Date(request.targetSla).getTime()) /
                                                        (1000 * 60 * 60),
                                                    )
                                                    return `${hours} giờ quá hạn`
                                                }
                                                return remaining
                                            }

                                            return (
                                                <button
                                                    key={request.id}
                                                    type="button"
                                                    onClick={() => onSelectRequest(request.id)}
                                                    className={`w-full rounded-lg border-l-4 gradient-card p-4 text-left transition-all hover:opacity-90 ${isSelected ? 'ring-2 ring-accent-cyan ring-offset-2 ring-offset-gray-800' : ''
                                                        } ${getBorderColor()}`}
                                                >
                                                    <div className="flex items-start justify-between gap-4">
                                                        {/* Phần trái: Nội dung chính */}
                                                        <div className="flex-1 min-w-0">
                                                            {/* Tiêu đề - In đậm màu trắng */}
                                                            <h3 className="mb-2 text-base font-bold text-white">
                                                                {request.title}
                                                            </h3>

                                                            {/* Chi tiết: ID và Yêu cầu bởi */}
                                                            <div className="mb-1 text-sm text-text-subtle">
                                                                <span>
                                                                    ID: {request.id.slice(0, 6)} | Yêu cầu bởi:{' '}
                                                                    {request.employeeName}
                                                                </span>
                                                            </div>

                                                            {/* Priority */}
                                                            <div className="text-sm text-text-subtle">
                                                                {getPriorityText()}
                                                            </div>
                                                        </div>

                                                        {/* Phần phải: Status tag và thời gian */}
                                                        <div className="flex-shrink-0 flex flex-col items-end gap-2">
                                                            {/* Status Badge */}
                                                            <StatusBadge status={request.status} />

                                                            {/* Thời gian còn lại/quá hạn */}
                                                            <span
                                                                className={`text-sm font-semibold whitespace-nowrap ${isOverdue
                                                                    ? 'text-red-400' // Màu đỏ nếu quá hạn
                                                                    : 'text-green-400' // Màu xanh lá nếu còn
                                                                    }`}
                                                            >
                                                                {getTimeDisplay()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </button>
                                            )
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2.2. Cột Phải: Chi tiết & Tương tác - 5/12 cột */}
                    <div className="flex flex-col lg:col-span-5" style={{ minHeight: '600px', maxHeight: '600px' }}>
                        {/* Container với shadow - Cho phép scroll */}
                        <div className="flex flex-1 flex-col overflow-y-auto rounded-lg border border-border-dark gradient-card p-4 shadow-lg shadow-black/50 custom-scrollbar">
                            {selectedRequest ? (
                                <div className="flex min-h-full flex-col">
                                    {/* Phần trên: Thông tin cố định */}
                                    <div className="flex-shrink-0 space-y-3 pb-4">
                                        {/* 1. Header Section */}
                                        <div className="space-y-2">
                                            <div className="text-sm text-text-subtle">
                                                <span className="font-semibold text-text-light">Người yêu cầu:</span>{' '}
                                                {selectedRequest.employeeName}
                                            </div>
                                            <div className="text-sm text-text-subtle">
                                                <span className="font-semibold text-text-light">Phòng ban:</span>{' '}
                                                {selectedRequest.employeeDepartment}
                                            </div>
                                        </div>

                                        {/* 2. Issue Title */}
                                        <div>
                                            <h3 className="text-lg font-bold text-text-light">
                                                {selectedRequest.title}
                                            </h3>
                                        </div>

                                        {/* 3. ID và Loại */}
                                        <div className="text-sm text-text-subtle">
                                            <span>
                                                <span className="font-semibold text-text-light">ID:</span> {selectedRequest.id} |{' '}
                                                <span className="font-semibold text-text-light">Loại:</span> {selectedRequest.type}
                                            </span>
                                        </div>

                                        {/* 4. Status and SLA Section */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-text-subtle">Trạng thái hiện tại:</span>
                                                <StatusBadge status={selectedRequest.status} />
                                            </div>
                                            <div className="text-sm">
                                                <span className="text-text-subtle">SLA Còn lại: </span>
                                                <span
                                                    className={`font-semibold ${slaSeverity(selectedRequest.targetSla, selectedRequest.status) ===
                                                        'breached'
                                                        ? 'text-red-400'
                                                        : 'text-green-400'
                                                        }`}
                                                >
                                                    {timeRemaining(selectedRequest.targetSla)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* 5. Detailed Description Section */}
                                        <div className="rounded-lg bg-gray-700 p-4">
                                            <h4 className="mb-2 text-sm font-semibold text-text-light">
                                                Mô tả chi tiết:
                                            </h4>
                                            <p className="text-sm leading-relaxed text-text-subtle whitespace-pre-line">
                                                {selectedRequest.description}
                                            </p>
                                        </div>

                                        {/* 5.5. Giá thành (chỉ hiển thị khi loại là "Mua sắm thiết bị") */}
                                        {selectedRequest.type === 'Mua sắm thiết bị' && <CostManagementSection request={selectedRequest} onCostUpdate={onCostUpdate} />}

                                        {/* 6. Action Buttons (Top) */}
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={() => onStatusUpdate(selectedRequest.id, 'inProgress')}
                                                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${selectedRequest.status === 'inProgress'
                                                    ? 'bg-blue-500 text-white' // Active - màu xanh dương đậm
                                                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/40 hover:bg-blue-500/30'
                                                    }`}
                                            >
                                                <span>🔧</span>
                                                <span>Đang xử lý</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => onStatusUpdate(selectedRequest.id, 'waiting')}
                                                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${selectedRequest.status === 'waiting'
                                                    ? 'bg-orange-500 text-white' // Active - màu cam đậm
                                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                                                    }`}
                                            >
                                                <span>👤</span>
                                                <span>Chờ phản hồi</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => onStatusUpdate(selectedRequest.id, 'completed')}
                                                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${selectedRequest.status === 'completed'
                                                    ? 'bg-green-500 text-white' // Active - màu xanh lá đậm
                                                    : 'bg-green-500/20 text-green-300 border border-green-500/40 hover:bg-green-500/30'
                                                    }`}
                                            >
                                                <span>✓</span>
                                                <span>Hoàn thành</span>
                                            </button>
                                            {/* Nút Yêu cầu từ IT */}
                                            <button
                                                type="button"
                                                onClick={() => setIsEmployeeRequestModalOpen(true)}
                                                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30"
                                            >
                                                <span>📋</span>
                                                <span>Yêu cầu từ IT</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* 7. History Section - Lịch sử Ghi chú & Chat - Hiển thị đầy đủ nội dung */}
                                    <div className="flex-shrink-0 flex flex-col rounded-lg gradient-card p-4">
                                        <h4 className="mb-3 text-sm font-semibold text-text-light">
                                            Lịch sử Ghi chú & Chat
                                        </h4>
                                        <div className="space-y-3">
                                            {!selectedRequest.notes || selectedRequest.notes.length === 0 ? (
                                                <p className="text-center text-sm text-text-subtle">
                                                    Chưa có tin nhắn hoặc ghi chú nào.
                                                </p>
                                            ) : (
                                                selectedRequest.notes
                                                    .sort(
                                                        (a, b) =>
                                                            new Date(a.createdAt).getTime() -
                                                            new Date(b.createdAt).getTime(),
                                                    )
                                                    .map((note) => {
                                                        // Xác định loại tin nhắn
                                                        const isStaffMessage =
                                                            note.author?.includes('IT') ||
                                                            note.author?.includes('Manager') ||
                                                            note.author?.includes('Support') ||
                                                            note.author?.includes('HR') ||
                                                            (note.author && note.author !== selectedRequest.employeeName)
                                                        const isInternalNote = note.visibility === 'internal'

                                                        return (
                                                            <div
                                                                key={note.id}
                                                                className={`flex ${isStaffMessage ? 'justify-end' : 'justify-start'
                                                                    }`}
                                                            >
                                                                <div
                                                                    className={`max-w-[85%] rounded-lg p-3 ${isStaffMessage
                                                                        ? 'bg-blue-500/30 text-blue-100' // Tin nhắn Staff - Xanh Dương, căn phải
                                                                        : isInternalNote
                                                                            ? 'bg-gray-700 border border-yellow-500/50 italic text-gray-300' // Ghi chú Nội bộ - Xám Đậm, viền Vàng, in nghiêng
                                                                            : 'bg-gray-600 text-gray-200' // Tin nhắn User - Xám, căn trái
                                                                        }`}
                                                                >
                                                                    <div className="mb-1 flex items-center justify-between text-xs">
                                                                        <span className="font-semibold">
                                                                            {note.author}
                                                                        </span>
                                                                        <span className="ml-2 text-text-subtle">
                                                                            {formatDateTime(note.createdAt)}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-sm leading-relaxed whitespace-pre-line">
                                                                        {note.message}
                                                                    </p>
                                                                    {/* Hiển thị file đính kèm */}
                                                                    {note.attachments && note.attachments.length > 0 && (
                                                                        <div className="mt-3 space-y-2">
                                                                            <div className="text-xs font-semibold text-text-subtle">
                                                                                File đính kèm:
                                                                            </div>
                                                                            {note.attachments.map((attachment) => {
                                                                                const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'
                                                                                const fileUrl = `${API_BASE}${attachment.filePath}`
                                                                                return (
                                                                                    <a
                                                                                        key={attachment.id}
                                                                                        href={fileUrl}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        className="flex items-center gap-2 rounded-lg bg-blue-500/20 border border-blue-500/40 px-3 py-2 text-xs text-blue-200 hover:bg-blue-500/30 transition cursor-pointer"
                                                                                    >
                                                                                        <span className="text-base">{getFileIcon(attachment.fileType)}</span>
                                                                                        <span className="flex-1 truncate">{attachment.fileName}</span>
                                                                                        <span className="text-blue-300/70">{formatFileSize(attachment.fileSize)}</span>
                                                                                    </a>
                                                                                )
                                                                            })}
                                                                        </div>
                                                                    )}
                                                                    {isInternalNote && (
                                                                        <div className="mt-2 text-xs text-yellow-400">
                                                                            Ghi chú nội bộ
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )
                                                    })
                                            )}
                                        </div>
                                    </div>

                                    {/* 8. Reply/Note Input Area - Cố định ở dưới */}
                                    <div className="flex-shrink-0 pt-2">
                                        <textarea
                                            value={noteDraft}
                                            onChange={(e) => onNoteDraftChange(e.target.value)}
                                            placeholder={`Phản hồi/Ghi chú cho ${selectedRequest.employeeName}...`}
                                            rows={3}
                                            className="w-full rounded-lg border border-border-dark bg-gray-700 px-4 py-3 text-sm text-text-light placeholder:text-text-subtle focus:border-accent-cyan focus:outline-none focus:ring-2 focus:ring-accent-cyan/20"
                                        />
                                    </div>

                                    {/* 9. Action Buttons (Bottom) - Cố định ở dưới */}
                                    <div className="flex-shrink-0 flex gap-2 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => onAddNote(selectedRequest.id, 'internal')}
                                            disabled={!noteDraft.trim()}
                                            className="flex items-center justify-center gap-2 flex-1 rounded-lg border border-gray-500 bg-gray-600 px-4 py-2 text-sm font-semibold text-gray-200 transition hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span>📄</span>
                                            <span>Lưu Ghi Chú Nội Bộ</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onAddNote(selectedRequest.id, 'public')}
                                            disabled={!noteDraft.trim()}
                                            className="flex items-center justify-center gap-2 flex-1 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span>💬</span>
                                            <span>Phản Hồi (Chat)</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex h-full items-center justify-center">
                                    <p className="text-center text-text-subtle">
                                        Chọn một yêu cầu từ danh sách để xem chi tiết và tương tác.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Bảng Danh sách Nhân viên (Phía dưới) */}
            <div className="flex-shrink-0 px-6 pb-6">
                <div className="rounded-lg border border-border-dark gradient-card p-4 shadow-lg shadow-black/50">
                    {/* Header */}
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-text-light">Danh sách Nhân viên</h2>
                            <p className="mt-1 text-sm text-text-subtle">
                                Tổng số: {filteredEmployeeDirectory.length} nhân viên
                            </p>
                        </div>
                        {/* Search box */}
                        <div className="flex items-center gap-3">
                            <input
                                type="text"
                                value={employeeDirectorySearch}
                                onChange={(e) => onEmployeeDirectorySearchChange(e.target.value)}
                                placeholder="Tìm kiếm theo tên, email, phòng ban..."
                                className="rounded-lg border border-border-dark bg-gray-700 px-4 py-2 text-sm text-text-light placeholder:text-text-subtle focus:border-accent-cyan focus:outline-none focus:ring-2 focus:ring-accent-cyan/20"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        <table className="w-full border-collapse">
                            <thead className="sticky top-0 z-10 bg-gray-800/95 backdrop-blur-sm">
                                <tr className="border-b border-white/10">
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/70">
                                        Tên Nhân viên
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/70">
                                        Email
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/70">
                                        Phòng ban
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/70">
                                        Ngày tạo
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/70">
                                        Số yêu cầu
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredEmployeeDirectory.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-12 text-center text-text-subtle">
                                            {employeeDirectorySearch
                                                ? 'Không tìm thấy nhân viên nào phù hợp với từ khóa tìm kiếm.'
                                                : 'Chưa có nhân viên nào trong hệ thống.'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredEmployeeDirectory.map((employee) => {
                                        // Đếm số yêu cầu của nhân viên này
                                        const employeeRequestsCount = requests.filter(
                                            (r) => r.employeeId === employee.id,
                                        ).length

                                        return (
                                            <tr
                                                key={employee.id}
                                                className="transition hover:bg-white/5"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        {/* Avatar */}
                                                        <div
                                                            className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${employee.avatarColor || 'from-gray-500 to-gray-600'} text-sm font-semibold text-white`}
                                                        >
                                                            {employee.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-medium text-text-light">
                                                            {employee.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-sm text-text-subtle">{employee.email}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300">
                                                        {employee.department}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-sm text-text-subtle">
                                                        {employee.createdAt
                                                            ? new Date(employee.createdAt).toLocaleDateString('vi-VN', {
                                                                year: 'numeric',
                                                                month: '2-digit',
                                                                day: '2-digit',
                                                            })
                                                            : '—'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                                                        {employeeRequestsCount} yêu cầu
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Gửi Yêu Cầu Bổ Sung */}
            <EmployeeRequestModal
                request={selectedRequest}
                isOpen={isEmployeeRequestModalOpen}
                onClose={() => setIsEmployeeRequestModalOpen(false)}
                onSend={handleSendEmployeeRequestClick}
                isSending={isSendingEmployeeRequest}
            />
        </div>
    )
}
