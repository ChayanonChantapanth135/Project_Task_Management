import express from 'express'
import cors from 'cors'
import authRoutes from './routes/authRoutes.js'
import { initializeDatabase } from './lib/initDb.js'

const app = express()
app.use(cors())
app.use(express.json())
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