import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'
import type { Express } from 'express-serve-static-core'
import { query } from '../db/pool'
import { upload } from '../middleware/upload'
import {
  requestInsertSchema,
  requestNoteSchema,
  requestStatusSchema,
  requestCostSchema,
  employeeRequestSchema,
  employeeResponseSchema,
} from '../schemas/request'
import { z } from 'zod'

const router = Router()

const employeeIdParamSchema = z.string().uuid()

interface MulterRequest extends Request {
  files?: Express.Multer.File[]
}

router.get('/', async (_req, res, next) => {
  try {
    const employeeIdRaw =
      typeof _req.query.employeeId === 'string' ? _req.query.employeeId : undefined
    const employeeIdParse = employeeIdRaw ? employeeIdParamSchema.safeParse(employeeIdRaw) : null

    if (employeeIdRaw && (!employeeIdParse || !employeeIdParse.success)) {
      res.status(400).json({ message: 'Invalid employee id' })
      return
    }
    const employeeId = employeeIdParse?.data

    let text = `SELECT r.id,
              r.title,
              r.type,
              r.description,
              r.priority,
              r.status,
              r.target_sla AS "targetSla",
              r.estimated_cost AS "estimatedCost",
              r.confirmed_cost AS "confirmedCost",
              r.created_at AS "createdAt",
              r.last_updated AS "lastUpdated",
              r.completed_at AS "completedAt",
              r.employee_id AS "employeeId",
              e.name AS "employeeName",
              e.email AS "employeeEmail",
              e.department AS "employeeDepartment"
       FROM service_requests r
       JOIN employees e ON e.id = r.employee_id`

    const params: unknown[] = []
    if (employeeId) {
      text += ' WHERE r.employee_id = $1'
      params.push(employeeId)
    }

    text += ' ORDER BY r.created_at DESC'

    const result = await query(text, params)
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const body = requestInsertSchema.parse(req.body)
    const result = await query(
      `INSERT INTO service_requests (title, type, description, priority, target_sla, employee_id, estimated_cost)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, title, type, description, priority, status, target_sla AS "targetSla", estimated_cost AS "estimatedCost", confirmed_cost AS "confirmedCost", created_at AS "createdAt", last_updated AS "lastUpdated", completed_at AS "completedAt", employee_id AS "employeeId"`,
      [
        body.title,
        body.type,
        body.description,
        body.priority,
        body.targetSla,
        body.employeeId,
        body.estimatedCost ?? null,
      ],
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

router.patch('/:id/status', async (req, res, next) => {
  try {
    const id = req.params.id
    const body = requestStatusSchema.parse(req.body)
    const result = await query(
      `UPDATE service_requests
         SET status = $1::request_status,
             last_updated = NOW(),
             completed_at = CASE WHEN $1 = 'completed' THEN NOW() ELSE completed_at END
       WHERE id = $2
       RETURNING id, status, last_updated AS "lastUpdated", completed_at AS "completedAt"`,
      [body.status, id],
    )
    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Request not found' })
      return
    }
    res.json(result.rows[0])
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Invalid payload', issues: error.issues })
      return
    }
    next(error)
  }
})

router.post('/:id/notes', async (req, res, next) => {
  try {
    const id = req.params.id
    const body = requestNoteSchema.parse(req.body)
    const result = await query(
      `INSERT INTO request_notes (request_id, author, message, visibility, note_type, parent_note_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, request_id AS "requestId", author, message, visibility, note_type AS "noteType", parent_note_id AS "parentNoteId", created_at AS "createdAt"`,
      [
        id,
        body.author ?? (body.visibility === 'internal' ? 'IT Manager' : 'IT Service Desk'),
        body.message,
        body.visibility,
        body.noteType ?? 'normal',
        body.parentNoteId ?? null,
      ],
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

router.get('/:id/notes', async (req, res, next) => {
  try {
    const id = req.params.id
    const notesResult = await query(
      `SELECT id,
              request_id AS "requestId",
              author,
              message,
              visibility,
              note_type AS "noteType",
              parent_note_id AS "parentNoteId",
              created_at AS "createdAt"
       FROM request_notes
       WHERE request_id = $1
       ORDER BY created_at DESC`,
      [id],
    )

    // Lấy attachments cho mỗi note
    const notesWithAttachments = await Promise.all(
      notesResult.rows.map(async (note) => {
        const attachmentsResult = await query(
          `SELECT id,
                  note_id AS "noteId",
                  file_name AS "fileName",
                  file_path AS "filePath",
                  file_size AS "fileSize",
                  file_type AS "fileType",
                  uploaded_by AS "uploadedBy",
                  created_at AS "createdAt"
           FROM note_attachments
           WHERE note_id = $1
           ORDER BY created_at ASC`,
          [note.id],
        )
        return {
          ...note,
          attachments: attachmentsResult.rows,
        }
      }),
    )

    res.json(notesWithAttachments)
  } catch (error) {
    next(error)
  }
})

router.post('/:id/employee-request', async (req, res, next) => {
  try {
    const id = req.params.id
    const body = employeeRequestSchema.parse(req.body)

    // Tự động set status thành 'waiting' khi IT gửi yêu cầu
    await query(
      `UPDATE service_requests
       SET status = 'waiting'::request_status,
           last_updated = NOW()
       WHERE id = $1`,
      [id],
    )

    const result = await query(
      `INSERT INTO request_notes (request_id, author, message, visibility, note_type)
       VALUES ($1, $2, $3, 'public', 'employee_request')
       RETURNING id, request_id AS "requestId", author, message, visibility, note_type AS "noteType", parent_note_id AS "parentNoteId", created_at AS "createdAt"`,
      [
        id,
        body.author ?? 'IT Manager',
        body.message,
      ],
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

router.patch('/:id/cost', async (req, res, next) => {
  try {
    const id = req.params.id
    const body = requestCostSchema.parse(req.body)
    const result = await query(
      `UPDATE service_requests
         SET confirmed_cost = $1,
             last_updated = NOW()
       WHERE id = $2
       RETURNING id, confirmed_cost AS "confirmedCost", last_updated AS "lastUpdated"`,
      [body.confirmedCost, id],
    )
    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Request not found' })
      return
    }
    res.json(result.rows[0])
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Invalid payload', issues: error.issues })
      return
    }
    next(error)
  }
})

router.post('/:id/employee-response', upload.array('files', 5), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id
    const multerReq = req as MulterRequest
    const files = multerReq.files || []

    // Kiểm tra phải có message hoặc files
    const message = (req.body.message || '').trim()
    if (!message && files.length === 0) {
      res.status(400).json({ message: 'Invalid payload', issues: [{ message: 'Phải có message hoặc file đính kèm', path: ['message'] }] })
      return
    }

    // Parse body từ FormData
    const body = employeeResponseSchema.parse({
      message: message || 'Đã đính kèm file',
      parentNoteId: req.body.parentNoteId,
      author: req.body.author,
    })

    // Tự động set status thành 'inProgress' khi nhân viên phản hồi
    await query(
      `UPDATE service_requests
       SET status = 'inProgress'::request_status,
           last_updated = NOW()
       WHERE id = $1`,
      [id],
    )

    const result = await query(
      `INSERT INTO request_notes (request_id, author, message, visibility, note_type, parent_note_id)
       VALUES ($1, $2, $3, 'public', 'employee_response', $4)
       RETURNING id, request_id AS "requestId", author, message, visibility, note_type AS "noteType", parent_note_id AS "parentNoteId", created_at AS "createdAt"`,
      [
        id,
        body.author ?? 'Nhân viên',
        body.message,
        body.parentNoteId,
      ],
    )

    const noteId = result.rows[0]?.id
    if (!noteId) {
      res.status(500).json({ message: 'Failed to create note' })
      return
    }

    // Lưu file attachments nếu có
    if (files.length > 0) {
      for (const file of files) {
        await query(
          `INSERT INTO note_attachments (note_id, file_name, file_path, file_size, file_type, uploaded_by)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id, note_id AS "noteId", file_name AS "fileName", file_path AS "filePath", file_size AS "fileSize", file_type AS "fileType", uploaded_by AS "uploadedBy", created_at AS "createdAt"`,
          [
            noteId,
            file.originalname,
            `/uploads/${file.filename}`,
            file.size,
            file.mimetype,
            body.author ?? 'Nhân viên',
          ],
        )
      }
    }

    // Lấy lại note với attachments
    const attachmentsResult = await query(
      `SELECT id,
              note_id AS "noteId",
              file_name AS "fileName",
              file_path AS "filePath",
              file_size AS "fileSize",
              file_type AS "fileType",
              uploaded_by AS "uploadedBy",
              created_at AS "createdAt"
       FROM note_attachments
       WHERE note_id = $1
       ORDER BY created_at ASC`,
      [noteId],
    )

    res.status(201).json({
      ...result.rows[0],
      attachments: attachmentsResult.rows,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Invalid payload', issues: error.issues })
      return
    }
    next(error)
  }
})

// DELETE /requests/:id - Xóa phiếu yêu cầu (chỉ nhân viên tạo request, và chỉ khi ở trạng thái new/waiting)
router.delete('/:id', async (req, res, next) => {
  try {
    const id = req.params.id
    const employeeId = typeof req.query.employeeId === 'string' ? req.query.employeeId : undefined

    if (!employeeId) {
      res.status(400).json({ message: 'employeeId is required' })
      return
    }

    // Kiểm tra request có tồn tại và thuộc về nhân viên này không
    const checkResult = await query(
      `SELECT id, status, employee_id AS "employeeId"
       FROM service_requests
       WHERE id = $1`,
      [id],
    )

    if (checkResult.rowCount === 0) {
      res.status(404).json({ message: 'Request not found' })
      return
    }

    const request = checkResult.rows[0] as {
      id: string
      status: string
      employeeId: string
    }

    // Kiểm tra quyền: chỉ nhân viên tạo request mới được xóa
    if (request.employeeId !== employeeId) {
      res.status(403).json({ message: 'Bạn không có quyền xóa yêu cầu này.' })
      return
    }

    // Chỉ cho phép xóa nếu request ở trạng thái new hoặc waiting
    if (request.status !== 'new' && request.status !== 'waiting') {
      res.status(400).json({
        message: 'Chỉ có thể xóa yêu cầu khi đang ở trạng thái "Chờ xử lý" hoặc "Đang chờ thông tin".',
      })
      return
    }

    // Xóa các notes và attachments liên quan trước
    await query(`DELETE FROM note_attachments WHERE note_id IN (SELECT id FROM request_notes WHERE request_id = $1)`, [id])
    await query(`DELETE FROM request_notes WHERE request_id = $1`, [id])

    // Xóa request
    const deleteResult = await query(`DELETE FROM service_requests WHERE id = $1`, [id])

    if (deleteResult.rowCount === 0) {
      res.status(404).json({ message: 'Request not found' })
      return
    }

    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

export default router
