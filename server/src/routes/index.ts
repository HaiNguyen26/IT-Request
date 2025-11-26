import { Router } from 'express'
import employeesRouter from './employees'
import requestsRouter from './requests'
import authRouter from './auth'

const router = Router()

router.use('/employees', employeesRouter)
router.use('/requests', requestsRouter)
router.use('/auth', authRouter)

export default router
