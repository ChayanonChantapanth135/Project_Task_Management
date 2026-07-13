import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/footer";
import { useLanguage } from "../lib/LanguageContext";
import { getCurrentUser } from "../lib/auth";
import { Modal } from "react-bootstrap";
import axios from "axios";

const Projects = () => {
  const { t } = useLanguage();
  const [currentUser, setCurrentUser] = useState({
    id: 1,
    name: "Admin User",
    role: "admin",
  });
  const [roleSimulation, setRoleSimulation] = useState("admin"); // To easily test all flowchart flows: admin, manager, team_leader

  // Projects list state
  const [projects, setProjects] = useState([]);

  // List of Team Leaders from DB
  const [teamLeaders, setTeamLeaders] = useState([]);

  // UI / Navigation States
  const [searchQuery, setSearchQuery] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedProject, setSelectedProject] = useState(null);

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

  // Fetch projects and team leaders from DB
  const fetchProjects = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:3000/auth/projects");
      // Format project end dates for HTML5 input compatibility
      const formatted = response.data.map((p) => {
        if (p.end_date) {
          p.endDate = new Date(p.end_date).toISOString().split("T")[0];
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
      const response = await axios.get(
        "http://127.0.0.1:3000/auth/team-leaders",
      );
      setTeamLeaders(response.data);
    } catch (err) {
      console.error("Failed to fetch team leaders from DB", err);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchTeamLeaders();
  }, []);

  // Filter projects according to User Role & Flowchart Select Query Rules:
  // - Admin (See All)
  // - Project Manager (Own Only)
  // - Team Leader / Member (Assign)
  const filteredProjects = projects.filter((p) => {
    // 1. Role-based visibility
    if (roleSimulation === "manager") {
      if (p.created_by !== currentUser.id) return false;
    } else if (roleSimulation === "team_leader") {
      if (p.teamLeaderId !== currentUser.id && p.created_by !== currentUser.id)
        return false;
    }

    // 2. Search query filter
    if (searchQuery) {
      return p.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  // 1. CREATE PROJECT FLOW
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // Validate Form?
    if (!formData.name || !formData.endDate || !formData.teamLeaderId) {
      setErrorMessage(
        "กรุณากรอกข้อมูลให้ครบถ้วนทุกช่อง (Title, End Date, Team Leader)",
      );
      return;
    }

    try {
      await axios.post("http://127.0.0.1:3000/auth/projects", {
        name: formData.name,
        endDate: formData.endDate,
        priority: formData.priority,
        teamLeaderId: Number(formData.teamLeaderId),
        createdBy: currentUser?.id || 1,
      });

      setShowCreateModal(false);
      // Reset form
      setFormData({
        name: "",
        endDate: "",
        priority: "Medium",
        teamLeaderId: "",
      });

      setSuccessMessage(
        "สร้างโปรเจกต์ใหม่และส่งการแจ้งเตือนไปยัง Team Leader สำเร็จ!",
      );
      setTimeout(() => setSuccessMessage(""), 5000);
      fetchProjects();
    } catch (err) {
      console.error("Create project failed", err);
      setErrorMessage("ไม่สามารถสร้างโปรเจกต์ได้");
    }
  };

  // 2. VIEW PROJECT DETAILS FLOW
  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setShowDetailModal(true);
  };

  // 3. EDIT PROJECT FLOW
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

    // Validate Form?
    if (
      !editFormData.name ||
      !editFormData.endDate ||
      !editFormData.teamLeaderId
    ) {
      setErrorMessage(
        "กรุณากรอกข้อมูลให้ครบถ้วนทุกช่อง (Title, End Date, Team Leader)",
      );
      return;
    }

    try {
      await axios.put(
        `http://127.0.0.1:3000/auth/projects/${editFormData.id}`,
        {
          name: editFormData.name,
          status: editFormData.status,
          priority: editFormData.priority,
          endDate: editFormData.endDate,
          teamLeaderId: Number(editFormData.teamLeaderId),
          userId: currentUser?.id || 1,
        },
      );

      setShowEditModal(false);
      setSuccessMessage("แก้ไขข้อมูลโปรเจกต์สำเร็จ!");
      setTimeout(() => setSuccessMessage(""), 5000);
      fetchProjects();
    } catch (err) {
      console.error("Edit project failed", err);
      setErrorMessage("ไม่สามารถแก้ไขข้อมูลโปรเจกต์ได้");
    }
  };

  // 4. DELETE PROJECT FLOW
  const handleOpenDelete = (project) => {
    setSelectedProject(project);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    // Flowchart: Is Admin?
    if (roleSimulation !== "admin") {
      setErrorMessage("ไม่มีสิทธิ์ลบโปรเจกต์ (เฉพาะ Admin เท่านั้น)");
      setShowDeleteModal(false);
      return;
    }

    try {
      await axios.delete(
        `http://127.0.0.1:3000/auth/projects/${selectedProject.id}`,
        {
          params: { userId: currentUser?.id || 1 },
        },
      );

      setShowDeleteModal(false);
      setSuccessMessage("ลบโปรเจกต์พร้อมข้อมูลที่เกี่ยวข้องทั้งหมดสำเร็จ!");
      setTimeout(() => setSuccessMessage(""), 5000);
      fetchProjects();
    } catch (err) {
      console.error("Delete project failed", err);
      setErrorMessage("ไม่สามารถลบโปรเจกต์ได้");
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Header />

      <main className="flex-grow-1 container py-4">
        {/* Page Title & Simulator Bar */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h1 className="h3 fw-bold text-dark mb-1">🗂️ Project Management</h1>
            <p className="text-muted mb-0">
              โครงร่างหน้าจัดการโปรเจกต์ตาม Flowchart
            </p>
          </div>

          {/* Role Simulator (Allows testing flow paths easily) */}
          {/* <div className="bg-white p-2 border rounded-lg shadow-sm d-flex align-items-center gap-2">
            <span className="text-muted small fw-bold">จำลองสิทธิ์:</span>
            <select
              className="form-select form-select-sm border-0 bg-light fw-bold"
              style={{ width: "170px" }}
              value={roleSimulation}
              onChange={(e) => {
                setRoleSimulation(e.target.value);
                logActivity(
                  `Switched simulated user role to: ${e.target.value}`,
                );
              }}
            >
              <option value="admin">Admin (เห็นทั้งหมด)</option>
              <option value="manager">Project Manager (สร้างเอง)</option>
              <option value="team_leader">
                Team Leader (ที่ได้รับมอบหมาย)
              </option>
            </select>
          </div> */}
        </div>

        {/* Success / Error Banners */}
        {successMessage && (
          <div
            className="alert alert-success alert-dismissible fade show shadow-sm rounded-lg d-flex align-items-center gap-2"
            role="alert"
          >
            <span>🎉</span> <strong>{successMessage}</strong>
          </div>
        )}
        {errorMessage && (
          <div
            className="alert alert-danger alert-dismissible fade show shadow-sm rounded-lg d-flex align-items-center gap-2"
            role="alert"
          >
            <span>⚠️</span> <strong>{errorMessage}</strong>
          </div>
        )}

        {/* Toolbar & Filter Bar */}
        <div className="card shadow-sm border-0 mb-4 rounded-lg overflow-hidden">
          <div className="card-body bg-white p-3">
            <div className="row g-3 align-items-center">
              <div className="col-12 col-md-6 col-lg-8">
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    🔍
                  </span>
                  <input
                    type="search"
                    className="form-control bg-light border-start-0 ps-0 rounded-end-lg"
                    placeholder="ค้นหาโปรเจกต์ด้วยชื่อ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-12 col-md-6 col-lg-4 text-md-end text-white">
                <button
                  className="btn btn-primary w-100 solid-on-hover d-flex align-items-center justify-content-center gap-2 py-2 rounded-lg"
                  onClick={() => setShowCreateModal(true)}
                >
                  <span>+ สร้างโปรเจกต์ใหม่</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Project List Table */}
        <div className="card shadow-sm border-0 rounded-lg overflow-hidden mb-4">
          <div className="card-header bg-white py-3 border-bottom">
            <h5 className="mb-0 fw-bold d-flex align-items-center gap-2 text-primary">
              📋 รายการโปรเจกต์ ({filteredProjects.length})
            </h5>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-uppercase text-muted small">
                <tr>
                  <th className="px-4 py-3">Project Name</th>
                  <th className="py-3">Status</th>
                  <th className="py-3" style={{ width: "250px" }}>
                    Progress
                  </th>
                  <th className="py-3">Priority</th>
                  <th className="py-3">Team Leader</th>
                  <th className="text-end px-4 py-3">Detail / Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <tr key={project.id}>
                      <td className="px-4 py-3 fw-bold text-dark">
                        {project.name}
                      </td>
                      <td className="py-3">
                        <span
                          className={`badge px-2.5 py-1.5 rounded-pill text-xs fw-semibold ${
                            project.status === "Completed"
                              ? "bg-success-subtle text-success"
                              : project.status === "In Progress"
                                ? "bg-primary-subtle text-primary"
                                : "bg-warning-subtle text-warning"
                          }`}
                        >
                          ● {project.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="progress w-100"
                            style={{ height: "6px", borderRadius: "10px" }}
                          >
                            <div
                              className={`progress-bar rounded-pill ${
                                project.progress === 100
                                  ? "bg-success"
                                  : project.progress > 50
                                    ? "bg-primary"
                                    : "bg-warning"
                              }`}
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                          <span className="small text-muted fw-bold">
                            {project.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span
                          className={`badge ${
                            project.priority === "High"
                              ? "bg-danger"
                              : project.priority === "Medium"
                                ? "bg-warning text-dark"
                                : "bg-info text-dark"
                          }`}
                        >
                          {project.priority}
                        </span>
                      </td>
                      <td className="py-3 text-muted fw-medium">
                        {project.teamLeaderName}
                      </td>
                      <td className="text-end px-4 py-3">
                        <div className="d-inline-flex gap-2">
                          <button
                            className="btn btn-sm btn-secondary px-2.5 py-1.5 rounded-lg text-xs"
                            onClick={() => handleViewDetails(project)}
                            title="ดูรายละเอียด"
                          >
                            View
                          </button>
                          <button
                            className="btn btn-sm btn-primary px-2.5 py-1.5 rounded-lg text-xs"
                            onClick={() => handleOpenEdit(project)}
                            title="แก้ไข"
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger px-2.5 py-1.5 rounded-lg text-xs"
                            onClick={() => handleOpenDelete(project)}
                            title="ลบ"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      <div className="fs-1 mb-2">📂</div>
                      <p className="mb-0 fw-medium">ไม่พบข้อมูลโปรเจกต์</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* CREATE MODAL */}
      <Modal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        centered
      >
        <Modal.Body className="p-4" style={{ borderRadius: "1rem" }}>
          <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
            <h5 className="fw-bold mb-0">🆕 สร้างโปรเจกต์ใหม่</h5>
            <button
              className="btn-close"
              onClick={() => setShowCreateModal(false)}
            ></button>
          </div>
          <form onSubmit={handleCreateSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-bold">
                หัวข้อโปรเจกต์ (Title) *
              </label>
              <input
                type="text"
                className="form-control rounded-lg"
                placeholder="ระบุชื่อหัวข้อโปรเจกต์"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-bold">
                วันที่สิ้นสุด (End Date) *
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
                ระดับความสำคัญ (Priority)
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
            <div className="mb-4">
              <label className="form-label small fw-bold">
                เลือก Team Leader *
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
                <option value="">-- กรุณาเลือก --</option>
                {teamLeaders.map((tl) => (
                  <option key={tl.id} value={tl.id}>
                    {tl.username || tl.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="d-flex gap-2 justify-content-end">
              <button
                type="button"
                className="btn btn-outline-secondary px-4 py-2 rounded-lg"
                onClick={() => setShowCreateModal(false)}
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="btn btn-primary px-4 py-2 rounded-lg"
              >
                💾 บันทึกและส่งการแจ้งเตือน
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
            <h5 className="fw-bold mb-0">✏️ แก้ไขโปรเจกต์</h5>
            <button
              className="btn-close"
              onClick={() => setShowEditModal(false)}
            ></button>
          </div>
          <form onSubmit={handleEditSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-bold">
                หัวข้อโปรเจกต์ (Title) *
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
              <label className="form-label small fw-bold">สถานะ (Status)</label>
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
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label small fw-bold">
                ระดับความสำคัญ (Priority)
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
                วันที่สิ้นสุด (End Date) *
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
            <div className="mb-4">
              <label className="form-label small fw-bold">
                เปลี่ยน Team Leader *
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
                {teamLeaders.map((tl) => (
                  <option key={tl.id} value={tl.id}>
                    {tl.username || tl.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="d-flex gap-2 justify-content-end">
              <button
                type="button"
                className="btn btn-outline-secondary px-4 py-2 rounded-lg"
                onClick={() => setShowEditModal(false)}
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="btn btn-primary px-4 py-2 rounded-lg"
              >
                💾 บันทึกการแก้ไข
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
                <h5 className="fw-bold mb-0">🔍 รายละเอียดโปรเจกต์</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowDetailModal(false)}
                ></button>
              </div>

              <div className="row g-4 mb-4">
                <div className="col-12 col-md-6">
                  <div className="mb-3">
                    <span className="text-muted small d-block">
                      ชื่อโปรเจกต์
                    </span>
                    <strong className="fs-5 text-dark">
                      {selectedProject.name}
                    </strong>
                  </div>
                  <div className="mb-3">
                    <span className="text-muted small d-block">
                      ระดับความสำคัญ
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
                      กำหนดส่ง (End Date)
                    </span>
                    <strong className="text-dark">
                      📅 {selectedProject.endDate}
                    </strong>
                  </div>
                  <div className="mb-3">
                    <span className="text-muted small d-block">
                      Team Leader ผู้รับผิดชอบ
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
                    ความคืบหน้าโดยรวม
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
                  📝 รายการงานในโปรเจกต์ (Tasks)
                </h6>
                <div className="list-group rounded-lg shadow-xs">
                  {selectedProject.tasks && selectedProject.tasks.length > 0 ? (
                    selectedProject.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <span className="text-dark fw-medium">
                          {task.title}
                        </span>
                        <span
                          className={`badge text-xs ${task.status === "Completed" ? "bg-success" : "bg-secondary"}`}
                        >
                          {task.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="list-group-item text-center py-3 text-muted text-xs">
                      ไม่มีงานที่ต้องทำในโปรเจกต์นี้
                    </div>
                  )}
                </div>
              </div>

              <div className="d-flex gap-2 justify-content-end border-top pt-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4 py-2 rounded-lg"
                  onClick={() => setShowDetailModal(false)}
                >
                  ปิดหน้าต่าง
                </button>
                <button
                  type="button"
                  className="btn btn-primary px-4 py-2 rounded-lg"
                  onClick={() => {
                    setShowDetailModal(false);
                    handleOpenEdit(selectedProject);
                  }}
                >
                  ✏️ แก้ไขโปรเจกต์นี้
                </button>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* DELETE CONFIRM MODAL */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Body className="p-4" style={{ borderRadius: "1rem" }}>
          {selectedProject && (
            <>
              <div className="text-center mb-4">
                <span className="fs-1 text-danger">🚨</span>
                <h5 className="fw-bold mt-2 text-danger">
                  ยืนยันการลบโปรเจกต์?
                </h5>
                <p className="text-muted mt-1 small">
                  ระบบจะทำการลบข้อมูลโปรเจกต์{" "}
                  <strong>"{selectedProject.name}"</strong> และทำการ Cascade
                  Delete ข้อมูลที่เกี่ยวโยงทั้งหมด (Tasks, Comments, Files)
                </p>
              </div>
              <div className="d-flex gap-2 justify-content-center">
                <button
                  type="button"
                  className="btn btn-light border px-4 py-2 rounded-lg w-50"
                  onClick={() => setShowDeleteModal(false)}
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  className="btn btn-danger px-4 py-2 rounded-lg w-50"
                  onClick={handleDeleteConfirm}
                >
                  💥 ยืนยันการลบ
                </button>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>

      <Footer />
    </div>
  );
};

export default Projects;
