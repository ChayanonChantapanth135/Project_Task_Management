import { connectToDatabase } from '../lib/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to delete old avatar file
function deleteOldAvatar(avatarPath) {
    if (!avatarPath) return;
    try {
        let fileName = '';
        if (avatarPath.startsWith('http')) {
            const parts = avatarPath.split('/uploads/');
            if (parts.length > 1) {
                fileName = parts[1];
            }
        } else if (avatarPath.startsWith('/uploads/')) {
            fileName = avatarPath.replace('/uploads/', '');
        }

        if (fileName) {
            const filePath = path.join(__dirname, '../uploads', fileName);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`[Avatar Cleanup] Deleted old file: ${filePath}`);
            }
        }
    } catch (error) {
        console.error('Error deleting old avatar file:', error.message);
    }
}

// Helper to log user activity
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
            await db.query(
                "UPDATE activity_logs SET created_at = CURRENT_TIMESTAMP WHERE id = ?",
                [lastLog[0].id]
            );
        } else {
            await db.query(
                "INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)",
                [userId, action, details]
            );
        }
    } catch (error) {
        console.error("Error writing activity log:", error.message);
    }
}

// Helper to format phone number
function formatPhoneNumber(phone) {
    if (!phone) return null;
    let cleaned = String(phone).trim().replace(/[\s-]/g, '');
    if (cleaned.startsWith('0')) {
        return '+66' + cleaned.slice(1);
    }
    return cleaned;
}

// --- AUTH CONTROLLERS ---

export const login = async (req, res) => {
    const { email, password } = req.body;
    console.log('Login request received:', { email });
    try {
        const db = await connectToDatabase();
        const [rows] = await db.query('SELECT * FROM users WHERE email = ? AND deleted_at IS NULL', [email]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not existed' });
        }

        const isMatch = await bcrypt.compare(password, rows[0].password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (rows[0].status === 'suspended') {
            return res.status(403).json({ message: 'บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ' });
        }
        const tokenExpiresIn = '40m';
        const tokenExpiresInSeconds = 40 * 60;
        const token = jwt.sign({ id: rows[0].id }, process.env.JWT_KEY, { expiresIn: tokenExpiresIn });

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
            });
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
        });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ message: error.message });
    }
};

export const refresh = async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Token required' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY, { ignoreExpiration: true });
        const db = await connectToDatabase();
        const [rows] = await db.query('SELECT * FROM users WHERE id = ? AND deleted_at IS NULL', [decoded.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (rows[0].status === 'suspended') {
            return res.status(403).json({ message: 'บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ' });
        }
        const tokenExpiresIn = '40m';
        const tokenExpiresInSeconds = 40 * 60;
        const newToken = jwt.sign({ id: decoded.id }, process.env.JWT_KEY, { expiresIn: tokenExpiresIn });
        
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
        });
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

export const logout = async (req, res) => {
    const { userId } = req.body;
    try {
        const db = await connectToDatabase();
        if (userId) {
            const [userRows] = await db.query('SELECT username FROM users WHERE id = ?', [userId]);
            const username = userRows[0]?.username || `User ID ${userId}`;
            await logActivity(db, userId, 'Logout', `User logged out: ${username}`);
        }
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Error logging logout:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// --- USER MANAGEMENT CONTROLLERS ---

export const getUsers = async (req, res) => {
    const { includeDeleted } = req.query;
    try {
        const db = await connectToDatabase();
        let query = 'SELECT id, username, email, phone, role, avatar, status, created_at, deleted_at FROM users WHERE deleted_at IS NULL';
        if (includeDeleted === 'true') {
            query = 'SELECT id, username, email, phone, role, avatar, status, created_at, deleted_at FROM users';
        }
        const [rows] = await db.query(query);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json({ message: error.message });
    }
};

export const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const db = await connectToDatabase();
        const [rows] = await db.query('SELECT id, username, email, phone, role, avatar, status, created_at, deleted_at FROM users WHERE id = ? AND deleted_at IS NULL', [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error fetching user:', error.message);
        res.status(500).json({ message: error.message });
    }
};

export const createUser = async (req, res) => {
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

        const emailUser = (process.env.EMAIL_USER || 'chayanon.sent@gmail.com').replace(/['"]/g, '').trim();
        const emailPass = (process.env.EMAIL_PASS || '').replace(/['"]/g, '').trim();

        if (emailPass) {
            try {
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: { user: emailUser, pass: emailPass }
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
        }

        const { creatorId } = req.body;
        await logActivity(db, creatorId ? Number(creatorId) : null, 'Create User', `Created user: ${username} (${email})`);

        res.status(201).json({ message: 'User created successfully', id: result.insertId });
    } catch (error) {
        console.error('Error creating user:', error.message);
        res.status(500).json({ message: error.message });
    }
};

export const updateUser = async (req, res) => {
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
};

export const softDeleteUser = async (req, res) => {
    const { id } = req.params;
    const { creatorId } = req.query;
    try {
        const db = await connectToDatabase();
        const [userRows] = await db.query('SELECT username, email FROM users WHERE id = ? AND deleted_at IS NULL', [id]);
        if (userRows.length === 0) {
            return res.status(404).json({ message: 'User not found or already deleted' });
        }
        const { username, email } = userRows[0];
        await db.query('UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
        await logActivity(db, creatorId ? Number(creatorId) : null, 'Soft Delete User', `Soft deleted user: ${username} (${email})`);
        res.status(200).json({ message: 'User soft-deleted successfully' });
    } catch (error) {
        console.error('Error soft deleting user:', error.message);
        res.status(500).json({ message: error.message });
    }
};

export const restoreUser = async (req, res) => {
    const { id } = req.params;
    const { creatorId } = req.body;
    try {
        const db = await connectToDatabase();
        const [userRows] = await db.query('SELECT username, email FROM users WHERE id = ?', [id]);
        if (userRows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const { username, email } = userRows[0];
        await db.query('UPDATE users SET deleted_at = NULL WHERE id = ?', [id]);
        await logActivity(db, creatorId ? Number(creatorId) : null, 'Restore User', `Restored user: ${username} (${email})`);
        res.status(200).json({ message: 'User restored successfully' });
    } catch (error) {
        console.error('Error restoring user:', error.message);
        res.status(500).json({ message: error.message });
    }
};

export const permanentDeleteUser = async (req, res) => {
    const { id } = req.params;
    const { creatorId } = req.query;
    try {
        const db = await connectToDatabase();
        const [userRows] = await db.query('SELECT username, email, avatar FROM users WHERE id = ?', [id]);
        if (userRows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const { username, email, avatar } = userRows[0];
        if (avatar) {
            deleteOldAvatar(avatar);
        }
        await db.query('DELETE FROM users WHERE id = ?', [id]);
        await logActivity(db, creatorId ? Number(creatorId) : null, 'Permanent Delete User', `Permanently deleted user: ${username} (${email})`);
        res.status(200).json({ message: 'User permanently deleted successfully' });
    } catch (error) {
        console.error('Error permanently deleting user:', error.message);
        res.status(500).json({ message: error.message });
    }
};

export const uploadAvatar = async (req, res) => {
    const { id } = req.params;
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const db = await connectToDatabase();
        
        const [userRows] = await db.query('SELECT avatar FROM users WHERE id = ?', [id]);
        if (userRows.length > 0 && userRows[0].avatar) {
            deleteOldAvatar(userRows[0].avatar);
        }

        const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3000';
        const avatarUrl = `${baseUrl}/uploads/${req.file.filename}`;
        
        await db.query('UPDATE users SET avatar = ? WHERE id = ?', [avatarUrl, id]);
        res.status(200).json({ message: 'Avatar uploaded successfully', avatarUrl });
    } catch (error) {
        console.error('Error uploading avatar:', error.message);
        res.status(500).json({ message: error.message });
    }
};

export const importUsers = async (req, res) => {
    const { users, userId } = req.body;
    if (!users || !Array.isArray(users)) {
        return res.status(400).json({ message: 'Invalid users payload' });
    }

    try {
        const db = await connectToDatabase();
        let importedCount = 0;
        let updatedCount = 0;

        const normalizeRole = (role) => {
            const r = (role || '').trim().toLowerCase();
            if (r === 'admin') return 'admin';
            if (r === 'project manager' || r === 'manager') return 'manager';
            if (r === 'team leader' || r === 'team_leader') return 'team_leader';
            if (r === 'video editor' || r === 'video_editor') return 'video_editor';
            if (r === 'translator') return 'translator';
            return 'user';
        };

        for (const item of users) {
            const username = (item.username || '').trim();
            const email = (item.email || '').trim();
            const password = (item.password || '').trim();
            const role = normalizeRole(item.role);

            if (!email || !username) {
                continue;
            }

            const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);

            if (existing.length > 0) {
                const userIdToUpdate = existing[0].id;
                let query = 'UPDATE users SET username = ?, role = ?';
                let params = [username, role];

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
                const finalPassword = password || '123456';
                const hashPassword = await bcrypt.hash(finalPassword, 10);
                await db.query(
                    'INSERT INTO users (username, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
                    [username, email, hashPassword, role, 'active']
                );
                importedCount++;
            }
        }

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
};

// --- PROJECT & TASK CONTROLLERS ---

export const getTeamLeaders = async (req, res) => {
    try {
        const db = await connectToDatabase();
        let [rows] = await db.query("SELECT id, username, email FROM users WHERE role = 'team_leader' AND deleted_at IS NULL");
        if (rows.length === 0) {
            [rows] = await db.query("SELECT id, username, email FROM users WHERE deleted_at IS NULL");
        }
        if (rows.length === 0) {
            rows = [
                { id: 3, username: "Somsak Somdee (Simulated)" },
                { id: 4, username: "Wichai Jaidee (Simulated)" },
                { id: 5, username: "Anong Rakdee (Simulated)" }
            ];
        }
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching team leaders:', error.message);
        res.status(500).json({ message: error.message });
    }
};

export const getProjects = async (req, res) => {
    try {
        const db = await connectToDatabase();
        const [projects] = await db.query(`
            SELECT p.*, u.id AS teamLeaderId, u.username AS teamLeaderName
            FROM projects p
            LEFT JOIN project_team_leaders ptl ON p.id = ptl.project_id
            LEFT JOIN users u ON ptl.user_id = u.id
            WHERE p.deleted_at IS NULL
            ORDER BY p.created_at DESC
        `);

        for (const p of projects) {
            const [tasks] = await db.query(`
                SELECT t.id, t.title, t.status, t.due_date, t.assigned_to, t.description, t.task_type, t.priority, u.username AS assigned_to_name
                FROM tasks t
                LEFT JOIN users u ON t.assigned_to = u.id
                WHERE t.project_id = ? AND t.deleted_at IS NULL
            `, [p.id]);
            p.tasks = tasks;
            if (tasks.length > 0) {
                const completed = tasks.filter(t => t.status && t.status.toLowerCase() === 'completed').length;
                p.progress = Math.round((completed / tasks.length) * 100);
            } else {
                p.progress = (p.status && p.status.toLowerCase() === 'completed') ? 100 : 0;
            }
        }

        res.status(200).json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error.message);
        res.status(500).json({ message: error.message });
    }
};

export const createProject = async (req, res) => {
    const { name, endDate, priority, teamLeaderId, createdBy } = req.body;
    try {
        const db = await connectToDatabase();
        const [result] = await db.query(
            "INSERT INTO projects (name, status, priority, end_date, created_by) VALUES (?, 'Pending', ?, ?, ?)",
            [name, priority, endDate, createdBy]
        );
        const projectId = result.insertId;

        if (teamLeaderId) {
            await db.query("INSERT INTO project_team_leaders (project_id, user_id) VALUES (?, ?)", [projectId, teamLeaderId]);
        }

        await logActivity(db, createdBy, 'Create New Project', `Created project: ${name}`);
        res.status(201).json({ message: 'Project created successfully', projectId });
    } catch (error) {
        console.error('Error creating project:', error.message);
        res.status(500).json({ message: error.message });
    }
};

export const updateProject = async (req, res) => {
    const { id } = req.params;
    const { name, status, priority, endDate, teamLeaderId, userId } = req.body;
    try {
        const db = await connectToDatabase();
        await db.query(
            "UPDATE projects SET name = ?, status = ?, priority = ?, end_date = ? WHERE id = ?",
            [name, status, priority, endDate, id]
        );

        await db.query("DELETE FROM project_team_leaders WHERE project_id = ?", [id]);
        if (teamLeaderId) {
            await db.query("INSERT INTO project_team_leaders (project_id, user_id) VALUES (?, ?)", [id, teamLeaderId]);
        }

        await logActivity(db, userId, 'Edit Project', `Edited project ID: ${id}`);
        res.status(200).json({ message: 'Project updated successfully' });
    } catch (error) {
        console.error('Error updating project:', error.message);
        res.status(500).json({ message: error.message });
    }
};

export const deleteProject = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.query;
    try {
        const db = await connectToDatabase();
        const [projRows] = await db.query('SELECT name FROM projects WHERE id = ? AND deleted_at IS NULL', [id]);
        const projName = projRows[0]?.name || id;

        await db.query("UPDATE projects SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?", [id]);
        await db.query("UPDATE tasks SET deleted_at = CURRENT_TIMESTAMP WHERE project_id = ?", [id]);

        await logActivity(db, userId, 'Delete Project', `Soft deleted project: ${projName}`);
        res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error.message);
        res.status(500).json({ message: error.message });
    }
};

export const createTask = async (req, res) => {
    const { projectId, title, description, taskType, priority, dueDate, assignedTo, createdBy } = req.body;
    if (!projectId || !title) {
        return res.status(400).json({ message: 'สร้างไม่สำเร็จ: กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' });
    }

    try {
        const db = await connectToDatabase();
        const [result] = await db.query(
            "INSERT INTO tasks (project_id, title, description, task_type, priority, due_date, assigned_to, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')",
            [projectId, title, description || null, taskType || null, priority || 'Medium', dueDate || null, assignedTo ? Number(assignedTo) : null]
        );
        const taskId = result.insertId;

        if (assignedTo) {
            const [projRows] = await db.query('SELECT name FROM projects WHERE id = ?', [projectId]);
            const projectName = projRows[0]?.name || `ID ${projectId}`;
            const notifMessage = `คุณได้รับมอบหมายงานใหม่: "${title}" ในโปรเจกต์ "${projectName}"`;
            await db.query(
                "INSERT INTO notifications (user_id, message, read_status) VALUES (?, ?, FALSE)",
                [Number(assignedTo), notifMessage]
            );
        }

        await logActivity(db, createdBy || null, 'Create Task Success', `Created task: ${title} under project ID: ${projectId}`);
        res.status(201).json({ message: 'Create Success', taskId });
    } catch (error) {
        console.error('Error creating task:', error.message);
        res.status(500).json({ message: 'สร้างไม่สำเร็จ: เกิดข้อผิดพลาดของระบบ' });
    }
};

export const updateTaskStatus = async (req, res) => {
    const { id } = req.params;
    const { status, userId } = req.body;
    try {
        const db = await connectToDatabase();
        const [taskRows] = await db.query('SELECT t.title, t.project_id, t.status AS old_status, p.name AS project_name, p.created_by AS project_creator FROM tasks t JOIN projects p ON t.project_id = p.id WHERE t.id = ?', [id]);
        if (taskRows.length === 0) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลงาน / Task not found' });
        }
        const { title, project_id, project_name, project_creator } = taskRows[0];

        await db.query('UPDATE tasks SET status = ? WHERE id = ?', [status, id]);
        await logActivity(db, userId || null, 'Update Task Status', `Updated task "${title}" status to "${status}"`);

        if (project_creator && Number(project_creator) !== Number(userId)) {
            const notifMessage = `งาน "${title}" ในโปรเจกต์ "${project_name}" ถูกอัปเดตสถานะเป็น "${status}"`;
            await db.query(
                "INSERT INTO notifications (user_id, message, read_status) VALUES (?, ?, FALSE)",
                [Number(project_creator), notifMessage]
            );
        }

        res.status(200).json({ message: 'อัปเดตสถานะสำเร็จ / Status updated successfully' });
    } catch (error) {
        console.error('Error updating task status:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// --- DASHBOARD & LOGS CONTROLLERS ---

export const getDashboardStats = async (req, res) => {
    try {
        const db = await connectToDatabase();
        
        const [userRows] = await db.query('SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL');
        const userCount = userRows[0].count;

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
            const [pRows] = await db.query('SELECT COUNT(*) as count FROM projects WHERE deleted_at IS NULL');
            projectCount = pRows[0].count;

            const [pendingProjRows] = await db.query("SELECT COUNT(*) as count FROM projects WHERE status = 'pending' AND deleted_at IS NULL");
            pendingProjects = pendingProjRows[0].count;

            const [inProgressProjRows] = await db.query("SELECT COUNT(*) as count FROM projects WHERE status = 'in_progress' AND deleted_at IS NULL");
            inProgressProjects = inProgressProjRows[0].count;

            const [reviewProjRows] = await db.query("SELECT COUNT(*) as count FROM projects WHERE status = 'review' AND deleted_at IS NULL");
            reviewProjects = reviewProjRows[0].count;

            const [completedProjRows] = await db.query("SELECT COUNT(*) as count FROM projects WHERE status = 'completed' AND deleted_at IS NULL");
            completedProjects = completedProjRows[0].count;
        } catch (e) {}

        try {
            const [tRows] = await db.query('SELECT COUNT(*) as count FROM tasks WHERE deleted_at IS NULL');
            taskCount = tRows[0].count;
            
            const [pendingRows] = await db.query("SELECT COUNT(*) as count FROM tasks WHERE status = 'Pending' AND deleted_at IS NULL");
            pendingTasks = pendingRows[0].count;

            const [progressRows] = await db.query("SELECT COUNT(*) as count FROM tasks WHERE status = 'In Progress' AND deleted_at IS NULL");
            inProgressTasks = progressRows[0].count;

            const [reviewRows] = await db.query("SELECT COUNT(*) as count FROM tasks WHERE status = 'Reviewing' AND deleted_at IS NULL");
            reviewingTasks = reviewRows[0].count;

            const [completedRows] = await db.query("SELECT COUNT(*) as count FROM tasks WHERE status = 'Completed' AND deleted_at IS NULL");
            completedTasks = completedRows[0].count;

            const [overdueRows] = await db.query("SELECT COUNT(*) as count FROM tasks WHERE due_date < NOW() AND status != 'Completed' AND deleted_at IS NULL");
            overdueTaskCount = overdueRows[0].count;
        } catch (e) {}

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
};

export const getActivityLogs = async (req, res) => {
    try {
        const db = await connectToDatabase();
        const [rows] = await db.query(`
            SELECT al.action, al.details, al.created_at, u.username
            FROM activity_logs al
            LEFT JOIN users u ON al.user_id = u.id
            ORDER BY al.created_at DESC
            LIMIT 100
        `);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching activity logs:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// --- OTP & RESET PASSWORD CONTROLLERS ---

export const sendOtp = async (req, res) => {
    const { email } = req.body;
    try {
        const db = await connectToDatabase();
        const [users] = await db.query('SELECT id, username FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'ไม่พบอีเมลผู้ใช้ในระบบ / User not found' });
        }

        const userId = users[0].id;
        const username = users[0].username;
        const otpCode = crypto.randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 3 * 60 * 1000);

        await db.query(
            'INSERT INTO otp_requests (user_id, otp_code, expires_at) VALUES (?, ?, ?)',
            [userId, otpCode, expiresAt]
        );

        console.log(`[OTP Sent] Email: ${email}, Code: ${otpCode}`);

        const emailUser = (process.env.EMAIL_USER || 'chayanon.sent@gmail.com').replace(/['"]/g, '').trim();
        const emailPass = (process.env.EMAIL_PASS || '').replace(/['"]/g, '').trim();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: emailUser, pass: emailPass }
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
};

export const resetPassword = async (req, res) => {
    const { email, password, otpCode } = req.body;
    try {
        const db = await connectToDatabase();
        const [rows] = await db.query('SELECT id, username FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userId = rows[0].id;

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
        await db.query('UPDATE otp_requests SET is_used = 1 WHERE id = ?', [otpRequestId]);

        const hashPassword = await bcrypt.hash(password, 10);
        await db.query('UPDATE users SET password = ? WHERE id = ?', [hashPassword, userId]);

        await logActivity(db, userId, 'Reset Password', `User reset password for: ${email}`);

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Error resetting password:', error.message);
        res.status(500).json({ message: error.message });
    }
};

export const resetPasswordFirstTime = async (req, res) => {
    const { userId, password } = req.body;
    try {
        const db = await connectToDatabase();
        const [rows] = await db.query('SELECT id, email FROM users WHERE id = ?', [userId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const hashPassword = await bcrypt.hash(password, 10);
        await db.query(
            'UPDATE users SET password = ?, is_force_reset = 0 WHERE id = ?',
            [hashPassword, userId]
        );

        await logActivity(db, userId, 'Reset Password First Time', `User reset password on first login for: ${rows[0].email}`);

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error resetting password on first login:', error.message);
        res.status(500).json({ message: error.message });
    }
};
