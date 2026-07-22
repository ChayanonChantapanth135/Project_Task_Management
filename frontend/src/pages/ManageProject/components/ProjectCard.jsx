import React from "react";

const ProjectCard = ({
  project,
  t,
  handleViewDetails,
  handleOpenEdit,
  handleOpenDelete
}) => {
  const statusLower = project.status?.toLowerCase();
  let badgeClass = "bg-amber-500/20 text-amber-300";
  let statusText = t("statusPending");
  if (statusLower === "completed") {
    badgeClass = "bg-emerald-500/20 text-emerald-300";
    statusText = t("statusCompleted");
  } else if (statusLower === "in_progress" || statusLower === "in progress") {
    badgeClass = "bg-indigo-500/20 text-indigo-300";
    statusText = t("statusInProgress");
  } else if (statusLower === "review" || statusLower === "reviewing") {
    badgeClass = "bg-pink-500/20 text-pink-300";
    statusText = t("statusReview");
  }

  return (
    <div className="glass-card rounded-3xl p-6 flex flex-col justify-between h-full relative overflow-hidden group">
      <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-indigo-500/10 rounded-full filter blur-2xl group-hover:bg-indigo-500/20 transition-all pointer-events-none"></div>

      <div>
        {/* Status & Priority */}
        <div className="flex justify-between items-center mb-4">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${badgeClass}`}>
            ● {statusText}
          </span>
          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
            project.priority === "High"
              ? "bg-rose-500/20 text-rose-300"
              : project.priority === "Medium"
                ? "bg-amber-500/20 text-amber-300"
                : "bg-indigo-500/20 text-indigo-300"
          }`}>
            {project.priority}
          </span>
        </div>

        {/* Project Title */}
        <h3 className="text-xl font-bold text-white mb-4 tracking-tight">{project.name}</h3>

        {/* Dates & Team Leader */}
        <div className="space-y-2 mb-6 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>⏱️ {t("endDateLabel")}:</span>
            <span className="font-semibold text-slate-200">
              {project.end_date ? new Date(project.end_date).toLocaleDateString() : "-"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>👤 {t("colTeamLeader")}:</span>
            <span className="font-semibold text-slate-200">
              {project.teamLeaderName || "-"}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar & Actions */}
      <div>
        <div className="mb-6">
          <div className="flex justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Progress</span>
            <span className="text-white">{project.progress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full transition-all duration-300"
              style={{ width: `${project.progress}%` }}
            ></div>
          </div>
        </div>

        <div className="flex justify-end items-center gap-2 pt-4 border-t border-white/5">
          <button className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-colors" onClick={() => handleViewDetails(project)}>
            {t("viewBtn")}
          </button>
          <button className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-xs font-medium transition-colors" onClick={() => handleOpenEdit(project)}>
            {t("editBtn")}
          </button>
          <button className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-medium transition-colors" onClick={() => handleOpenDelete(project)}>
            {t("deleteBtn")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
