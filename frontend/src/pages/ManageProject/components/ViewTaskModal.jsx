import React from "react";
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
  return (
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
              value={
                selectedTask
                  ? selectedTask.task_type || selectedTask.taskType || ""
                  : ""
              }
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
            <label className="form-label small fw-bold text-muted">
              {t("taskAssigneeLabel")}
            </label>
            <input
              type="text"
              className="form-control bg-light rounded-lg text-muted"
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
                    userId: currentUser?.id,
                  });

                  // Update task status inside selectedProject locally
                  if (selectedProject && selectedProject.tasks) {
                    const updatedTasks = selectedProject.tasks.map((t) =>
                      t.id === selectedTask.id
                        ? { ...t, status: tempStatus }
                        : t,
                    );
                    const completed = updatedTasks.filter(
                      (t) =>
                        t.status && t.status.toLowerCase() === "completed",
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
      </Modal.Body>
    </Modal>
  );
};

export default ViewTaskModal;
