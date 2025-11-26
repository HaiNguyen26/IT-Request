import { useState, useEffect } from 'react'
import { PriorityBadge } from '../common/PriorityBadge'
import { StatusBadge } from '../common/StatusBadge'
import { formatDateTime, timeRemaining, slaProgress } from '../../utils/time'
import { formatVND } from '../../utils/format'
import { priorityMeta } from '../../constants/meta'
import { api } from '../../api'
import { mapNote } from '../../utils/mappers'
import type { Employee, ServiceRequest } from '../../types'


interface RequestDetailModalProps {
    request: ServiceRequest | null
    isOpen: boolean
    onClose: () => void
    onSendMessage: (message: string) => void
    messageDraft: string
    onMessageDraftChange: (message: string) => void
    selectedEmployee: Employee
    onRequestUpdate?: (updatedRequest: ServiceRequest) => void
}

export const RequestDetailModal = ({
    request,
    isOpen,
    onClose,
    onSendMessage,
    messageDraft,
    onMessageDraftChange,
    selectedEmployee,
    onRequestUpdate,
}: RequestDetailModalProps) => {
    const [isSending, setIsSending] = useState(false)
    const [localRequest, setLocalRequest] = useState<ServiceRequest | null>(null)

    // Sync local request với prop request
    useEffect(() => {
        if (request) {
            setLocalRequest(request)
        } else {
            // Reset localRequest khi request là null
            setLocalRequest(null)
        }
    }, [request])


    // Refresh notes khi modal mở để đảm bảo có dữ liệu mới nhất
    useEffect(() => {
        if (!isOpen || !request) return

        let isCancelled = false

        const refreshNotes = async () => {
            try {
                const notes = await api.getRequestNotes(request.id)

                // Kiểm tra lại nếu modal đã đóng trong khi đang fetch
                if (isCancelled) return

                const updatedRequest = {
                    ...request,
                    notes: notes.map(mapNote),
                }
                setLocalRequest(updatedRequest)

                // Chỉ gọi onRequestUpdate nếu modal vẫn đang mở và chưa bị hủy
                if (onRequestUpdate && isOpen && !isCancelled) {
                    onRequestUpdate(updatedRequest)
                }
            } catch (error) {
                if (isCancelled) return
                console.error('Không thể tải notes mới nhất', error)
                // Nếu lỗi, vẫn dùng request từ props
                setLocalRequest(request)
            }
        }

        void refreshNotes()

        // Cleanup: đánh dấu là đã hủy khi modal đóng
        return () => {
            isCancelled = true
        }
    }, [isOpen, request?.id, onRequestUpdate])

    // Không hiển thị modal nếu không mở hoặc không có request
    if (!isOpen || !request) return null

    // Nếu chưa có localRequest, hiển thị loading hoặc dùng request từ props
    if (!localRequest) {
        // Đợi localRequest được set
        return null
    }

    // Sử dụng localRequest thay vì request để có dữ liệu mới nhất
    const displayRequest = localRequest


    const handleSend = async () => {
        if (!messageDraft.trim() || isSending) return
        setIsSending(true)
        await onSendMessage(messageDraft.trim())
        setIsSending(false)
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            void handleSend()
        }
    }

    // Lấy tất cả notes public để hiển thị trong chat (bao gồm cả employee_request và employee_response)
    const allChatNotes = displayRequest.notes
        .filter((note) => note.visibility === 'public')
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

    // Lấy public notes cho activity history (không bao gồm employee_request/response vì chúng đã được hiển thị riêng)
    const publicNotes = displayRequest.notes.filter((note) =>
        note.visibility === 'public' &&
        note.noteType !== 'employee_request' &&
        note.noteType !== 'employee_response'
    )

    const progress = slaProgress(displayRequest)
    const remaining = timeRemaining(displayRequest.targetSla)

    // Sử dụng displayRequest thay vì request cho tất cả hiển thị

    // Giả lập handler (trong thực tế sẽ lấy từ API)
    const handler = {
        name: 'Trần Duy',
        role: 'IT Support Level 2',
        initials: 'TD',
    }

    // Format time chỉ hiển thị giờ:phút
    const formatTimeOnly = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }

    // Format date cho hiển thị
    const formatDateShort = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }

    // Format datetime cho hiển thị
    const formatDateTimeShort = (dateString: string) => {
        return `${formatTimeOnly(dateString)} ${formatDateShort(dateString)}`
    }

    // Activity history - Sắp xếp theo thời gian từ mới đến cũ
    const activities = [
        {
            time: formatTimeOnly(displayRequest.createdAt),
            action: `Yêu cầu được tạo tự động với độ ưu tiên ${priorityMeta[displayRequest.priority].label}`,
            type: 'system',
            color: 'bg-green-500', // Green dot
        },
        ...publicNotes
            .map((note) => {
                let action = note.message
                let type = 'note'
                let color = 'bg-blue-500' // Default blue

                // Kiểm tra nếu là status change
                if (note.message.includes('Trạng thái') || note.message.includes('status') || note.message.includes('chuyển')) {
                    type = 'status_change'
                    color = 'bg-blue-500'
                    // Tìm status trong message
                    if (note.message.includes('Đang xử lý')) {
                        action = 'Ticket chuyển trạng thái sang Đang xử lý (Do IT phản hồi)'
                    }
                } else if (note.author.includes('IT') || note.author.includes('Manager')) {
                    type = 'it_comment'
                    color = 'bg-blue-500'
                    action = `${note.author} đã thêm nhận xét về ${note.message.substring(0, 20)}...`
                }

                return {
                    time: formatTimeOnly(note.createdAt),
                    action,
                    type,
                    color,
                }
            })
            .sort((a, b) => {
                // Sắp xếp từ mới đến cũ (ngược lại)
                const timeA = a.time.split(':').map(Number)
                const timeB = b.time.split(':').map(Number)
                const minutesA = timeA[0] * 60 + timeA[1]
                const minutesB = timeB[0] * 60 + timeB[1]
                return minutesB - minutesA
            }),
    ]

    return (
        <div
            className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={(e) => {
                // Chỉ đóng khi click vào overlay, không phải vào modal content
                if (e.target === e.currentTarget) {
                    onClose()
                }
            }}
        >
            <div
                className="modal-panel relative flex h-[90vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-border-dark bg-[#161b22] shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 1. Header */}
                <div className="flex-shrink-0 border-b border-border-dark gradient-header px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* ID và Title */}
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-sm text-text-subtle">
                                {displayRequest.id.slice(0, 8)}
                            </span>
                            <h2 className="text-lg font-semibold text-text-light">
                                {displayRequest.title}
                            </h2>
                        </div>

                        {/* Badges và Nút Đóng */}
                        <div className="flex items-center gap-3">
                            <PriorityBadge priority={displayRequest.priority} />
                            <StatusBadge status={displayRequest.status} />
                            <button
                                onClick={onClose}
                                className="rounded-lg p-2 text-xl text-text-subtle transition hover:bg-[#161b22] hover:text-text-light"
                                aria-label="Đóng modal"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. Body - Grid 2 Cột */}
                <div className="grid flex-1 min-h-0 grid-cols-3 overflow-hidden">
                    {/* Cột 1 & 2: Thông tin Chi tiết & Chat */}
                    <div className="col-span-2 flex flex-col overflow-hidden border-r border-border-dark">
                        {/* A. THÔNG TIN CHI TIẾT + SLA - Layout ngang để tiết kiệm diện tích */}
                        <div className="flex-shrink-0 bg-[#070b13] p-5">
                            <div className="flex items-start gap-3">
                                <div className="h-6 w-1 rounded-full bg-blue-500"></div>
                                <div className="flex-1">
                                    <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-blue-400">
                                        THÔNG TIN CHI TIẾT & SLA
                                    </h4>
                                    {/* Grid layout ngang - 2 cột */}
                                    <div className="grid grid-cols-2 gap-5">
                                        {/* Cột trái: Thông tin cơ bản */}
                                        <div className="space-y-3">
                                            <div>
                                                <span className="text-xs text-text-subtle">Loại Yêu Cầu:</span>
                                                <p className="text-sm font-medium text-text-light">{displayRequest.type}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs text-text-subtle">Ngày Tạo:</span>
                                                <p className="text-sm font-medium text-text-light">
                                                    {formatTimeOnly(displayRequest.createdAt)} {formatDateShort(displayRequest.createdAt)}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-xs text-text-subtle">Cập nhật:</span>
                                                <p className="text-sm font-medium text-text-light">
                                                    {formatDateTime(displayRequest.lastUpdated)}
                                                </p>
                                            </div>
                                        </div>
                                        {/* Cột phải: SLA và Mô tả */}
                                        <div className="space-y-3">
                                            {/* SLA CAM KẾT - Compact */}
                                            <div>
                                                <span className="text-xs text-text-subtle">SLA CAM KẾT:</span>
                                                <div className="mt-1.5">
                                                    <div className="flex items-center justify-between text-sm mb-2">
                                                        <span className="text-blue-400 font-semibold">
                                                            {priorityMeta[displayRequest.priority].slaHours}h
                                                        </span>
                                                        <span
                                                            className={`font-semibold ${remaining.includes('Quá hạn')
                                                                ? 'text-red-400'
                                                                : 'text-green-400'
                                                                }`}
                                                        >
                                                            {remaining.toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="relative h-3 overflow-hidden rounded-full border border-blue-900/40 bg-[#111522] shadow-inner shadow-blue-500/20">
                                                        <div
                                                            className="h-full rounded-full"
                                                            style={{
                                                                width: `${Math.min(100, Math.max(0, progress))}%`,
                                                                backgroundImage:
                                                                    'linear-gradient(120deg, rgba(6,182,212,0.9), rgba(59,130,246,0.95), rgba(168,85,247,0.9))',
                                                                backgroundSize: '200% 100%',
                                                                animation: 'gradient-shift 2.5s ease infinite',
                                                                boxShadow: '0 0 20px rgba(59,130,246,0.5)',
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Mô tả chi tiết - Compact */}
                                            <div>
                                                <span className="text-xs text-text-subtle">Mô tả:</span>
                                                <div className="mt-1.5 rounded bg-purple-900/30 border border-purple-700/50 p-3">
                                                    <p className="text-sm leading-relaxed text-purple-200 line-clamp-4">
                                                        {displayRequest.description}
                                                    </p>
                                                </div>
                                            </div>
                                            {/* Giá thành (chỉ hiển thị khi loại là "Mua sắm thiết bị") */}
                                            {displayRequest.type === 'Mua sắm thiết bị' && (
                                                <div>
                                                    <span className="text-xs text-text-subtle">Giá thành:</span>
                                                    <div className="mt-1.5 rounded bg-amber-900/30 border border-amber-700/50 p-3">
                                                        {displayRequest.estimatedCost && (
                                                            <div className="mb-1">
                                                                <span className="text-xs text-amber-300/80">Giá đề xuất:</span>
                                                                <p className="text-sm font-semibold text-amber-200">{formatVND(displayRequest.estimatedCost)}</p>
                                                            </div>
                                                        )}
                                                        {displayRequest.confirmedCost ? (
                                                            <div>
                                                                <span className="text-xs text-green-300/80">Giá đã xác nhận:</span>
                                                                <p className="text-base font-bold text-green-400">{formatVND(request.confirmedCost)}</p>
                                                            </div>
                                                        ) : (
                                                            <p className="text-xs text-amber-300/70">Đang chờ IT xác nhận giá</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* C. TRAO ĐỔI VỚI IT SUPPORT */}
                        <div className="flex flex-1 min-h-0 flex-col overflow-hidden bg-[#070b13]">
                            <div className="flex-shrink-0 p-6">
                                <div className="flex items-start gap-3">
                                    {/* Vertical blue line */}
                                    <div className="h-6 w-1 rounded-full bg-blue-500"></div>
                                    <h4 className="text-sm font-semibold uppercase tracking-wider text-blue-400">
                                        TRAO ĐỔI VỚI IT SUPPORT
                                    </h4>
                                </div>
                            </div>

                            {/* Chat Messages */}
                            <div className="flex-1 min-h-0 overflow-y-auto bg-[#070b13] px-6 py-5 custom-scrollbar">
                                <div className="space-y-3">
                                    {allChatNotes.length === 0 ? (
                                        <p className="text-sm text-text-subtle">Chưa có trao đổi nào.</p>
                                    ) : (
                                        allChatNotes.map((note) => {
                                            // Xác định loại message
                                            const isEmployeeRequest = note.noteType === 'employee_request'
                                            const isEmployeeResponse = note.noteType === 'employee_response'

                                            // Xác định message từ nhân viên (user) hay từ IT
                                            // Nếu là employee_response thì chắc chắn là từ nhân viên
                                            // Nếu author khớp với tên nhân viên thì là từ nhân viên
                                            // Ngược lại là từ IT
                                            const isUserMessage =
                                                isEmployeeResponse ||
                                                note.author === selectedEmployee.name ||
                                                note.author === selectedEmployee.email.split('@')[0] ||
                                                note.author.toLowerCase().includes(selectedEmployee.name.toLowerCase())

                                            // Message từ IT (không phải từ nhân viên)
                                            const isITMessage = !isUserMessage && !isEmployeeRequest

                                            // Nếu là employee_request, hiển thị với style đặc biệt và form phản hồi
                                            if (isEmployeeRequest) {
                                                const hasResponse = displayRequest.notes.some((n) => n.parentNoteId === note.id)

                                                return (
                                                    <div key={note.id} className="flex justify-start">
                                                        <div className="relative max-w-[85%] w-full">
                                                            <div className="rounded-2xl border-2 border-orange-500/60 bg-orange-500/10 p-4 shadow-sm mb-2">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <span className="text-lg">⚠️</span>
                                                                    <span className="text-xs font-semibold text-orange-300 uppercase">
                                                                        Yêu cầu bổ sung từ IT
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm font-medium text-orange-100 whitespace-pre-line mb-2">
                                                                    {note.message}
                                                                </p>
                                                                <div className="flex items-center justify-between text-xs">
                                                                    <span className="text-orange-300/70">
                                                                        {note.author} • {formatDateTimeShort(note.createdAt)}
                                                                    </span>
                                                                    {hasResponse && (
                                                                        <span className="text-green-400 font-semibold">✓ Đã phản hồi</span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Thông báo hướng dẫn */}
                                                            {!hasResponse && (
                                                                <div className="mt-2 rounded-lg border border-blue-500/50 bg-blue-500/10 p-2">
                                                                    <p className="text-xs text-blue-300">
                                                                        💡 Vui lòng sử dụng nút <strong>"⚠️ Có yêu cầu từ IT"</strong> ở dashboard để phản hồi và gửi file đính kèm.
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            }

                                            // Hiển thị message thông thường (từ IT hoặc từ nhân viên)
                                            return (
                                                <div key={note.id} className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}>
                                                    <div
                                                        className={`relative max-w-[85%] rounded-2xl border p-4 shadow-sm ${isUserMessage
                                                            ? 'border-indigo-600/50 bg-[#1b1f2a]'
                                                            : 'border-cyan-500/40 bg-[#101426]'
                                                            }`}
                                                    >
                                                        <span
                                                            className={`absolute inset-y-3 left-0 w-1 rounded-full ${isUserMessage
                                                                ? 'bg-indigo-400'
                                                                : 'bg-cyan-400'
                                                                }`}
                                                        />
                                                        <div className="pl-3">
                                                            <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
                                                                <span
                                                                    className={
                                                                        isUserMessage ? 'text-indigo-200' : 'text-cyan-200'
                                                                    }
                                                                >
                                                                    {note.author}
                                                                    {isEmployeeResponse && (
                                                                        <span className="ml-2 text-xs text-green-400">(Phản hồi yêu cầu)</span>
                                                                    )}
                                                                    {isITMessage && (
                                                                        <span className="ml-2 text-xs text-cyan-400">(IT Support)</span>
                                                                    )}
                                                                </span>
                                                                <span className="text-[10px] font-normal text-gray-400">
                                                                    {formatDateTimeShort(note.createdAt)}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm leading-relaxed text-gray-200 whitespace-pre-line">
                                                                {note.message}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Input và Nút Gửi */}
                            <div className="flex-shrink-0 border-t border-border-dark gradient-header px-4 py-3">
                                <div className="flex gap-2">
                                    <textarea
                                        value={messageDraft}
                                        onChange={(e) => onMessageDraftChange(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Nhập phản hồi hoặc yêu cầu thêm thông tin..."
                                        className="flex-1 resize-none rounded-xl border border-border-dark bg-[#141923] px-4 py-2 text-sm text-text-light placeholder:text-text-subtle focus:border-blue-400 focus:outline-none"
                                        rows={1}
                                        disabled={isSending}
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={!messageDraft.trim() || isSending}
                                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span>✈️</span>
                                        <span>{isSending ? 'Đang gửi...' : 'Gửi Phản Hồi'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cột 3: NGƯỜI XỬ LÝ & LỊCH SỬ HOẠT ĐỘNG */}
                    <div className="col-span-1 flex flex-col overflow-hidden border-l border-border-dark">
                        <div className="flex-1 min-h-0 overflow-y-auto p-6 custom-scrollbar">
                            {/* A. NGƯỜI XỬ LÝ */}
                            <div className="mb-6">
                                <div className="flex items-start gap-3 mb-4">
                                    {/* Vertical blue line */}
                                    <div className="h-6 w-1 rounded-full bg-blue-500"></div>
                                    <h4 className="text-sm font-semibold uppercase tracking-wider text-blue-400">
                                        NGƯỜI XỬ LÝ
                                    </h4>
                                </div>
                                <div className="rounded-lg border border-border-dark gradient-sidebar-card p-4 shadow-lg">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-700 text-lg font-semibold text-white shadow-lg">
                                            {handler.initials}
                                        </div>
                                        <div>
                                            <p className="text-base font-semibold text-text-light">
                                                {handler.name}
                                            </p>
                                            <p className="mt-1 text-sm text-text-subtle">{handler.role}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* B. LỊCH SỬ HOẠT ĐỘNG */}
                            <div>
                                <div className="flex items-start gap-3 mb-4">
                                    {/* Vertical blue line */}
                                    <div className="h-6 w-1 rounded-full bg-blue-500"></div>
                                    <h4 className="text-sm font-semibold uppercase tracking-wider text-blue-400">
                                        LỊCH SỬ HOẠT ĐỘNG
                                    </h4>
                                </div>
                                <div className="rounded-lg border border-border-dark gradient-sidebar-card p-4 shadow-lg">
                                    <div className="space-y-0">
                                        {activities.map((activity, index) => (
                                            <div key={index} className="flex gap-4">
                                                {/* Timeline indicator */}
                                                <div className="flex-shrink-0 flex flex-col items-center">
                                                    <div
                                                        className={`h-3 w-3 rounded-full shadow-lg ${activity.color}`}
                                                    />
                                                    {index < activities.length - 1 && (
                                                        <div className="mt-1.5 h-full min-h-[40px] w-0.5 bg-border-dark" />
                                                    )}
                                                </div>
                                                {/* Activity content */}
                                                <div className="flex-1 pb-4">
                                                    <p className="mb-1.5 text-sm font-semibold text-blue-400">
                                                        {activity.time}
                                                    </p>
                                                    <p className="text-sm leading-relaxed text-text-light">
                                                        {activity.action}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
