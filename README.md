# 🚀 Project & Task Management System (RNM AUTH)

ระบบบริหารจัดการโครงการและติดตามงานในทีมแบบครบวงจร (Enterprise Project & Task Management System) ที่ออกแบบด้วยดีไซน์ **Dark Luxe Glassmorphism** ทันสมัย ลื่นไหล และปลอดภัย พร้อมระบบกระจายงาน สรุปสถิติอัตโนมัติ และการจัดลำดับสิทธิ์การเข้าถึงตามบทบาทผู้ใช้ (Role-Based Access Control)

---

## 🌟 ฟีเจอร์หลักของระบบ (Key Features)

### 🔐 1. ระบบยืนยันตัวตนและความปลอดภัย (Authentication & Security)
- **JWT & bcrypt Authentication**: ระบบล็อกอิน ป้องกันรหัสผ่านด้วย bcrypt hashing และออก Token ด้วย JSON Web Token
- **OTP Verification & Password Reset**: กู้คืนรหัสผ่านด้วยรหัส OTP ส่งตรงไปยังอีเมล
- **First-Time Password Change**: บังคับเปลี่ยนรหัสผ่านสำหรับการใช้งานครั้งแรกเพื่อความปลอดภัย
- **User Suspension Control**: สามารถพักการใช้งานผู้ใช้ (Suspend) พร้อมระงับการเข้าสู่ระบบแบบเรียลไทม์

### 👥 2. ระบบจัดการผู้ใช้งานตามบทบาท (User & RBAC Management)
- **สิทธิ์การใช้งาน 5 ระดับ (Role Hierarchies)**:
  1. 🔑 **Admin** - สิทธิ์สูงสุด จัดการผู้ใช้ โครงการ งาน และดูรายงานทั้งหมด
  2. 💼 **Project Manager** - สร้างและดูแลโครงการ บริหารผู้รับผิดชอบงาน
  3. 👑 **Team Leader** - ดูแลโครงการที่ได้รับมอบหมายและแจกจ่ายงานในทีม
  4. 🎬 **Video Editor** - ดำเนินการและอัปเดตสถานะงานตัดต่อ
  5. 🗣️ **Translator** - ดำเนินการและอัปเดตสถานะงานแปล
- **Excel Import / Export**: นำเข้าผู้ใช้งานด้วยไฟล์ Excel (`.xlsx`) ตามเทมเพลต และส่งออกข้อมูลผู้ใช้พร้อมระบบค้นหาและกรองข้อมูล
- **Profile & Avatar Management**: อัปโหลดและเปลี่ยนรูปโปรไฟล์ พร้อมจัดการข้อมูลส่วนตัว

### 📁 3. ระบบบริหารโครงการ (Project Management)
- **Auto Status & Progress Calculation**: 
  - คำนวณเปอร์เซ็นต์ความคืบหน้า (Progress 0-100%) อัตโนมัติจากจำนวน Task ที่เสร็จสิ้น
  - **Auto In-Progress**: เปลี่ยนสถานะโครงการเป็น `In Progress` ทันทีเมื่อมีการสร้าง Task ในโครงการ
  - **Auto Complete**: เปลี่ยนสถานะโครงการเป็น `Completed` อัตโนมัติทันทีเมื่อ Progress ครบ 100%
- **Team Leader Assignment**: ผูกผู้ดูแลโครงการ (Team Leader) พร้อมแสดงกำหนดวันส่ง (End Date) และลำดับความสำคัญ (Priority)

### 📋 4. ระบบจัดการงานและติดตามสถานะ (Task Management)
- **Task Creation & Assignment**: สร้างงาน กำหนดประเภทงาน (แปล, ตัดต่อ, อื่นๆ), ลำดับความสำคัญ (High, Medium, Low) และผู้รับผิดชอบ
- **Interactive Custom Date Picker**: ช่องใส่วันที่แบบยืดหยุ่น รองรับการพิมพ์ตรงในรูปแบบ วัน/เดือน/ปี (`DD/MM/YYYY`) พร้อมปฏิทินเลือกวันที่ในระบบเวลาท้องถิ่น (Local Timezone Safe)
- **Task Status Timeline & History**: บันทึกประวัติการเปลี่ยนสถานะงานอย่างละเอียดพร้อมระบุผู้ปรับเปลี่ยนและเวลาแบบย้อนหลัง
- **Comments & File Attachments**: ระบบแสดงความคิดเห็นแบบเรียลไทม์และแนบไฟล์ประกอบงาน
- **Kanban Board & Table View**: สลับมุมมองการทำงานได้ทั้งแบบตาราง (Table View) และแบบบอร์ด (Kanban Board)

### 📊 5. แดชบอร์ด รายงาน และประวัติกิจกรรม (Dashboard & Reports)
- **Interactive Visual Dashboard**: กราฟสรุปสถิติจำนวนงาน งานที่เกินกำหนด (Overdue Tasks) และปฏิทินกำหนดส่งงาน (FullCalendar Integration)
- **Role-Based Report Analytics**: หน้าสถิติรายงานยืดหยุ่นตามบทบาท (Admin, Manager, Team Leader, User)
- **Activity Logging System**: บันทึกทุกกิจกรรมในระบบ (Activity Logs) เพื่อการตรวจสอบความถูกต้องย้อนหลัง

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

### **Frontend**
- **Core**: React 19, Vite, React Router DOM v7
- **Styling & Animation**: Vanilla CSS (CSS Modules & Custom Design System), Tailwind CSS v4, GSAP (GreenSock Animation Platform), Framer Motion
- **UI Components & Icons**: Bootstrap 5, React Bootstrap, **Ionicons v7** (`<ion-icon>`)
- **Calendar & Tools**: FullCalendar, SweetAlert2, ExcelJS, XLSX

### **Backend**
- **Runtime & Framework**: Node.js, Express.js
- **Database Driver**: `mysql2` (Connection Pool พร้อมคอนฟิก `dateStrings: true` เพื่อความแม่นยำของ Timezone)
- **Security & Uploads**: bcrypt, jsonwebtoken, nodemailer, multer (Handling avatar & task file uploads)

### **Database**
- **RDBMS**: MySQL (รองรับการใช้งานผ่าน XAMPP / MariaDB)

---

## 📁 โครงสร้างโฟลเดอร์ของโปรเจกต์ (Project Structure)

```text
RNM AUTH/
├── frontend/                   # Frontend Client (React + Vite)
│   ├── public/                 # Static Assets & Templates (e.g. Excel Template)
│   ├── src/
│   │   ├── assets/             # Images & Logos
│   │   ├── components/         # Reusable Components (Header, CustomDateInput, SearchableUserSelect, etc.)
│   │   ├── lib/                # Utilities, Auth Helpers, LanguageContext, DateUtils
│   │   ├── pages/
│   │   │   ├── AllTasks/       # หน้างานทั้งหมด (Admin Task Overview)
│   │   │   ├── Dashboard/      # หน้าแดชบอร์ดสรุปผล & ปฏิทิน
│   │   │   ├── ManageProject/  # หน้าจัดการโครงการ (Projects List, Modals, Kanban)
│   │   │   ├── ManageUser/     # หน้าจัดการผู้ใช้งาน (CRUD, Excel Import/Export)
│   │   │   ├── MyTasks/        # หน้างานของฉัน (User Personal Tasks)
│   │   │   ├── Profile/        # หน้าโปรไฟล์ส่วนตัว
│   │   │   ├── Reports/        # หน้าสถิติและรายงานผลตามบทบาท
│   │   │   └── Activity/       # หน้าประวัติกิจกรรมในระบบ
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html              # Ionicons ES Modules Script Entrypoint
│   └── package.json
│
├── server/                     # Backend API Server (Node.js + Express)
│   ├── controllers/
│   │   └── authController.js   # Main Business Logic, Task & Project Status Sync
│   ├── lib/
│   │   └── db.js               # MySQL Connection Pool Config (`dateStrings: true`)
│   ├── middleware/
│   │   └── authMiddleware.js   # Multer Storage & Authentication Verification
│   ├── routes/
│   │   └── authRoutes.js       # Express Route Endpoints
│   ├── uploads/                # Directory for Profile Avatars & Task Attachments
│   ├── index.js                # Express Server Setup & Startup
│   └── package.json
│
└── README.md
```

---

## ⚡ วิธีการติดตั้งและเริ่มต้นใช้งาน (Getting Started)

### 1. ความต้องการของระบบ (Prerequisites)
- **Node.js**: v18.0.0 หรือสูงกว่า
- **MySQL / XAMPP**: เปิดใช้งาน Apache และ MySQL Server

### 2. การตั้งค่าฐานข้อมูล (Database Setup)
1. เปิด **XAMPP Control Panel** แล้วกด **Start** ที่โมดูล **MySQL** และ **Apache**
2. เข้าใช้งาน **phpMyAdmin** (`http://localhost/phpmyadmin`)
3. สร้างฐานข้อมูลใหม่ชื่อ `rnm_auth` (หรือตามชื่อที่ระบุไว้ใน `.env`)
4. นำเข้าไฟล์ SQL ที่เตรียมไว้ (Database Dump) เข้าสู่ฐานข้อมูล

### 3. การติดตั้งและรัน Backend Server
```bash
# สลับไปยังโฟลเดอร์ server
cd server

# ติดตั้ง Dependencies
npm install

# เริ่มต้นทำงานเซิร์ฟเวอร์ (Runs on Port 3000)
npm start
```

### 4. การติดตั้งและรัน Frontend Client
```bash
# สลับไปยังโฟลเดอร์ frontend
cd frontend

# ติดตั้ง Dependencies
npm install

# เริ่มต้นทำงานการพัฒนา (Runs on Port 5173)
npm run dev
```

---

## 🔌 API Endpoints สรุปสังเขป

### 🔑 Authentication & Users
- `POST /auth/login` - ล็อกอินเข้าสู่ระบบ
- `POST /auth/send-otp` - ส่งรหัส OTP ไปยังอีเมล
- `POST /auth/reset-password` - ตั้งรหัสผ่านใหม่ด้วย OTP
- `GET /auth/users` - ดึงรายชื่อผู้ใช้งานทั้งหมด
- `POST /auth/users` - เพิ่มผู้ใช้ใหม่ (พร้อมอัปโหลดรูปภาพ)
- `PUT /auth/users/:id` - แก้ไขข้อมูลผู้ใช้งาน
- `DELETE /auth/users/:id` - พักการใช้งานผู้ใช้ (Soft Delete)
- `POST /auth/users/import` - นำเข้าผู้ใช้งานด้วยไฟล์ Excel

### 📁 Projects & Tasks
- `GET /auth/projects` - ดึงรายการโครงการทั้งหมด (พร้อมซิงค์ Progress และ Status อัตโนมัติ)
- `POST /auth/projects` - สร้างโครงการใหม่
- `PUT /auth/projects/:id` - แก้ไขโครงการ
- `POST /auth/tasks` - สร้างงานใหม่ภายใต้โครงการ
- `PUT /auth/tasks/:id/status` - อัปเดตสถานะงาน (พร้อมคำนวณและปรับสถานะโครงการอัตโนมัติ)
- `PUT /auth/tasks/:id` - แก้ไขรายละเอียดงาน
- `POST /auth/tasks/:id/comments` - เพิ่มความคิดเห็นในงาน
- `POST /auth/tasks/:id/files` - อัปโหลดไฟล์แนบประกอบงาน

---

## 📄 License & Maintainer
พัฒนาและดูแลระบบโดยทีมงาน **Project Task Management System (RNM AUTH)**
