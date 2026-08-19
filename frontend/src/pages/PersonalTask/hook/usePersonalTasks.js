import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { getCurrentUser } from "../../../lib/auth";
import { API_URL } from "../../../config";

const defaultColumnData = {
  tasks: {},
  columns: {
    todo: {
      id: "todo",
      title: "TO DO",
      color: "#007aeb",
      status: "todo",
      taskIds: [],
    },
    "in-progress": {
      id: "in-progress",
      title: "IN PROGRESS",
      color: "#f59e0b",
      status: "in-progress",
      taskIds: [],
    },
    completed: {
      id: "completed",
      title: "COMPLETED",
      color: "#00b884",
      status: "completed",
      taskIds: [],
    },
  },
  columnOrder: ["todo", "in-progress", "completed"],
};

export const usePersonalTasks = () => {
  const [data, setData] = useState(defaultColumnData);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  // ดึงข้อมูล User ปัจจุบันอย่างถูกต้อง
  useEffect(() => {
    const initUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user && user.id) {
          setCurrentUserId(user.id);
        } else {
          const userData = localStorage.getItem("userData");
          if (userData) {
            const parsed = JSON.parse(userData);
            setCurrentUserId(parsed.id);
          }
        }
      } catch (err) {
        console.error("Error loading current user:", err);
      }
    };
    initUser();
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const url = currentUserId
        ? `${API_URL}/auth/personal-tasks?userId=${currentUserId}`
        : `${API_URL}/auth/personal-tasks`;
      const res = await axios.get(url);
      const taskList = res.data || [];

      const newTasks = {};
      const todoTaskIds = [];
      const inProgressTaskIds = [];
      const completedTaskIds = [];

      taskList.forEach((task) => {
        const taskIdStr = `task-${task.id}`;
        // ตรวจสอบ status หรือ fallback จาก is_completed
        let currentStatus = task.status;
        if (!currentStatus) {
          currentStatus = task.is_completed ? "completed" : "todo";
        }

        newTasks[taskIdStr] = {
          id: taskIdStr,
          dbId: task.id,
          title: task.title,
          status: currentStatus,
          is_completed: currentStatus === "completed" ? 1 : 0,
          task_date: task.task_date,
          created_at: task.created_at,
        };

        if (currentStatus === "completed") {
          completedTaskIds.push(taskIdStr);
        } else if (currentStatus === "in-progress") {
          inProgressTaskIds.push(taskIdStr);
        } else {
          todoTaskIds.push(taskIdStr);
        }
      });

      setData({
        tasks: newTasks,
        columns: {
          todo: { ...defaultColumnData.columns.todo, taskIds: todoTaskIds },
          "in-progress": {
            ...defaultColumnData.columns["in-progress"],
            taskIds: inProgressTaskIds,
          },
          completed: {
            ...defaultColumnData.columns.completed,
            taskIds: completedTaskIds,
          },
        },
        columnOrder: ["todo", "in-progress", "completed"],
      });
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (currentUserId !== null) {
      fetchTasks();
    }
  }, [currentUserId, fetchTasks]);

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const startCol = data.columns[source.droppableId];
    const finishCol = data.columns[destination.droppableId];

    if (startCol === finishCol) {
      const newTaskIds = Array.from(startCol.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = { ...startCol, taskIds: newTaskIds };
      setData((prev) => ({
        ...prev,
        columns: { ...prev.columns, [newColumn.id]: newColumn },
      }));
      return;
    }

    const startTaskIds = Array.from(startCol.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStart = { ...startCol, taskIds: startTaskIds };

    const finishTaskIds = Array.from(finishCol.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = { ...finishCol, taskIds: finishTaskIds };

    const movedTask = data.tasks[draggableId];
    const newStatus = destination.droppableId; // 'todo' | 'in-progress' | 'completed'

    setData((prev) => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        [draggableId]: {
          ...prev.tasks[draggableId],
          status: newStatus,
          is_completed: newStatus === "completed" ? 1 : 0,
        },
      },
      columns: {
        ...prev.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      },
    }));

    try {
      await axios.put(
        `${API_URL}/auth/personal-tasks/${movedTask.dbId}`,
        {
          status: newStatus,
          is_completed: newStatus === "completed" ? 1 : 0,
        }
      );
    } catch (err) {
      console.error("Failed to update status in db:", err);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถอัปเดตสถานะงานได้",
      });
      fetchTasks();
    }
  };

  const handleAddTask = async (columnId) => {
    const targetColumn = data.columns[columnId] || data.columns["todo"];
    const targetStatus = targetColumn.id;

    const { value: formValues } = await Swal.fire({
      title: `<span class="text-xl font-semibold text-gray-800">เพิ่ม Task ใหม่ (${targetColumn?.title || ""})</span>`,
      html: `
        <div class="flex flex-col gap-3 text-left">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ชื่องาน <span class="text-red-500">*</span></label>
            <input id="swal-task-title" class="swal2-input !m-0 !w-full" placeholder="กรอกชื่องานของคุณ..." />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">วันที่กำหนด (ถ้ามี)</label>
            <input id="swal-task-date" type="date" class="swal2-input !m-0 !w-full" />
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#007aeb",
      cancelButtonColor: "#6c757d",
      preConfirm: () => {
        const title = document.getElementById("swal-task-title").value.trim();
        const task_date = document.getElementById("swal-task-date").value;
        if (!title) {
          Swal.showValidationMessage("กรุณากรอกชื่องาน");
          return false;
        }
        return { title, task_date: task_date || null };
      },
    });

    if (formValues) {
      try {
        let uid = currentUserId;
        if (!uid) {
          const user = await getCurrentUser();
          uid = user?.id || null;
        }
        if (!uid) {
          const rawUser = localStorage.getItem("userData");
          if (rawUser) {
            uid = JSON.parse(rawUser).id;
          }
        }

        await axios.post(`${API_URL}/auth/personal-tasks`, {
          user_id: uid,
          title: formValues.title,
          status: targetStatus,
          is_completed: targetStatus === "completed" ? 1 : 0,
          task_date: formValues.task_date,
        });

        Swal.fire({
          icon: "success",
          title: "เพิ่มงานสำเร็จ",
          timer: 1500,
          showConfirmButton: false,
        });

        fetchTasks();
      } catch (err) {
        console.error("Error creating personal task:", err);
        const errMsg = err.response?.data?.message || err.message || "ไม่สามารถเพิ่มงานได้";
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: errMsg,
        });
      }
    }
  };

  const handleEditTask = async (task) => {
    const formattedDate = task.task_date
      ? new Date(task.task_date).toISOString().split("T")[0]
      : "";

    const { value: formValues } = await Swal.fire({
      title: `<span class="text-xl font-semibold text-gray-800">แก้ไข Task</span>`,
      html: `
        <div class="flex flex-col gap-3 text-left">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ชื่องาน <span class="text-red-500">*</span></label>
            <input id="swal-edit-title" class="swal2-input !m-0 !w-full" value="${task.title.replace(/"/g, "&quot;")}" placeholder="กรอกชื่องานของคุณ..." />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">วันที่กำหนด (ถ้ามี)</label>
            <input id="swal-edit-date" type="date" class="swal2-input !m-0 !w-full" value="${formattedDate}" />
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "บันทึกการแก้ไข",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#007aeb",
      cancelButtonColor: "#6c757d",
      preConfirm: () => {
        const title = document.getElementById("swal-edit-title").value.trim();
        const task_date = document.getElementById("swal-edit-date").value;
        if (!title) {
          Swal.showValidationMessage("กรุณากรอกชื่องาน");
          return false;
        }
        return { title, task_date: task_date || null };
      },
    });

    if (formValues) {
      try {
        await axios.put(`${API_URL}/auth/personal-tasks/${task.dbId}`, {
          title: formValues.title,
          task_date: formValues.task_date,
        });

        Swal.fire({
          icon: "success",
          title: "แก้ไขงานสำเร็จ",
          timer: 1500,
          showConfirmButton: false,
        });

        fetchTasks();
      } catch (err) {
        console.error("Error updating personal task:", err);
        const errMsg = err.response?.data?.message || err.message || "ไม่สามารถแก้ไขงานได้";
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: errMsg,
        });
      }
    }
  };

  const handleDeleteTask = async (task) => {
    const result = await Swal.fire({
      title: "ยืนยันการลบ?",
      text: `คุณต้องการลบงาน "${task.title}" หรือไม่?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(
          `${API_URL}/auth/personal-tasks/${task.dbId}`
        );
        Swal.fire({
          icon: "success",
          title: "ลบงานสำเร็จ",
          timer: 1200,
          showConfirmButton: false,
        });
        fetchTasks();
      } catch (err) {
        console.error("Error deleting task:", err);
        Swal.fire("Error", "ไม่สามารถลบงานได้", "error");
      }
    }
  };

  return {
    data,
    loading,
    fetchTasks,
    handleDragEnd,
    handleAddTask,
    handleEditTask,
    handleDeleteTask,
  };
};
