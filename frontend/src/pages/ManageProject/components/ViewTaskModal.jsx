import React, { useState, useEffect, useRef } from "react";
import { Modal } from "react-bootstrap";
import axios from "axios";

const ViewTaskModal = ({
  showViewTaskModal,
  setShowViewTaskModal,
  selectedProject,
  setSelectedProject,
  selectedTask,
  tempStatus,
  setTempStatus,
  currentUser,
  setSuccessMessage,
  setErrorMessage,
  fetchProjects,
  t,
}) => {
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
    if (showViewTaskModal && selectedTask) {
      fetchComments();
      fetchFiles();
      fetchStatusHistory();
    }
  }, [showViewTaskModal, selectedTask]);

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

    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploadedBy", currentUser?.id);

    try {
      setUploading(true);
      await axios.post(`/auth/tasks/${selectedTask.id}/files`, formData, {
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

  const formatTaskType = (type) => {
    if (!type) return "";
    if (type === "แปล") return t("taskTypeTranslate");
    if (type === "ตัดต่อ") return t("taskTypeVideoEdit");
    if (type === "อื่นๆ") return t("taskTypeOthers");
    return type;
  };

  const formatPriority = (p) => {
    if (!p) return "";
    const lower = String(p).toLowerCase();
    if (lower === "high") return t("priorityHigh");
    if (lower === "medium") return t("priorityMedium");
    if (lower === "low") return t("priorityLow");
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
      show={showViewTaskModal}
      onHide={() => setShowViewTaskModal(false)}
      size="lg"
      centered
    >
      <Modal.Body className="p-4" style={{ borderRadius: "1rem" }}>
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
          <h5 className="fw-bold mb-0 text-slate-900">🔍 {t("taskDetailsTitle")}</h5>
          <button
            className="btn-close"
            onClick={() => setShowViewTaskModal(false)}
          ></button>
        </div>

        <div className="row g-4">
          {/* Left Column: Task Details */}
          <div className="col-lg-6 border-end pe-lg-4">
            {/* Project Name (Read Only) */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted mb-1">
                {t("taskProjectLabel")}
              </label>
              <input
                type="text"
                className="form-control bg-light rounded-lg text-muted text-sm py-2"
                value={selectedProject ? selectedProject.name : ""}
                readOnly
                disabled
              />
            </div>

            {/* Title / Task Name */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted mb-1">
                {t("taskNameLabel")}
              </label>
              <input
                type="text"
                className="form-control bg-light rounded-lg text-muted text-sm py-2"
                value={selectedTask ? selectedTask.title : ""}
                readOnly
                disabled
              />
            </div>

            {/* Task Type */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted mb-1">
                {t("taskTypeLabel")}
              </label>
              <input
                type="text"
                className="form-control bg-light rounded-lg text-muted text-sm py-2"
                value={
                  selectedTask
                    ? formatTaskType(selectedTask.task_type || selectedTask.taskType)
                    : ""
                }
                readOnly
                disabled
              />
            </div>

            {/* Description */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted mb-1">
                {t("taskDescLabel")}
              </label>
              <textarea
                className="form-control bg-light rounded-lg text-muted text-sm py-2"
                rows="3"
                value={
                  selectedTask
                    ? selectedTask.description || t("noDescription")
                    : ""
                }
                readOnly
                disabled
              />
            </div>

            {/* Priority */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted mb-1">
                {t("taskPriorityLabel")}
              </label>
              <input
                type="text"
                className="form-control bg-light rounded-lg text-muted text-sm py-2"
                value={selectedTask ? formatPriority(selectedTask.priority) : ""}
                readOnly
                disabled
              />
            </div>

            {/* Due Date */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted mb-1">
                {t("taskDueDateLabel")}
              </label>
              <input
                type="text"
                className="form-control bg-light rounded-lg text-muted text-sm py-2"
                value={
                  selectedTask
                    ? selectedTask.dueDate || selectedTask.due_date || ""
                    : ""
                }
                readOnly
                disabled
              />
            </div>

            {/* Assignee */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted mb-1">
                {t("taskAssigneeLabel")}
              </label>
              <input
                type="text"
                className="form-control bg-light rounded-lg text-muted text-sm py-2"
                value={
                  selectedTask
                    ? selectedTask.assigned_to_name || t("noAssignee")
                    : ""
                }
                readOnly
                disabled
              />
            </div>

            {/* Task Status */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted mb-1">
                {t("taskStatusLabel")}
              </label>
              <select
                className="form-select rounded-lg text-sm py-2"
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
                className="btn btn-secondary px-4 py-2 rounded-lg text-xs"
                onClick={() => setShowViewTaskModal(false)}
              >
                {t("cancelBtn")}
              </button>
              <button
                type="button"
                className="btn btn-primary px-4 py-2 rounded-lg text-xs text-white"
                onClick={async () => {
                  try {
                    await axios.put(`/auth/tasks/${selectedTask.id}/status`, {
                      status: tempStatus,
                      userId: currentUser?.id,
                    });

                    // Update task status inside selectedProject locally
                    if (selectedProject && selectedProject.tasks) {
                      const updatedTasks = selectedProject.tasks.map((t) =>
                        t.id === selectedTask.id
                          ? { ...t, status: tempStatus }
                          : t
                      );
                      const completed = updatedTasks.filter(
                        (t) =>
                          t.status && t.status.toLowerCase() === "completed"
                      ).length;
                      const progress =
                        updatedTasks.length > 0
                          ? Math.round((completed / updatedTasks.length) * 100)
                          : 0;
                      setSelectedProject((prev) => ({
                        ...prev,
                        tasks: updatedTasks,
                        progress,
                      }));
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
                          โดย {file.fullname || file.username}
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
                        <span className="fw-bold text-dark">{c.fullname || c.username} ({c.role})</span>
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
                            <span className="fw-bold text-dark">{h.fullname || h.username || "System"}</span>{" "}
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
      </Modal.Body>
    </Modal>
  );
};

export default ViewTaskModal;
