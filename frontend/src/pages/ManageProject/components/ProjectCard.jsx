import React from "react";

const ProjectCard = ({
  project,
  t,
  handleViewDetails,
  handleOpenEdit,
  handleOpenDelete
}) => {
  const statusLower = project.status?.toLowerCase();
  let badgeClass = "bg-warning-subtle text-warning";
  let statusText = t("statusPending");
  if (statusLower === "completed") {
    badgeClass = "bg-success-subtle text-success";
    statusText = t("statusCompleted");
  } else if (statusLower === "in_progress" || statusLower === "in progress") {
    badgeClass = "bg-primary-subtle text-primary";
    statusText = t("statusInProgress");
  } else if (statusLower === "review" || statusLower === "reviewing") {
    badgeClass = "bg-info-subtle text-info";
    statusText = t("statusReview");
  }

  return (
    <div className="card shadow-sm border border-light-subtle rounded-lg bg-white h-100 hover-shadow transition-all">
      <div className="card-body p-4 d-flex flex-column justify-content-between">
        <div>
          {/* Status & Priority */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className={`badge px-2.5 py-1.5 rounded-pill text-xs fw-semibold ${badgeClass}`}>
              ● {statusText}
            </span>
            <span className={`badge ${
              project.priority === "High" ? "bg-danger" : project.priority === "Medium" ? "bg-warning text-dark" : "bg-info text-dark"
            }`}>
              {project.priority}
            </span>
          </div>

          {/* Project Title */}
          <h5 className="fw-bold text-dark mb-3" style={{ fontSize: "1.1rem" }}>{project.name}</h5>

          {/* Dates & Team Leader */}
          <div className="mb-4">
            <div className="text-muted small mb-2 d-flex align-items-center gap-1.5">
              <span>⏱️ {t("endDateLabel")}:</span>
              <span className="fw-semibold text-dark">
                {project.end_date ? new Date(project.end_date).toLocaleDateString() : "-"}
              </span>
            </div>
            <div className="text-muted small d-flex align-items-center gap-1.5">
              <span>👤 {t("colTeamLeader")}:</span>
              <span className="fw-semibold text-dark">
                {project.teamLeaderName || "-"}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar & Actions */}
        <div>
          <div className="mb-4">
            <div className="d-flex justify-content-between text-xs text-muted mb-1.5 fw-semibold">
              <span>Progress</span>
              <span>{project.progress}%</span>
            </div>
            <div className="progress" style={{ height: "6px", borderRadius: "10px" }}>
              <div
                className={`progress-bar rounded-pill ${
                  project.progress === 100 ? "bg-success" : project.progress > 50 ? "bg-primary" : "bg-warning"
                }`}
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 pt-3 border-top">
            <button className="btn btn-sm btn-secondary px-2.5 py-1.5 text-xs rounded-lg" onClick={() => handleViewDetails(project)}>
              {t("viewBtn")}
            </button>
            <button className="btn btn-sm btn-primary px-2.5 py-1.5 text-xs rounded-lg" onClick={() => handleOpenEdit(project)}>
              {t("editBtn")}
            </button>
            <button className="btn btn-sm btn-danger px-2.5 py-1.5 text-xs rounded-lg" onClick={() => handleOpenDelete(project)}>
              {t("deleteBtn")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
