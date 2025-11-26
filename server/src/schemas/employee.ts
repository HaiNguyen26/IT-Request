import { z } from 'zod'

const emailField = z
  .string()
  .min(1, 'Email cá nhân không được để trống')
  .transform((value) => value.trim().toLowerCase())

export const employeeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Họ và Tên không được để trống'),
  email: emailField,
  department: z.string().min(1, 'Bộ phận không được để trống'),
  createdAt: z.string().datetime(),
})

export const employeeInsertSchema = employeeSchema.omit({ id: true, createdAt: true })
export const employeeUpdateSchema = employeeInsertSchema.partial()

export type EmployeeInsert = z.infer<typeof employeeInsertSchema>
