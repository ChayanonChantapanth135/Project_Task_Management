import express from 'express'
import cors from 'cors'
import authRoutes from './routes/authRoutes.js'
import { initializeDatabase } from './lib/initDb.js'
import path from 'path'
import { fileURLToPath } from 'url'

// กำหนดตัวแปรและตั้งค่าที่อยู่ไฟล์/โฟลเดอร์สำหรับบริการไฟล์ Static (เช่น ไฟล์อัปโหลด Avatar)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// เปิดใช้งาน CORS เพื่อให้แอปพลิเคชันฝั่ง Frontend สามารถยิง API ข้ามโดเมนได้
app.use(cors())

// ตั้งค่าให้ Express สามารถแปลง body ของ Request ที่เป็น JSON ได้
app.use(express.json())

// บริการไฟล์ Static ในโฟลเดอร์ uploads (สำหรับเข้าถึงรูปภาพโปรไฟล์ผู้ใช้งาน)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// เรียกใช้เราเตอร์จัดการระบบสมาชิกและโครงการภายใต้เส้นทาง /auth
app.use('/auth', authRoutes)

// ทำการตั้งค่าและตรวจสอบฐานข้อมูลเบื้องต้นขณะรันเซิร์ฟเวอร์ (แบบ non-blocking)
initializeDatabase().catch(err => {
    console.error('Database initialization failed, proceeding anyway:', err.message)
})

// กำหนด Port และเริ่มต้นการทำงานของ Express Server
const PORT = process.env.PORT || 3000
const HOST = '0.0.0.0'
app.listen(PORT, HOST, () => {
    console.log(`Server is running on port ${PORT}`)
})