import express from 'express'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
// Trigger restart to reload latest .env configurations
import {connectToDatabase} from '../lib/db.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'))
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname))
    }
})

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if (allowed.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error('Only image files are allowed'), false)
        }
    }
})

const router = express.Router()

// ฟังก์ชันช่วย (Helper) สำหรับลบไฟล์รูปโปรไฟล์เก่าออกจากเซิร์ฟเวอร์อย่างปลอดภัยเพื่อไม่ให้เป็นไฟล์ขยะค้างอยู่ในโฟลเดอร์ uploads
function deleteOldAvatar(avatarPath) {
    if (!avatarPath) return;
    try {
        let fileName = '';
        // ตรวจสอบว่าเป็น URL สมบูรณ์ (เริ่มด้วย http) หรือไม่ เพื่อดึงชื่อไฟล์ออกมา
        if (avatarPath.startsWith('http')) {
            const parts = avatarPath.split('/uploads/');
            if (parts.length > 1) {
                fileName = parts[1];
            }
        } else if (avatarPath.startsWith('/uploads/')) {
            // กรณีเป็น Relative Path เช่น /uploads/avatar-xxx.jpg
            fileName = avatarPath.replace('/uploads/', '');
        }

        // หากแกะชื่อไฟล์ได้สำเร็จ ให้ตรวจสอบและทำลายไฟล์บนดิสก์จริง
        if (fileName) {
            const filePath = path.join(__dirname, '../uploads', fileName);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath); // ลบไฟล์บนฮาร์ดดิสก์
                console.log(`[Avatar Cleanup] Deleted old file: ${filePath}`);
            }
        }
    } catch (error) {
        console.error('Error deleting old avatar file:', error.message);
    }
}


// Helper to log user activity without duplicate consecutive logs
async function logActivity(db, userId, action, details) {
    try {
        let lastLog = [];
        if (userId) {
            [lastLog] = await db.query(
                "SELECT id, action, details FROM activity_logs WHERE user_id = ? ORDER BY id DESC LIMIT 1",
                [userId]
            );
        } else {
            [lastLog] = await db.query(
                "SELECT id, action, details FROM activity_logs WHERE user_id IS NULL ORDER BY id DESC LIMIT 1"
            );
        }

        if (lastLog.length > 0 && lastLog[0].action === action && lastLog[0].details === details) {
            // Update the timestamp of the last log instead of inserting a duplicate row
            await db.query(
                "UPDATE activity_logs SET created_at = CURRENT_TIMESTAMP WHERE id = ?",
                [lastLog[0].id]
            );
        } else {
            // Insert a new log entry
            await db.query(
                "INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)",
                [userId, action, details]
            );
        }
    } catch (error) {
        console.error("Error writing activity log:", error.message);
    }
}

// router.post('/register', async (req, res) => {
//     const { username, email, password } = req.body
//     console.log('Register request received:', { username, email })
//     try {
//         const db = await connectToDatabase()
//         const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]) 
//         if (rows.length > 0) {
//             return res.status(409).json({ message: 'User already exists' })
//         }

//         const hashPassword = await bcrypt.hash(password, 10)
//         const result = await db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashPassword])
//         console.log('User registered successfully:', { username, email })
//         res.status(201).json({ message: 'User registered successfully' })
//     }catch (error) {
//         console.error('Registration error:', error.message)
//         res.status(500).json({ message: error.message })
//     }
// })

/**
 * POST /login
 * - ตรวจสอบความถูกต้องของ Email และ Password
 * - ตรวจสอบว่าบัญชีผู้ใช้ถูกระงับ (suspended) หรือไม่
 * - ลงบันทึกประวัติการเข้าใช้งาน (Activity Log)
 * - ออก Token (JWT) สำหรับใช้ในการยืนยันตัวตน มีอายุการใช้งาน 20 นาที
 */
router.post('/login', async (req, res) => {
    const { email, password } = req.body
    console.log('Login request received:', { email })
    // หน่วงเวลา 3 วินาทีตามที่ผู้ใช้ร้องขอ
    // await new Promise(resolve => setTimeout(resolve, 3000));
    try {
        const db = await connectToDatabase()
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]) 
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not existed' })
        }

        const isMatch = await bcrypt.compare(password, rows[0].password)
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        if (rows[0].status === 'suspended') {
            return res.status(403).json({ message: 'บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ' })
        }
        const tokenExpiresIn = '20m';
        const tokenExpiresInSeconds = 20 * 60;
        const token = jwt.sign({ id: rows[0].id }, process.env.JWT_KEY, { expiresIn: tokenExpiresIn });

        // Log Login
        await logActivity(db, rows[0].id, 'Login', `User logged in: ${rows[0].username}`);

        if (rows[0].is_force_reset === 1) {
            return res.status(201).json({
                requirePasswordReset: true,
                message: "กรุณาเปลี่ยนรหัสผ่านก่อนเข้าใช้งานครั้งแรก",
                token: token,
                expiresIn: tokenExpiresIn,
                expiresInSeconds: tokenExpiresInSeconds,
                user: {
                    id: rows[0].id,
                    name: rows[0].username,
                    email: rows[0].email,
                    role: rows[0].role || 'user',
                    avatar: rows[0].avatar || null,
                    is_force_reset: 1
                }
            })
        }

        return res.status(201).json({
            token: token,
            expiresIn: tokenExpiresIn,
            expiresInSeconds: tokenExpiresInSeconds,
            user: {
                id: rows[0].id,
                name: rows[0].username,
                email: rows[0].email,
                role: rows[0].role || 'user',
                avatar: rows[0].avatar || null,
                is_force_reset: 0
            }
        })
    } catch (error) {
        console.error('Login error:', error.message)
        res.status(500).json({ message: error.message })
    }
})

/**
 * POST /refresh
 * - ทำการต่ออายุ Token (Refresh Token) 
 * - รับ Token เดิม ตรวจสอบความถูกต้อง และออก Token ใหม่ให้อีก 20 นาที
 * - ช่วยให้ผู้ใช้ระบบไม่ต้องล็อกอินใหม่บ่อยๆ ตราบใดที่ยังใช้งานระบบอยู่
 */
router.post('/refresh', async (req, res) => {
    const { token } = req.body
    if (!token) return res.status(400).json({ message: 'Token required' })
    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY, { ignoreExpiration: true })
        const db = await connectToDatabase()
        const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [decoded.id])
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' })
        }
        if (rows[0].status === 'suspended') {
            return res.status(403).json({ message: 'บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ' })
        }
        const tokenExpiresIn = '20m'
        const tokenExpiresInSeconds = 20 * 60
        const newToken = jwt.sign({ id: decoded.id }, process.env.JWT_KEY, { expiresIn: tokenExpiresIn })
        
        return res.status(200).json({
            token: newToken,
            expiresInSeconds: tokenExpiresInSeconds,
            user: {
                id: rows[0].id,
                name: rows[0].username,
                email: rows[0].email,
                role: rows[0].role || 'user',
                avatar: rows[0].avatar || null
            }
        })
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' })
    }
})

// Helper to format phone number (convert leading 0 to +66)
function formatPhoneNumber(phone) {
    if (!phone) return null;
    let cleaned = String(phone).trim().replace(/[\s-]/g, '');
    if (cleaned.startsWith('0')) {
        return '+66' + cleaned.slice(1);
    }
    return cleaned;
}

/**
 * GET /users
 * - ดึงข้อมูลผู้ใช้งานทั้งหมดในระบบ (ยกเว้นรหัสผ่าน)
 * - ใช้แสดงผลในหน้ารายการผู้ใช้งาน (Manage Users)
 */
router.get('/users', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const [rows] = await db.query('SELECT id, username, email, phone, role, avatar, status, created_at FROM users');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json({ message: error.message });
    }
})

/**
 * GET /users/:id
 * - ดึงข้อมูลประวัติและข้อมูลเฉพาะของผู้ใช้งานตาม ID ที่ระบุ
 */
router.get('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const db = await connectToDatabase();
        const [rows] = await db.query('SELECT id, username, email, phone, role, avatar, status, created_at FROM users WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error fetching user:', error.message);
        res.status(500).json({ message: error.message });
    }
})

// สำหรับlogin
/**
 * POST /users
 * - สร้างบัญชีผู้ใช้งานใหม่โดยผู้ดูแลระบบ (Admin)
 * - ทำการเข้ารหัสผ่านด้วย bcrypt ก่อนบันทึก
 * - แปลงบทบาท (Role) จากหน้าบ้าน (เช่น Admin, Project Manager) ให้เป็นค่าระดับฐานข้อมูล (เช่น admin, manager)
 */
router.post('/users', upload.single('avatar'), async (req, res) => {
    const { username, email, password, phone, role, status } = req.body;
    try {
        const db = await connectToDatabase();
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length > 0) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const formattedPhone = formatPhoneNumber(phone);
        
        let sqlRole = 'user';
        const normRole = (role || '').trim().toLowerCase();
        if (normRole === 'admin') sqlRole = 'admin';
        else if (normRole === 'project manager' || normRole === 'manager') sqlRole = 'manager';
        else if (normRole === 'team leader' || normRole === 'team_leader') sqlRole = 'team_leader';
        else if (normRole === 'video editor' || normRole === 'video_editor') sqlRole = 'video_editor';
        else if (normRole === 'translator') sqlRole = 'translator';

        const sqlStatus = status === 'suspended' ? 'suspended' : 'active';

        let avatarUrl = null;
        if (req.file) {
            avatarUrl = `/uploads/${req.file.filename}`;
        }

        const [result] = await db.query(
            'INSERT INTO users (username, email, password, phone, role, status, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [username, email, hashPassword, formattedPhone, sqlRole, sqlStatus, avatarUrl]
        );

        // 4. ส่งรหัสผ่านชั่วคราวให้ผู้ใช้ทางอีเมลผ่าน nodemailer
        const emailUser = (process.env.EMAIL_USER || 'chayanon.sent@gmail.com').replace(/['"]/g, '').trim();
        const emailPass = (process.env.EMAIL_PASS || '').replace(/['"]/g, '').trim();

        if (emailPass) {
            try {
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: emailUser,
                        pass: emailPass
                    }
                });

                const mailOptions = {
                    from: `"Project Management" <${emailUser}>`,
                    to: email,
                    subject: 'New Account Registration - Project Management',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                            <h2 style="color: #0d6efd; text-align: center;">Welcome to Project Management</h2>
                            <p>Hello <b>${username}</b>,</p>
                            <p>Your user account has been successfully created by the administrator. Here are your login details:</p>
                            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 5px 0;"><b>Email:</b> ${email}</p>
                                <p style="margin: 5px 0;"><b>Temporary Password:</b> <span style="font-size: 16px; font-weight: bold; color: #dc3545;">${password}</span></p>
                            </div>
                            <p style="color: #ea580c; font-weight: bold;">* You will be forced to reset your password on your first login for security purposes.</p>
                            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                            <p style="font-size: 12px; color: #777; text-align: center;">Please keep these credentials secure and confidential.</p>
                        </div>
                    `
                };

                await transporter.sendMail(mailOptions);
                console.log(`[Welcome Email Sent] Email: ${email}`);
            } catch (mailErr) {
                console.error('Error sending welcome email:', mailErr.message);
            }
        } else {
            console.warn('[Warning] EMAIL_PASS is not configured in .env. Skipping welcome email delivery.');
        }

        const { creatorId } = req.body;
        await logActivity(db, creatorId ? Number(creatorId) : null, 'Create User', `Created user: ${username} (${email})`);

        res.status(201).json({ message: 'User created successfully', id: result.insertId });
    } catch (error) {
        console.error('Error creating user:', error.message);
        res.status(500).json({ message: error.message });
    }
})

/**
 * PUT /users/:id
 * - อัปเดตข้อมูลผู้ใช้งานตาม ID ที่ส่งมา (ชื่ออีเมล, บทบาท, สถานะบัญชี)
 * - หากมีการระบุรหัสผ่านใหม่ จะทำการเข้ารหัส (hash) และอัปเดตรหัสผ่านใหม่ด้วย
 */
router.put('/users/:id', upload.single('avatar'), async (req, res) => {
    const { id } = req.params;
    const { username, email, password, phone, role, status, creatorId } = req.body;
    try {
        const db = await connectToDatabase();
        
        const [oldUserRows] = await db.query('SELECT status FROM users WHERE id = ?', [id]);
        const oldStatus = oldUserRows[0]?.status;

        const formattedPhone = formatPhoneNumber(phone);

        let query = 'UPDATE users SET username = ?, email = ?, phone = ?, role = ?, status = ?';
        let params = [username, email, formattedPhone, role, status || 'active'];
        
        let sqlRole = 'user';
        const normRole = (role || '').trim().toLowerCase();
        if (normRole === 'admin') sqlRole = 'admin';
        else if (normRole === 'project manager' || normRole === 'manager') sqlRole = 'manager';
        else if (normRole === 'team leader' || normRole === 'team_leader') sqlRole = 'team_leader';
        else if (normRole === 'video editor' || normRole === 'video_editor') sqlRole = 'video_editor';
        else if (normRole === 'translator') sqlRole = 'translator';
        
        params[3] = sqlRole;

        if (password) {
            const hashPassword = await bcrypt.hash(password, 10);
            query += ', password = ?';
            params.push(hashPassword);
        }

        if (req.file) {
            // ดึงข้อมูลรูปภาพประจำตัวอันเดิมของผู้ใช้ออกมาและลบทิ้งก่อนเซฟไฟล์ใหม่
            const [userRows] = await db.query('SELECT avatar FROM users WHERE id = ?', [id]);
            if (userRows.length > 0 && userRows[0].avatar) {
                deleteOldAvatar(userRows[0].avatar);
            }
            const avatarUrl = `/uploads/${req.file.filename}`;
            query += ', avatar = ?';
            params.push(avatarUrl);
        }
        
        query += ' WHERE id = ?';
        params.push(id);

        await db.query(query, params);
        const targetStatus = status || 'active';
        if (targetStatus !== oldStatus) {
            if (targetStatus === 'suspended') {
                await logActivity(db, creatorId ? Number(creatorId) : null, 'Suspend User', `Suspended user: ${username} (${email})`);
            } else if (targetStatus === 'active') {
                await logActivity(db, creatorId ? Number(creatorId) : null, 'Activate User', `Activated user: ${username} (${email})`);
            } else {
                await logActivity(db, creatorId ? Number(creatorId) : null, 'Edit User', `Edited user ID: ${id} (${username})`);
            }
        } else {
            await logActivity(db, creatorId ? Number(creatorId) : null, 'Edit User', `Edited user ID: ${id} (${username})`);
        }
        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error.message);
        res.status(500).json({ message: error.message });
    }
})

/**
 * DELETE /users/:id
 * - ลบบัญชีผู้ใช้งานออกจากระบบตาม ID ที่ระบุ
 */
router.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { creatorId } = req.query;
    try {
        const db = await connectToDatabase();
        // ดึงข้อมูลรูปโปรไฟล์และลบออกจากโฟลเดอร์เซิร์ฟเวอร์ก่อนที่จะทำการลบแถวข้อมูลผู้ใช้งานในฐานข้อมูล
        const [userRows] = await db.query('SELECT username, email, avatar FROM users WHERE id = ?', [id]);
        if (userRows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const { username, email, avatar } = userRows[0];
        if (avatar) {
            deleteOldAvatar(avatar);
        }
        await db.query('DELETE FROM users WHERE id = ?', [id]);
        await logActivity(db, creatorId ? Number(creatorId) : null, 'Delete User', `Deleted user: ${username} (${email})`);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error.message);
        res.status(500).json({ message: error.message });
    }
})

// Upload avatar and update user's avatar in DB
/**
 * POST /upload-avatar/:id
 * - อัปโหลดรูปภาพโปรไฟล์ (Avatar) ของผู้ใช้งานโดยใช้ multer
 * - ตรวจสอบความถูกต้องของไฟล์รูปภาพ และจำกัดขนาดไม่เกิน 2MB
 * - บันทึกที่อยู่รูปภาพ (URL) ลงในฐานข้อมูลของบัญชีผู้ใช้
 */
router.post('/upload-avatar/:id', upload.single('avatar'), async (req, res) => {
    const { id } = req.params
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' })
        }
        const db = await connectToDatabase()
        
        // ค้นหาและลบรูปโปรไฟล์อันเดิมออกจากดิสก์เซิร์ฟเวอร์
        const [userRows] = await db.query('SELECT avatar FROM users WHERE id = ?', [id])
        if (userRows.length > 0 && userRows[0].avatar) {
            deleteOldAvatar(userRows[0].avatar)
        }

        // นำ BASE_URL มาใช้สร้าง URL เต็มรูปแบบสำหรับการเข้าถึงรูปภาพแทนการฮาร์ดโค้ด
        const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3000'
        const avatarUrl = `${baseUrl}/uploads/${req.file.filename}`
        
        await db.query('UPDATE users SET avatar = ? WHERE id = ?', [avatarUrl, id])
        res.status(200).json({ message: 'Avatar uploaded successfully', avatarUrl })
    } catch (error) {
        console.error('Error uploading avatar:', error.message)
        res.status(500).json({ message: error.message })
    }
})

/**
 * GET /dashboard-stats
 * - ดึงข้อมูลสถิติรวมสำหรับหน้า Dashboard
 * - นับจำนวนผู้ใช้งานทั้งหมด, โครงการทั้งหมด, และงานทั้งหมด (แยกสถานะ และงานที่เกินกำหนด)
 */
router.get('/dashboard-stats', async (req, res) => {
    try {
        const db = await connectToDatabase();
        
        // Count total users
        const [userRows] = await db.query('SELECT COUNT(*) as count FROM users');
        const userCount = userRows[0].count;

        // Since projects and tasks tables might not exist yet, we query gracefully
        let projectCount = 0;
        let pendingProjects = 0;
        let inProgressProjects = 0;
        let reviewProjects = 0;
        let completedProjects = 0;

        let taskCount = 0;
        let overdueTaskCount = 0;
        let pendingTasks = 0;
        let inProgressTasks = 0;
        let reviewingTasks = 0;
        let completedTasks = 0;

        try {
            const [pRows] = await db.query('SELECT COUNT(*) as count FROM projects');
            projectCount = pRows[0].count;

            const [pendingProjRows] = await db.query("SELECT COUNT(*) as count FROM projects WHERE status = 'pending'");
            pendingProjects = pendingProjRows[0].count;

            const [inProgressProjRows] = await db.query("SELECT COUNT(*) as count FROM projects WHERE status = 'in_progress'");
            inProgressProjects = inProgressProjRows[0].count;

            const [reviewProjRows] = await db.query("SELECT COUNT(*) as count FROM projects WHERE status = 'review'");
            reviewProjects = reviewProjRows[0].count;

            const [completedProjRows] = await db.query("SELECT COUNT(*) as count FROM projects WHERE status = 'completed'");
            completedProjects = completedProjRows[0].count;
        } catch (e) { /* ignore if projects table doesn't exist */ }

        try {
            const [tRows] = await db.query('SELECT COUNT(*) as count FROM tasks');
            taskCount = tRows[0].count;
            
            // Query counts by status/overdue if columns exist
            const [pendingRows] = await db.query("SELECT COUNT(*) as count FROM tasks WHERE status = 'Pending'");
            pendingTasks = pendingRows[0].count;

            const [progressRows] = await db.query("SELECT COUNT(*) as count FROM tasks WHERE status = 'In Progress'");
            inProgressTasks = progressRows[0].count;

            const [reviewRows] = await db.query("SELECT COUNT(*) as count FROM tasks WHERE status = 'Reviewing'");
            reviewingTasks = reviewRows[0].count;

            const [completedRows] = await db.query("SELECT COUNT(*) as count FROM tasks WHERE status = 'Completed'");
            completedTasks = completedRows[0].count;

            // Simple overdue query if due_date column exists
            const [overdueRows] = await db.query("SELECT COUNT(*) as count FROM tasks WHERE due_date < NOW() AND status != 'Completed'");
            overdueTaskCount = overdueRows[0].count;
        } catch (e) { /* ignore if tasks table doesn't exist */ }

        res.status(200).json({
            users: userCount,
            projects: projectCount,
            tasks: taskCount,
            overdueTasks: overdueTaskCount,
            projectStatus: {
                pending: pendingProjects,
                inProgress: inProgressProjects,
                review: reviewProjects,
                completed: completedProjects
            },
            taskStatus: {
                pending: pendingTasks,
                inProgress: inProgressTasks,
                reviewing: reviewingTasks,
                completed: completedTasks
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error.message);
        res.status(500).json({ message: error.message });
    }
})

// --- PROJECTS MANAGEMENT DB ENDPOINTS ---

// Fetch team leaders (all users or users with role team_leader/admin)
/**
 * GET /team-leaders
 * - ดึงรายชื่อผู้ใช้ที่มีบทบาทเป็น Team Leader เพื่อให้เลือกตอนสร้างโครงการ
 * - หากไม่มีข้อมูล จะทำการดึงข้อมูลผู้ใช้ทั้งหมด หรือใช้ข้อมูลจำลอง (mock data)
 */
router.get('/team-leaders', async (req, res) => {
    try {
        const db = await connectToDatabase()
        let [rows] = await db.query("SELECT id, username, email FROM users WHERE role = 'team_leader'")
        if (rows.length === 0) {
            // Fallback 1: Try to fetch all users in the system
            [rows] = await db.query("SELECT id, username, email FROM users")
        }
        if (rows.length === 0) {
            // Fallback 2: If the system has no users yet, return simulated fallback team leaders
            rows = [
                { id: 3, username: "Somsak Somdee (Simulated)" },
                { id: 4, username: "Wichai Jaidee (Simulated)" },
                { id: 5, username: "Anong Rakdee (Simulated)" }
            ]
        }
        res.status(200).json(rows)
    } catch (error) {
        console.error('Error fetching team leaders:', error.message)
        res.status(500).json({ message: error.message })
    }
})

// Fetch projects (and auto-seed if none exist)
/**
 * GET /projects
 * - ดึงรายชื่อโครงการทั้งหมดพร้อมกับข้อมูลหัวหน้าทีม (Team Leader) 
 * - คำนวณความคืบหน้า (Progress) เป็นเปอร์เซ็นต์ตามจำนวนงาน (Tasks) ที่เสร็จสิ้น
 * - หากระบบยังไม่มีโครงการใดๆ จะสร้างข้อมูลโครงการและงานจำลองขึ้นมาโดยอัตโนมัติ (Auto-seeding)
 */
router.get('/projects', async (req, res) => {
    try {
        const db = await connectToDatabase()
        
        // Check if projects table is empty
        const [rowsCount] = await db.query('SELECT COUNT(*) as count FROM projects')
        if (rowsCount[0].count === 0) {
            // Get some users to associate as creators/leaders to avoid foreign key violations
            const [users] = await db.query('SELECT id FROM users LIMIT 3')
            const adminId = users[0]?.id || 1
            const leader1 = users[1]?.id || adminId
            const leader2 = users[2]?.id || adminId

            // Insert mock projects
            const proj1 = await db.query(
                "INSERT INTO projects (name, description, status, priority, end_date, created_by) VALUES (?, ?, ?, ?, ?, ?)",
                ["Website Redesign", "Figma design and React implementation", "In Progress", "High", "2026-08-30", adminId]
            )
            const proj2 = await db.query(
                "INSERT INTO projects (name, description, status, priority, end_date, created_by) VALUES (?, ?, ?, ?, ?, ?)",
                ["Mobile App Development", "Flutter-based mobile app creation", "Pending", "High", "2026-12-15", adminId]
            )
            const proj3 = await db.query(
                "INSERT INTO projects (name, description, status, priority, end_date, created_by) VALUES (?, ?, ?, ?, ?, ?)",
                ["Data Analytics Dashboard", "Dashboard for KPI representation", "Completed", "Medium", "2026-07-01", adminId]
            )

            // Associate team leaders
            if (proj1[0].insertId) await db.query("INSERT INTO project_team_leaders (project_id, user_id) VALUES (?, ?)", [proj1[0].insertId, leader1])
            if (proj2[0].insertId) await db.query("INSERT INTO project_team_leaders (project_id, user_id) VALUES (?, ?)", [proj2[0].insertId, leader2])
            if (proj3[0].insertId) await db.query("INSERT INTO project_team_leaders (project_id, user_id) VALUES (?, ?)", [proj3[0].insertId, leader1])

            // Seed some default tasks too
            if (proj1[0].insertId) {
                await db.query("INSERT INTO tasks (project_id, title, status) VALUES (?, 'Design Figma mockup', 'Completed')", [proj1[0].insertId])
                await db.query("INSERT INTO tasks (project_id, title, status) VALUES (?, 'Setup frontend routing', 'In Progress')", [proj1[0].insertId])
                await db.query("INSERT INTO tasks (project_id, title, status) VALUES (?, 'Integrate database schema', 'Pending')", [proj1[0].insertId])
            }
            if (proj2[0].insertId) {
                await db.query("INSERT INTO tasks (project_id, title, status) VALUES (?, 'Define API contracts', 'In Progress')", [proj2[0].insertId])
            }
            if (proj3[0].insertId) {
                await db.query("INSERT INTO tasks (project_id, title, status) VALUES (?, 'Export CSV files', 'Completed')", [proj3[0].insertId])
            }
        }

        // Fetch all projects along with team leaders and tasks
        const [projects] = await db.query(`
            SELECT p.*, u.id AS teamLeaderId, u.username AS teamLeaderName
            FROM projects p
            LEFT JOIN project_team_leaders ptl ON p.id = ptl.project_id
            LEFT JOIN users u ON ptl.user_id = u.id
            ORDER BY p.created_at DESC
        `)

        // Fetch tasks for each project
        for (const p of projects) {
            const [tasks] = await db.query(`
                SELECT t.id, t.title, t.status, t.due_date, t.assigned_to, t.description, t.task_type, t.priority, u.username AS assigned_to_name
                FROM tasks t
                LEFT JOIN users u ON t.assigned_to = u.id
                WHERE t.project_id = ?
            `, [p.id])
            p.tasks = tasks
            // Calculate progress based on tasks
            if (tasks.length > 0) {
                const completed = tasks.filter(t => t.status && t.status.toLowerCase() === 'completed').length
                p.progress = Math.round((completed / tasks.length) * 100)
            } else {
                p.progress = (p.status && p.status.toLowerCase() === 'completed') ? 100 : 0
            }
        }

        res.status(200).json(projects)
    } catch (error) {
        console.error('Error fetching projects:', error.message)
        res.status(500).json({ message: error.message })
    }
})

// Create new project
/**
 * POST /projects
 * - สร้างโครงการใหม่ พร้อมกำหนดระดับความสำคัญ (Priority) วันส่งงาน (End Date)
 * - กำหนดผู้ดูแลโครงการ (Team Leader)
 * - บันทึกประวัติกิจกรรมการสร้างโครงการลงฐานข้อมูล
 */
router.post('/projects', async (req, res) => {
    const { name, endDate, priority, teamLeaderId, createdBy } = req.body
    try {
        const db = await connectToDatabase()
        
        // 1. Insert project
        const [result] = await db.query(
            "INSERT INTO projects (name, status, priority, end_date, created_by) VALUES (?, 'Pending', ?, ?, ?)",
            [name, priority, endDate, createdBy]
        )
        const projectId = result.insertId

        // 2. Assign team leader
        if (teamLeaderId) {
            await db.query("INSERT INTO project_team_leaders (project_id, user_id) VALUES (?, ?)", [projectId, teamLeaderId])
        }

        // Log Activity
        await logActivity(db, createdBy, 'Create New Project', `Created project: ${name}`);

        res.status(201).json({ message: 'Project created successfully', projectId })
    } catch (error) {
        console.error('Error creating project:', error.message)
        res.status(500).json({ message: error.message })
    }
})

// Edit project
/**
 * PUT /projects/:id
 * - แก้ไขรายละเอียดโครงการ (ชื่อ, สถานะ, ความสำคัญ, วันส่งงาน, หัวหน้าทีม) ตาม ID ของโครงการ
 * - อัปเดตข้อมูลความเชื่อมโยงกับ Team Leader ในตารางกลาง (project_team_leaders)
 * - บันทึกประวัติกิจกรรมการแก้ไข
 */
router.put('/projects/:id', async (req, res) => {
    const { id } = req.params
    const { name, status, priority, endDate, teamLeaderId, userId } = req.body
    try {
        const db = await connectToDatabase()

        // 1. Update project
        await db.query(
            "UPDATE projects SET name = ?, status = ?, priority = ?, end_date = ? WHERE id = ?",
            [name, status, priority, endDate, id]
        )

        // 2. Update team leader (delete existing assignments and insert new one)
        await db.query("DELETE FROM project_team_leaders WHERE project_id = ?", [id])
        if (teamLeaderId) {
            await db.query("INSERT INTO project_team_leaders (project_id, user_id) VALUES (?, ?)", [id, teamLeaderId])
        }

        // Log Activity
        await logActivity(db, userId, 'Edit Project', `Edited project ID: ${id}`);

        res.status(200).json({ message: 'Project updated successfully' })
    } catch (error) {
        console.error('Error updating project:', error.message)
        res.status(500).json({ message: error.message })
    }
})

// Delete project
/**
 * DELETE /projects/:id
 * - ลบโครงการออกจากระบบ (Cascade Delete จะทำการลบงาน, คอมเมนต์, ไฟล์ที่เกี่ยวกับโครงการนี้โดยอัตโนมัติ)
 * - บันทึกประวัติกิจกรรมการลบ
 */
router.delete('/projects/:id', async (req, res) => {
    const { id } = req.params
    const { userId } = req.query
    try {
        const db = await connectToDatabase()
        
        // Get name for logging
        const [projRows] = await db.query('SELECT name FROM projects WHERE id = ?', [id])
        const projName = projRows[0]?.name || id

        // Delete project (cascade delete handles tasks, comments, project_team_leaders, files)
        await db.query("DELETE FROM projects WHERE id = ?", [id])

        // Log Activity
        await logActivity(db, userId, 'Delete Project', `Deleted project: ${projName}`);

        res.status(200).json({ message: 'Project deleted successfully' })
    } catch (error) {
        console.error('Error deleting project:', error.message)
        res.status(500).json({ message: error.message })
    }
})

// Create new task
/**
 * POST /tasks
 * - สร้างงานใหม่ภายใต้โครงการที่เลือก
 * - รองรับ ประเภทงาน, รายละเอียด, ลำดับความสำคัญ (Priority), วันกำหนดส่ง (Due Date)
 * - เลือกระบุผู้รับผิดชอบงานได้ (Assignee)
 * - หากมีผู้รับผิดชอบ จะสร้างการแจ้งเตือน (Notification) ไปยังผู้ใช้นั้นๆ
 * - บันทึกประวัติกิจกรรมการทำงานลงฐานข้อมูล
 */
router.post('/tasks', async (req, res) => {
    const { projectId, title, description, taskType, priority, dueDate, assignedTo, createdBy } = req.body
    
    // 1. Validate Form?
    if (!projectId || !title) {
        return res.status(400).json({ message: 'สร้างไม่สำเร็จ: กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' })
    }

    try {
        const db = await connectToDatabase()

        // 2. INSERT INTO tasks status = "Pending"
        const [result] = await db.query(
            "INSERT INTO tasks (project_id, title, description, task_type, priority, due_date, assigned_to, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')",
            [projectId, title, description || null, taskType || null, priority || 'Medium', dueDate || null, assignedTo ? Number(assignedTo) : null]
        )
        const taskId = result.insertId

        // 3. Has Assignee? -> Send Notification
        if (assignedTo) {
            const [projRows] = await db.query('SELECT name FROM projects WHERE id = ?', [projectId])
            const projectName = projRows[0]?.name || `ID ${projectId}`
            const notifMessage = `คุณได้รับมอบหมายงานใหม่: "${title}" ในโปรเจกต์ "${projectName}"`
            await db.query(
                "INSERT INTO notifications (user_id, message, read_status) VALUES (?, ?, FALSE)",
                [Number(assignedTo), notifMessage]
            )
        }

        // 4. Log Activity "Create Task Success"
        await logActivity(db, createdBy || null, 'Create Task Success', `Created task: ${title} under project ID: ${projectId}`)

        // 5. Show "Create Success"
        res.status(201).json({ message: 'Create Success', taskId })
    } catch (error) {
        console.error('Error creating task:', error.message)
        res.status(500).json({ message: 'สร้างไม่สำเร็จ: เกิดข้อผิดพลาดของระบบ' })
    }
})

// Update task status
router.put('/tasks/:id/status', async (req, res) => {
    const { id } = req.params
    const { status, userId } = req.body
    try {
        const db = await connectToDatabase()
        
        // 1. Get task information (title, project_id, etc.)
        const [taskRows] = await db.query('SELECT t.title, t.project_id, t.status AS old_status, p.name AS project_name, p.created_by AS project_creator FROM tasks t JOIN projects p ON t.project_id = p.id WHERE t.id = ?', [id])
        if (taskRows.length === 0) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลงาน / Task not found' })
        }
        const { title, project_id, project_name, project_creator } = taskRows[0]

        // 2. Update status
        await db.query('UPDATE tasks SET status = ? WHERE id = ?', [status, id])

        // 3. Log activity
        await logActivity(db, userId || null, 'Update Task Status', `Updated task "${title}" status to "${status}"`)

        // 4. Send notification to the project creator/assigner
        if (project_creator && Number(project_creator) !== Number(userId)) {
            const notifMessage = `งาน "${title}" ในโปรเจกต์ "${project_name}" ถูกอัปเดตสถานะเป็น "${status}"`
            await db.query(
                "INSERT INTO notifications (user_id, message, read_status) VALUES (?, ?, FALSE)",
                [Number(project_creator), notifMessage]
            )
        }

        res.status(200).json({ message: 'อัปเดตสถานะสำเร็จ / Status updated successfully' })
    } catch (error) {
        console.error('Error updating task status:', error.message)
        res.status(500).json({ message: error.message })
    }
})


// Fetch recent activity logs (limited to 10)
/**
 * GET /activity-logs
 * - ดึงประวัติกิจกรรมการทำงานของระบบ (สูงสุด 100 รายการล่าสุด) เช่น การล็อกอิน การสร้าง/แก้ไขโครงการ 
 * - แสดงผลร่วมกับชื่อผู้ใช้งานที่ทำกิจกรรมนั้นๆ
 */
router.get('/activity-logs', async (req, res) => {
    try {
        const db = await connectToDatabase()
        const [rows] = await db.query(`
            SELECT al.action, al.details, al.created_at, u.username
            FROM activity_logs al
            LEFT JOIN users u ON al.user_id = u.id
            ORDER BY al.created_at DESC
            LIMIT 100
        `)
        res.status(200).json(rows)
    } catch (error) {
        console.error('Error fetching activity logs:', error.message)
        res.status(500).json({ message: error.message })
    }
})

// Log user logout action
/**
 * POST /logout
 * - บันทึกประวัติการออกจากระบบ (Logout) ของผู้ใช้งาน
 */
router.post('/logout', async (req, res) => {
    const { userId } = req.body
    try {
        const db = await connectToDatabase()
        if (userId) {
            // Get username for logging
            const [userRows] = await db.query('SELECT username FROM users WHERE id = ?', [userId])
            const username = userRows[0]?.username || `User ID ${userId}`
            await logActivity(db, userId, 'Logout', `User logged out: ${username}`);
        }
        res.status(200).json({ message: 'Logged out successfully' })
    } catch (error) {
        console.error('Error logging logout:', error.message)
        res.status(500).json({ message: error.message })
    }
})

// Bulk Import Users
/**
 * POST /users/import
 * - นำเข้าผู้ใช้งานจำนวนมากจากไฟล์ CSV
 * - หากอีเมลซ้ำจะเป็นการอัปเดตข้อมูลผู้ใช้งานเดิม (username, role, และ password หากระบุมา)
 * - หากเป็นอีเมลใหม่จะทำการสร้างผู้ใช้งานใหม่
 */
router.post('/users/import', async (req, res) => {
    const { users, userId } = req.body;
    // ตรวจสอบความถูกต้องของข้อมูลที่ส่งมา
    if (!users || !Array.isArray(users)) {
        return res.status(400).json({ message: 'Invalid users payload' });
    }

    try {
        const db = await connectToDatabase();
        let importedCount = 0; // ตัวนับจำนวนสร้างใหม่
        let updatedCount = 0;  // ตัวนับจำนวนอัปเดตข้อมูลเดิม

        // ฟังก์ชันช่วยในการแปลงบทบาท (Role) ให้เข้ากันได้กับฐานข้อมูล (Enum)
        const normalizeRole = (role) => {
            const r = (role || '').trim().toLowerCase();
            if (r === 'admin') return 'admin';
            if (r === 'project manager' || r === 'manager') return 'manager';
            if (r === 'team leader' || r === 'team_leader') return 'team_leader';
            if (r === 'video editor' || r === 'video_editor') return 'video_editor';
            if (r === 'translator') return 'translator';
            return 'user';
        };

        // วนลูปประมวลผลข้อมูลผู้ใช้ทีละรายชื่อ
        for (const item of users) {
            const username = (item.username || '').trim();
            const email = (item.email || '').trim();
            const password = (item.password || '').trim();
            const role = normalizeRole(item.role);

            // ข้ามรายการหากข้อมูลอีเมลหรือชื่อเป็นค่าว่าง
            if (!email || !username) {
                continue;
            }

            // ตรวจสอบว่ามีผู้ใช้อีเมลนี้ในระบบอยู่แล้วหรือไม่
            const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);

            if (existing.length > 0) {
                // กรณีอีเมลซ้ำ: อัปเดตข้อมูลเดิม (Username, Role)
                const userIdToUpdate = existing[0].id;
                let query = 'UPDATE users SET username = ?, role = ?';
                let params = [username, role];

                // หากมีการระบุรหัสผ่านใหม่ใน CSV ให้ทำ hashing และบันทึกรหัสผ่านใหม่
                if (password) {
                    const hashPassword = await bcrypt.hash(password, 10);
                    query += ', password = ?';
                    params.push(hashPassword);
                }

                query += ' WHERE id = ?';
                params.push(userIdToUpdate);

                await db.query(query, params);
                updatedCount++;
            } else {
                // กรณีเป็นอีเมลใหม่: ทำการสมัครสมาชิกใหม่
                const finalPassword = password || '123456'; // รหัสผ่านเริ่มต้นกรณีไม่ได้ใส่มา
                const hashPassword = await bcrypt.hash(finalPassword, 10);
                await db.query(
                    'INSERT INTO users (username, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
                    [username, email, hashPassword, role, 'active']
                );
                importedCount++;
            }
        }

        // บันทึกกิจกรรมการนำเข้าลงตารางประวัติกิจกรรม (Activity Logs)
        await logActivity(
            db,
            userId || null,
            'Import Users',
            `Bulk imported: ${importedCount} new, updated: ${updatedCount} existing`
        );

        res.status(200).json({
            message: 'Import completed successfully',
            imported: importedCount,
            updated: updatedCount,
        });
    } catch (error) {
        console.error('Error importing users:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// Send OTP Request
/**
 * POST /send-otp
 * - ตรวจสอบว่ามีอีเมลในระบบหรือไม่
 * - สุ่มเลข OTP 6 หลักโดยใช้ crypto.randomInt
 * - บันทึกลงตาราง otp_requests พร้อมเวลาหมดอายุ 3 นาที
 * - แสดง OTP ที่คอนโซลเพื่อทดสอบ
 */
router.post('/send-otp', async (req, res) => {
    const { email } = req.body;
    try {
        const db = await connectToDatabase();
        const [users] = await db.query('SELECT id, username FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'ไม่พบอีเมลผู้ใช้ในระบบ / User not found' });
        }

        const userId = users[0].id;
        const username = users[0].username;
        
        // 1. สุ่มตัวเลข 6 หลัก (เลข 100000 - 999999)
        const otpCode = crypto.randomInt(100000, 999999).toString();
        
        // 2. คำนวณเวลาหมดอายุ (ปัจจุบัน + 3 นาที)
        const expiresAt = new Date(Date.now() + 3 * 60 * 1000);

        // 3. บันทึกลง MySQL
        await db.query(
            'INSERT INTO otp_requests (user_id, otp_code, expires_at) VALUES (?, ?, ?)',
            [userId, otpCode, expiresAt]
        );

        // แสดงผลรหัส OTP ที่คอนโซลของเซิร์ฟเวอร์เพื่อความสะดวกในการทดสอบ/พัฒนา
        console.log(`[OTP Sent] Email: ${email}, Code: ${otpCode}`);

        // 4. ตั้งค่า nodemailer เพื่อส่งอีเมล
        const emailUser = (process.env.EMAIL_USER || 'chayanon.sent@gmail.com').replace(/['"]/g, '').trim();
        const emailPass = (process.env.EMAIL_PASS || '').replace(/['"]/g, '').trim();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: emailUser,
                pass: emailPass
            }
        });

        const mailOptions = {
            from: `"Project Management" <${emailUser}>`,
            to: email,
            subject: 'OTP Verification Code - Project Management',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #0d6efd; text-align: center;">OTP Verification</h2>
                    <p>Hello <b>${username}</b>,</p>
                    <p>You requested a one-time password (OTP) to reset your account password.</p>
                    <div style="background-color: #f9f9f9; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
                        <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #1a1a2e;">${otpCode}</span>
                    </div>
                    <p style="color: #ea580c; font-weight: bold;">* This OTP code will expire in 3 minutes and can only be used once.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #777; text-align: center;">If you did not request this, you can safely ignore this email.</p>
                </div>
            `
        };

        // หากมีการตั้งค่ารหัสผ่านอีเมลใน env ให้ทำการส่งจริง ถ้าไม่มีให้ข้าม (เพื่อไม่ให้พังในการทดสอบ)
        if (emailPass) {
            await transporter.sendMail(mailOptions);
        } else {
            console.warn('[Warning] EMAIL_PASS is not configured in .env. Skipping real email delivery, showing OTP on console/frontend.');
        }

        res.status(200).json({ 
            message: 'ส่งรหัส OTP เรียบร้อยแล้ว (OTP sent successfully)',
            otpCode: otpCode 
        });
    } catch (error) {
        console.error('Error sending OTP:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// Reset user password
/**
 * POST /reset-password
 * - ทำการรีเซ็ตรหัสผ่านของผู้ใช้งานระบุตามอีเมล
 * - ตรวจสอบว่าอีเมลมีอยู่ในระบบจริงหรือไม่
 * - ตรวจสอบรหัส OTP ให้ถูกต้อง
 * - เข้ารหัสผ่านใหม่ (hash) และบันทึกลงฐานข้อมูล
 */
router.post('/reset-password', async (req, res) => {
    const { email, password, otpCode } = req.body;
    try {
        const db = await connectToDatabase();
        // ตรวจสอบว่าผู้ใช้งานที่มีอีเมลนี้มีอยู่จริงหรือไม่
        const [rows] = await db.query('SELECT id, username FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userId = rows[0].id;

        // 1. ตรวจสอบความถูกต้องของ OTP
        const [otpRows] = await db.query(`
            SELECT * FROM otp_requests 
            WHERE user_id = ? 
              AND otp_code = ? 
              AND is_used = 0 
              AND expires_at > NOW() 
            ORDER BY created_at DESC 
            LIMIT 1
        `, [userId, otpCode]);

        if (otpRows.length === 0) {
            return res.status(400).json({ message: 'รหัส OTP ไม่ถูกต้อง หรือหมดอายุแล้ว (Invalid or expired OTP)' });
        }

        const otpRequestId = otpRows[0].id;

        // 2. กฎเหล็ก: อัปเดตตาราง otp_requests ให้ is_used = 1 ทันที เพื่อป้องกันการใช้งานซ้ำ
        await db.query('UPDATE otp_requests SET is_used = 1 WHERE id = ?', [otpRequestId]);

        const hashPassword = await bcrypt.hash(password, 10);

        // อัปเดตรหัสผ่านใหม่
        await db.query('UPDATE users SET password = ? WHERE id = ?', [hashPassword, userId]);

        // บันทึกกิจกรรมลง Activity Logs
        await logActivity(db, userId, 'Reset Password', `User reset password for: ${email}`);

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Error resetting password:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// Reset password on first login
/**
 * POST /reset-password-first-time
 * - สำหรับการเปลี่ยนรหัสผ่านครั้งแรกเมื่อเข้าสู่ระบบ
 * - อัปเดตรหัสผ่านใหม่ที่ผ่านการเข้ารหัสแล้ว
 * - อัปเดตคอลัมน์ is_force_reset = 0 เพื่อปลดล็อก
 */
router.post('/reset-password-first-time', async (req, res) => {
    const { userId, password } = req.body;
    try {
        const db = await connectToDatabase();
        
        // ตรวจสอบว่าผู้ใช้มีอยู่จริงหรือไม่
        const [rows] = await db.query('SELECT id, email FROM users WHERE id = ?', [userId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        // อัปเดตตาราง users
        await db.query(
            'UPDATE users SET password = ?, is_force_reset = 0 WHERE id = ?',
            [hashPassword, userId]
        );

        // บันทึกกิจกรรมลง Activity Logs
        await logActivity(db, userId, 'Reset Password First Time', `User reset password on first login for: ${rows[0].email}`);

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error resetting password on first login:', error.message);
        res.status(500).json({ message: error.message });
    }
});

export default router;

