import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

// Import Bootstrap Icons
import 'bootstrap-icons/font/bootstrap-icons.css';

// Import Bootstrap JS (optional - สำหรับ dropdown, modal, etc.)
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import './index.css';

// จุดเริ่มต้นการทำงานของแอปพลิเคชันฝั่ง Client (React Entry Point)
// - โหลดไฟล์ CSS หลัก, Bootstrap CSS, Bootstrap Icons และ Bootstrap JS Bundle
// - เรนเดอร์คอมโพเนนต์ App ภายใต้ <StrictMode> ลงใน HTML Element ที่มี ID เป็น 'root'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
