import { z } from 'zod'

export const requestInsertSchema = z.object({
  title: z.string().min(1),
  type: z.string().min(1),
  description: z.string().min(1),
  priority: z.enum(['urgent', 'high', 'medium', 'low']),
  targetSla: z.string().datetime(),
  employeeId: z.string().uuid(),
  estimatedCost: z.number().positive().optional().nullable(),
})

export const requestStatusSchema = z.object({
  status: z.enum(['new', 'inProgress', 'waiting', 'completed']),
})

export const requestNoteSchema = z.object({
  message: z.string().min(1),
  visibility: z.enum(['public', 'internal']).default('internal'),
  author: z.string().min(1).optional(),
  noteType: z.enum(['normal', 'employee_request', 'employee_response']).optional().default('normal'),
  parentNoteId: z.string().uuid().optional().nullable(),
})

export const employeeRequestSchema = z.object({
  message: z.string().min(1),
  author: z.string().min(1).optional(),
})

export const employeeResponseSchema = z.object({
  message: z.string().default(''),
  parentNoteId: z.string().uuid(),
  author: z.string().min(1).optional(),
})

export const requestCostSchema = z.object({
  confirmedCost: z.number().positive().nullable(),
})

export type RequestInsert = z.infer<typeof requestInsertSchema>
export type RequestStatusUpdate = z.infer<typeof requestStatusSchema>
export type RequestNoteInsert = z.infer<typeof requestNoteSchema>
export type RequestCostUpdate = z.infer<typeof requestCostSchema>
