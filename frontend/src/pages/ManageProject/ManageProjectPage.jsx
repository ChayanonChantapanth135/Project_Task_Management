import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/footer";
import { useLanguage } from "../../lib/LanguageContext";
import { getCurrentUser } from "../../lib/auth";
import { Modal } from "react-bootstrap";
import axios from "axios";
import ConfirmModal from "../../components/ConfirmModal";
import ProjectCard from "./components/ProjectCard";
import ProjectFilter from "./components/ProjectFilter";
import ProjectTable from "./components/ProjectTable";

/**
 * คอมโพเนนต์หน้าจัดการโครงการ (ManageProjectPage Component)
 * - แสดงรายการโครงการทั้งหมดในระบบผ่านตาราง (Table View) หรือการ์ดความคืบหน้า (Board View)
 * - รองรับการกรอง ค้นหาโครงการ และเรียงตามลำดับความสำคัญ (Priority)
 * - จัดการแบบฟอร์มบันทึกข้อมูลโครงการใหม่ แก้ไข และยิง API ดึงข้อมูลจริงจากฐานข้อมูล
 */
const ManageProjectPage = () => {
  const { t } = useLanguage();
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
          p.endDate = new Date(p.end_date).toISOString().split("T")[0];
        }
        if (p.tasks) {
          p.tasks = p.tasks.map((t) => {
            if (t.due_date) {
              t.dueDate = new Date(t.due_date).toISOString().split("T")[0];
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

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <main className="container my-4" style={{ maxWidth: "1200px" }}>
        {/* Header and Title */}
        <div className="mb-4 d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-bold text-dark d-flex align-items-center gap-2 mb-0">
              <span>📂</span> {t("projectManagementTitle")}
            </h2>
          </div>

          {/* Flowchart Debug Role Switcher
          <div className="d-flex align-items-center gap-2 border bg-white p-2 rounded-lg shadow-xs">
            <span className="text-xs text-muted fw-semibold">🔑 Flow Tester:</span>
            <select
              className="form-select form-select-sm text-xs rounded-md"
              style={{ width: "130px" }}
              value={roleSimulation}
              onChange={(e) => setRoleSimulation(e.target.value)}
            >
              <option value="admin">Admin (All Flow)</option>
              <option value="manager">Manager (Creator Flow)</option>
              <option value="team_leader">Lead (Assigned Flow)</option>
            </select>
          </div> */}
        </div>

        {/* Global Toast Alerts */}
        {successMessage && (
          <div className="alert alert-success border-0 shadow-sm rounded-lg py-2.5 px-4 mb-4 d-flex align-items-center gap-2">
            <span>✅</span>
            <span
              className="fw-medium text-success"
              style={{ fontSize: "0.9rem" }}
            >
              {successMessage}
            </span>
          </div>
        )}

        {errorMessage && (
          <div className="alert alert-danger border-0 shadow-sm rounded-lg py-2.5 px-4 mb-4 d-flex align-items-center gap-2">
            <span>⚠️</span>
            <span
              className="fw-medium text-danger"
              style={{ fontSize: "0.9rem" }}
            >
              {errorMessage}
            </span>
          </div>
        )}

        {/* Filter panel */}
        <ProjectFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewMode={viewMode}
          setViewMode={setViewMode}
          handleOpenCreate={() => setShowCreateModal(true)}
          t={t}
        />

        {viewMode === "table" ? (
          <ProjectTable
            filteredProjects={filteredProjects}
            t={t}
            sortByPriority={sortByPriority}
            setSortByPriority={setSortByPriority}
            handleViewDetails={handleViewDetails}
            handleOpenEdit={handleOpenEdit}
            handleOpenDelete={handleOpenDelete}
          />
        ) : (
          /* Grid Card View (Board View by Project) */
          <div className="row g-4 mb-4">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <div key={project.id} className="col-12 col-md-6 col-lg-4">
                  <ProjectCard
                    project={project}
                    t={t}
                    handleViewDetails={handleViewDetails}
                    handleOpenEdit={handleOpenEdit}
                    handleOpenDelete={handleOpenDelete}
                  />
                </div>
              ))
            ) : (
              <div className="col-12">
                <div className="card shadow-sm border-0 rounded-lg text-center py-5 bg-white">
                  <div className="fs-1 mb-2">📂</div>
                  <p className="mb-0 text-muted fw-medium">
                    {t("noProjectsFound")}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* CREATE MODAL */}
      <Modal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        centered
      >
        <Modal.Body className="p-4" style={{ borderRadius: "1rem" }}>
          <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
            <h5 className="fw-bold mb-0">🆕 {t("createProjectTitle")}</h5>
            <button
              className="btn-close"
              onClick={() => setShowCreateModal(false)}
            ></button>
          </div>
          <form onSubmit={handleCreateSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-bold">
                {t("modalProjectTitle")} *
              </label>
              <input
                type="text"
                className="form-control rounded-lg"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-bold">
                {t("modalProjectPriority")}
              </label>
              <select
                className="form-select rounded-lg"
                value={formData.priority}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, priority: e.target.value }))
                }
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label small fw-bold">
                {t("modalProjectEndDate")} *
              </label>
              <input
                type="date"
                className="form-control rounded-lg"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, endDate: e.target.value }))
                }
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-bold">
                {t("modalProjectTeamLeader")} *
              </label>
              <select
                className="form-select rounded-lg"
                value={formData.teamLeaderId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    teamLeaderId: e.target.value,
                  }))
                }
                required
              >
                <option value="">-- {t("modalProjectTeamLeader")} --</option>
                {teamLeaders.map((leader) => (
                  <option key={leader.id} value={leader.id}>
                    {leader.username}
                  </option>
                ))}
              </select>
            </div>
            <div className="d-flex justify-content-end gap-2 pt-3 border-top mt-4">
              <button
                type="button"
                className="btn btn-secondary px-4 py-2 rounded-lg"
                onClick={() => setShowCreateModal(false)}
              >
                {t("cancelBtn")}
              </button>
              <button
                type="submit"
                className="btn btn-primary px-4 py-2 rounded-lg"
              >
                🚀 {t("createProjectBtnSubmit")}
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
      >
        <Modal.Body className="p-4" style={{ borderRadius: "1rem" }}>
          <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
            <h5 className="fw-bold mb-0">✏️ {t("editProjectTitle")}</h5>
            <button
              className="btn-close"
              onClick={() => setShowEditModal(false)}
            ></button>
          </div>
          <form onSubmit={handleEditSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-bold">
                {t("modalProjectTitle")} *
              </label>
              <input
                type="text"
                className="form-control rounded-lg"
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-bold">
                {t("modalProjectStatus")}
              </label>
              <select
                className="form-select rounded-lg"
                value={editFormData.status}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
              >
                <option value="pending">{t("pending")}</option>
                <option value="in_progress">{t("inProgress")}</option>
                <option value="review">{t("reviewing")}</option>
                <option value="completed">{t("completed")}</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label small fw-bold">
                {t("modalProjectPriority")}
              </label>
              <select
                className="form-select rounded-lg"
                value={editFormData.priority}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    priority: e.target.value,
                  }))
                }
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label small fw-bold">
                {t("modalProjectEndDate")} *
              </label>
              <input
                type="date"
                className="form-control rounded-lg"
                value={editFormData.endDate}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-bold">
                {t("modalProjectTeamLeader")} *
              </label>
              <select
                className="form-select rounded-lg"
                value={editFormData.teamLeaderId}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    teamLeaderId: e.target.value,
                  }))
                }
                required
              >
                <option value="">-- {t("modalProjectTeamLeader")} --</option>
                {teamLeaders.map((leader) => (
                  <option key={leader.id} value={leader.id}>
                    {leader.username}
                  </option>
                ))}
              </select>
            </div>
            <div className="d-flex justify-content-end gap-2 pt-3 border-top mt-4">
              <button
                type="button"
                className="btn btn-secondary px-4 py-2 rounded-lg"
                onClick={() => setShowEditModal(false)}
              >
                {t("cancelBtn")}
              </button>
              <button
                type="submit"
                className="btn btn-primary px-4 py-2 rounded-lg"
              >
                💾 {t("modalSaveProject")}
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* DETAIL MODAL */}
      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        size="lg"
        centered
      >
        <Modal.Body className="p-4" style={{ borderRadius: "1rem" }}>
          {selectedProject && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                <h5 className="fw-bold mb-0">🔍 {t("projectDetailsTitle")}</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowDetailModal(false)}
                ></button>
              </div>

              <div className="row g-4 mb-4">
                <div className="col-12 col-md-6">
                  <div className="mb-3">
                    <span className="text-muted small d-block">
                      {t("projectDetailsName")}
                    </span>
                    <strong className="fs-5 text-dark">
                      {selectedProject.name}
                    </strong>
                  </div>
                  <div className="mb-3">
                    <span className="text-muted small d-block">
                      {t("colPriority")}
                    </span>
                    <span
                      className={`badge ${selectedProject.priority === "High" ? "bg-danger" : "bg-warning text-dark"}`}
                    >
                      {selectedProject.priority}
                    </span>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="mb-3">
                    <span className="text-muted small d-block">
                      {t("projectDetailsDueDate")}
                    </span>
                    <strong className="text-dark">
                      📅 {selectedProject.endDate}
                    </strong>
                  </div>
                  <div className="mb-3">
                    <span className="text-muted small d-block">
                      {t("projectDetailsLeader")}
                    </span>
                    <span className="text-primary fw-bold">
                      👤 {selectedProject.teamLeaderName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Detail */}
              <div className="mb-4 p-3 bg-light rounded-lg">
                <div className="d-flex justify-content-between mb-2">
                  <span className="fw-bold small text-muted">
                    {t("projectDetailsProgress")}
                  </span>
                  <span className="fw-bold text-primary">
                    {selectedProject.progress}%
                  </span>
                </div>
                <div className="progress" style={{ height: "10px" }}>
                  <div
                    className="progress-bar bg-primary progress-bar-striped progress-bar-animated"
                    style={{ width: `${selectedProject.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Tasks List */}
              <div className="mb-4">
                <h6 className="fw-bold text-dark mb-3">
                  📝 {t("projectDetailsTaskList")}
                </h6>
                <div className="list-group rounded-lg shadow-xs">
                  {selectedProject.tasks && selectedProject.tasks.length > 0 ? (
                    selectedProject.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="list-group-item d-flex align-items-center justify-content-between py-3"
                      >
                         {/* Left: Task Title */}
                        <div
                          className="d-flex flex-column justify-content-center"
                          style={{ flex: 1, minWidth: "150px" }}
                        >
                          <span className="text-dark fw-medium">
                            {task.title}
                          </span>
                        </div>

                        {/* Middle: Assignee & Due Date */}
                        <div
                          className="d-flex flex-column gap-1 text-muted small"
                          style={{
                            flex: 1,
                            minWidth: "180px",
                            paddingLeft: "15px",
                          }}
                        >
                          <span className="d-block">
                            👤 {task.assigned_to_name || t("unassigned")}
                          </span>
                          {task.dueDate && (
                            <span className="d-block">📅 {task.dueDate}</span>
                          )}
                        </div>

                        {/* Middle-Right: Status Badge */}
                        <div className="ms-3" style={{ minWidth: "110px" }}>
                          <span
                            className={`badge text-xs ${
                              task.status === "Completed"
                                ? "bg-success"
                                : task.status === "Reviewing"
                                ? "bg-warning text-dark"
                                : task.status === "In Progress"
                                ? "bg-info text-dark"
                                : "bg-secondary"
                            }`}
                          >
                            {task.status || "Pending"}
                          </span>
                        </div>

                        {/* Right: View Task Detail Button */}
                        <div className="ms-3">
                          <button
                            className="btn btn-sm btn-primary rounded-lg text-xs"
                            onClick={() => {
                              setSelectedTask(task);
                              setTempStatus(task.status || "Pending");
                              setShowViewTaskModal(true);
                            }}
                          >
                            {t("viewTaskDetail")}
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="list-group-item text-center py-3 text-muted text-xs">
                      {t("projectDetailsNoTasks")}
                    </div>
                  )}
                </div>
              </div>

              <div className="d-flex gap-2 justify-content-end border-top pt-3">
                <button
                  type="button"
                  className="btn btn-primary px-4 py-2 rounded-lg"
                  onClick={() => {
                    setShowDetailModal(false);
                    setShowAddTaskModal(true);
                  }}
                >
                  + {t("Add Task")}
                </button>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* DELETE CONFIRM MODAL */}
      <ConfirmModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        title={t("deleteProjectConfirmTitle")}
        description={
          selectedProject && (
            <>
              {t("deleteProjectConfirmDesc1")}
              <strong>"{selectedProject.name}"</strong>
              {t("deleteProjectConfirmDesc2")}
            </>
          )
        }
        onConfirm={handleDeleteConfirm}
        confirmText={t("confirmDeleteBtn")}
        cancelText={t("cancelBtn")}
        type="danger"
      />

      {/* ADD TASK MODAL */}
      <Modal
        show={showAddTaskModal}
        onHide={() => setShowAddTaskModal(false)}
        centered
      >
        <Modal.Body className="p-4" style={{ borderRadius: "1rem" }}>
          <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
            <h5 className="fw-bold mb-0">📝 สร้างงานใหม่ (Add Task)</h5>
            <button
              className="btn-close"
              onClick={() => setShowAddTaskModal(false)}
            ></button>
          </div>
          <form onSubmit={handleAddTaskSubmit}>
            {/* Project Name (Read Only) */}
            <div className="mb-3">
              <label className="form-label small fw-bold">
                โปรเจกต์ (Project)
              </label>
              <input
                type="text"
                className="form-control bg-light rounded-lg text-muted"
                value={selectedProject ? selectedProject.name : ""}
                readOnly
              />
            </div>

            {/* Title / Task Name */}
            <div className="mb-3">
              <label className="form-label small fw-bold">
                ชื่องาน (Task Name) *
              </label>
              <input
                type="text"
                className="form-control rounded-lg"
                placeholder="กรอกชื่อกิจกรรม/งาน"
                value={taskFormData.title}
                onChange={(e) =>
                  setTaskFormData((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                required
              />
            </div>

            {/* Task Type */}
            <div className="mb-3">
              <label className="form-label small fw-bold">
                ประเภทงาน (Task Type)
              </label>
              <select
                className="form-select rounded-lg"
                value={taskFormData.taskType}
                onChange={(e) =>
                  setTaskFormData((prev) => ({
                    ...prev,
                    taskType: e.target.value,
                  }))
                }
              >
                <option value="แปล">แปล (Translate)</option>
                <option value="ตัดต่อ">ตัดต่อ (Video Edit)</option>
                <option value="อื่นๆ">อื่นๆ (Others)</option>
              </select>
            </div>

            {/* Custom Task Type (Shown if อื่นๆ is selected) */}
            {taskFormData.taskType === "อื่นๆ" && (
              <div className="mb-3">
                <label className="form-label small fw-bold">
                  ระบุประเภทงานเพิ่มเติม *
                </label>
                <input
                  type="text"
                  className="form-control rounded-lg"
                  placeholder="ระบุประเภทงานเพิ่มเติมของคุณ"
                  value={taskFormData.customTaskType}
                  onChange={(e) =>
                    setTaskFormData((prev) => ({
                      ...prev,
                      customTaskType: e.target.value,
                    }))
                  }
                  required
                />
              </div>
            )}

            {/* Description */}
            <div className="mb-3">
              <label className="form-label small fw-bold">
                รายละเอียด (Description)
              </label>
              <textarea
                className="form-control rounded-lg"
                rows="3"
                placeholder="กรอกรายละเอียดงาน"
                value={taskFormData.description}
                onChange={(e) =>
                  setTaskFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>

            {/* Priority */}
            <div className="mb-3">
              <label className="form-label small fw-bold">
                ความสำคัญ (Priority)
              </label>
              <select
                className="form-select rounded-lg"
                value={taskFormData.priority}
                onChange={(e) =>
                  setTaskFormData((prev) => ({
                    ...prev,
                    priority: e.target.value,
                  }))
                }
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Due Date */}
            <div className="mb-3">
              <label className="form-label small fw-bold">
                วันส่งงาน (Due Date)
              </label>
              <input
                type="date"
                className="form-control rounded-lg"
                value={taskFormData.dueDate}
                onChange={(e) =>
                  setTaskFormData((prev) => ({
                    ...prev,
                    dueDate: e.target.value,
                  }))
                }
              />
            </div>

            {/* Assignee */}
            <div className="mb-3">
              <label className="form-label small fw-bold">
                ผู้รับผิดชอบ (Assignee) - Optional
              </label>
              <select
                className="form-select rounded-lg"
                value={taskFormData.assignedTo}
                onChange={(e) =>
                  setTaskFormData((prev) => ({
                    ...prev,
                    assignedTo: e.target.value,
                  }))
                }
              >
                <option value="">-- ไม่ระบุผู้รับผิดชอบ --</option>
                <optgroup label="👑 Team Leader">
                  {users
                    .filter((u) => u.role === "team_leader")
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.username}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="🗣️ Translator">
                  {users
                    .filter((u) => u.role === "translator")
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.username}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="🎬 Video Editor">
                  {users
                    .filter((u) => u.role === "video_editor")
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.username}
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>

            <div className="d-flex justify-content-end gap-2 pt-3 border-top mt-4">
              <button
                type="button"
                className="btn btn-secondary px-4 py-2 rounded-lg"
                onClick={() => setShowAddTaskModal(false)}
              >
                ยกเลิก (Cancel)
              </button>
              <button
                type="submit"
                className="btn btn-primary px-4 py-2 rounded-lg"
              >
                + สร้างงาน (Create Task)
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* VIEW TASK DETAIL MODAL */}
      <Modal
        show={showViewTaskModal}
        onHide={() => setShowViewTaskModal(false)}
        centered
      >
        <Modal.Body className="p-4" style={{ borderRadius: "1rem" }}>
          <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
            <h5 className="fw-bold mb-0">🔍 {t("taskDetailsTitle")}</h5>
            <button
              className="btn-close"
              onClick={() => setShowViewTaskModal(false)}
            ></button>
          </div>
          <div>
            {/* Project Name (Read Only) */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">
                {t("taskProjectLabel")}
              </label>
              <input
                type="text"
                className="form-control bg-light rounded-lg text-muted"
                value={selectedProject ? selectedProject.name : ""}
                readOnly
                disabled
              />
            </div>

            {/* Title / Task Name */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">
                {t("taskNameLabel")}
              </label>
              <input
                type="text"
                className="form-control bg-light rounded-lg text-muted"
                value={selectedTask ? selectedTask.title : ""}
                readOnly
                disabled
              />
            </div>

            {/* Task Type */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">
                {t("taskTypeLabel")}
              </label>
              <input
                type="text"
                className="form-control bg-light rounded-lg text-muted"
                value={selectedTask ? selectedTask.task_type || selectedTask.taskType || "" : ""}
                readOnly
                disabled
              />
            </div>

            {/* Description */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">
                {t("taskDescLabel")}
              </label>
              <textarea
                className="form-control bg-light rounded-lg text-muted"
                rows="3"
                value={selectedTask ? selectedTask.description || t("noDescription") : ""}
                readOnly
                disabled
              />
            </div>

            {/* Priority */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">
                {t("taskPriorityLabel")}
              </label>
              <input
                type="text"
                className="form-control bg-light rounded-lg text-muted"
                value={selectedTask ? selectedTask.priority || "" : ""}
                readOnly
                disabled
              />
            </div>

            {/* Due Date */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">
                {t("taskDueDateLabel")}
              </label>
              <input
                type="text"
                className="form-control bg-light rounded-lg text-muted"
                value={selectedTask ? selectedTask.dueDate || selectedTask.due_date || "" : ""}
                readOnly
                disabled
              />
            </div>

            {/* Assignee */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">
                {t("taskAssigneeLabel")}
              </label>
              <input
                type="text"
                className="form-control bg-light rounded-lg text-muted"
                value={selectedTask ? selectedTask.assigned_to_name || t("noAssignee") : ""}
                readOnly
                disabled
              />
            </div>

            {/* Task Status */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">
                {t("taskStatus")}
              </label>
              <select
                className="form-select rounded-lg"
                value={tempStatus}
                onChange={(e) => setTempStatus(e.target.value)}
              >
                <option value="Pending">{t("taskStatusPending")}</option>
                <option value="In Progress">{t("taskStatusInProgress")}</option>
                <option value="Reviewing">{t("taskStatusReviewing")}</option>
                <option value="Completed">{t("taskStatusCompleted")}</option>
              </select>
            </div>

            <div className="d-flex justify-content-end gap-2 pt-3 border-top mt-4">
              <button
                type="button"
                className="btn btn-secondary px-4 py-2 rounded-lg"
                onClick={() => setShowViewTaskModal(false)}
              >
                {t("cancelBtn")}
              </button>
              <button
                type="button"
                className="btn btn-primary px-4 py-2 rounded-lg"
                onClick={async () => {
                  try {
                    await axios.put(`/auth/tasks/${selectedTask.id}/status`, {
                      status: tempStatus,
                      userId: currentUser?.id
                    });
                    
                    // Update task status inside selectedProject locally
                    if (selectedProject && selectedProject.tasks) {
                      const updatedTasks = selectedProject.tasks.map(t =>
                        t.id === selectedTask.id ? { ...t, status: tempStatus } : t
                      );
                      const completed = updatedTasks.filter(t => t.status && t.status.toLowerCase() === 'completed').length;
                      const progress = updatedTasks.length > 0 ? Math.round((completed / updatedTasks.length) * 100) : 0;
                      setSelectedProject(prev => ({ ...prev, tasks: updatedTasks, progress }));
                    }

                    setSuccessMessage("อัปเดตสถานะงานสำเร็จ");
                    setTimeout(() => setSuccessMessage(""), 5000);
                    setShowViewTaskModal(false);
                    fetchProjects();
                  } catch (err) {
                    console.error("Failed to update task status:", err);
                    setErrorMessage("ไม่สามารถอัปเดตสถานะงานได้");
                    setTimeout(() => setErrorMessage(""), 5000);
                  }
                }}
              >
                {t("updateStatusBtn")}
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <Footer />
    </div>
  );
};

export default ManageProjectPage;
