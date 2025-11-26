import * as XLSX from 'xlsx'

export interface ParsedEmployeeRow {
    name: string
    email: string
    department: string
}

const REQUIRED_COLUMNS = {
    name: 'Họ và Tên',
    email: 'Email cá nhân',
    department: 'Bộ phận',
} as const

const sanitizeCell = (value: unknown) => String(value ?? '').trim()

const normalizeHeader = (value: string) =>
    sanitizeCell(value)
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/\s+/g, ' ')
        .toLocaleLowerCase('vi')

export const parseEmployeeExcel = async (file: File): Promise<ParsedEmployeeRow[]> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onerror = () => reject(new Error('Không thể đọc file Excel.'))

        reader.onload = (event) => {
            try {
                const buffer = event.target?.result
                if (!buffer) {
                    reject(new Error('Không thể đọc dữ liệu từ file.'))
                    return
                }

                const workbook = XLSX.read(buffer, { type: 'array' })
                const sheetName = workbook.SheetNames[0]
                if (!sheetName) {
                    reject(new Error('File Excel không chứa sheet nào.'))
                    return
                }

                const worksheet = workbook.Sheets[sheetName]
                const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
                    defval: '',
                })

                if (rows.length === 0) {
                    reject(new Error('File Excel không có dữ liệu.'))
                    return
                }

                const headers = Object.keys(rows[0] ?? {})
                const normalizedHeaderMap = new Map<string, string>()
                headers.forEach((header) => {
                    normalizedHeaderMap.set(normalizeHeader(header), header)
                })

                const columnMap = Object.entries(REQUIRED_COLUMNS).reduce(
                    (acc, [key, label]) => {
                        const normalized = normalizeHeader(label)
                        const actualHeader = normalizedHeaderMap.get(normalized)
                        if (!actualHeader) {
                            acc.missing.push(label)
                        } else {
                            acc.found[key as keyof typeof REQUIRED_COLUMNS] = actualHeader
                        }
                        return acc
                    },
                    {
                        found: {} as Record<keyof typeof REQUIRED_COLUMNS, string>,
                        missing: [] as string[],
                    },
                )

                if (columnMap.missing.length > 0) {
                    reject(new Error(`Thiếu cột: ${columnMap.missing.join(', ')}`))
                    return
                }

                const parsed = rows
                    .map((row, index) => {
                        const name = sanitizeCell(row[columnMap.found.name])
                        const email = sanitizeCell(row[columnMap.found.email]).toLowerCase()
                        const department = sanitizeCell(row[columnMap.found.department])

                        const rowNumber = index + 2 // +2 vì header là dòng 1

                        if (!name || !email || !department) {
                            console.warn(`Bỏ qua dòng ${rowNumber} vì thiếu dữ liệu.`)
                            return null
                        }

                        return {
                            name,
                            email,
                            department,
                        }
                    })
                    .filter((value): value is ParsedEmployeeRow => Boolean(value))

                if (parsed.length === 0) {
                    reject(new Error('Không có dòng hợp lệ trong file Excel.'))
                    return
                }

                resolve(parsed)
            } catch (error) {
                reject(error instanceof Error ? error : new Error('Không thể xử lý file Excel.'))
            }
        }

        reader.readAsArrayBuffer(file)
    })
