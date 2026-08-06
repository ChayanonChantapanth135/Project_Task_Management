import { useState, useEffect } from "react";
import axios from "axios";
import { getCurrentUser } from "../../../lib/auth";
import { safeDateString } from "../../../lib/dateUtils";

export const useProjectManagement = (t) => {
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

  const filteredProjects = projects.filter((p) => {
    if (roleSimulation === "manager") {
      if (p.created_by !== currentUser.id) return false;
    } else if (roleSimulation === "team_leader") {
      if (p.teamLeaderId !== currentUser.id && p.created_by !== currentUser.id)
        return false;
    }
    if (searchQuery) {
      return p.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  if (sortByPriority !== "none") {
    const priorityWeight = { High: 3, Medium: 2, Low: 1 };
    filteredProjects.sort((a, b) => {
      const weightA = priorityWeight[a.priority] || 0;
      const weightB = priorityWeight[b.priority] || 0;
      return sortByPriority === "desc" ? weightB - weightA : weightA - weightB;
    });
  }

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
