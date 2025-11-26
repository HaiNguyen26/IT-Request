import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { employeeLoginSchema, managementLoginSchema } from '../schemas/auth'
import { query } from '../db/pool'
import { z } from 'zod'

const router = Router()

router.post('/management/login', async (req, res, next) => {
  try {
    const { role, username, password } = managementLoginSchema.parse(req.body)

    // Normalize username: lowercase và trim để match với database
    const normalizedUsername = username.trim().toLowerCase()
    const result = await query(
      `SELECT id, role, username, password_hash AS "passwordHash", display_name AS "displayName", email, department
       FROM management_accounts
       WHERE username = $1`,
      [normalizedUsername],
    )

    if (result.rowCount === 0) {
      res.status(401).json({ message: 'Thông tin đăng nhập không hợp lệ.' })
      return
    }

    const account = result.rows[0] as {
      id: string
      role: 'itManager' | 'leadership'
      username: string
      passwordHash: string
      displayName: string
      email: string
      department: string | null
    }

    if (account.role !== role) {
      res.status(403).json({ message: 'Tài khoản không có quyền truy cập vai trò này.' })
      return
    }

    const isMatch = await bcrypt.compare(password, account.passwordHash)
    if (!isMatch) {
      res.status(401).json({ message: 'Thông tin đăng nhập không hợp lệ.' })
      return
    }

    res.json({
      id: account.id,
      role: account.role,
      username: account.username,
      displayName: account.displayName,
      email: account.email,
      department: account.department,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Invalid payload', issues: error.issues })
      return
    }
    next(error)
  }
})

router.post('/employee/login', async (req, res, next) => {
  try {
    const { name, password } = employeeLoginSchema.parse(req.body)

    const result = await query(
      `SELECT id,
              name,
              email,
              department,
              password_hash AS "passwordHash",
              created_at AS "createdAt"
       FROM employees
       WHERE LOWER(name) = LOWER($1)
       LIMIT 1`,
      [name],
    )

    if (result.rowCount === 0) {
      res.status(401).json({ message: 'Tên không tồn tại trong hệ thống.' })
      return
    }

    const employee = result.rows[0] as {
      id: string
      name: string
      email: string
      department: string
      passwordHash: string | null
      createdAt: string
    }

    if (!employee.passwordHash) {
      const hashed = await bcrypt.hash(password, 10)
      await query('UPDATE employees SET password_hash = $1 WHERE id = $2', [hashed, employee.id])
    } else {
      const ok = await bcrypt.compare(password, employee.passwordHash)
      if (!ok) {
        res.status(401).json({ message: 'Mật khẩu không chính xác.' })
        return
      }
    }

    res.json({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      department: employee.department,
      createdAt: employee.createdAt,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Invalid payload', issues: error.issues })
      return
    }
    next(error)
  }
})

export default router

