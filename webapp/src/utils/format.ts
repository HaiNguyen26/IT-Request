/**
 * Format số tiền thành định dạng VND
 * @param amount - Số tiền cần format
 * @returns Chuỗi định dạng VND (ví dụ: "1.000.000 ₫")
 */
export function formatVND(amount: number | null | undefined): string {
    if (amount === null || amount === undefined) {
        return '—'
    }
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount)
}

/**
 * Parse giá trị từ input thành number
 * @param value - Giá trị từ input
 * @returns Number hoặc null nếu không hợp lệ
 */
export function parseCostInput(value: string): number | null {
    // Loại bỏ ký tự không phải số
    const cleaned = value.replace(/[^\d]/g, '')
    if (cleaned === '') return null
    const num = Number(cleaned)
    return isNaN(num) || num <= 0 ? null : num
}

/**
 * Format file size thành định dạng dễ đọc
 * @param bytes - Kích thước file tính bằng bytes
 * @returns Chuỗi định dạng (ví dụ: "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Lấy icon cho file type
 * @param fileType - MIME type của file
 * @returns Emoji icon
 */
export function getFileIcon(fileType: string): string {
    if (fileType.includes('pdf')) return '📄'
    if (fileType.includes('word') || fileType.includes('document')) return '📝'
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊'
    if (fileType.includes('image')) return '🖼️'
    return '📎'
}

