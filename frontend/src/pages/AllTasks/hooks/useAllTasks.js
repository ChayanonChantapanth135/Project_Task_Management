import { useState, useEffect } from "react";
import axios from "axios";
import { useLanguage } from "../../../lib/LanguageContext";

export const useAllTasks = () => {
  const { language } = useLanguage();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allProjectsList, setAllProjectsList] = useState([]);
  const [allUsersList, setAllUsersList] = useState([]);

  // ดึงข้อมูลงานและข้อมูลเสริมจากฐานข้อมูล
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/auth/projects");
      const allTasks = [];
      response.data.forEach((project) => {
        if (project.tasks && Array.isArray(project.tasks)) {
          project.tasks.forEach((task) => {
            let formattedDueDate = "-";
            if (task.due_date) {
              try {
                formattedDueDate = new Date(task.due_date).toISOString().split("T")[0];
              } catch (e) {
                formattedDueDate = task.due_date;
              }
            }
            // ปรับรูปแบบตัวอักษรของระดับความสำคัญและสถานะให้ตรงกับที่ UI ใช้กรอง
            let normalizedPriority = "Medium";
            if (task.priority) {
              const p = task.priority.toLowerCase();
              if (p === "high") normalizedPriority = "High";
              else if (p === "medium") normalizedPriority = "Medium";
              else if (p === "low") normalizedPriority = "Low";
            }

            let normalizedStatus = "Pending";
            if (task.status) {
              const s = task.status.toLowerCase();
              if (s === "pending") normalizedStatus = "Pending";
              else if (s === "in progress" || s === "in_progress") normalizedStatus = "In Progress";
              else if (s === "reviewing" || s === "review") normalizedStatus = "Reviewing";
              else if (s === "completed") normalizedStatus = "Completed";
            }

            allTasks.push({
              id: task.id,
              title: task.title,
              project: project.name,
              projectId: project.id,
              assignee: task.assigned_to_name || "Unassigned",
              assignedTo: task.assigned_to || "",
              status: normalizedStatus,
              priority: normalizedPriority,
              dueDate: formattedDueDate,
              description: task.description || "",
              taskType: task.task_type || "",
            });
          });
        }
      });
      setTasks(allTasks);
      setAllProjectsList(response.data.map(p => ({ id: p.id, name: p.name })));
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/auth/users");
      setAllUsersList(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  // ตัวกรองและคำค้นหา
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // กรองงานตามเงื่อนไข
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignee.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "All" || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // คำนวณข้อมูลสำหรับ Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTasks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);

  // สถิติสรุปภาพรวมงาน
  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "Pending").length,
    inProgress: tasks.filter((t) => t.status === "In Progress").length,
    reviewing: tasks.filter((t) => t.status === "Reviewing").length,
    completed: tasks.filter((t) => t.status === "Completed").length,
  };

  // Manage Task Modal States
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [tempStatus, setTempStatus] = useState("Pending");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  // ดึงข้อมูลผู้ใช้ปัจจุบัน
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { getCurrentUser } = await import("../../../lib/auth");
        const user = await getCurrentUser();
        if (user) {
          setCurrentUser(user);
        }
      } catch (err) {
        console.error("Error loading user profile:", err);
      }
    };
    fetchUser();
  }, []);

  const [taskHistory, setTaskHistory] = useState({
    lastEditedBy: "ไม่มีข้อมูล / No data",
    lastEditedAt: null,
    assigneeChangesCount: 0,
    historyLogs: [],
  });

  const fetchTaskHistory = async (taskId) => {
    try {
      const response = await axios.get(`/auth/tasks/${taskId}/history`);
      setTaskHistory(response.data);
    } catch (err) {
      console.error("Error fetching task history:", err);
    }
  };

  const handleManageClick = (task) => {
    setSelectedTask(task);
    setTempStatus(task.status);
    fetchTaskHistory(task.id);
    setShowViewModal(true);
  };

  const handleUpdateTask = async (updatedDetails) => {
    if (!selectedTask) return;
    try {
      await axios.put(`/auth/tasks/${selectedTask.id}`, {
        ...updatedDetails,
        userId: currentUser?.id,
      });

      await fetchTasks();

      setSuccessMessage(language === "th" ? "อัปเดตข้อมูลงานสำเร็จ" : "Task updated successfully");
      setTimeout(() => setSuccessMessage(""), 5000);
      setShowViewModal(false);
    } catch (err) {
      console.error("Failed to update task:", err);
      setErrorMessage(language === "th" ? "ไม่สามารถอัปเดตข้อมูลงานได้" : "Failed to update task");
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`/auth/tasks/${taskId}?userId=${currentUser?.id}`);

      await fetchTasks();

      setSuccessMessage(language === "th" ? "ลบงานสำเร็จ" : "Task deleted successfully");
      setTimeout(() => setSuccessMessage(""), 5000);
      setShowViewModal(false);
    } catch (err) {
      console.error("Failed to delete task:", err);
      setErrorMessage(language === "th" ? "ไม่สามารถลบงานได้" : "Failed to delete task");
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  return {
    tasks,
    setTasks,
    loading,
    fetchTasks,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    currentItems,
    totalPages,
    stats,
    showViewModal,
    setShowViewModal,
    selectedTask,
    tempStatus,
    setTempStatus,
    successMessage,
    setSuccessMessage,
    errorMessage,
    setErrorMessage,
    handleManageClick,
    handleUpdateTask,
    handleDeleteTask,
    allProjectsList,
    allUsersList,
    currentUser,
    taskHistory,
    fetchTaskHistory,
    totalItems: filteredTasks.length,
  };
};
