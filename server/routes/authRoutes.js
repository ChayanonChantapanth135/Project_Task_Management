import express from 'express'
import {connectToDatabase} from '../lib/db.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'

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

router.post('/login', async (req, res) => {
    const { email, password } = req.body
    console.log('Login request received:', { email })
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

        return res.status(201).json({
            token: token,
            expiresIn: tokenExpiresIn,
            expiresInSeconds: tokenExpiresInSeconds,
            user: {
                id: rows[0].id,
                name: rows[0].username,
                email: rows[0].email,
                role: rows[0].role || 'user',
                avatar: rows[0].avatar || null
            }
        })
    }catch (error) {
        console.error('Login error:', error.message)
        res.status(500).json({ message: error.message })
    }
})

router.get('/users', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const [rows] = await db.query('SELECT id, username, email, role, avatar, status, created_at FROM users');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json({ message: error.message });
    }
})

router.get('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const db = await connectToDatabase();
        const [rows] = await db.query('SELECT id, username, email, role, avatar, status, created_at FROM users WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error fetching user:', error.message);
        res.status(500).json({ message: error.message });
    }
})

router.post('/users', async (req, res) => {
    const { username, email, password, role, status } = req.body;
    try {
        const db = await connectToDatabase();
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length > 0) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const hashPassword = await bcrypt.hash(password, 10);
        
        let sqlRole = 'user';
        if (role === 'Admin') sqlRole = 'admin';
        else if (role === 'Project Manager') sqlRole = 'manager';
        else if (role === 'Team Leader') sqlRole = 'team_leader';
        else if (role === 'Video Editor') sqlRole = 'video_editor';
        else if (role === 'Translator') sqlRole = 'translator';

        const sqlStatus = status === 'suspended' ? 'suspended' : 'active';

        const [result] = await db.query(
            'INSERT INTO users (username, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
            [username, email, hashPassword, sqlRole, sqlStatus]
        );
        res.status(201).json({ message: 'User created successfully', id: result.insertId });
    } catch (error) {
        console.error('Error creating user:', error.message);
        res.status(500).json({ message: error.message });
    }
})

router.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { username, email, password, role, status } = req.body;
    try {
        const db = await connectToDatabase();
        
        let query = 'UPDATE users SET username = ?, email = ?, role = ?, status = ?';
        let params = [username, email, role, status || 'active'];
        
        if (password) {
            const hashPassword = await bcrypt.hash(password, 10);
            query += ', password = ?';
            params.push(hashPassword);
        }
        
        query += ' WHERE id = ?';
        params.push(id);
        
        let sqlRole = 'user';
        if (role === 'Admin') sqlRole = 'admin';
        else if (role === 'Project Manager') sqlRole = 'manager';
        else if (role === 'Team Leader') sqlRole = 'team_leader';
        else if (role === 'Video Editor') sqlRole = 'video_editor';
        else if (role === 'Translator') sqlRole = 'translator';
        
        params[2] = sqlRole;

        await db.query(query, params);
        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error.message);
        res.status(500).json({ message: error.message });
    }
})

router.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const db = await connectToDatabase();
        await db.query('DELETE FROM users WHERE id = ?', [id]);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error.message);
        res.status(500).json({ message: error.message });
    }
})

// Upload avatar and update user's avatar in DB
router.post('/upload-avatar/:id', upload.single('avatar'), async (req, res) => {
    const { id } = req.params
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' })
        }
        const avatarUrl = `http://127.0.0.1:3000/uploads/${req.file.filename}`
        const db = await connectToDatabase()
        await db.query('UPDATE users SET avatar = ? WHERE id = ?', [avatarUrl, id])
        res.status(200).json({ message: 'Avatar uploaded successfully', avatarUrl })
    } catch (error) {
        console.error('Error uploading avatar:', error.message)
        res.status(500).json({ message: error.message })
    }
})

router.get('/dashboard-stats', async (req, res) => {
    try {
        const db = await connectToDatabase();
        
        // Count total users
        const [userRows] = await db.query('SELECT COUNT(*) as count FROM users');
        const userCount = userRows[0].count;

        // Since projects and tasks tables might not exist yet, we query gracefully
        let projectCount = 0;
        let taskCount = 0;
        let overdueTaskCount = 0;
        let pendingTasks = 0;
        let inProgressTasks = 0;
        let reviewingTasks = 0;
        let completedTasks = 0;

        try {
            const [pRows] = await db.query('SELECT COUNT(*) as count FROM projects');
            projectCount = pRows[0].count;
        } catch (e) { /* ignore if projects table doesn't exist */ }

        try {
            const [tRows] = await db.query('SELECT COUNT(*) as count FROM tasks');
            taskCount = tRows[0].count;
            
            // Query counts by status/overdue if columns exist
            const [pendingRows] = await db.query("SELECT COUNT(*) as count FROM tasks WHERE status = 'pending'");
            pendingTasks = pendingRows[0].count;

            const [progressRows] = await db.query("SELECT COUNT(*) as count FROM tasks WHERE status = 'in_progress'");
            inProgressTasks = progressRows[0].count;

            const [reviewRows] = await db.query("SELECT COUNT(*) as count FROM tasks WHERE status = 'reviewing'");
            reviewingTasks = reviewRows[0].count;

            const [completedRows] = await db.query("SELECT COUNT(*) as count FROM tasks WHERE status = 'completed'");
            completedTasks = completedRows[0].count;

            // Simple overdue query if due_date column exists
            const [overdueRows] = await db.query("SELECT COUNT(*) as count FROM tasks WHERE due_date < NOW() AND status != 'completed'");
            overdueTaskCount = overdueRows[0].count;
        } catch (e) { /* ignore if tasks table doesn't exist */ }

        res.status(200).json({
            users: userCount,
            projects: projectCount,
            tasks: taskCount,
            overdueTasks: overdueTaskCount,
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

export default router;
