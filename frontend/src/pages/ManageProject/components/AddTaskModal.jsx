import React from "react";
import { Modal } from "react-bootstrap";

const AddTaskModal = ({
  showAddTaskModal,
  setShowAddTaskModal,
  selectedProject,
  taskFormData,
  setTaskFormData,
  users,
  handleAddTaskSubmit,
  t,
}) => {
  return (
    <Modal
      show={showAddTaskModal}
      onHide={() => setShowAddTaskModal(false)}
      centered
    >
      <Modal.Body className="p-4" style={{ borderRadius: "1rem" }}>
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
          <h5 className="fw-bold mb-0">
            📝 {t("Create Task Success") || "สร้างงานใหม่ (Add Task)"}
          </h5>
          <button
            className="btn-close"
            onClick={() => setShowAddTaskModal(false)}
          ></button>
        </div>
        <form onSubmit={handleAddTaskSubmit}>
          {/* Project Name (Read Only) */}
          <div className="mb-3">
            <label className="form-label small fw-bold">
              {t("taskProjectLabel")}
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
              {t("taskNameLabel")} *
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
              {t("taskTypeLabel")}
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
              {t("taskDescLabel")}
            </label>
            <textarea
              className="form-control rounded-lg"
              rows="2"
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
              {t("taskPriorityLabel")}
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
              {t("taskDueDateLabel")}
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
              {t("taskAssigneeLabel")} - Optional
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
              <option value="">-- {t("noAssignee")} --</option>
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
              {t("cancelBtn")}
            </button>
            <button
              type="submit"
              className="btn btn-primary px-4 py-2 rounded-lg"
            >
              + {t("Create Task")}
            </button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default AddTaskModal;
