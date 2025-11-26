import { useState } from 'react'
import type { ServiceRequest } from '../../types'

interface EmployeeRequestModalProps {
    request: ServiceRequest | null
    isOpen: boolean
    onClose: () => void
    onSend: (message: string) => Promise<void>
    isSending: boolean
}

export const EmployeeRequestModal = ({
    request,
    isOpen,
    onClose,
    onSend,
    isSending,
}: EmployeeRequestModalProps) => {
    const [message, setMessage] = useState('')

    if (!isOpen || !request) return null

    const handleSend = async () => {
        if (!message.trim() || isSending) return
        try {
            await onSend(message.trim())
            setMessage('')
            onClose()
        } catch (error) {
            console.error('Không thể gửi yêu cầu', error)
        }
    }

    return (
        <div
            className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose()
                }
            }}
        >
            <div
                className="modal-panel relative flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border-dark bg-[#161b22] shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex-shrink-0 border-b border-border-dark bg-[#080A0D] px-6 py-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-text-light">
                            📋 Gửi Yêu Cầu Bổ Sung Cho Nhân Viên
                        </h2>
                        <button
                            onClick={onClose}
                            className="rounded-lg p-2 text-xl text-text-subtle transition hover:bg-[#161b22] hover:text-text-light"
                            aria-label="Đóng modal"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 min-h-0 overflow-y-auto p-6">
                    <div className="space-y-4">
                        {/* Thông tin request */}
                        <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
                            <p className="text-sm text-blue-200 mb-1">
                                <span className="font-semibold">Yêu cầu:</span> {request.title}
                            </p>
                            <p className="text-xs text-blue-300/80">
                                <span className="font-semibold">Nhân viên:</span> {request.employeeName}
                            </p>
                        </div>

                        {/* Textarea */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-white">
                                Nội dung yêu cầu bổ sung <span className="text-red-400">*</span>
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Ví dụ: Vui lòng bổ sung hình ảnh thiết bị, phiếu yêu cầu có chữ ký..."
                                rows={6}
                                className="w-full rounded-lg border border-orange-500/50 bg-gray-700 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-orange-400 focus:outline-none"
                            />
                            <p className="mt-2 text-xs text-white/70">
                                Yêu cầu này sẽ được gửi cho nhân viên và họ có thể phản hồi kèm file đính kèm.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 border-t border-border-dark bg-[#080A0D] px-6 py-4">
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-lg bg-gray-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-500"
                        >
                            Hủy
                        </button>
                        <button
                            type="button"
                            onClick={handleSend}
                            disabled={!message.trim() || isSending}
                            className="flex-1 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSending ? 'Đang gửi...' : '📤 Gửi Yêu Cầu'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

