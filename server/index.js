import express from 'express'
import cors from 'cors'
import authRoutes from './routes/authRoutes.js'
import { initializeDatabase } from './lib/initDb.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use('/auth', authRoutes)

// Initialize database (non-blocking)
initializeDatabase().catch(err => {
    console.error('Database initialization failed, proceeding anyway:', err.message)
})

const PORT = process.env.PORT || 3000
const HOST = '0.0.0.0'
app.listen(PORT, HOST, () => {
    console.log(`Server is running on port ${PORT}`)
})