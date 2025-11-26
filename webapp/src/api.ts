import type {
    EmployeeDTO,
    EmployeePayload,
    ManagementAccountDTO,
    NoteDTO,
    RequestDTO,
} from './types'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    try {
        // Không set Content-Type nếu body là FormData (browser sẽ tự set với boundary)
        const isFormData = init?.body instanceof FormData
        const headers: HeadersInit = isFormData
            ? { ...init?.headers }
            : {
                'Content-Type': 'application/json',
                ...init?.headers,
            }

        const response = await fetch(`${API_BASE}${path}`, {
            ...init,
            headers,
        })

        if (!response.ok) {
            let message = 'Request failed'
            try {
                const data = await response.json()
                message = data.message ?? message
                if (Array.isArray(data.issues) && data.issues.length > 0) {
                    const detail = data.issues
                        .map((issue: { message?: string; path?: string[] }) => {
                            const path = issue.path?.join('.')
                            return path ? `${path}: ${issue.message}` : issue.message
                        })
                        .filter(Boolean)
                        .join(' | ')
                    if (detail) {
                        message = `${message}. Chi tiết: ${detail}`
                    }
                }
            } catch (error) {
                console.error('Failed to parse error response', error)
            }
            throw new Error(message)
        }

        if (response.status === 204) {
            return undefined as T
        }

        return response.json() as Promise<T>
    } catch (error) {
        // Xử lý lỗi network (Failed to fetch)
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error(
                `Không thể kết nối đến server. Vui lòng kiểm tra:\n` +
                `1. Backend server đang chạy tại ${API_BASE}\n` +
                `2. Kiểm tra kết nối mạng\n` +
                `3. Kiểm tra CORS settings`
            )
        }
        // Re-throw các lỗi khác
        throw error
    }
}

export const api = {
    getEmployees: () =>
        request<EmployeeDTO[]>('/employees', {
            method: 'GET',
        }),

    loginEmployee: (payload: { name: string; password: string }) =>
        request<EmployeeDTO>('/auth/employee/login', {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

    findEmployeeByEmail: async (email: string) => {
        try {
            const result = await request<EmployeeDTO>(`/employees?email=${encodeURIComponent(email)}`)
            return result
        } catch (error) {
            if (error instanceof Error && error.message === 'Employee not found') {
                return null
            }
            throw error
        }
    },

    upsertEmployee: (payload: EmployeePayload) =>
        request<EmployeeDTO>('/employees', {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

    deleteEmployee: (id: string) =>
        request<void>(`/employees/${id}`, {
            method: 'DELETE',
        }),

    bulkEmployees: (employees: EmployeePayload[]) =>
        request<EmployeeDTO[]>('/employees/bulk', {
            method: 'POST',
            body: JSON.stringify(employees),
        }),

    getRequests: (params?: { employeeId?: string }) => {
        const search = params?.employeeId ? `?employeeId=${params.employeeId}` : ''
        return request<RequestDTO[]>(`/requests${search}`)
    },

    createRequest: (payload: {
        title: string
        type: string
        description: string
        priority: RequestDTO['priority']
        targetSla: string
        employeeId: string
        estimatedCost?: number | null
    }) =>
        request<RequestDTO>('/requests', {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

    updateRequestStatus: (id: string, status: RequestDTO['status']) =>
        request<{ id: string; status: string; lastUpdated: string; completedAt: string | null }>(
            `/requests/${id}/status`,
            {
                method: 'PATCH',
                body: JSON.stringify({ status }),
            },
        ),

    addRequestNote: (
        id: string,
        payload: { message: string; visibility: NoteDTO['visibility']; author?: string },
    ) =>
        request<NoteDTO>(`/requests/${id}/notes`, {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

    getRequestNotes: (id: string) => request<NoteDTO[]>(`/requests/${id}/notes`),

    sendEmployeeRequest: (id: string, payload: { message: string; author?: string }) =>
        request<NoteDTO>(`/requests/${id}/employee-request`, {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

    sendEmployeeResponse: (id: string, payload: { message: string; parentNoteId: string; author?: string; files?: File[] }) => {
        const formData = new FormData()
        formData.append('message', payload.message)
        formData.append('parentNoteId', payload.parentNoteId)
        if (payload.author) {
            formData.append('author', payload.author)
        }
        if (payload.files && payload.files.length > 0) {
            payload.files.forEach((file) => {
                formData.append('files', file)
            })
        }
        return request<NoteDTO>(`/requests/${id}/employee-response`, {
            method: 'POST',
            body: formData,
        })
    },

    updateRequestCost: (id: string, confirmedCost: number | null) =>
        request<{ id: string; confirmedCost: number | null; lastUpdated: string }>(
            `/requests/${id}/cost`,
            {
                method: 'PATCH',
                body: JSON.stringify({ confirmedCost }),
            },
        ),

    deleteRequest: (id: string, employeeId: string) =>
        request<void>(`/requests/${id}?employeeId=${encodeURIComponent(employeeId)}`, {
            method: 'DELETE',
        }),

    loginManagement: (payload: { role: 'itManager' | 'leadership'; username: string; password: string }) =>
        request<ManagementAccountDTO>('/auth/management/login', {
            method: 'POST',
            body: JSON.stringify(payload),
        }),
}
