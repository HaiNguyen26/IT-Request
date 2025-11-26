import { z } from 'zod'

export const managementLoginSchema = z.object({
  role: z.enum(['itManager', 'leadership']),
  username: z.string().min(1, 'Tên đăng nhập không được để trống').transform((value) => value.trim()),
  password: z.string().min(1, 'Mật khẩu không được để trống'),
})

export type ManagementLoginPayload = z.infer<typeof managementLoginSchema>

export const employeeLoginSchema = z.object({
  name: z
    .string()
    .min(1, 'Tên không được để trống')
    .transform((value) => value.trim()),
  password: z.string().min(1, 'Mật khẩu không được để trống'),
})

export type EmployeeLoginPayload = z.infer<typeof employeeLoginSchema>

