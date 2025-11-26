import { useState, useEffect } from 'react'
import { api } from '../../api'
import { mapNote } from '../../utils/mappers'
import { formatDateTime } from '../../utils/time'
import type { ServiceRequest, Employee } from '../../types'

interface ITRequestModalProps {
    request: ServiceRequest | null
    isOpen: boolean
    onClose: () => void
    selectedEmployee: Employee
    onRequestUpdate?: (updatedRequest: ServiceRequest) => void
}

export const ITRequestModal = ({
    request,
    isOpen,
    onClose,
    selectedEmployee,
    onRequestUpdate,
}: ITRequestModalProps) => {
    const [responseDraft, setResponseDraft] = useState('')
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [isSendingResponse, setIsSendingResponse] = useState(false)
    const [localRequest, setLocalRequest] = useState<ServiceRequest | null>(null)

    // Sync local request với prop request
    useEffect(() => {
        if (request) {
            setLocalRequest(request)
        } else {
            setLocalRequest(null)
        }
    }, [request])

    // Reset form khi modal đóng
    useEffect(() => {
        if (!isOpen) {
            setResponseDraft('')
            setSelectedFiles([])
        }
    }, [isOpen])

    if (!isOpen || !request || !localRequest) return null

    // Lấy các yêu cầu từ IT (employee_request) chưa được phản hồi
    const pendingITRequests = localRequest.notes.filter(
        (note) => note.noteType === 'employee_request' && !localRequest.notes.some((n) => n.parentNoteId === note.id)
    )

    if (pendingITRequests.length === 0) {
        return null
    }

    const handleSendResponse = async (itRequestNoteId: string) => {
        if (!responseDraft.trim() && selectedFiles.length === 0) {
            alert('Vui lòng nhập phản hồi hoặc đính kèm file')
            return
        }
        if (isSendingResponse) return

        setIsSendingResponse(true)
        try {
            const created = await api.sendEmployeeResponse(localRequest.id, {
                message: responseDraft.trim() || (selectedFiles.length > 0 ? 'Đã đính kèm file' : ''),
                parentNoteId: itRequestNoteId,
                author: selectedEmployee.name,
                files: selectedFiles.length > 0 ? selectedFiles : undefined,
            })
            const mapped = mapNote(created)
            const updatedRequest = {
                ...localRequest,
                notes: [mapped, ...localRequest.notes],
                status: 'inProgress' as const,
                lastUpdated: new Date().toISOString(),
            }
            setLocalRequest(updatedRequest)
            if (onRequestUpdate) {
                onRequestUpdate(updatedRequest)
            }
            setResponseDraft('')
            setSelectedFiles([])
        } catch (error) {
            console.error('Không thể gửi phản hồi', error)
            alert(error instanceof Error ? error.message : 'Không thể gửi phản hồi')
        } finally {
            setIsSendingResponse(false)
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
                className="modal-panel relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border-dark bg-[#161b22] shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex-shrink-0 border-b border-border-dark bg-[#080A0D] px-6 py-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-text-light">
                            📋 Yêu cầu từ IT
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
                <div className="flex-1 min-h-0 overflow-y-auto p-6 custom-scrollbar">
                    <div className="space-y-4">
                        {pendingITRequests.map((itRequest) => {
                            const hasResponse = localRequest.notes.some((n) => n.parentNoteId === itRequest.id)

                            return (
                                <div key={itRequest.id} className="rounded-lg border-2 border-orange-500/60 bg-orange-500/10 p-4">
                                    <div className="mb-3 flex items-center gap-2">
                                        <span className="text-lg">⚠️</span>
                                        <span className="text-sm font-semibold text-orange-300 uppercase">
                                            Yêu cầu bổ sung từ IT
                                        </span>
                                    </div>
                                    <p className="mb-3 text-sm font-medium text-orange-100 whitespace-pre-line">
                                        {itRequest.message}
                                    </p>
                                    <div className="mb-3 text-xs text-orange-300/70">
                                        Yêu cầu từ: {itRequest.author} • {formatDateTime(itRequest.createdAt)}
                                    </div>

                                    {hasResponse ? (
                                        <div className="rounded-lg bg-green-500/20 border border-green-500/50 px-3 py-2">
                                            <p className="text-sm font-semibold text-green-300">✓ Đã phản hồi</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <textarea
                                                value={responseDraft}
                                                onChange={(e) => setResponseDraft(e.target.value)}
                                                placeholder="Nhập phản hồi của bạn (ví dụ: đã bổ sung hình ảnh, đã ký phiếu yêu cầu)..."
                                                rows={3}
                                                className="w-full rounded-lg border border-blue-500/50 bg-gray-700 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:border-blue-400 focus:outline-none"
                                            />
                                            {/* File Upload */}
                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-white/80">
                                                    Đính kèm file (PDF, Word, Excel, Hình ảnh) - Tối đa 5 file, mỗi file 10MB
                                                </label>
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp"
                                                    onChange={(e) => {
                                                        const files = Array.from(e.target.files || [])
                                                        if (files.length > 5) {
                                                            alert('Chỉ được chọn tối đa 5 file')
                                                            return
                                                        }
                                                        const oversizedFiles = files.filter(f => f.size > 10 * 1024 * 1024)
                                                        if (oversizedFiles.length > 0) {
                                                            alert(`Các file sau vượt quá 10MB: ${oversizedFiles.map(f => f.name).join(', ')}`)
                                                            return
                                                        }
                                                        setSelectedFiles(files)
                                                    }}
                                                    className="w-full rounded-lg border border-blue-500/50 bg-gray-700 px-3 py-2 text-xs text-white file:mr-4 file:rounded-lg file:border-0 file:bg-blue-500 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-blue-600"
                                                />
                                                {selectedFiles.length > 0 && (
                                                    <div className="mt-2 space-y-1">
                                                        {selectedFiles.map((file, idx) => (
                                                            <div key={idx} className="flex items-center justify-between rounded bg-blue-500/10 px-2 py-1 text-xs text-blue-200">
                                                                <span className="truncate">{file.name}</span>
                                                                <span className="ml-2 text-blue-300">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== idx))}
                                                                    className="ml-2 text-red-400 hover:text-red-300"
                                                                >
                                                                    ×
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleSendResponse(itRequest.id)}
                                                    disabled={(!responseDraft.trim() && selectedFiles.length === 0) || isSendingResponse}
                                                    className="flex-1 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600 disabled:opacity-50"
                                                >
                                                    {isSendingResponse ? 'Đang gửi...' : '✓ Gửi phản hồi'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={onClose}
                                                    className="rounded-lg bg-gray-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-500"
                                                >
                                                    Đóng
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

