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
        // Prevent duplicate inserts from concurrent/race requests within 3 seconds
        let recentLog = [];
        if (userId) {
            [recentLog] = await db.query(
                "SELECT id FROM activity_logs WHERE user_id = ? AND action = ? AND details = ? AND created_at >= NOW() - INTERVAL 3 SECOND LIMIT 1",
                [userId, action, details]
            );
        } else {
            [recentLog] = await db.query(
                "SELECT id FROM activity_logs WHERE user_id IS NULL AND action = ? AND details = ? AND created_at >= NOW() - INTERVAL 3 SECOND LIMIT 1",
                [action, details]
            );
        }

        if (recentLog.length > 0) {
            await db.query(
                "UPDATE activity_logs SET created_at = CURRENT_TIMESTAMP WHERE id = ?",
                [recentLog[0].id]
            );
            return;
        }

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

        await logActivity(db, rows[0].id, 'Login', `User logged in: ${rows[0].fullname}`);

        if (rows[0].is_force_reset === 1) {
            return res.status(201).json({
                requirePasswordReset: true,
                message: "กรุณาเปลี่ยนรหัสผ่านก่อนเข้าใช้งานครั้งแรก",
                token: token,
                expiresIn: tokenExpiresIn,
                expiresInSeconds: tokenExpiresInSeconds,
                user: {
                    id: rows[0].id,
                    name: rows[0].fullname,
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
                name: rows[0].fullname,
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
                name: rows[0].fullname,
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
            const [userRows] = await db.query('SELECT fullname FROM users WHERE id = ?', [userId]);
            const fullname = userRows[0]?.fullname || `User ID ${userId}`;
            await logActivity(db, userId, 'Logout', `User logged out: ${fullname}`);
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
        let query = 'SELECT id, fullname, email, phone, role, avatar, status, created_at, deleted_at FROM users WHERE deleted_at IS NULL';
        if (includeDeleted === 'true') {
            query = 'SELECT id, fullname, email, phone, role, avatar, status, created_at, deleted_at FROM users';
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
        const [rows] = await db.query('SELECT id, fullname, email, phone, role, avatar, status, created_at, deleted_at FROM users WHERE id = ? AND deleted_at IS NULL', [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error fetching user:', error.message);
        res.status(500).json({ message: error.message });
    }
};

export const createUser = async (req, res) => {
    const { fullname, email, password, phone, role, status } = req.body;
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
            'INSERT INTO users (fullname, email, password, phone, role, status, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [fullname, email, hashPassword, formattedPhone, sqlRole, sqlStatus, avatarUrl]
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
                            <p>Hello <b>${fullname}</b>,</p>
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
        await logActivity(db, creatorId ? Number(creatorId) : null, 'Create User', `Created user: ${fullname} (${email})`);

        res.status(201).json({ message: 'User created successfully', id: result.insertId });
    } catch (error) {
        console.error('Error creating user:', error.message);
        res.status(500).json({ message: error.message });
    }
};

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { fullname, email, password, phone, role, status, creatorId, currentPassword } = req.body;
    try {
        const db = await connectToDatabase();
        
        const [oldUserRows] = await db.query('SELECT password, status FROM users WHERE id = ?', [id]);
        const oldPasswordHash = oldUserRows[0]?.password;
        const oldStatus = oldUserRows[0]?.status;

        if (password && String(id) === String(creatorId)) {
            if (!currentPassword) {
                return res.status(400).json({ message: 'กรุณากรอกรหัสผ่านปัจจุบัน' });
            }
            const isMatch = await bcrypt.compare(currentPassword, oldPasswordHash);
            if (!isMatch) {
                return res.status(400).json({ message: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' });
            }
        }

        if (email) {
            const [existing] = await db.query('SELECT id FROM users WHERE email = ? AND id != ? AND deleted_at IS NULL', [email, id]);
            if (existing.length > 0) {
                return res.status(409).json({ message: 'อีเมลนี้ถูกใช้งานโดยผู้ใช้อื่นแล้ว' });
            }
        }

        const formattedPhone = formatPhoneNumber(phone);

        let query = 'UPDATE users SET fullname = ?, email = ?, phone = ?, role = ?, status = ?';
        let params = [fullname, email, formattedPhone, role, status || 'active'];
        
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
                await logActivity(db, creatorId ? Number(creatorId) : null, 'Suspend User', `Suspended user: ${fullname} (${email})`);
            } else if (targetStatus === 'active') {
                await logActivity(db, creatorId ? Number(creatorId) : null, 'Activate User', `Activated user: ${fullname} (${email})`);
            } else {
                await logActivity(db, creatorId ? Number(creatorId) : null, 'Edit User', `Edited user ID: ${id} (${fullname})`);
            }
        } else {
            await logActivity(db, creatorId ? Number(creatorId) : null, 'Edit User', `Edited user ID: ${id} (${fullname})`);
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
        const [userRows] = await db.query('SELECT fullname, email FROM users WHERE id = ? AND deleted_at IS NULL', [id]);
        if (userRows.length === 0) {
            return res.status(404).json({ message: 'User not found or already deleted' });
        }
        const { fullname, email } = userRows[0];
        await db.query('UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
        await logActivity(db, creatorId ? Number(creatorId) : null, 'Soft Delete User', `Soft deleted user: ${fullname} (${email})`);
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
        const [userRows] = await db.query('SELECT fullname, email FROM users WHERE id = ?', [id]);
        if (userRows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const { fullname, email } = userRows[0];
        await db.query('UPDATE users SET deleted_at = NULL WHERE id = ?', [id]);
        await logActivity(db, creatorId ? Number(creatorId) : null, 'Restore User', `Restored user: ${fullname} (${email})`);
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
        const [userRows] = await db.query('SELECT fullname, email, avatar FROM users WHERE id = ?', [id]);
        if (userRows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const { fullname, email, avatar } = userRows[0];
        if (avatar) {
            deleteOldAvatar(avatar);
        }
        await db.query('DELETE FROM users WHERE id = ?', [id]);
        await logActivity(db, creatorId ? Number(creatorId) : null, 'Permanent Delete User', `Permanently deleted user: ${fullname} (${email})`);
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
            const fullname = (item.fullname || item.username || '').trim();
            const email = (item.email || '').trim();
            const password = (item.password || '').trim();
            const role = normalizeRole(item.role);

            if (!email || !fullname) {
                continue;
            }

            const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);

            if (existing.length > 0) {
                const userIdToUpdate = existing[0].id;
                let query = 'UPDATE users SET fullname = ?, role = ?';
                let params = [fullname, role];

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
                    'INSERT INTO users (fullname, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
                    [fullname, email, hashPassword, role, 'active']
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
        let [rows] = await db.query("SELECT id, fullname, email FROM users WHERE role = 'team_leader' AND deleted_at IS NULL");
        if (rows.length === 0) {
            [rows] = await db.query("SELECT id, fullname, email FROM users WHERE deleted_at IS NULL");
        }
        if (rows.length === 0) {
            rows = [
                { id: 3, fullname: "Somsak Somdee (Simulated)" },
                { id: 4, fullname: "Wichai Jaidee (Simulated)" },
                { id: 5, fullname: "Anong Rakdee (Simulated)" }
            ];
        }
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching team leaders:', error.message);
        res.status(500).json({ message: error.message });
    }
};

const checkAndUpdateProjectStatus = async (db, projectId) => {
    if (!projectId) return;
    try {
        const [tasks] = await db.query(
            "SELECT status FROM tasks WHERE project_id = ? AND deleted_at IS NULL",
            [projectId]
        );
        if (tasks.length > 0) {
            const hasReviewing = tasks.some(t => t.status && (t.status.toLowerCase() === 'reviewing' || t.status.toLowerCase() === 'review'));
            const completedCount = tasks.filter(t => t.status && t.status.toLowerCase() === 'completed').length;
            const progress = Math.round((completedCount / tasks.length) * 100);

            if (hasReviewing) {
                await db.query("UPDATE projects SET status = 'Reviewing' WHERE id = ?", [projectId]);
            } else if (progress === 100) {
                await db.query("UPDATE projects SET status = 'Completed' WHERE id = ?", [projectId]);
            } else {
                await db.query("UPDATE projects SET status = 'In Progress' WHERE id = ?", [projectId]);
            }
        }
    } catch (err) {
        console.error("Error auto updating project status:", err.message);
    }
};

export const getProjects = async (req, res) => {
    try {
        const db = await connectToDatabase();
        const [projects] = await db.query(`
            SELECT p.*, u.id AS teamLeaderId, u.fullname AS teamLeaderName
            FROM projects p
            LEFT JOIN project_team_leaders ptl ON p.id = ptl.project_id
            LEFT JOIN users u ON ptl.user_id = u.id
            WHERE p.deleted_at IS NULL
            ORDER BY p.created_at DESC
        `);

        for (const p of projects) {
            const [tasks] = await db.query(`
                SELECT t.id, t.title, t.status, t.due_date, t.assigned_to, t.description, t.task_type, t.priority, u.fullname AS assigned_to_name
                FROM tasks t
                LEFT JOIN users u ON t.assigned_to = u.id
                WHERE t.project_id = ? AND t.deleted_at IS NULL
            `, [p.id]);
            p.tasks = tasks;
            if (tasks.length > 0) {
                const hasReviewing = tasks.some(t => t.status && (t.status.toLowerCase() === 'reviewing' || t.status.toLowerCase() === 'review'));
                const completed = tasks.filter(t => t.status && t.status.toLowerCase() === 'completed').length;
                p.progress = Math.round((completed / tasks.length) * 100);

                if (hasReviewing) {
                    if (p.status !== 'Reviewing') {
                        p.status = 'Reviewing';
                        await db.query("UPDATE projects SET status = 'Reviewing' WHERE id = ?", [p.id]);
                    }
                } else if (p.progress === 100) {
                    if (p.status !== 'Completed') {
                        p.status = 'Completed';
                        await db.query("UPDATE projects SET status = 'Completed' WHERE id = ?", [p.id]);
                    }
                } else {
                    if (p.status !== 'In Progress') {
                        p.status = 'In Progress';
                        await db.query("UPDATE projects SET status = 'In Progress' WHERE id = ?", [p.id]);
                    }
                }
            } else {
                p.progress = 0;
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

const parseDueDate = (dateStr) => {
    if (!dateStr || dateStr === "-" || dateStr === "null" || dateStr === "undefined") return null;
    const str = String(dateStr).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    if (str.includes("T")) return str.split("T")[0];
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
        const [d, m, y] = str.split("/");
        let yearNum = parseInt(y, 10);
        if (yearNum > 2400) yearNum -= 543;
        return `${yearNum}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
        return d.toISOString().split("T")[0];
    }
    return null;
};

export const createTask = async (req, res) => {
    const { projectId, title, description, taskType, priority, dueDate, assignedTo, createdBy } = req.body;
    if (!projectId || !title) {
        return res.status(400).json({ message: 'สร้างไม่สำเร็จ: กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' });
    }

    const formattedDueDate = parseDueDate(dueDate);
    try {
        const db = await connectToDatabase();
        const [result] = await db.query(
            "INSERT INTO tasks (project_id, title, description, task_type, priority, due_date, assigned_to, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')",
            [projectId, title, description || null, taskType || null, priority || 'Medium', formattedDueDate, assignedTo ? Number(assignedTo) : null]
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

        await db.query(
            "INSERT INTO task_history (task_id, action, details, changed_by) VALUES (?, 'create', ?, ?)",
            [taskId, `สร้างงาน: "${title}"`, createdBy || null]
        );

        await checkAndUpdateProjectStatus(db, projectId);

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
        await checkAndUpdateProjectStatus(db, project_id);
        await db.query(
            "INSERT INTO task_history (task_id, action, details, changed_by) VALUES (?, 'status_change', ?, ?)",
            [id, `เปลี่ยนสถานะเป็น "${status}"`, userId || null]
        );
        await db.query(
            "INSERT INTO task_status_history (task_id, status, changed_by) VALUES (?, ?, ?)",
            [id, status, userId || null]
        );
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

export const updateTask = async (req, res) => {
    const { id } = req.params;
    const { title, description, taskType, priority, dueDate, assignedTo, projectId, status, userId } = req.body;
    try {
        const db = await connectToDatabase();
        const [oldTaskRows] = await db.query('SELECT title, description, task_type, priority, due_date, assigned_to, status FROM tasks WHERE id = ?', [id]);
        if (oldTaskRows.length === 0) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลงาน / Task not found' });
        }
        const oldTask = oldTaskRows[0];
        const oldAssignee = oldTask.assigned_to;
        const oldTitle = oldTask.title;
        const oldStatus = oldTask.status;

        const formattedDueDate = parseDueDate(dueDate) || (oldTask.due_date ? String(oldTask.due_date).split("T")[0] : null);

        await db.query(
            'UPDATE tasks SET title = ?, description = ?, task_type = ?, priority = ?, due_date = ?, assigned_to = ?, project_id = ?, status = ? WHERE id = ?',
            [
                title,
                description || null,
                taskType || null,
                priority || 'Medium',
                formattedDueDate,
                assignedTo ? Number(assignedTo) : null,
                projectId ? Number(projectId) : null,
                status || 'Pending',
                id
            ]
        );

        // Log assignee change
        if (Number(assignedTo) !== Number(oldAssignee)) {
            const [oldUserRows] = oldAssignee ? await db.query('SELECT fullname FROM users WHERE id = ?', [oldAssignee]) : [[]];
            const [newUserRows] = assignedTo ? await db.query('SELECT fullname FROM users WHERE id = ?', [assignedTo]) : [[]];
            const oldName = oldUserRows[0]?.fullname || 'ไม่มีผู้รับผิดชอบ';
            const newName = newUserRows[0]?.fullname || 'ไม่มีผู้รับผิดชอบ';
            await db.query(
                "INSERT INTO task_history (task_id, action, details, changed_by) VALUES (?, 'assignee_change', ?, ?)",
                [id, `เปลี่ยนผู้รับผิดชอบจาก "${oldName}" เป็น "${newName}"`, userId || null]
            );
        }

        // Log status change
        if (status && status !== oldStatus) {
            await db.query(
                "INSERT INTO task_history (task_id, action, details, changed_by) VALUES (?, 'status_change', ?, ?)",
                [id, `เปลี่ยนสถานะเป็น "${status}"`, userId || null]
            );
            await db.query(
                "INSERT INTO task_status_history (task_id, status, changed_by) VALUES (?, ?, ?)",
                [id, status, userId || null]
            );
        }

        const oldDueDateStr = oldTask.due_date ? parseDueDate(oldTask.due_date) : null;
        const detailsChanged = (title !== oldTask.title ||
                                (description || null) !== (oldTask.description || null) ||
                                taskType !== oldTask.task_type ||
                                priority !== oldTask.priority ||
                                formattedDueDate !== oldDueDateStr);
        if (detailsChanged) {
            await db.query(
                "INSERT INTO task_history (task_id, action, details, changed_by) VALUES (?, 'edit_details', ?, ?)",
                [id, `แก้ไขรายละเอียดงาน`, userId || null]
            );
        }

        await logActivity(db, userId || null, 'Update Task Details', `Updated task details for "${title}" (ID: ${id})`);

        if (assignedTo && Number(assignedTo) !== Number(oldAssignee)) {
            const [projRows] = await db.query('SELECT name FROM projects WHERE id = ?', [projectId]);
            const projectName = projRows[0]?.name || `ID ${projectId}`;
            const notifMessage = `คุณได้รับมอบหมายงานใหม่: "${title}" ในโปรเจกต์ "${projectName}"`;
            await db.query(
                "INSERT INTO notifications (user_id, message, read_status) VALUES (?, ?, FALSE)",
                [Number(assignedTo), notifMessage]
            );
        }

        await checkAndUpdateProjectStatus(db, projectId || oldTask.project_id);

        res.status(200).json({ message: 'อัปเดตข้อมูลงานสำเร็จ / Task updated successfully' });
    } catch (error) {
        console.error('Error updating task:', error.message);
        res.status(500).json({ message: error.message });
    }
};

export const deleteTask = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.query;
    try {
        const db = await connectToDatabase();
        const [taskRows] = await db.query('SELECT title, project_id FROM tasks WHERE id = ?', [id]);
        if (taskRows.length === 0) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลงาน / Task not found' });
        }
        const { title, project_id } = taskRows[0];

        await db.query('UPDATE tasks SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
        await checkAndUpdateProjectStatus(db, project_id);
        await logActivity(db, userId || null, 'Delete Task', `Soft deleted task "${title}" (ID: ${id})`);
        res.status(200).json({ message: 'ลบงานสำเร็จ / Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error.message);
        res.status(500).json({ message: error.message });
    }
};

export const getTaskHistory = async (req, res) => {
    const { id } = req.params;
    try {
        const db = await connectToDatabase();
        
        // 1. Get history logs with usernames
        const [historyRows] = await db.query(`
            SELECT th.id, th.action, th.details, th.changed_at, u.fullname, u.role
            FROM task_history th
            LEFT JOIN users u ON th.changed_by = u.id
            WHERE th.task_id = ?
            ORDER BY th.changed_at DESC
        `, [id]);
        
        // 2. Calculate assignee changes count
        const [assigneeChanges] = await db.query(
            "SELECT COUNT(*) as count FROM task_history WHERE task_id = ? AND action = 'assignee_change'",
            [id]
        );
        
        // 3. Get last editor details
        let lastEditedBy = 'ไม่มีข้อมูล / No data';
        let lastEditedAt = null;
        if (historyRows.length > 0) {
            // Find the latest edit (excluding 'create')
            const latestEdit = historyRows.find(h => h.action !== 'create');
            if (latestEdit) {
                lastEditedBy = latestEdit.fullname ? `${latestEdit.fullname} (${latestEdit.role})` : 'System';
                lastEditedAt = latestEdit.changed_at;
            } else if (historyRows[0]) {
                lastEditedBy = historyRows[0].fullname ? `${historyRows[0].fullname} (${historyRows[0].role})` : 'System';
                lastEditedAt = historyRows[0].changed_at;
            }
        }
        
        res.status(200).json({
            lastEditedBy,
            lastEditedAt,
            assigneeChangesCount: assigneeChanges[0]?.count || 0,
            historyLogs: historyRows
        });
    } catch (error) {
        console.error('Error fetching task history:', error.message);
        res.status(500).json({ message: error.message });
    }
};

export const getTaskComments = async (req, res) => {
    const { id } = req.params;
    try {
        const db = await connectToDatabase();
        const [rows] = await db.query(`
            SELECT c.id, c.comment, c.created_at, u.fullname, u.avatar, u.role
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.task_id = ?
            ORDER BY c.created_at ASC
        `, [id]);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching comments:', error.message);
        res.status(500).json({ message: error.message });
    }
};

export const createTaskComment = async (req, res) => {
    const { id } = req.params;
    const { comment, userId } = req.body;
    if (!comment) {
        return res.status(400).json({ message: 'ความคิดเห็นไม่สามารถว่างได้ / Comment cannot be empty' });
    }
    try {
        const db = await connectToDatabase();
        await db.query(
            "INSERT INTO comments (task_id, user_id, comment) VALUES (?, ?, ?)",
            [id, userId, comment]
        );
        res.status(201).json({ message: 'บันทึกความคิดเห็นสำเร็จ / Comment created successfully' });
    } catch (error) {
        console.error('Error creating comment:', error.message);
        res.status(500).json({ message: error.message });
    }
};

export const getTaskFiles = async (req, res) => {
    const { id } = req.params;
    try {
        const db = await connectToDatabase();
        const [rows] = await db.query(`
            SELECT f.id, f.filename, f.filepath, f.created_at, u.fullname, u.role
            FROM files f
            JOIN users u ON f.uploaded_by = u.id
            WHERE f.task_id = ?
            ORDER BY f.created_at DESC
        `, [id]);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching files:', error.message);
        res.status(500).json({ message: error.message });
    }
};

export const uploadTaskFile = async (req, res) => {
    const { id } = req.params;
    const { uploadedBy } = req.body;
    if (!req.file) {
        return res.status(400).json({ message: 'กรุณาเลือกไฟล์ที่ต้องการอัปโหลด / Please select a file' });
    }
    try {
        const db = await connectToDatabase();
        const filename = req.file.originalname;
        const filepath = `/uploads/${req.file.filename}`;
        
        await db.query(
            "INSERT INTO files (task_id, filename, filepath, uploaded_by) VALUES (?, ?, ?, ?)",
            [id, filename, filepath, uploadedBy || null]
        );
        res.status(201).json({ message: 'อัปโหลดไฟล์สำเร็จ / File uploaded successfully', filepath });
    } catch (error) {
        console.error('Error uploading task file:', error.message);
        res.status(500).json({ message: error.message });
    }
};

export const getTaskStatusHistory = async (req, res) => {
    const { id } = req.params;
    try {
        const db = await connectToDatabase();
        const [rows] = await db.query(`
            SELECT tsh.status, tsh.changed_at, u.fullname, u.role
            FROM task_status_history tsh
            LEFT JOIN users u ON tsh.changed_by = u.id
            WHERE tsh.task_id = ?
            ORDER BY tsh.changed_at ASC
        `, [id]);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching status history:', error.message);
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

            const [pPendingRows] = await db.query("SELECT COUNT(*) as count FROM projects WHERE status = 'Pending' AND deleted_at IS NULL");
            pendingProjects = pPendingRows[0].count;

            const [pProgressRows] = await db.query("SELECT COUNT(*) as count FROM projects WHERE status = 'In Progress' AND deleted_at IS NULL");
            inProgressProjects = pProgressRows[0].count;

            const [pReviewRows] = await db.query("SELECT COUNT(*) as count FROM projects WHERE status = 'Reviewing' AND deleted_at IS NULL");
            reviewProjects = pReviewRows[0].count;

            const [pCompletedRows] = await db.query("SELECT COUNT(*) as count FROM projects WHERE status = 'Completed' AND deleted_at IS NULL");
            completedProjects = pCompletedRows[0].count;

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
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;
        const userId = req.query.userId ? parseInt(req.query.userId, 10) : null;
        
        let query = `
            SELECT al.action, al.details, al.created_at, u.fullname
            FROM activity_logs al
            LEFT JOIN users u ON al.user_id = u.id
        `;
        const params = [];
        
        if (userId && !isNaN(userId)) {
            query += ` WHERE al.user_id = ?`;
            params.push(userId);
        }
        
        query += ` ORDER BY al.created_at DESC`;
        
        if (limit && !isNaN(limit)) {
            query += ` LIMIT ?`;
            params.push(limit);
        }
        const [rows] = await db.query(query, params);
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
        const [users] = await db.query('SELECT id, fullname FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'ไม่พบอีเมลผู้ใช้ในระบบ / User not found' });
        }

        const userId = users[0].id;
        const fullname = users[0].fullname;
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
                    <p>Hello <b>${fullname}</b>,</p>
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
        const [rows] = await db.query('SELECT id, fullname FROM users WHERE email = ?', [email]);
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
