import React, { useState, useEffect, useRef } from "react";
import { Modal } from "react-bootstrap";
import axios from "axios";
import SearchableUserSelect from "../../../components/SearchableUserSelect";

const TaskDetailModal = ({
  showViewModal,
  setShowViewModal,
  selectedTask,
  tempStatus,
  setTempStatus,
  handleUpdateTask,
  handleDeleteTask,
  projects = [],
  users = [],
  currentUser,
  t,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    taskType: "",
    priority: "",
    dueDate: "",
    assignedTo: "",
    projectId: "",
    status: "",
  });

  const [comments, setComments] = useState([]);
  const [files, setFiles] = useState([]);
  const [statusHistory, setStatusHistory] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchComments = async () => {
    if (!selectedTask) return;
    try {
      const response = await axios.get(`/auth/tasks/${selectedTask.id}/comments`);
      setComments(response.data);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  const fetchFiles = async () => {
    if (!selectedTask) return;
    try {
      const response = await axios.get(`/auth/tasks/${selectedTask.id}/files`);
      setFiles(response.data);
    } catch (err) {
      console.error("Error fetching files:", err);
    }
  };

  const fetchStatusHistory = async () => {
    if (!selectedTask) return;
    try {
      const response = await axios.get(`/auth/tasks/${selectedTask.id}/status-history`);
      setStatusHistory(response.data);
    } catch (err) {
      console.error("Error fetching status history:", err);
    }
  };

  useEffect(() => {
    if (selectedTask) {
      setFormData({
        title: selectedTask.title || "",
        description: selectedTask.description || "",
        taskType: selectedTask.taskType || "",
        priority: selectedTask.priority || "Medium",
        dueDate: selectedTask.dueDate && selectedTask.dueDate !== "-" ? selectedTask.dueDate : "",
        assignedTo: selectedTask.assignedTo || "",
        projectId: selectedTask.projectId || "",
        status: selectedTask.status || "Pending",
      });
      setTempStatus(selectedTask.status || "Pending");
      setIsEditing(false);

      if (showViewModal) {
        fetchComments();
        fetchFiles();
        fetchStatusHistory();
      }
    }
  }, [selectedTask, showViewModal]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedTask) return;
    try {
      await axios.post(`/auth/tasks/${selectedTask.id}/comments`, {
        comment: newComment,
        userId: currentUser?.id,
      });
      setNewComment("");
      fetchComments();
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedTask) return;

    const fileFormData = new FormData();
    fileFormData.append("file", file);
    fileFormData.append("uploadedBy", currentUser?.id);

    try {
      setUploading(true);
      await axios.post(`/auth/tasks/${selectedTask.id}/files`, fileFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      fetchFiles();
    } catch (err) {
      console.error("Error uploading file:", err);
    } finally {
      setUploading(false);
    }
  };

  const onSave = () => {
    handleUpdateTask({
      ...formData,
      status: tempStatus, // Include status change
    });
  };

  const formatTaskType = (type) => {
    if (!type) return "";
    if (type === "แปล") return t("taskTypeTranslate") || "Translate";
    if (type === "ตัดต่อ") return t("taskTypeVideoEdit") || "Video Edit";
    if (type === "อื่นๆ") return t("taskTypeOthers") || "Others";
    return type;
  };

  const formatPriority = (p) => {
    if (!p) return "";
    const lower = String(p).toLowerCase();
    if (lower === "high") return t("priorityHigh") || "High";
    if (lower === "medium") return t("priorityMedium") || "Medium";
    if (lower === "low") return t("priorityLow") || "Low";
    return p;
  };

  const getStatusBadgeClass = (status) => {
    const s = String(status).toLowerCase();
    if (s === "completed") return "bg-success text-white";
    if (s === "in progress" || s === "in_progress") return "bg-primary text-white";
    if (s === "reviewing" || s === "review") return "bg-warning text-dark";
    return "bg-secondary text-white";
  };

  const translateStatus = (status) => {
    const s = String(status).toLowerCase();
    if (s === "completed") return "เสร็จสมบูรณ์";
    if (s === "in progress" || s === "in_progress") return "กำลังทำ";
    if (s === "reviewing" || s === "review") return "รอตรวจสอบ";
    return "รอดำเนินการ";
  };

  return (
    <Modal
      show={showViewModal}
      onHide={() => setShowViewModal(false)}
      size="lg"
      centered
    >
      <Modal.Body className="p-4" style={{ borderRadius: "1rem" }}>
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
          <h5 className="fw-bold mb-0 text-slate-900">
            {isEditing ? "📝 แก้ไขข้อมูลงาน" : `🔍 ${t("taskDetailsTitle") || "Task Details"}`}
          </h5>
          <div className="d-flex gap-2">
            {!isEditing && (
              <button
                className="btn btn-sm btn-primary px-3 py-1 rounded-xl text-xs"
                onClick={() => setIsEditing(true)}
              >
                ✏️ แก้ไขข้อมูล
              </button>
            )}
            <button
              className="btn-close"
              onClick={() => setShowViewModal(false)}
            ></button>
          </div>
        </div>

        <div className="row g-4">
          {/* Left Column: Task Details */}
          <div className="col-lg-6 border-end pe-lg-4">
            {/* Project Name */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted mb-1">
                {t("taskProjectLabel") || "Project"}
              </label>
              {isEditing ? (
                <select
                  name="projectId"
                  className="form-select rounded-lg text-sm py-2"
                  value={formData.projectId}
                  onChange={handleInputChange}
                >
                  <option value="">เลือกโครงการ...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  className="form-control bg-light rounded-lg text-muted text-sm py-2"
                  value={selectedTask ? selectedTask.project : ""}
                  readOnly
                  disabled
                />
              )}
            </div>

            {/* Title / Task Name */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted mb-1">
                {t("taskNameLabel") || "Task Name"}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="title"
                  className="form-control rounded-lg text-sm py-2"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              ) : (
                <input
                  type="text"
                  className="form-control bg-light rounded-lg text-muted text-sm py-2"
                  value={selectedTask ? selectedTask.title : ""}
                  readOnly
                  disabled
                />
              )}
            </div>

            {/* Task Type */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted mb-1">
                {t("taskTypeLabel") || "Task Type"}
              </label>
              {isEditing ? (
                <select
                  name="taskType"
                  className="form-select rounded-lg text-sm py-2"
                  value={formData.taskType}
                  onChange={handleInputChange}
                >
                  <option value="แปล">{t("taskTypeTranslate") || "แปล"}</option>
                  <option value="ตัดต่อ">{t("taskTypeVideoEdit") || "ตัดต่อ"}</option>
                  <option value="อื่นๆ">{t("taskTypeOthers") || "อื่นๆ"}</option>
                </select>
              ) : (
                <input
                  type="text"
                  className="form-control bg-light rounded-lg text-muted text-sm py-2"
                  value={selectedTask ? formatTaskType(selectedTask.taskType) : ""}
                  readOnly
                  disabled
                />
              )}
            </div>

            {/* Description */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted mb-1">
                {t("taskDescLabel") || "Description"}
              </label>
              {isEditing ? (
                <textarea
                  name="description"
                  className="form-control rounded-lg text-sm py-2"
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              ) : (
                <textarea
                  className="form-control bg-light rounded-lg text-muted text-sm py-2"
                  rows="3"
                  value={
                    selectedTask
                      ? selectedTask.description || t("noDescription") || "No description provided."
                      : ""
                  }
                  readOnly
                  disabled
                />
              )}
            </div>

            {/* Priority */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted mb-1">
                {t("taskPriorityLabel") || "Priority"}
              </label>
              {isEditing ? (
                <select
                  name="priority"
                  className="form-select rounded-lg text-sm py-2"
                  value={formData.priority}
                  onChange={handleInputChange}
                >
                  <option value="Low">{t("priorityLow") || "Low"}</option>
                  <option value="Medium">{t("priorityMedium") || "Medium"}</option>
                  <option value="High">{t("priorityHigh") || "High"}</option>
                </select>
              ) : (
                <input
                  type="text"
                  className="form-control bg-light rounded-lg text-muted text-sm py-2"
                  value={selectedTask ? formatPriority(selectedTask.priority) : ""}
                  readOnly
                  disabled
                />
              )}
            </div>

            {/* Due Date */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted mb-1">
                {t("taskDueDateLabel") || "Due Date"}
              </label>
              {isEditing ? (
                <input
                  type="date"
                  name="dueDate"
                  className="form-control rounded-lg text-sm py-2"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                />
              ) : (
                <input
                  type="text"
                  className="form-control bg-light rounded-lg text-muted text-sm py-2"
                  value={selectedTask ? selectedTask.dueDate : ""}
                  readOnly
                  disabled
                />
              )}
            </div>

            {/* Assignee */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted mb-1">
                {t("taskAssigneeLabel") || "Assignee"}
              </label>
              {isEditing ? (
                <SearchableUserSelect
                  users={users}
                  value={formData.assignedTo}
                  onChange={handleInputChange}
                  placeholder={`-- ${t("selectAssignee") || "Select Assignee"} --`}
                />
              ) : (
                <input
                  type="text"
                  className="form-control bg-light rounded-lg text-muted text-sm py-2"
                  value={
                    selectedTask
                      ? selectedTask.assignee || t("noAssignee") || "Unassigned"
                      : ""
                  }
                  readOnly
                  disabled
                />
              )}
            </div>

            {/* Task Status */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted mb-1">
                {t("taskStatusLabel") || "Status"}
              </label>
              <select
                className="form-select rounded-lg text-sm py-2 font-semibold"
                value={tempStatus}
                onChange={(e) => setTempStatus(e.target.value)}
              >
                <option value="Pending">{t("taskStatusPending") || "Pending"}</option>
                <option value="In Progress">{t("taskStatusInProgress") || "In Progress"}</option>
                <option value="Reviewing">{t("taskStatusReviewing") || "Reviewing"}</option>
                <option value="Completed">{t("taskStatusCompleted") || "Completed"}</option>
              </select>
            </div>

          </div>

          {/* Right Column: Files, Comments, History */}
          <div className="col-lg-6 ps-lg-4 d-flex flex-column gap-4">
            {/* ไฟล์แนบ */}
            <div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold text-slate-800 text-sm">
                  ไฟล์แนบ ({files.length})
                </span>
                <input
                  type="file"
                  className="d-none"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary px-3 rounded-xl text-xs"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? "กำลังอัปโหลด..." : "📤 อัปโหลด"}
                </button>
              </div>

              <div className="border rounded-xl p-2.5 bg-slate-50 max-h-[120px] overflow-y-auto">
                {files.length > 0 ? (
                  <div className="d-flex flex-column gap-2">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="d-flex justify-content-between align-items-center text-xs pb-1 border-bottom last:border-0 last:pb-0"
                      >
                        <a
                          href={`${axios.defaults.baseURL || "http://127.0.0.1:3000"}${file.filepath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-truncate fw-bold text-primary"
                          style={{ maxWidth: "70%" }}
                        >
                          📎 {file.filename}
                        </a>
                        <span className="text-muted" style={{ fontSize: "10px" }}>
                          โดย {file.username}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted text-xs py-3">
                    ไม่มีไฟล์แนบ
                  </div>
                )}
              </div>
            </div>

            {/* ความคิดเห็น */}
            <div>
              <span className="fw-bold text-slate-800 text-sm mb-2 d-block">
                ความคิดเห็น ({comments.length})
              </span>

              <form onSubmit={handleAddComment} className="mb-3">
                <textarea
                  className="form-control text-sm rounded-lg mb-2"
                  rows="2"
                  placeholder="เขียนความคิดเห็น..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="btn btn-sm btn-primary px-3 text-xs text-white"
                >
                  🚀 ส่งความคิดเห็น
                </button>
              </form>

              <div className="border rounded-xl p-2.5 bg-slate-50 max-h-[150px] overflow-y-auto d-flex flex-column gap-2.5">
                {comments.length > 0 ? (
                  comments.map((c) => (
                    <div key={c.id} className="text-xs pb-2 border-bottom last:border-0 last:pb-0">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-bold text-dark">{c.username} ({c.role})</span>
                        <span className="text-muted" style={{ fontSize: "10px" }}>
                          {new Date(c.created_at).toLocaleString("th-TH")}
                        </span>
                      </div>
                      <p className="mb-0 text-secondary">{c.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted text-xs py-4">
                    ยังไม่มีความคิดเห็น
                  </div>
                )}
              </div>
            </div>

            {/* ประวัติการเปลี่ยนสถานะ */}
            <div>
              <span className="fw-bold text-slate-800 text-sm mb-2 d-block">
                🕒 ประวัติการเปลี่ยนสถานะ
              </span>

              <div className="border rounded-xl p-3 bg-slate-50 max-h-[160px] overflow-y-auto">
                {statusHistory.length > 0 ? (
                  <div className="position-relative ps-3 border-start">
                    {statusHistory.map((h, index) => {
                      const prevStatus = index > 0 ? statusHistory[index - 1].status : null;
                      return (
                        <div key={index} className="mb-3 position-relative text-xs">
                          {/* Dot on the timeline */}
                          <div
                            className="position-absolute rounded-circle"
                            style={{
                              width: "10px",
                              height: "10px",
                              left: "-21px",
                              top: "4px",
                              backgroundColor: "#14b8a6",
                              border: "2px solid #fff",
                            }}
                          ></div>
                          <div>
                            <span className="fw-bold text-dark">{h.username || "System"}</span>{" "}
                            เปลี่ยนสถานะ
                            {prevStatus ? (
                              <>
                                {" "}จาก{" "}
                                <span className={`badge px-2 py-0.5 rounded ${getStatusBadgeClass(prevStatus)}`}>
                                  {translateStatus(prevStatus)}
                                </span>{" "}
                                เป็น{" "}
                              </>
                            ) : (
                              " เป็น "
                            )}
                            <span className={`badge px-2 py-0.5 rounded ${getStatusBadgeClass(h.status)}`}>
                              {translateStatus(h.status)}
                            </span>
                          </div>
                          <div className="text-muted mt-1 font-mono" style={{ fontSize: "10px" }}>
                            {new Date(h.changed_at).toLocaleString("th-TH")}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-muted text-xs py-4">
                    ยังไม่มีประวัติการเปลี่ยนสถานะ
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer at the bottom of Modal.Body (spans full width) */}
        <div className="d-flex justify-content-between align-items-center gap-3 pt-3 border-top mt-4">
          {currentUser?.role === "admin" && selectedTask ? (
            <button
              type="button"
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-full text-xs font-bold whitespace-nowrap border border-red-500/30 transition-all shadow-sm"
              onClick={() => {
                if (window.confirm("คุณต้องการลบงานนี้จริงหรือไม่? / Are you sure you want to delete this task?")) {
                  handleDeleteTask(selectedTask.id);
                }
              }}
            >
              🗑️ ลบงาน
            </button>
          ) : (
            <div />
          )}

          <div className="d-flex gap-2">
            {isEditing ? (
              <>
                <button
                  type="button"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full text-xs font-semibold whitespace-nowrap border border-white/10 transition-all"
                  onClick={() => setIsEditing(false)}
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-lg"
                  onClick={onSave}
                >
                  บันทึกข้อมูล
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full text-xs font-semibold whitespace-nowrap border border-white/10 transition-all"
                  onClick={() => setShowViewModal(false)}
                >
                  {t("cancelBtn") || "Cancel"}
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-lg"
                  onClick={() => {
                    handleUpdateTask({
                      title: formData.title,
                      description: formData.description,
                      taskType: formData.taskType,
                      priority: formData.priority,
                      dueDate: formData.dueDate,
                      assignedTo: formData.assignedTo,
                      projectId: formData.projectId,
                      status: tempStatus, // Just save status change
                    });
                  }}
                >
                  {t("updateStatusBtn") || "Update Status"}
                </button>
              </>
            )}
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default TaskDetailModal;
