import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { getCurrentUser } from "../../../lib/auth";
import { safeDateString } from "../../../lib/dateUtils";

export const useProjectManagement = (t) => {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState({
    id: 1,
    name: "Admin User",
    role: "admin",
  });
  const [roleSimulation, setRoleSimulation] = useState("admin");

  // Projects list state
  const [projects, setProjects] = useState([]);
  const [viewMode, setViewMode] = useState("table"); // "table" or "board"
  const [sortByPriority, setSortByPriority] = useState("none"); // "none", "desc", "asc"

  // List of Team Leaders from DB
  const [teamLeaders, setTeamLeaders] = useState([]);
  // List of all users from DB
  const [users, setUsers] = useState([]);

  // UI / Navigation States
  const [searchQuery, setSearchQuery] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showViewTaskModal, setShowViewTaskModal] = useState(false);

  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [tempStatus, setTempStatus] = useState("Pending");

  // Form States
  const [formData, setFormData] = useState({
    name: "",
    endDate: "",
    priority: "Medium",
    teamLeaderId: "",
  });

  const [editFormData, setEditFormData] = useState({
    id: null,
    name: "",
    status: "",
    priority: "Medium",
    endDate: "",
    teamLeaderId: "",
  });

  const [taskFormData, setTaskFormData] = useState({
    title: "",
    taskType: "แปล",
    customTaskType: "",
    description: "",
    priority: "Medium",
    dueDate: "",
    assignedTo: "",
  });

  // Load current user profile
  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      if (user) {
        setCurrentUser(user);
        setRoleSimulation(user.role);
      }
    };
    fetchUser();
  }, []);

  // Keep selectedProject in sync with updated projects list
  useEffect(() => {
    if (selectedProject && projects.length > 0) {
      const updatedProj = projects.find((p) => p.id === selectedProject.id);
      if (updatedProj) {
        setSelectedProject(updatedProj);
      }
    }
  }, [projects]);

  // Fetch projects and team leaders from DB
  const fetchProjects = async () => {
    try {
      const response = await axios.get("/auth/projects");
      const formatted = response.data.map((p) => {
        if (p.end_date) {
          p.endDate = safeDateString(p.end_date);
        }
        if (p.tasks) {
          p.tasks = p.tasks.map((t) => {
            if (t.due_date) {
              t.dueDate = safeDateString(t.due_date);
            }
            return t;
          });
        }
        return p;
      });
      setProjects(formatted);
    } catch (err) {
      console.error("Failed to fetch projects from DB", err);
    }
  };

  const fetchTeamLeaders = async () => {
    try {
      const response = await axios.get("/auth/team-leaders");
      setTeamLeaders(response.data);
    } catch (err) {
      console.error("Failed to fetch team leaders from DB", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/auth/users");
      setUsers(response.data);
    } catch (err) {
      console.error("Failed to fetch users from DB", err);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchTeamLeaders();
    fetchUsers();
  }, []);

  // Auto-open Project Detail modal if projectId, openProject, or openProjectName is present in URL search params
  useEffect(() => {
    const checkAndOpenProject = async () => {
      const params = new URLSearchParams(location.search);
      const targetProjectId = params.get("projectId") || params.get("openProject");
      const targetProjectName = params.get("openProjectName");

      if (targetProjectId || targetProjectName) {
        if (projects.length > 0) {
          const found = projects.find((p) => {
            if (targetProjectId && Number(p.id) === Number(targetProjectId)) return true;
            if (targetProjectName && (p.name || "").trim().toLowerCase() === targetProjectName.trim().toLowerCase()) return true;
            return false;
          });
          if (found) {
            setSelectedProject(found);
            setShowDetailModal(true);
            return;
          }
        }
        // Fallback: If not found in current state or projects still loading, fetch directly
        try {
          const res = await axios.get("/auth/projects");
          const found = res.data.find((p) => {
            if (targetProjectId && Number(p.id) === Number(targetProjectId)) return true;
            if (targetProjectName && (p.name || "").trim().toLowerCase() === targetProjectName.trim().toLowerCase()) return true;
            return false;
          });
          if (found) {
            if (found.end_date) found.endDate = safeDateString(found.end_date);
            if (found.tasks) {
              found.tasks = found.tasks.map((t) => {
                if (t.due_date) t.dueDate = safeDateString(t.due_date);
                return t;
              });
            }
            setSelectedProject(found);
            setShowDetailModal(true);
          }
        } catch (err) {
          console.error("Error auto-opening project:", err);
        }
      }
    };
    checkAndOpenProject();
  }, [projects, location.search]);

  const filteredProjects = projects.filter((p) => {
    const role = (currentUser?.role || roleSimulation || "").toLowerCase().trim().replace(/\s+/g, "_");
    const userId = Number(currentUser?.id);

    if (role === "admin") {
      // Admin sees everything
    } else if (role === "manager" || role === "project_manager") {
      // Manager sees projects created by them or where they are designated manager/leader
      const isCreator = Number(p.created_by) === userId;
      const isLeader = Number(p.teamLeaderId) === userId || Number(p.team_leader_id) === userId;
      if (!isCreator && !isLeader) return false;
    } else {
      // Staff roles (storyboard, animation, designer, programmer, team_leader, etc.)
      // Can only see projects that are relevant to them (they have a task assigned or are assigned to the project)
      const isLeader = Number(p.teamLeaderId) === userId || Number(p.team_leader_id) === userId;
      const isCreator = Number(p.created_by) === userId;
      const hasAssignedTask = p.tasks && Array.isArray(p.tasks) && p.tasks.some(
        (t) => Number(t.assigned_to) === userId || Number(t.assignedTo) === userId
      );
      if (!isLeader && !isCreator && !hasAssignedTask) {
        return false;
      }
    }

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = (p.name || "").toLowerCase().includes(q);
      const matchId = String(p.id || "").includes(q.replace("#", ""));
      const matchLeader = (p.teamLeaderName || p.teamLeader || "").toLowerCase().includes(q);
      const matchManager = (p.projectManagerName || "").toLowerCase().includes(q);
      const matchStatus = (p.status || "").toLowerCase().includes(q);
      const matchTask =
        p.tasks &&
        Array.isArray(p.tasks) &&
        p.tasks.some((t) => (t.title || "").toLowerCase().includes(q));

      return matchName || matchId || matchLeader || matchManager || matchStatus || matchTask;
    }
    return true;
  });

  const priorityWeight = { High: 3, Medium: 2, Low: 1 };

  filteredProjects.sort((a, b) => {
    // 1. Incomplete projects first, Completed projects last
    const aCompleted = (a.status || "").toLowerCase() === "completed" ? 1 : 0;
    const bCompleted = (b.status || "").toLowerCase() === "completed" ? 1 : 0;

    if (aCompleted !== bCompleted) {
      return aCompleted - bCompleted;
    }

    // 2. Sort by priority
    const weightA = priorityWeight[a.priority] || (a.priority === "Low" ? 1 : a.priority === "High" ? 3 : 2);
    const weightB = priorityWeight[b.priority] || (b.priority === "Low" ? 1 : b.priority === "High" ? 3 : 2);

    if (sortByPriority === "asc") {
      return weightA - weightB;
    }
    // Default or "desc" is High -> Medium -> Low
    return weightB - weightA;
  });

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.name || !formData.endDate || !formData.teamLeaderId) {
      setErrorMessage(t("fillRequiredFieldsProject"));
      return;
    }

    try {
      await axios.post("/auth/projects", {
        name: formData.name,
        endDate: formData.endDate,
        priority: formData.priority,
        teamLeaderId: Number(formData.teamLeaderId),
        createdBy: currentUser?.id || 1,
      });

      setShowCreateModal(false);
      setFormData({
        name: "",
        endDate: "",
        priority: "Medium",
        teamLeaderId: "",
      });

      setSuccessMessage(t("projectCreatedSuccess"));
      setTimeout(() => setSuccessMessage(""), 5000);
      fetchProjects();
    } catch (err) {
      console.error("Create project failed", err);
      setErrorMessage(t("projectCreateFailed"));
    }
  };

  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setShowDetailModal(true);
  };

  const handleOpenEdit = (project) => {
    setSelectedProject(project);
    setEditFormData({
      id: project.id,
      name: project.name,
      status: project.status,
      priority: project.priority,
      endDate: project.endDate,
      teamLeaderId: project.teamLeaderId || "",
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (
      !editFormData.name ||
      !editFormData.endDate ||
      !editFormData.teamLeaderId
    ) {
      setErrorMessage(t("fillRequiredFieldsProject"));
      return;
    }

    try {
      await axios.put(`/auth/projects/${editFormData.id}`, {
        name: editFormData.name,
        status: editFormData.status,
        priority: editFormData.priority,
        endDate: editFormData.endDate,
        teamLeaderId: Number(editFormData.teamLeaderId),
        userId: currentUser?.id || 1,
      });

      setShowEditModal(false);
      setSuccessMessage(t("projectUpdatedSuccess"));
      setTimeout(() => setSuccessMessage(""), 5000);
      fetchProjects();
    } catch (err) {
      console.error("Edit project failed", err);
      setErrorMessage(t("projectUpdateFailed"));
    }
  };

  const handleOpenDelete = (project) => {
    setSelectedProject(project);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (roleSimulation !== "admin") {
      setErrorMessage(t("noPermissionDeleteProject"));
      setShowDeleteModal(false);
      return;
    }

    try {
      await axios.delete(`/auth/projects/${selectedProject.id}`, {
        params: { userId: currentUser?.id || 1 },
      });

      setShowDeleteModal(false);
      setSuccessMessage(t("projectDeletedSuccess"));
      setTimeout(() => setSuccessMessage(""), 5000);
      fetchProjects();
    } catch (err) {
      console.error("Delete project failed", err);
      setErrorMessage(t("projectDeleteFailed"));
    }
  };

  const handleAddTaskSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!taskFormData.title) {
      setErrorMessage("สร้างไม่สำเร็จ: กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      return;
    }

    try {
      const typeValue =
        taskFormData.taskType === "อื่นๆ"
          ? taskFormData.customTaskType
          : taskFormData.taskType;

      const payload = {
        projectId: selectedProject.id,
        title: taskFormData.title,
        description: taskFormData.description,
        taskType: typeValue,
        priority: taskFormData.priority,
        dueDate: taskFormData.dueDate || null,
        assignedTo: taskFormData.assignedTo || null,
        createdBy: currentUser?.id || 1,
      };

      await axios.post("/auth/tasks", payload);

      setSuccessMessage("Create Success");
      setTimeout(() => setSuccessMessage(""), 5000);

      // Reset Form
      setTaskFormData({
        title: "",
        taskType: "แปล",
        customTaskType: "",
        description: "",
        priority: "Medium",
        dueDate: "",
        assignedTo: "",
      });

      setShowAddTaskModal(false);
      fetchProjects();
    } catch (err) {
      console.error("Failed to create task:", err);
      setErrorMessage(
        err.response?.data?.message || "สร้างไม่สำเร็จ: เกิดข้อผิดพลาดของระบบ",
      );
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  return {
    currentUser,
    setCurrentUser,
    roleSimulation,
    setRoleSimulation,
    projects,
    setProjects,
    viewMode,
    setViewMode,
    sortByPriority,
    setSortByPriority,
    teamLeaders,
    users,
    searchQuery,
    setSearchQuery,
    successMessage,
    setSuccessMessage,
    errorMessage,
    setErrorMessage,
    showCreateModal,
    setShowCreateModal,
    showEditModal,
    setShowEditModal,
    showDetailModal,
    setShowDetailModal,
    showDeleteModal,
    setShowDeleteModal,
    showAddTaskModal,
    setShowAddTaskModal,
    showViewTaskModal,
    setShowViewTaskModal,
    selectedProject,
    setSelectedProject,
    selectedTask,
    setSelectedTask,
    tempStatus,
    setTempStatus,
    formData,
    setFormData,
    editFormData,
    setEditFormData,
    taskFormData,
    setTaskFormData,
    filteredProjects,
    fetchProjects,
    fetchTeamLeaders,
    fetchUsers,
    handleCreateSubmit,
    handleViewDetails,
    handleOpenEdit,
    handleEditSubmit,
    handleOpenDelete,
    handleDeleteConfirm,
    handleAddTaskSubmit,
  };
};
