import React from "react";

const ProjectTable = ({
  filteredProjects,
  t,
  sortByPriority,
  setSortByPriority,
  handleViewDetails,
  handleOpenEdit,
  handleOpenDelete,
}) => {
  return (
    <div className="glass-panel rounded-3xl p-6 shadow-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-slate-400 font-bold">
              <th className="py-4 px-4">{t("colProjectName")}</th>
              <th className="py-4 px-4">{t("colStatus")}</th>
              <th className="py-4 px-4">{t("colProgress")}</th>
              <th
                className="py-4 px-4 cursor-pointer select-none"
                onClick={() => {
                  if (sortByPriority === "none") setSortByPriority("desc");
                  else if (sortByPriority === "desc") setSortByPriority("asc");
                  else setSortByPriority("none");
                }}
              >
                {t("colPriority")}{" "}
                <span>
                  {sortByPriority === "none"
                    ? "⇅"
                    : sortByPriority === "desc"
                      ? "↓"
                      : "↑"}
                </span>
              </th>
              <th className="py-4 px-4">{t("colTeamLeader")}</th>
              <th className="py-4 px-4 text-right pr-6">{t("colDetailAction")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm text-slate-200">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <tr key={project.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-4 font-bold text-white">
                    {project.name}
                  </td>
                  <td className="py-4 px-4">
                    {(() => {
                      const statusLower = project.status?.toLowerCase();
                      let badgeClass = "bg-amber-500/20 text-amber-300";
                      let statusText = t("statusPending");
                      if (statusLower === "completed") {
                        badgeClass = "bg-emerald-500/20 text-emerald-300";
                        statusText = t("statusCompleted");
                      } else if (
                        statusLower === "in_progress" ||
                        statusLower === "in progress"
                      ) {
                        badgeClass = "bg-indigo-500/20 text-indigo-300";
                        statusText = t("statusInProgress");
                      } else if (
                        statusLower === "review" ||
                        statusLower === "reviewing"
                      ) {
                        badgeClass = "bg-pink-500/20 text-pink-300";
                        statusText = t("statusReview");
                      }
                      return (
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap inline-block ${badgeClass}`}>
                          ● {statusText}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3 w-36">
                      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full transition-all duration-300"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-slate-400">
                        {project.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        project.priority === "High"
                          ? "bg-rose-500/20 text-rose-300"
                          : project.priority === "Medium"
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-indigo-500/20 text-indigo-300"
                      }`}
                    >
                      {project.priority}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-400 text-xs">
                    👤 {project.teamLeaderName || "-"}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-colors"
                        onClick={() => handleViewDetails(project)}
                      >
                        {t("viewBtn")}
                      </button>
                      <button
                        className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-xs font-medium transition-colors"
                        onClick={() => handleOpenEdit(project)}
                      >
                        {t("editBtn")}
                      </button>
                      <button
                        className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-medium transition-colors"
                        onClick={() => handleOpenDelete(project)}
                      >
                        {t("deleteBtn")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-12 text-slate-500">
                  <div className="text-4xl mb-2">📂</div>
                  <p className="text-sm font-semibold">{t("noProjectsFound")}</p>
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
