import React, { useState, useEffect, useRef } from "react";
import { Modal } from "react-bootstrap";
import axios from "axios";
import { useLanguage } from "../../../lib/LanguageContext";
import { formatDateTime, formatDate } from "../../../lib/dateUtils";
import SearchableUserSelect from "../../../components/SearchableUserSelect";
import CustomDateInput from "../../../components/CustomDateInput";

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
  users = [],
  t,
}) => {
  const { language } = useLanguage();
  const userRole = (currentUser?.role || "").toLowerCase().trim().replace(/\s+/g, "_");
  const canManage = userRole === "admin" || userRole === "manager" || userRole === "project_manager";

  const [comments, setComments] = useState([]);
  const [files, setFiles] = useState([]);
  const [statusHistory, setStatusHistory] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    taskType: "แปล",
    customTaskType: "",
    priority: "Medium",
    dueDate: "",
    assignedTo: "",
    status: "Pending",
  });

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
      const rawDate = selectedTask.dueDate || selectedTask.due_date || "";
      let isoDueDate = "";
      if (rawDate && rawDate !== "-") {
        const str = String(rawDate).trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
          isoDueDate = str;
        } else if (str.includes("T")) {
          isoDueDate = str.split("T")[0];
        } else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
          const [d, m, y] = str.split("/");
          let yearNum = parseInt(y, 10);
          if (yearNum > 2400) yearNum -= 543;
          isoDueDate = `${yearNum}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
        }
      }

      const rawType = selectedTask.task_type || selectedTask.taskType || "";
      const isKnownType = ["แปล", "ตัดต่อ", "อื่นๆ"].includes(rawType);

      setFormData({
        title: selectedTask.title || "",
        description: selectedTask.description || "",
        taskType: isKnownType ? rawType : rawType ? "อื่นๆ" : "แปล",
        customTaskType: isKnownType ? "" : rawType,
        priority: selectedTask.priority || "Medium",
        dueDate: isoDueDate,
        assignedTo: selectedTask.assigned_to || selectedTask.assignedTo || "",
        status: selectedTask.status || "Pending",
      });
      setTempStatus(selectedTask.status || "Pending");
      setIsEditing(false);

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

  const handleSaveTaskDetails = async () => {
    if (!selectedTask) return;
    try {
      if (isEditing) {
        const typeValue =
          formData.taskType === "อื่นๆ"
            ? formData.customTaskType
            : formData.taskType;

        const payload = {
          title: formData.title,
          description: formData.description,
          taskType: typeValue,
          priority: formData.priority,
          dueDate: formData.dueDate,
          assignedTo: formData.assignedTo ? Number(formData.assignedTo) : null,
          projectId: selectedProject?.id,
          status: tempStatus,
          userId: currentUser?.id,
        };

        await axios.put(`/auth/tasks/${selectedTask.id}`, payload);

        const assignedUser = users.find(
          (u) => Number(u.id) === Number(formData.assignedTo)
        );
        const assignedName = assignedUser
          ? assignedUser.fullname || assignedUser.username
          : "Unassigned";

        if (selectedProject && selectedProject.tasks) {
          const updatedTasks = selectedProject.tasks.map((tItem) =>
            tItem.id === selectedTask.id
              ? {
                  ...tItem,
                  title: formData.title,
                  description: formData.description,
                  task_type: typeValue,
                  taskType: typeValue,
                  priority: formData.priority,
                  due_date: formData.dueDate,
                  dueDate: formData.dueDate,
                  assigned_to: formData.assignedTo,
                  assigned_to_name: assignedName,
                  status: tempStatus,
                }
              : tItem
          );
          const completed = updatedTasks.filter(
            (tItem) => tItem.status && tItem.status.toLowerCase() === "completed"
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

        setSuccessMessage(
          language === "th" ? "อัปเดตข้อมูลงานสำเร็จ" : "Task updated successfully"
        );
        setTimeout(() => setSuccessMessage(""), 5000);
        setShowViewTaskModal(false);
        if (fetchProjects) fetchProjects();
      } else {
        await axios.put(`/auth/tasks/${selectedTask.id}/status`, {
          status: tempStatus,
          userId: currentUser?.id,
        });

        if (selectedProject && selectedProject.tasks) {
          const updatedTasks = selectedProject.tasks.map((tItem) =>
            tItem.id === selectedTask.id ? { ...tItem, status: tempStatus } : tItem
          );
          const completed = updatedTasks.filter(
            (tItem) => tItem.status && tItem.status.toLowerCase() === "completed"
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

        setSuccessMessage(
          language === "th" ? "อัปเดตสถานะงานสำเร็จ" : "Status updated successfully"
        );
        setTimeout(() => setSuccessMessage(""), 5000);
        setShowViewTaskModal(false);
        if (fetchProjects) fetchProjects();
      }
    } catch (err) {
      console.error("Failed to update task:", err);
      setErrorMessage(
        language === "th" ? "ไม่สามารถอัปเดตข้อมูลงานได้" : "Failed to update task"
      );
      setTimeout(() => setErrorMessage(""), 5000);
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
          <h5 className="fw-bold mb-0 text-slate-900 d-flex align-items-center gap-1.5">
            {isEditing ? (
              <>
                <ion-icon name="create-outline" style={{ fontSize: "20px" }}></ion-icon>
                <span>{language === "th" ? "แก้ไขข้อมูลงาน" : "Edit Task Info"}</span>
              </>
            ) : (
              <>
                <ion-icon name="search-outline" style={{ fontSize: "20px" }}></ion-icon>
                <span>{t("taskDetailsTitle") || "Task Details"}</span>
              </>
            )}
          </h5>
          <div className="d-flex align-items-center gap-2">
            {!isEditing && canManage && (
              <button
                type="button"
                className="btn btn-sm btn-primary rounded-xl px-3 py-1 text-xs fw-bold text-white shadow-sm d-flex align-items-center gap-1"
                onClick={() => setIsEditing(true)}
              >
                <ion-icon name="create-outline" style={{ fontSize: "15px" }}></ion-icon>
                <span>{language === "th" ? "แก้ไขข้อมูล" : "Edit Task"}</span>
              </button>
            )}
            <button
              className="btn-close"
              onClick={() => setShowViewTaskModal(false)}
            ></button>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-6 border-end pe-lg-4">
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

            <div className="mb-3">
              <label className="form-label small fw-bold text-muted mb-1">
                {t("taskNameLabel")}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  className="form-control rounded-lg text-sm py-2"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
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

            <div className="mb-3">
              <label className="form-label small fw-bold text-muted mb-1">
                {t("taskTypeLabel")}
              </label>
              {isEditing ? (
                <>
                  <select
                    className="form-select rounded-lg text-sm py-2"
                    value={formData.taskType}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, taskType: e.target.value }))
                    }
                  >
                    <option value="แปล">{t("taskTypeTranslate")}</option>
                    <option value="ตัดต่อ">{t("taskTypeVideoEdit")}</option>
                    <option value="อื่นๆ">{t("taskTypeOthers")}</option>
                  </select>
                  {formData.taskType === "อื่นๆ" && (
                    <input
                      type="text"
                      className="form-control rounded-lg text-sm py-2 mt-2"
                      placeholder={t("customTaskTypePlaceholder")}
                      value={formData.customTaskType}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          customTaskType: e.target.value,
                        }))
                      }
                    />
                  )}
                </>
              ) : (
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
              )}
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold text-muted mb-1">
                {t("taskDescLabel")}
              </label>
              {isEditing ? (
                <textarea
                  className="form-control rounded-lg text-sm py-2"
                  rows="3"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              ) : (
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
              )}
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold text-muted mb-1">
                {t("taskPriorityLabel")}
              </label>
              {isEditing ? (
                <select
                  className="form-select rounded-lg text-sm py-2"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, priority: e.target.value }))
                  }
                >
                  <option value="High">{t("priorityHigh")}</option>
                  <option value="Medium">{t("priorityMedium")}</option>
                  <option value="Low">{t("priorityLow")}</option>
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

            <div className="mb-3" lang={language === "th" ? "th-TH" : "en-GB"}>
              <label className="form-label small fw-bold text-muted mb-1">
                {t("taskDueDateLabel")}
              </label>
              {isEditing ? (
                <CustomDateInput
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
                  }
                />
              ) : (
                <input
                  type="text"
                  className="form-control bg-light rounded-lg text-muted text-sm py-2"
                  value={
                    selectedTask
                      ? formatDate(selectedTask.dueDate || selectedTask.due_date, language)
                      : ""
                  }
                  readOnly
                  disabled
                />
              )}
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold text-muted mb-1">
                {t("taskAssigneeLabel")}
              </label>
              {isEditing ? (
                <SearchableUserSelect
                  users={users}
                  value={formData.assignedTo}
                  name="assignedTo"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      assignedTo: e.target.value,
                    }))
                  }
                  allowedRoles={[
                    "manager",
                    "project_manager",
                    "storyboard",
                    "animation",
                    "designer",
                    "programmer",
                  ]}
                  placeholder={`-- ${t("selectAssignee") || "Select Assignee"} --`}
                />
              ) : (
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
              )}
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold text-muted mb-1">
                {t("taskStatusLabel")}
              </label>
              <select
                className="form-select rounded-lg text-sm py-2"
                value={tempStatus}
                onChange={(e) => {
                  setTempStatus(e.target.value);
                  setFormData((prev) => ({ ...prev, status: e.target.value }));
                }}
              >
                <option value="Pending">{t("taskStatusPending")}</option>
                <option value="In Progress">{t("taskStatusInProgress")}</option>
                <option value="Reviewing">{t("taskStatusReviewing")}</option>
                <option value="Completed">{t("taskStatusCompleted")}</option>
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
                          {formatDateTime(c.created_at, language)}
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
              <span className="fw-bold text-slate-800 text-sm mb-2 d-flex align-items-center gap-1.5">
                <ion-icon name="time-outline" style={{ fontSize: "18px" }}></ion-icon>
                <span>{language === "th" ? "ประวัติการเปลี่ยนสถานะ" : "Status History"}</span>
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
                            {formatDateTime(h.changed_at, language)}
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
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-full text-xs font-bold whitespace-nowrap border border-red-500/30 transition-all shadow-sm d-inline-flex align-items-center gap-1"
              onClick={async () => {
                if (
                  window.confirm(
                    language === "th"
                      ? "คุณต้องการลบงานนี้จริงหรือไม่?"
                      : "Are you sure you want to delete this task?"
                  )
                ) {
                  try {
                    await axios.delete(`/auth/tasks/${selectedTask.id}?userId=${currentUser?.id}`);
                    setSuccessMessage(language === "th" ? "ลบงานสำเร็จ" : "Task deleted successfully");
                    setTimeout(() => setSuccessMessage(""), 5000);
                    setShowViewTaskModal(false);
                    if (fetchProjects) fetchProjects();
                  } catch (err) {
                    console.error("Failed to delete task:", err);
                    setErrorMessage(language === "th" ? "ไม่สามารถลบงานได้" : "Failed to delete task");
                    setTimeout(() => setErrorMessage(""), 5000);
                  }
                }
              }}
            >
              <ion-icon name="trash-outline" style={{ fontSize: "15px" }}></ion-icon>
              <span>{language === "th" ? "ลบงาน" : "Delete Task"}</span>
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
                  {language === "th" ? "ยกเลิก" : "Cancel"}
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-lg"
                  onClick={handleSaveTaskDetails}
                >
                  {language === "th" ? "บันทึกข้อมูล" : "Save Changes"}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full text-xs font-semibold whitespace-nowrap border border-white/10 transition-all"
                  onClick={() => setShowViewTaskModal(false)}
                >
                  {t("cancelBtn") || "Cancel"}
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-lg"
                  onClick={handleSaveTaskDetails}
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

export default ViewTaskModal;
