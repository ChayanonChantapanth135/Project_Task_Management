import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// Import Bootstrap CSS (ต้องมาก่อน index.css เพื่อให้ index.css override ได้)
import 'bootstrap/dist/css/bootstrap.min.css';

// Import Bootstrap Icons
import 'bootstrap-icons/font/bootstrap-icons.css';

// Import Bootstrap JS (optional - สำหรับ dropdown, modal, etc.)
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Import custom CSS (ต้องมาหลัง Bootstrap เพื่อ override ได้)
import './index.css';

// กำหนดค่าคอนฟิกเริ่มต้นให้กับ Axios เพื่อให้เรียกเรียกใช้ API แบบ Relative Path ทั่วทั้งแอปพลิเคชันได้สะดวก
import axios from 'axios';
import { API_URL } from './config';

axios.defaults.baseURL = API_URL;

// จุดเริ่มต้นการทำงานของแอปพลิเคชันฝั่ง Client (React Entry Point)
// - โหลดไฟล์ CSS หลัก, Bootstrap CSS, Bootstrap Icons และ Bootstrap JS Bundle
// - เรนเดอร์คอมโพเนนต์ App ภายใต้ <StrictMode> ลงใน HTML Element ที่มี ID เป็น 'root'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
