import { Router } from 'express'
import { query } from '../db/pool'
import { employeeInsertSchema } from '../schemas/employee'
import { z } from 'zod'

const router = Router()
const uuidParam = z.string().uuid()

router.get('/', async (req, res, next) => {
  try {
    const email = typeof req.query.email === 'string' ? req.query.email : undefined
    if (email) {
      const result = await query(
        'SELECT id, name, email, department, created_at AS "createdAt" FROM employees WHERE LOWER(email) = LOWER($1) LIMIT 1',
        [email],
      )
      if (result.rowCount === 0) {
        res.status(404).json({ message: 'Employee not found' })
        return
      }
      res.json(result.rows[0])
      return
    }

    const result = await query(
      'SELECT id, name, email, department, created_at AS "createdAt" FROM employees ORDER BY name ASC',
    )
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const idParse = z.string().uuid().safeParse(req.params.id)
    if (!idParse.success) {
      res.status(400).json({ message: 'Invalid employee id' })
      return
    }
    const id = idParse.data
    const result = await query(
      'SELECT id, name, email, department, created_at AS "createdAt" FROM employees WHERE id = $1',
      [id],
    )
    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Employee not found' })
      return
    }
    res.json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const body = employeeInsertSchema.parse(req.body)
    const result = await query(
      `INSERT INTO employees (name, email, department)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, department = EXCLUDED.department
       RETURNING id, name, email, department, created_at AS "createdAt"`,
      [body.name, body.email, body.department],
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Invalid payload', issues: error.issues })
      return
    }
    next(error)
  }
})

router.post('/bulk', async (req, res, next) => {
  try {
    const payload = z.array(employeeInsertSchema).nonempty().parse(req.body)
    const uniqueMap = new Map<string, z.infer<typeof employeeInsertSchema>>()
    payload.forEach((employee) => uniqueMap.set(employee.email, employee))
    const uniqueEmployees = Array.from(uniqueMap.values())

    if (uniqueEmployees.length === 0) {
      res.status(400).json({ message: 'Danh sách nhân viên không hợp lệ.' })
      return
    }

    const values: string[] = []
    const params: unknown[] = []

    uniqueEmployees.forEach((employee, index) => {
      const base = index * 3
      params.push(employee.name, employee.email, employee.department)
      values.push(`($${base + 1}, $${base + 2}, $${base + 3})`)
    })

    const result = await query(
      `INSERT INTO employees (name, email, department)
       VALUES ${values.join(', ')}
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, department = EXCLUDED.department
       RETURNING id, name, email, department, created_at AS "createdAt"`,
      params,
    )

    res.status(201).json(result.rows)
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Invalid payload', issues: error.issues })
      return
    }
    next(error)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const parseResult = uuidParam.safeParse(req.params.id)
    if (!parseResult.success) {
      res.status(400).json({ message: 'Invalid employee id' })
      return
    }
    const id = parseResult.data
    const result = await query('DELETE FROM employees WHERE id = $1', [id])
    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Employee not found' })
      return
    }
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

export default router
