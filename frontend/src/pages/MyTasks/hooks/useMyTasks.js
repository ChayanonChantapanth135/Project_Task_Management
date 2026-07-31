import { useState, useEffect } from "react";
import axios from "axios";
import { getCurrentUser } from "../../../lib/auth";
import { useLanguage } from "../../../lib/LanguageContext";

export const useMyTasks = () => {
  const { language } = useLanguage();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myTasks, setMyTasks] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal State
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [tempStatus, setTempStatus] = useState("Pending");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      if (!user) return;
      setCurrentUser(user);

      const projectRes = await axios.get("/auth/projects");
      const userRes = await axios.get("/auth/users");
      
      setAllProjects(projectRes.data.map(p => ({ id: p.id, name: p.name })));
      setAllUsers(userRes.data);

      const allUserTasks = [];
      projectRes.data.forEach((project) => {
        if (project.tasks && Array.isArray(project.tasks)) {
          project.tasks.forEach((task) => {
            if (task.assigned_to === user.id || task.assigned_to_name === user.fullname) {
              let normalizedStatus = "Pending";
              if (task.status) {
                const s = task.status.toLowerCase();
                if (s === "pending") normalizedStatus = "Pending";
                else if (s === "in progress" || s === "in_progress") normalizedStatus = "In Progress";
                else if (s === "reviewing" || s === "review") normalizedStatus = "Reviewing";
                else if (s === "completed") normalizedStatus = "Completed";
              }

              let normalizedPriority = "Medium";
              if (task.priority) {
                const p = task.priority.toLowerCase();
                if (p === "high") normalizedPriority = "High";
                else if (p === "medium") normalizedPriority = "Medium";
                else if (p === "low") normalizedPriority = "Low";
              }

              let formattedDueDate = "-";
              if (task.due_date) {
                try {
                  formattedDueDate = new Date(task.due_date).toISOString().split("T")[0];
                } catch (e) {
                  formattedDueDate = task.due_date;
                }
              }

              allUserTasks.push({
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
            }
          });
        }
      });

      setMyTasks(allUserTasks);
    } catch (err) {
      console.error("Error loading tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateTask = async (updatedDetails) => {
    if (!selectedTask) return;
    try {
      await axios.put(`/auth/tasks/${selectedTask.id}`, {
        ...updatedDetails,
        userId: currentUser?.id,
      });

      setSuccessMessage(language === "th" ? "อัปเดตข้อมูลงานสำเร็จ" : "Task updated successfully");
      setTimeout(() => setSuccessMessage(""), 4000);
      setShowViewModal(false);
      await loadData();
    } catch (err) {
      console.error("Failed to update task:", err);
      setErrorMessage(language === "th" ? "ไม่สามารถอัปเดตข้อมูลงานได้" : "Failed to update task");
      setTimeout(() => setErrorMessage(""), 4000);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`/auth/tasks/${taskId}?userId=${currentUser?.id}`);
      setSuccessMessage(language === "th" ? "ลบงานสำเร็จ" : "Task deleted successfully");
      setTimeout(() => setSuccessMessage(""), 4000);
      setShowViewModal(false);
      await loadData();
    } catch (err) {
      console.error("Failed to delete task:", err);
      setErrorMessage(language === "th" ? "ไม่สามารถลบงานได้" : "Failed to delete task");
      setTimeout(() => setErrorMessage(""), 4000);
    }
  };

  const handleManageClick = (task) => {
    setSelectedTask(task);
    setTempStatus(task.status);
    setShowViewModal(true);
  };

  const filteredTasks = myTasks.filter((task) => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.project.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const tasksByProject = filteredTasks.reduce((acc, task) => {
    if (!acc[task.project]) {
      acc[task.project] = {
        name: task.project,
        projectId: task.projectId,
        tasks: []
      };
    }
    acc[task.project].tasks.push(task);
    return acc;
  }, {});

  const projectGroups = Object.values(tasksByProject);

  const stats = {
    total: myTasks.length,
    pending: myTasks.filter(t => t.status === "Pending").length,
    inProgress: myTasks.filter(t => t.status === "In Progress").length,
    reviewing: myTasks.filter(t => t.status === "Reviewing").length,
    completed: myTasks.filter(t => t.status === "Completed").length,
  };

  return {
    currentUser,
    loading,
    myTasks,
    allProjects,
    allUsers,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    showViewModal,
    setShowViewModal,
    selectedTask,
    tempStatus,
    setTempStatus,
    successMessage,
    errorMessage,
    loadData,
    handleUpdateTask,
    handleDeleteTask,
    handleManageClick,
    projectGroups,
    stats,
    filteredTasks
  };
};
