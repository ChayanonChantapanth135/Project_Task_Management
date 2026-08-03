import React from "react";
import { useLanguage } from "../../../lib/LanguageContext";

export default function ManagerReportView({ data }) {
  const { t } = useLanguage();
  const { managedProjects, managedTasks, managerCompletionRate } = data;

  const onTrackCount = managedProjects.filter((p) => (p.status || "").toLowerCase() !== "delayed").length;

  return (
    <div className="space-y-8">
      {/* 4 Manager KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center text-2xl font-bold">
            📂
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              {t("projectsTitle")}
            </p>
            <h3 className="text-2xl font-black text-white mt-1">{managedProjects.length}</h3>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-2xl font-bold">
            📋
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              {t("totalTasks")}
            </p>
            <h3 className="text-2xl font-black text-white mt-1">{managedTasks.length}</h3>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-2xl font-bold">
            ⚡
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              {t("onTrackProjectsLabel")}
            </p>
            <h3 className="text-2xl font-black text-emerald-400 mt-1">{onTrackCount}</h3>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-2xl font-bold">
            📈
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              {t("overallCompletionRateLabel")}
            </p>
            <h3 className="text-2xl font-black text-cyan-300 mt-1">{managerCompletionRate}%</h3>
          </div>
        </div>
      </div>

      {/* Managed Projects Health & Progress List */}
      <div className="glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
          <span>🎯</span> {t("managedProjectsProgressTitle")}
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          {t("managedProjectsProgressDesc")}
        </p>

        <div className="space-y-4">
          {managedProjects.length > 0 ? (
            managedProjects.map((p) => (
              <div key={p.id} className="glass-card rounded-2xl p-5 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="text-base font-bold text-white">{p.name}</h4>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">
                      {p.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {t("colTeamLeader")}: <strong className="text-slate-200">{p.teamLeaderName || "-"}</strong> | {t("endDateLabel")}: {p.end_date ? p.end_date.split("T")[0] : "-"}
                  </p>
                </div>

                <div className="w-full md:w-64">
                  <div className="flex justify-between items-center text-xs font-bold mb-1">
                    <span className="text-slate-300">{t("colProgress")}</span>
                    <span className="text-teal-400">{p.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-teal-400 to-indigo-500 h-2.5 rounded-full transition-all"
                      style={{ width: `${p.progress || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400 text-sm">
              {t("noManagedProjectsText")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
