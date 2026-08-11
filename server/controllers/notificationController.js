import { connectToDatabase } from '../lib/db.js'

/**
 * ดึงรายการการแจ้งเตือนของผู้ใช้ที่ล็อกอินอยู่
 */
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const db = await connectToDatabase();
    
    // ดึงการแจ้งเตือน 50 รายการล่าสุด
    const [rows] = await db.query(
      `SELECT id, user_id, title, message, type, link, COALESCE(is_read, read_status, 0) as is_read, created_at 
       FROM notifications 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [userId]
    );

    // นับจำนวนที่ยังไม่ได้อ่าน
    const [unreadRows] = await db.query(
      `SELECT COUNT(*) as unreadCount 
       FROM notifications 
       WHERE user_id = ? AND (is_read = 0 OR is_read IS NULL) AND (read_status = 0 OR read_status IS NULL)`,
      [userId]
    );

    return res.status(200).json({
      notifications: rows,
      unreadCount: unreadRows[0]?.unreadCount || 0
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ message: 'Server error fetching notifications' });
  }
};

/**
 * ทำเครื่องหมายการแจ้งเตือนเดี่ยวว่าอ่านแล้ว (และอัปเดตสถานะงานเป็น In Progress หากงานนั้นมีสถานะเป็น Pending)
 */
export const markAsRead = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const db = await connectToDatabase();

    // 1. ดึงรายละเอียดของแจ้งเตือนรายการนี้
    const [notifRows] = await db.query(
      `SELECT task_id, user_id FROM notifications WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    // 2. ทำเครื่องหมายอ่านแล้ว
    await db.query(
      `UPDATE notifications 
       SET is_read = 1, read_status = 1 
       WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    // 3. หากแจ้งเตือนนี้เชื่อมโยงกับงาน ให้เปลี่ยนสถานะงานจาก Pending เป็น In Progress ทันที
    if (notifRows.length > 0 && notifRows[0].task_id) {
      const taskId = notifRows[0].task_id;
      const [taskRows] = await db.query(
        `SELECT id, project_id, status FROM tasks WHERE id = ? AND deleted_at IS NULL`,
        [taskId]
      );

      if (taskRows.length > 0 && taskRows[0].status === 'Pending') {
        await db.query(
          `UPDATE tasks SET status = 'In Progress' WHERE id = ?`,
          [taskId]
        );

        // บันทึกประวัติการเปลี่ยนสถานะงาน
        await db.query(
          "INSERT INTO task_history (task_id, action, details, changed_by) VALUES (?, 'status_change', ?, ?)",
          [taskId, `เปลี่ยนสถานะเป็น In Progress อัตโนมัติเมื่อกดอ่านการแจ้งเตือน`, userId]
        );

        // อัปเดตสถานะโปรเจกต์หลักถ้าจำเป็น
        if (taskRows[0].project_id) {
          const [tasks] = await db.query(
            "SELECT status FROM tasks WHERE project_id = ? AND deleted_at IS NULL",
            [taskRows[0].project_id]
          );
          if (tasks.length > 0) {
            const hasReviewing = tasks.some(t => t.status && (t.status.toLowerCase() === 'reviewing' || t.status.toLowerCase() === 'review'));
            const completedCount = tasks.filter(t => t.status && t.status.toLowerCase() === 'completed').length;
            const progress = Math.round((completedCount / tasks.length) * 100);

            if (hasReviewing) {
              await db.query("UPDATE projects SET status = 'Reviewing' WHERE id = ?", [taskRows[0].project_id]);
            } else if (progress === 100) {
              await db.query("UPDATE projects SET status = 'Completed' WHERE id = ?", [taskRows[0].project_id]);
            } else {
              await db.query("UPDATE projects SET status = 'In Progress' WHERE id = ?", [taskRows[0].project_id]);
            }
          }
        }
      }
    }

    return res.status(200).json({ message: 'Notification marked as read and task updated to In Progress' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({ message: 'Server error updating notification' });
  }
};

/**
 * ทำเครื่องหมายการแจ้งเตือนทั้งหมดว่าอ่านแล้ว (และอัปเดตสถานะงานทั้งหมดของแจ้งเตือนนั้นเป็น In Progress)
 */
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.userId;
    const db = await connectToDatabase();

    // ดึงงานที่ยังไม่ได้อ่าน
    const [unreadNotifs] = await db.query(
      `SELECT DISTINCT task_id FROM notifications 
       WHERE user_id = ? AND (is_read = 0 OR is_read IS NULL) AND task_id IS NOT NULL`,
      [userId]
    );

    // ทำเครื่องหมายอ่านทั้งหมด
    await db.query(
      `UPDATE notifications 
       SET is_read = 1, read_status = 1 
       WHERE user_id = ?`,
      [userId]
    );

    // อัปเดตงานทั้งหมดที่มีสถานะ Pending เป็น In Progress
    for (const item of unreadNotifs) {
      if (item.task_id) {
        const [taskRows] = await db.query(
          `SELECT id, project_id, status FROM tasks WHERE id = ? AND status = 'Pending' AND deleted_at IS NULL`,
          [item.task_id]
        );
        if (taskRows.length > 0) {
          await db.query(`UPDATE tasks SET status = 'In Progress' WHERE id = ?`, [item.task_id]);
          await db.query(
            "INSERT INTO task_history (task_id, action, details, changed_by) VALUES (?, 'status_change', ?, ?)",
            [item.task_id, `เปลี่ยนสถานะเป็น In Progress อัตโนมัติเมื่อกดอ่านการแจ้งเตือนทั้งหมด`, userId]
          );
        }
      }
    }

    return res.status(200).json({ message: 'All notifications marked as read and tasks updated' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return res.status(500).json({ message: 'Server error updating notifications' });
  }
};

/**
 * ลบการแจ้งเตือนรายการเดียว
 */
export const deleteNotification = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const db = await connectToDatabase();
    await db.query(
      `DELETE FROM notifications WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    return res.status(200).json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return res.status(500).json({ message: 'Server error deleting notification' });
  }
};

/**
 * ลบการแจ้งเตือนทั้งหมดของผู้ใช้
 */
export const clearAllNotifications = async (req, res) => {
  try {
    const userId = req.userId;

    const db = await connectToDatabase();
    await db.query(
      `DELETE FROM notifications WHERE user_id = ?`,
      [userId]
    );

    return res.status(200).json({ message: 'All notifications deleted' });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    return res.status(500).json({ message: 'Server error clearing notifications' });
  }
};

/**
 * Helper function สำหรับสร้างการแจ้งเตือนในระบบ (สำหรับเรียกใช้ใน backend controllers)
 */
export const createNotificationHelper = async ({ userId, title, message, type = 'system', link = null }) => {
  try {
    if (!userId || !message) return null;
    const db = await connectToDatabase();
    const [result] = await db.query(
      `INSERT INTO notifications (user_id, title, message, type, link, is_read, read_status) 
       VALUES (?, ?, ?, ?, ?, 0, 0)`,
      [userId, title || 'System Notification', message, type, link]
    );
    return result.insertId;
  } catch (error) {
    console.error('Error in createNotificationHelper:', error);
    return null;
  }
};
