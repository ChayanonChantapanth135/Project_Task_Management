import React from "react";
import { Modal } from "react-bootstrap";
import { useLanguage } from "../../../lib/LanguageContext";
import { formatDate } from "../../../lib/dateUtils";

const ProjectDetailModal = ({
  showDetailModal,
  setShowDetailModal,
  selectedProject,
  setSelectedTask,
  setTempStatus,
  setShowViewTaskModal,
  setShowAddTaskModal,
  t,
}) => {
  const { language } = useLanguage();

  return (
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
                    📅 {formatDate(selectedProject.endDate, language)}
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
                          <span className="d-block">📅 {formatDate(task.dueDate, language)}</span>
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
  );
};

export default ProjectDetailModal;
