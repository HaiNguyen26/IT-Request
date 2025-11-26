export type RoleKey = 'employee' | 'itManager' | 'leadership'
export type ManagerRole = Exclude<RoleKey, 'employee'>

export type PriorityKey = 'urgent' | 'high' | 'medium' | 'low'

export type StatusKey = 'new' | 'inProgress' | 'waiting' | 'completed'

export interface Employee {
  id: string
  name: string
  email: string
  department: string
  avatarColor: string
  createdAt?: string
}

export interface NoteAttachment {
  id: string
  noteId: string
  fileName: string
  filePath: string
  fileSize: number
  fileType: string
  uploadedBy: string
  createdAt: string
}

export interface RequestNote {
  id: string
  author: string
  message: string
  createdAt: string
  visibility: 'public' | 'internal'
  noteType?: 'normal' | 'employee_request' | 'employee_response'
  parentNoteId?: string | null
  attachments?: NoteAttachment[]
}

export interface ServiceRequest {
  id: string
  title: string
  type: string
  description: string
  priority: PriorityKey
  status: StatusKey
  createdAt: string
  targetSla: string
  employeeId: string
  employeeName: string
  employeeEmail: string
  employeeDepartment: string
  lastUpdated: string
  completedAt?: string
  notes: RequestNote[]
  estimatedCost?: number | null
  confirmedCost?: number | null
}

export interface CreationFeedback {
  type: 'success' | 'error'
  message: string
}

export interface EmployeeLoginForm {
  name: string
  password: string
}

export interface ManagementLoginForm {
  username: string
  password: string
}

export interface SlaOverview {
  total: number
  completed: number
  breached: number
  slaMet: number
  avgResolutionHours: number | null
}

export interface EmployeeDTO {
  id: string
  name: string
  email: string
  department: string
  createdAt: string
}

export interface EmployeePayload {
  name: string
  email: string
  department: string
}

export interface RequestDTO {
  id: string
  title: string
  type: string
  description: string
  priority: PriorityKey
  status: StatusKey
  targetSla: string
  createdAt: string
  lastUpdated: string
  completedAt: string | null
  employeeId: string
  employeeName: string
  employeeEmail: string
  employeeDepartment: string
  estimatedCost?: number | null
  confirmedCost?: number | null
}

export interface AttachmentDTO {
  id: string
  noteId: string
  fileName: string
  filePath: string
  fileSize: number
  fileType: string
  uploadedBy: string
  createdAt: string
}

export interface NoteDTO {
  id: string
  requestId: string
  author: string
  message: string
  visibility: 'public' | 'internal'
  noteType?: 'normal' | 'employee_request' | 'employee_response'
  parentNoteId?: string | null
  createdAt: string
  attachments?: AttachmentDTO[]
}

export interface ManagementAccountDTO {
  id: string
  role: ManagerRole
  username: string
  displayName: string
  email: string
  department: string | null
}
