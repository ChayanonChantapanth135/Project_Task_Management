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

        // Log Login
        await db.query("INSERT INTO activity_logs (user_id, action, details) VALUES (?, 'Login', ?)", [rows[0].id, `User logged in: ${rows[0].username}`]);

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
    } catch (error) {
        console.error('Login error:', error.message)
        res.status(500).json({ message: error.message })
    }
})

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
        else if (role === 'Project Manager') sqlRole = 'project_manager';
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

// --- PROJECTS MANAGEMENT DB ENDPOINTS ---

// Fetch team leaders (all users or users with role team_leader/admin)
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
            const [tasks] = await db.query('SELECT id, title, status FROM tasks WHERE project_id = ?', [p.id])
            p.tasks = tasks
            // Calculate progress based on tasks
            if (tasks.length > 0) {
                const completed = tasks.filter(t => t.status === 'Completed').length
                p.progress = Math.round((completed / tasks.length) * 100)
            } else {
                p.progress = p.status === 'Completed' ? 100 : 0
            }
        }

        res.status(200).json(projects)
    } catch (error) {
        console.error('Error fetching projects:', error.message)
        res.status(500).json({ message: error.message })
    }
})

// Create new project
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
        await db.query("INSERT INTO activity_logs (user_id, action, details) VALUES (?, 'Create New Project', ?)", [createdBy, `Created project: ${name}`])

        res.status(201).json({ message: 'Project created successfully', projectId })
    } catch (error) {
        console.error('Error creating project:', error.message)
        res.status(500).json({ message: error.message })
    }
})

// Edit project
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
        await db.query("INSERT INTO activity_logs (user_id, action, details) VALUES (?, 'Edit Project', ?)", [userId, `Edited project ID: ${id}`])

        res.status(200).json({ message: 'Project updated successfully' })
    } catch (error) {
        console.error('Error updating project:', error.message)
        res.status(500).json({ message: error.message })
    }
})

// Delete project
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
        await db.query("INSERT INTO activity_logs (user_id, action, details) VALUES (?, 'Delete Project', ?)", [userId, `Deleted project: ${projName}`])

        res.status(200).json({ message: 'Project deleted successfully' })
    } catch (error) {
        console.error('Error deleting project:', error.message)
        res.status(500).json({ message: error.message })
    }
})

// Fetch recent activity logs (limited to 10)
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
router.post('/logout', async (req, res) => {
    const { userId } = req.body
    try {
        const db = await connectToDatabase()
        if (userId) {
            // Get username for logging
            const [userRows] = await db.query('SELECT username FROM users WHERE id = ?', [userId])
            const username = userRows[0]?.username || `User ID ${userId}`
            await db.query("INSERT INTO activity_logs (user_id, action, details) VALUES (?, 'Logout', ?)", [userId, `User logged out: ${username}`])
        }
        res.status(200).json({ message: 'Logged out successfully' })
    } catch (error) {
        console.error('Error logging logout:', error.message)
        res.status(500).json({ message: error.message })
    }
})

export default router;
