# Project Management - สิ่งที่เหลือต้องทำ (TODO LIST)

อ้างอิงจากแผนภาพการทำงาน (Flowchart) ทั้ง 4 ส่วนในรูปภาพ มีรายการสิ่งที่ต้องพัฒนาและจัดการเพิ่มเติมดังนี้:

---

## 1. ระบบจัดการผู้ใช้และบทบาท (User & Role Management)
- [x] **สร้างฐานข้อมูลและตารางผู้ใช้งาน (Database & Table)** - รองรับบทบาท Admin, Project Manager, Video Editor, Translator, Team Leader
- [x] **ลงทะเบียน/เพิ่มผู้ใช้ใหม่ (Add User)** - พร้อมอัปโหลดรูปภาพโปรไฟล์ผ่าน Multer
- [x] **แก้ไขข้อมูลผู้ใช้ (Edit User)** - อัปเดตรูปภาพโปรไฟล์ ชื่อ บทบาท และรหัสผ่าน
- [x] **ลบผู้ใช้งาน (Delete User)** - ลบออกจากฐานข้อมูล MySQL อย่างถาวร
- [x] **พักการใช้งานผู้ใช้งาน (Suspend/Active User)** - เปลี่ยนแปลงสถานะ (Status) ของผู้ใช้งาน
- [x] **ระงับการ Login (Suspend Verification)** - ตรวจสอบว่าโดนระงับใช้งานหรือไม่ในขั้นตอน Login หากโดนระงับจะบล็อกไม่ให้เข้าสู่ระบบ

---

## 2. ระบบจัดการโครงการ (Project Management Flow)
ตาม Flowchart ด้านล่างซ้าย:
- [ ] **สร้างตารางโครงการ (Create `projects` Table)**:
  - ฟิลด์ที่จำเป็น: `id`, `project_name`, `description`, `status` (เช่น Active, Completed, Cancelled), `created_at`
- [ ] **ระบบเพิ่มโครงการใหม่ (Create Project)**:
  - หน้า UI ฟอร์มสำหรับกรอกชื่อโครงการ รายละเอียด และสถานะเริ่มต้น
  - API endpoint `POST /auth/projects` เพื่อบันทึกข้อมูล
- [ ] **ระบบแสดงรายการโครงการ (List Projects)**:
  - ดึงข้อมูลจากฐานข้อมูลมาแสดงในหน้า `/Projects`
  - เชื่อมโยงตัวเลขจำนวนโครงการรวมไปยังตัวการ์ดบน Dashboard
- [ ] **ระบบแก้ไขโครงการ (Edit Project)**:
  - แก้ไขรายละเอียดโครงการ และอัปเดตสถานะของโครงการ
- [ ] **ระบบลบโครงการ (Delete Project)**:
  - ลบโครงการออกจากฐานข้อมูลแบบถาวร

---

## 3. ระบบจัดการงาน (Task Management Flow)
ตาม Flowchart ด้านขวา:
- [ ] **สร้างตารางงาน (Create `tasks` Table)**:
  - ฟิลด์ที่จำเป็น: `id`, `project_id` (เชื่อมกับตารางโครงการ), `task_name`, `assigned_to` (เชื่อมกับ ID ผู้ใช้), `status` (ENUM: 'pending', 'in_progress', 'reviewing', 'completed'), `due_date`, `created_at`
- [ ] **ระบบมอบหมายงาน (Create/Assign Task)**:
  - UI ฟอร์มสร้างงานใหม่ เลือกโครงการที่จะผูก และเลือกผู้ใช้ที่จะมอบหมายงานให้
  - API endpoint `POST /auth/tasks`
- [ ] **ระบบแสดงรายการงาน (List Tasks)**:
  - หน้า `/AllTasks` สำหรับดูงานทั้งหมดแยกตามโครงการ/ผู้รับผิดชอบ
  - หน้า `/MyTasks` สำหรับแสดงผลเฉพาะงานที่มอบหมายให้ผู้ใช้งานคนนั้น ๆ ที่กำลังล็อกอินอยู่
  - เชื่อมโยงตัวเลขบน Dashboard (Total Tasks, Overdue Tasks และกราฟสถานะงาน)
- [ ] **ระบบปรับปรุงสถานะงาน (Update Task Status)**:
  - ฟังก์ชันสำหรับผู้ทำงานในการเปลี่ยนสถานะงาน (เช่น ย้ายจาก Pending ➔ In Progress ➔ Reviewing ➔ Completed)

---

## 4. ระบบการรายงานและตรวจสอบ (Reports & Activity Logging)
ตาม Flowchart ด้านขวาบนและล่างขวา:
- [ ] **ระบบประวัติกิจกรรม (Activity Logs)**:
  - บันทึกประวัติการทำงาน (เช่น ใครล็อกอิน, ใครสร้างโครงการใหม่, ใครอัปเดตงาน) ลงในฐานข้อมูล
  - แสดงผลรายการกิจกรรมล่าสุดในหน้า Dashboard และหน้า `/Activity` (View All)
- [ ] **หน้าสถิติและรายงาน (Reports Page)**:
  - พัฒนาหน้า `/Reports` เพื่อแสดงกราฟหรืองานที่เลยกำหนด (Overdue Tasks) 
  - การกรองข้อมูลแยกตามโครงการหรือผู้ใช้งาน

Frontend npm run dev /
Sever npm start /
server xampp apache,mysql
/ เอาdataไปใส่ไว้ในmysqlด้วย importได้เลย
