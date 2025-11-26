import { avatarPalette, priorityMeta } from '../constants/meta'
import type {
  Employee,
  EmployeeDTO,
  NoteDTO,
  RequestDTO,
  RequestNote,
  ServiceRequest,
  AttachmentDTO,
  NoteAttachment,
} from '../types'

const deriveAvatarGradient = (seed: string) => {
  if (!seed) return avatarPalette[0]
  const hash = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return avatarPalette[hash % avatarPalette.length]
}

export const mapEmployee = (dto: EmployeeDTO): Employee => ({
  id: dto.id,
  name: dto.name,
  email: dto.email,
  department: dto.department,
  avatarColor: deriveAvatarGradient(`${dto.email}-${dto.department}`),
  createdAt: dto.createdAt,
})

export const mapAttachment = (dto: AttachmentDTO): NoteAttachment => ({
  id: dto.id,
  noteId: dto.noteId,
  fileName: dto.fileName,
  filePath: dto.filePath,
  fileSize: dto.fileSize,
  fileType: dto.fileType,
  uploadedBy: dto.uploadedBy,
  createdAt: dto.createdAt,
})

export const mapNote = (dto: NoteDTO): RequestNote => ({
  id: dto.id,
  author: dto.author,
  message: dto.message,
  visibility: dto.visibility,
  noteType: dto.noteType ?? 'normal',
  parentNoteId: dto.parentNoteId ?? undefined,
  createdAt: dto.createdAt,
  attachments: dto.attachments?.map(mapAttachment) ?? undefined,
})

export const mapRequest = (
  dto: RequestDTO,
  notes: RequestNote[] = [],
): ServiceRequest => ({
  id: dto.id,
  title: dto.title,
  type: dto.type,
  description: dto.description,
  priority: dto.priority,
  status: dto.status,
  createdAt: dto.createdAt,
  targetSla: dto.targetSla,
  employeeId: dto.employeeId,
  employeeName: dto.employeeName,
  employeeEmail: dto.employeeEmail,
  employeeDepartment: dto.employeeDepartment,
  lastUpdated: dto.lastUpdated,
  completedAt: dto.completedAt ?? undefined,
  notes,
  estimatedCost: dto.estimatedCost ?? undefined,
  confirmedCost: dto.confirmedCost ?? undefined,
})

export const getSlaTargetHours = (priority: keyof typeof priorityMeta) =>
  priorityMeta[priority].slaHours
