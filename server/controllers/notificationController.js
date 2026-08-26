import { connectToDatabase } from '../lib/db.js'
import { emitNotificationToUser } from '../lib/socket.js'

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
      `SELECT id, user_id, task_id, title, message, type, link, COALESCE(is_read, read_status, 0) as is_read, created_at 
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
  const userId = req.userId;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const db = await connectToDatabase();
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. ดึงรายละเอียดของแจ้งเตือนรายการนี้
    const [notifRows] = await connection.query(
      `SELECT task_id, user_id FROM notifications WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    // 2. ทำเครื่องหมายอ่านแล้ว
    await connection.query(
      `UPDATE notifications 
       SET is_read = 1, read_status = 1 
       WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    // 3. หากแจ้งเตือนนี้เชื่อมโยงกับงาน ให้เปลี่ยนสถานะงานจาก Pending เป็น In Progress ทันที
    if (notifRows.length > 0 && notifRows[0].task_id) {
      const taskId = notifRows[0].task_id;
      const [taskRows] = await connection.query(
        `SELECT id, project_id, status FROM tasks WHERE id = ? AND deleted_at IS NULL`,
        [taskId]
      );

      if (taskRows.length > 0 && taskRows[0].status === 'Pending') {
        await connection.query(
          `UPDATE tasks SET status = 'In Progress' WHERE id = ?`,
          [taskId]
        );

        // บันทึกประวัติการเปลี่ยนสถานะงาน
        await connection.query(
          "INSERT INTO task_history (task_id, action, details, changed_by) VALUES (?, 'status_change', ?, ?)",
          [taskId, `เปลี่ยนสถานะเป็น In Progress อัตโนมัติเมื่อกดอ่านการแจ้งเตือน`, userId]
        );
        await connection.query(
          "INSERT INTO task_status_history (task_id, status, changed_by) VALUES (?, 'In Progress', ?)",
          [taskId, userId]
        );

        // อัปเดตสถานะโปรเจกต์หลักถ้าจำเป็น
        if (taskRows[0].project_id) {
          const [tasks] = await connection.query(
            "SELECT status FROM tasks WHERE project_id = ? AND deleted_at IS NULL",
            [taskRows[0].project_id]
          );
          if (tasks.length > 0) {
            const hasReviewing = tasks.some(t => t.status && (t.status.toLowerCase() === 'reviewing' || t.status.toLowerCase() === 'review'));
            const completedCount = tasks.filter(t => t.status && t.status.toLowerCase() === 'completed').length;
            const progress = Math.round((completedCount / tasks.length) * 100);

            const [projRows] = await connection.query("SELECT status FROM projects WHERE id = ?", [taskRows[0].project_id]);
            const oldStatus = projRows[0]?.status;

            let newStatus = 'In Progress';
            if (hasReviewing) {
              newStatus = 'Reviewing';
            } else if (progress === 100) {
              newStatus = 'Completed';
            }

            if (newStatus !== oldStatus) {
              await connection.query("UPDATE projects SET status = ? WHERE id = ?", [newStatus, taskRows[0].project_id]);
              if (newStatus === 'Reviewing') {
                // Send reviewing notifications
                try {
                  const pId = taskRows[0].project_id;
                  const [pData] = await connection.query("SELECT name, created_by FROM projects WHERE id = ?", [pId]);
                  const pName = pData[0]?.name || `ID ${pId}`;
                  const pCreator = pData[0]?.created_by;

                  const targetIds = new Set();
                  if (pCreator) targetIds.add(Number(pCreator));
                  const [mRows] = await connection.query("SELECT id FROM users WHERE role = 'manager' AND deleted_at IS NULL");
                  mRows.forEach(m => targetIds.add(Number(m.id)));
                  const [tlRows] = await connection.query("SELECT user_id FROM project_team_leaders WHERE project_id = ?", [pId]);
                  tlRows.forEach(tl => targetIds.add(Number(tl.user_id)));

                  for (const uid of targetIds) {
                    const title = 'โปรเจกต์รอตรวจสอบ';
                    const message = `โปรเจกต์ "${pName}" มีสถานะเป็น Reviewing (รอตรวจสอบ)`;
                    const link = `/Projects?projectId=${pId}`;
                    const [recent] = await connection.query("SELECT id FROM notifications WHERE user_id = ? AND title = ? AND message = ? AND created_at >= NOW() - INTERVAL 1 MINUTE", [uid, title, message]);
                    if (recent.length === 0) {
                      const [insertResult] = await connection.query("INSERT INTO notifications (user_id, title, message, type, link, is_read, read_status) VALUES (?, ?, ?, 'project', ?, 0, 0)", [uid, title, message, link]);
                      emitNotificationToUser(uid, {
                        id: insertResult.insertId,
                        user_id: uid,
                        title,
                        message,
                        type: 'project',
                        link,
                        project_id: pId
                      });
                    }
                  }
                } catch (notifErr) {
                  console.error("Error sending project reviewing notif in markAsRead:", notifErr);
                }
              }
            }
          }
        }
      }
    }

    await connection.commit();
    return res.status(200).json({ message: 'Notification marked as read and task updated to In Progress' });
  } catch (error) {
    await connection.rollback();
    console.error('Error marking notification as read:', error);
    return res.status(500).json({ message: 'Server error updating notification' });
  } finally {
    connection.release();
  }
};

/**
 * ทำเครื่องหมายการแจ้งเตือนทั้งหมดว่าอ่านแล้ว (และอัปเดตสถานะงานทั้งหมดของแจ้งเตือนนั้นเป็น In Progress)
 */
export const markAllAsRead = async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const db = await connectToDatabase();
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. ดึงงานที่ยังไม่ได้อ่าน
    const [unreadNotifs] = await connection.query(
      `SELECT DISTINCT task_id FROM notifications 
       WHERE user_id = ? AND (is_read = 0 OR is_read IS NULL) AND task_id IS NOT NULL`,
      [userId]
    );

    // 2. ทำเครื่องหมายอ่านทั้งหมด
    await connection.query(
      `UPDATE notifications 
       SET is_read = 1, read_status = 1 
       WHERE user_id = ?`,
      [userId]
    );

    // 3. อัปเดตงานทั้งหมดที่มีสถานะ Pending เป็น In Progress
    if (unreadNotifs.length > 0) {
      const taskIds = unreadNotifs.map(n => n.task_id).filter(Boolean);

      if (taskIds.length > 0) {
        // ดึงเฉพาะ Task ที่เป็น Pending เพื่ออัปเดต
        const [pendingTasks] = await connection.query(
          `SELECT id FROM tasks WHERE id IN (?) AND status = 'Pending' AND deleted_at IS NULL`,
          [taskIds]
        );

        if (pendingTasks.length > 0) {
          const pendingIds = pendingTasks.map(t => t.id);

          // Batch Update สถานะ Tasks
          await connection.query(
            `UPDATE tasks SET status = 'In Progress' WHERE id IN (?)`,
            [pendingIds]
          );

          // บันทึกประวัติด้วย Promise.all รันแบบขนาน
          await Promise.all(
            pendingIds.map(async (tId) => {
              await connection.query(
                "INSERT INTO task_history (task_id, action, details, changed_by) VALUES (?, 'status_change', ?, ?)",
                [tId, 'เปลี่ยนสถานะเป็น In Progress อัตโนมัติเมื่อกดอ่านการแจ้งเตือนทั้งหมด', userId]
              );
              await connection.query(
                "INSERT INTO task_status_history (task_id, status, changed_by) VALUES (?, 'In Progress', ?)",
                [tId, userId]
              );
            })
          );
        }
      }
    }

    await connection.commit();
    return res.status(200).json({ message: 'All notifications marked as read and tasks updated' });
  } catch (error) {
    await connection.rollback();
    console.error('Error marking all notifications as read:', error);
    return res.status(500).json({ message: 'Server error updating notifications' });
  } finally {
    connection.release();
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
export const createNotificationHelper = async ({ userId, title, message, type = 'system', link = null, taskId = null, projectId = null }) => {
  try {
    if (!userId || !message) return null;
    const db = await connectToDatabase();
    const [result] = await db.query(
      `INSERT INTO notifications (user_id, task_id, title, message, type, link, is_read, read_status) 
       VALUES (?, ?, ?, ?, ?, ?, 0, 0)`,
      [userId, taskId || null, title || 'System Notification', message, type, link]
    );

    const newNotifId = result.insertId;
    emitNotificationToUser(userId, {
      id: newNotifId,
      user_id: userId,
      task_id: taskId || null,
      project_id: projectId || null,
      title: title || 'System Notification',
      message,
      type,
      link,
    });

    return newNotifId;
  } catch (error) {
    console.error('Error in createNotificationHelper:', error);
    return null;
  }
};
