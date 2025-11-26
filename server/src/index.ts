import express from 'express'
import cors from 'cors'
import path from 'path'
import { config } from './config'
import routes from './routes'
import { ensureDefaultManagementAccounts } from './services/managementAccounts'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api', routes)

// Serve uploaded files - Phải đặt sau /api để tránh conflict
app.use('/api/uploads', express.static(path.join(process.cwd(), 'uploads')))

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  if (err instanceof Error) {
    res.status(500).json({ message: err.message })
    return
  }
  res.status(500).json({ message: 'Internal server error' })
})

void (async () => {
  try {
    await ensureDefaultManagementAccounts()
    console.log('Default management accounts are ready.')
  } catch (error) {
    console.error('Failed to ensure default management accounts', error)
    process.exit(1)
  }

  app.listen(config.port, () => {
    console.log(`API listening on port ${config.port}`)
  })
})()
