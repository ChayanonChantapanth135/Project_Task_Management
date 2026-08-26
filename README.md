# 🚀 Enterprise Project & Task Management System (RNM AUTH)

ระบบบริหารจัดการโครงการและติดตามภารกิจในทีมแบบครบวงจร ออกแบบด้วยสถาปัตยกรรม **Modern Modular Frontend & RESTful Backend** บนธีม **Dark Luxe Glassmorphism** ที่ทันสมัย ลื่นไหล และปลอดภัย พร้อมระบบคำนวณความคืบหน้าอัตโนมัติ การจัดการสิทธิ์ผู้ใช้งานตามบทบาท (RBAC) ปฏิทินกำหนดส่งงานแบบสองทิศทาง (Bidirectional Drag & Drop) และระบบ Personal Kanban Board

---

## 🌟 ฟีเจอร์หลักของระบบ (Key Features)

### 🔐 1. ระบบยืนยันตัวตนและความปลอดภัย (Authentication & Security)
- **JWT & bcrypt Authentication**: ล็อกอินปลอดภัย เข้ารหัสรหัสผ่านด้วย `bcrypt` และออก Session Token ด้วย `jsonwebtoken`
- **OTP Email Verification & Password Reset**: ระบบกู้คืนรหัสผ่านด้วยรหัส OTP 6 หลัก ส่งผ่าน SMTP (`nodemailer`)
- **First-Time Password Change**: บังคับให้ผู้ใช้งานเปลี่ยนรหัสผ่านทันทีเมื่อเข้าสู่ระบบครั้งแรกเพื่อความปลอดภัย
- **User Suspension Control**: ผู้ดูแลระบบสามารถสั่งระงับ (Suspend) หรือเปิดใช้งานผู้ใช้ได้ทันที

### 👥 2. การจัดการผู้ใช้และสิทธิ์การเข้าถึง (User & RBAC Management)
- **ระบบสิทธิ์ตามบทบาทหน้าที่ (Role-Based Access Control)**:
  1. 🔑 **Admin** (`admin`) - สิทธิ์สูงสุด จัดการผู้ใช้งาน โครงการ งานทั้งหมด และดูรายงานสถิติระดับบริหาร
  2. 💼 **Project Manager** (`manager`) - สร้างและบริหารโครงการ มอบหมาย Team Leader และติดตามงานในความดูแล
  3. 🎨 **Storyboard** (`storyboard`) - ผู้สร้างสตอรี่บอร์ด วางแผนภาพ และดำเนินงานที่ได้รับมอบหมาย
  4. 🎬 **Animation** (`animation`) - แอนิเมเตอร์และโมชันดีไซเนอร์ ดำเนินงานด้านการเคลื่อนไหว
  5. 🖌️ **Designer** (`designer`) - กราฟิกและ UI/UX ดีไซเนอร์ ออกแบบชิ้นงานตามที่ได้รับมอบหมาย
  6. 💻 **Programmer** (`programmer`) - นักพัฒนาซอฟต์แวร์ ดำเนินงานด้านระบบและเขียนโปรแกรม
  *(หมายเหตุ: ทุกบทบาทสามารถได้รับมอบหมายให้เป็น 👑 **Team Leader** ของแต่ละโครงการเพื่อดูแลโครงการและแจกจ่ายงานในทีมได้)*
- **Excel Import / Export**: นำเข้าผู้ใช้งานด้วยไฟล์ Excel (`.xlsx`) และ Export รายชื่อพร้อมระบบค้นหาและกรองข้อมูล
- **Profile Management**: อัปโหลดเปลี่ยนรูปโปรไฟล์ (Multer Storage) แก้ไขเบอร์โทรศัพท์ และเปลี่ยนรหัสผ่าน

### 📁 3. การบริหารโครงการ (Project Management)
- **Smart Progress & Status Automation**:
  - คำนวณเปอร์เซ็นต์ความคืบหน้า (Progress 0-100%) อัตโนมัติจาก Task ที่เสร็จสิ้น
  - **Auto In-Progress**: เปลี่ยนสถานะโครงการเป็น `In Progress` ทันทีที่มีการสร้างงานในโครงการ
  - **Auto Complete**: ปรับสถานะโครงการเป็น `Completed` อัตโนมัติเมื่อ Task ในโครงการเสร็จครบ 100%
- **Team Leader Assignment**: มอบหมายหัวหน้าทีมผู้รับผิดชอบโครงการ พร้อมระบุกำหนดวันส่ง (End Date) และระดับความสำคัญ (Priority)

### 📋 4. การจัดการงานในโครงการ (Project Tasks)
- **Task Assignment & Priority**: สร้างงาน มอบหมายผู้รับผิดชอบ ระบุประเภทงาน (เช่น งานแปล, งานตัดต่อ) และระดับความสำคัญ (High, Medium, Low)
- **Flexible Localized Date Picker**: ปฏิทินและกล่องเลือกวันที่รองรับรูปแบบ วัน/เดือน/ปี (`DD/MM/YYYY`) ปลอดภัยจากปัญหา Timezone
- **Status History Timeline**: บันทึกประวัติการเปลี่ยนสถานะงานอย่างละเอียด ย้อนดูได้ว่าใครเป็นผู้เปลี่ยนสถานะและเวลาใด
- **Comments & File Attachments**: แสดงความคิดเห็นแบบเรียลไทม์ และอัปโหลดไฟล์แนบประกอบงาน

### 📌 5. ระบบงานส่วนตัว (Personal Tasks - Kanban & Calendar)
- **Kanban Board Drag & Drop**: จัดการงานส่วนตัวด้วยบอร์ดลากวางสถานะ `To Do`, `In Progress`, `Completed` พร้อมบันทึกลำดับ (Position) ลงฐานข้อมูล
- **Interactive Calendar with Bidirectional Tray**: 
  - ลากงานจากถาดงานค้างด้านล่างขึ้นปฏิทินเพื่อกำหนดวันส่ง (`task_date`)
  - ลากงานจากปฏิทินลงถาดด้านล่างเพื่อยกเลิกวันกำหนดส่ง (Unschedule) ได้ทันที
  - ปรับแต่งการเรนเดอร์ด้วย GPU Acceleration (`will-change`) เพื่อความลื่นไหลสูงสุด

### 📊 6. แดชบอร์ดและรายงานวิเคราะห์ (Dashboard & Analytics Reports)
- **Role-Based Dynamic Dashboard**: แดชบอร์ดสรุปยอดงาน งานเกินกำหนด (Overdue) และปฏิทินภาพรวมตามบทบาทผู้ใช้
- **Executive & Team Performance Reports**: หน้าสรุปรายงานประสิทธิภาพการส่งงาน กราฟสัดส่วนงาน และอัตราความสำเร็จ (Completion Rate)
- **Activity Logs**: ระบบบันทึกประวัติการใช้งานทุกการเปลี่ยนแปลง (Audit Trail)

### 🌐 7. ระบบหลายภาษา (Internationalization - i18n)
- รองรับการสลับภาษาทั้ง **ภาษาไทย (TH)** และ **ภาษาอังกฤษ (EN)** ครอบคลุมทุกหน้า ทุก Modal และข้อความแจ้งเตือน โดยรวมศูนย์คำแปลไว้ที่ `LanguageContext.jsx`

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

### **Frontend**
- **Core**: React 19, Vite, React Router DOM v7
- **Architecture**: Custom Hooks Pattern (`useDashboard`, `usePersonalTasks`, `useMyTasks`, `useProjectManagement`, etc.)
- **Styling & UI**: Tailwind CSS v4, Vanilla CSS (Glassmorphism & Neon Glow Tokens), GSAP (GreenSock Animation Platform), Framer Motion
- **Libraries & Plugins**: `@fullcalendar/react`, `@hello-pangea/dnd`, `sweetalert2`, `exceljs`, `xlsx`, `axios`, `socket.io-client`

### **Backend**
- **Runtime & Framework**: Node.js, Express.js (ES Modules), WebSockets (`socket.io`)
- **Database Driver**: `mysql2/promise` (Connection Pooling พร้อม `dateStrings: true`)
- **Security & Utilities**: `bcrypt`, `jsonwebtoken`, `nodemailer`, `multer`
- **Database Optimization**: Auto-migration พร้อม Composite Indexing (`notifications`, `activity_logs`, `tasks`, `projects`, `personal_tasks`, `otp_requests`)

### **Database**
- **RDBMS**: MySQL 8.0+ / MariaDB (ผ่าน XAMPP)

---

## 📁 โครงสร้างโฟลเดอร์ของโปรเจกต์ (Project Structure)

```text
RNM AUTH/
├── frontend/                   # ส่วนติดต่อผู้ใช้งาน (React + Vite Client)
│   ├── public/                 # รูปภาพและเทมเพลตไฟล์ Excel
│   ├── src/
│   │   ├── assets/             # รูปภาพ ไอคอน โลโก้
│   │   ├── components/         # คอมโพเนนต์ส่วนกลาง (Header, Footer, LanguageSwitcher)
│   │   ├── lib/                # Context & Utilities (LanguageContext, auth, dateUtils)
│   │   ├── pages/              # แยกโฟลเดอร์แต่ละหน้าตาม Clean Architecture
│   │   │   ├── About/          # หน้าเกี่ยวกับเรา (Features, Tech Stack)
│   │   │   ├── Activity/       # หน้าบันทึกประวัติกิจกรรมทั้งหมดในระบบ
│   │   │   ├── AllTasks/       # หน้าภาพรวมงานทั้งหมดสำหรับ Admin
│   │   │   ├── Contract/       # หน้าติดต่อเราและฟอร์มส่งข้อความ
│   │   │   ├── Dashboard/      # หน้าแดชบอร์ดสรุปผล & useDashboard Hook
│   │   │   ├── Home/           # หน้าแรก (Landing Page)
│   │   │   ├── Login/          # หน้าเข้าสู่ระบบ & useLogin Hook
│   │   │   ├── ManageProject/  # หน้าจัดการโครงการ & useProjectManagement Hook
│   │   │   ├── ManageUser/     # หน้าจัดการผู้ใช้งาน & useUserManagement Hook
│   │   │   ├── MyActivity/     # หน้าประวัติกิจกรรมส่วนบุคคล
│   │   │   ├── MyTasks/        # หน้างานที่ได้รับมอบหมาย & useMyTasks Hook
│   │   │   ├── PersonalTask/   # หน้างานส่วนตัว (Kanban Board & Calendar Tray)
│   │   │   ├── Profile/        # หน้าโปรไฟล์และตั้งค่าบัญชี
│   │   │   ├── Reports/        # หน้ารายงานและสถิติตามบทบาท
│   │   │   ├── ResetPassword/  # หน้ารีเซ็ตรหัสผ่านด้วย OTP
│   │   │   └── ResetPasswordFirstTime/ # หน้าบังคับเปลี่ยนรหัสผ่านครั้งแรก
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                     # ส่วนให้บริการ API (Node.js + Express Server)
│   ├── controllers/
│   │   └── authController.js   # Logic หลัก: จัดการสิทธิ์ โครงการ งาน และฐานข้อมูล
│   ├── lib/
│   │   ├── db.js               # เชื่อมต่อ MySQL Connection Pool
│   │   └── initDb.js           # สร้างตารางและ Performance Indexes อัตโนมัติ
│   ├── middleware/
│   │   └── authMiddleware.js   # ตรวจสอบ JWT Token และ Multer Uploads
│   ├── routes/
│   │   └── authRoutes.js       # กำหนด API Endpoints ทั้งหมด
│   ├── uploads/                # เก็บรูปโปรไฟล์และไฟล์แนบ
│   ├── index.js                # Entry Point เริ่มต้นการทำงานของเซิร์ฟเวอร์
│   └── package.json
│
└── README.md
```

---

## ⚡ วิธีการติดตั้งและรันระบบ (Getting Started)

### 1. ความต้องการของระบบ (Prerequisites)
- **Node.js**: เวอร์ชัน 18.0.0 ขึ้นไป
- **MySQL / XAMPP**: ติดตั้งและเปิดใช้งาน MySQL และ Apache

### 2. การตั้งค่าฐานข้อมูล (Database Setup)
1. เปิด **XAMPP Control Panel** แล้วกด **Start** ที่โมดูล **MySQL** และ **Apache**
2. เข้าสู่ **phpMyAdmin** ที่ `http://localhost/phpmyadmin`
3. สร้างฐานข้อมูลใหม่ชื่อ `myapp_db` (หรือตั้งชื่อตามต้องการ)
4. ตั้งค่า Environment Variable ในโฟลเดอร์ `server` (สร้างไฟล์ `.env`):
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=myapp_db
   JWT_SECRET=your_jwt_secret_key
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   ```
*(เมื่อรันเซิร์ฟเวอร์ ระบบจะสร้างตารางและดัชนี Index ทั้ง 13 ตารางให้อัตโนมัติ)*

### 3. การเริ่มต้น Backend Server
```bash
# เข้าสู่โฟลเดอร์ server
cd server

# ติดตั้ง Dependencies
npm install

# เริ่มต้นการทำงานเซิร์ฟเวอร์ (รันบน Port 3000)
npm start
```

### 4. การเริ่มต้น Frontend Client
```bash
# เข้าสู่โฟลเดอร์ frontend
cd frontend

# ติดตั้ง Dependencies
npm install

# เริ่มต้น Development Server (รันบน Port 5173)
npm run dev
```

เปิดเบราว์เซอร์ไปที่: `http://localhost:5173`

---

## 🔌 สรุป API Endpoints ที่สำคัญ

| Method | Endpoint | คำอธิบาย |
| :--- | :--- | :--- |
| `POST` | `/auth/login` | เข้าสู่ระบบ และรับ JWT Token |
| `POST` | `/auth/send-otp` | ส่งรหัส OTP 6 หลักไปยังอีเมล |
| `POST` | `/auth/reset-password` | รีเซ็ตรหัสผ่านใหม่ด้วย OTP |
| `GET` | `/auth/users` | ดึงรายชื่อผู้ใช้ทั้งหมด |
| `POST` | `/auth/users` | เพิ่มผู้ใช้ใหม่พร้อมอัปโหลดรูปภาพ |
| `PUT` | `/auth/users/:id` | แก้ไขข้อมูลผู้ใช้งาน / เปลี่ยนสิทธิ์ |
| `DELETE` | `/auth/users/:id` | ลบผู้ใช้ (Soft Delete) |
| `GET` | `/auth/projects` | ดึงรายการโครงการ (พร้อมคำนวณ Progress อัตโนมัติ) |
| `POST` | `/auth/projects` | สร้างโครงการใหม่และมอบหมาย Team Leader |
| `PUT` | `/auth/projects/:id` | อัปเดตข้อมูลโครงการ |
| `POST` | `/auth/tasks` | สร้างงานใหม่ภายใต้โครงการ |
| `PUT` | `/auth/tasks/:id/status` | เปลี่ยนสถานะงาน (Sync กับสถานะโครงการ) |
| `GET` | `/auth/personal-tasks` | ดึงรายการงานส่วนตัวของผู้ใช้ |
| `POST` | `/auth/personal-tasks` | สร้างงานส่วนตัวใหม่ |
| `PUT` | `/auth/personal-tasks/reorder` | อัปเดตลำดับและการย้ายสถานะบน Kanban Board |
| `GET` | `/auth/dashboard-stats` | ดึงข้อมูลสถิติภาพรวมสำหรับ Dashboard |
| `GET` | `/auth/activity-logs` | ดึงประวัติกิจกรรมของระบบ |

---

## 📄 License & Maintainers
พัฒนาและดูแลระบบโดยทีมงาน **Project Task Management System (RNM AUTH)**
