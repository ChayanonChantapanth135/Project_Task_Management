import express from 'express';
import { upload, uploadTaskFileMiddleware, verifyToken } from '../middleware/authMiddleware.js';
import * as authCtrl from '../controllers/authController.js';
import * as notificationCtrl from '../controllers/notificationController.js';

const router = express.Router();

// --- AUTH ROUTES ---
router.post('/login', authCtrl.login);
router.post('/refresh', authCtrl.refresh);
router.post('/logout', authCtrl.logout);

// --- USER ROUTES ---
router.get('/users', authCtrl.getUsers);
router.get('/users/:id', authCtrl.getUserById);
router.post('/users', upload.single('avatar'), authCtrl.createUser);
router.put('/users/:id', upload.single('avatar'), authCtrl.updateUser);
router.delete('/users/:id', authCtrl.softDeleteUser);
router.post('/users/:id/restore', authCtrl.restoreUser);
router.delete('/users/:id/permanent', authCtrl.permanentDeleteUser);
router.post('/upload-avatar/:id', upload.single('avatar'), authCtrl.uploadAvatar);
router.post('/users/import', authCtrl.importUsers);

// --- PROJECT & TASK ROUTES ---
router.get('/team-leaders', authCtrl.getTeamLeaders);
router.get('/projects', authCtrl.getProjects);
router.post('/projects', authCtrl.createProject);
router.put('/projects/:id', authCtrl.updateProject);
router.delete('/projects/:id', authCtrl.deleteProject);

router.post('/tasks', authCtrl.createTask);
router.put('/tasks/:id/status', authCtrl.updateTaskStatus);
router.put('/tasks/:id', authCtrl.updateTask);
router.delete('/tasks/:id', authCtrl.deleteTask);
router.get('/tasks/:id/history', authCtrl.getTaskHistory);
router.get('/tasks/:id/comments', authCtrl.getTaskComments);
router.post('/tasks/:id/comments', authCtrl.createTaskComment);
router.get('/tasks/:id/files', authCtrl.getTaskFiles);
router.post('/tasks/:id/files', uploadTaskFileMiddleware.single('file'), authCtrl.uploadTaskFile);
router.get('/tasks/:id/status-history', authCtrl.getTaskStatusHistory);

// --- DASHBOARD & LOGS ROUTES ---
router.get('/dashboard-stats', authCtrl.getDashboardStats);
router.get('/activity-logs', authCtrl.getActivityLogs);

// --- OTP & RESET PASSWORD ROUTES ---
router.post('/send-otp', authCtrl.sendOtp);
router.post('/reset-password', authCtrl.resetPassword);
router.post('/reset-password-first-time', authCtrl.resetPasswordFirstTime);

// --- NOTIFICATION ROUTES ---
router.get('/notifications', verifyToken, notificationCtrl.getUserNotifications);
router.put('/notifications/read-all', verifyToken, notificationCtrl.markAllAsRead);
router.put('/notifications/:id/read', verifyToken, notificationCtrl.markAsRead);
router.delete('/notifications/clear-all', verifyToken, notificationCtrl.clearAllNotifications);
router.delete('/notifications/:id', verifyToken, notificationCtrl.deleteNotification);

export default router;
