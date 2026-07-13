import React from "react";

const ProjectTable = ({
  filteredProjects,
  t,
  sortByPriority,
  setSortByPriority,
  handleViewDetails,
  handleOpenEdit,
  handleOpenDelete
}) => {
  return (
    <div className="card border-0 shadow-sm rounded-lg overflow-hidden">
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0 bg-white">
          <thead className="table-light text-secondary" style={{ fontSize: "0.85rem", fontWeight: "600" }}>
            <tr>
              <th scope="col" className="px-4 py-3 border-0">{t("colProjectName")}</th>
              <th scope="col" className="py-3 border-0">{t("colStatus")}</th>
              <th scope="col" className="py-3 border-0">{t("colProgress")}</th>
              <th
                scope="col"
                className="py-3 border-0 cursor-pointer select-none"
                onClick={() => {
                  if (sortByPriority === "none") setSortByPriority("desc");
                  else if (sortByPriority === "desc") setSortByPriority("asc");
                  else setSortByPriority("none");
                }}
              >
                {t("colPriority")}{" "}
                <span>
                  {sortByPriority === "none" ? "⇅" : sortByPriority === "desc" ? "↓" : "↑"}
                </span>
              </th>
              <th scope="col" className="py-3 border-0">{t("colTeamLeader")}</th>
              <th scope="col" className="px-4 py-3 border-0 text-end">{t("colDetailAction")}</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: "0.9rem" }}>
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <tr key={project.id}>
                  <td className="px-4 py-3 fw-bold text-dark">{project.name}</td>
                  <td className="py-3">
                    {(() => {
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
                        <span className={`badge px-2.5 py-1.5 rounded-pill text-xs fw-semibold ${badgeClass}`}>
                          ● {statusText}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="py-3">
                    <div className="d-flex align-items-center gap-2">
                      <div className="progress w-100" style={{ height: "6px", borderRadius: "10px" }}>
                        <div
                          className={`progress-bar rounded-pill ${
                            project.progress === 100 ? "bg-success" : project.progress > 50 ? "bg-primary" : "bg-warning"
                          }`}
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs fw-semibold text-secondary">{project.progress}%</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`badge ${
                      project.priority === "High" ? "bg-danger" : project.priority === "Medium" ? "bg-warning text-dark" : "bg-info text-dark"
                    }`}>
                      {project.priority}
                    </span>
                  </td>
                  <td className="py-3 text-secondary font-weight-medium">
                    👤 {project.teamLeaderName || "-"}
                  </td>
                  <td className="px-4 py-3 text-end">
                    <div className="d-inline-flex gap-1.5">
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
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-5 text-muted">
                  <div className="fs-1 mb-2">📂</div>
                  <p className="mb-0 fw-medium">{t("noProjectsFound")}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectTable;
