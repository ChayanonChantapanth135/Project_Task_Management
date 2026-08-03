import React from "react";
import { useLanguage } from "../../../lib/LanguageContext";

export default function TeamLeaderReportView({ data }) {
  const { t } = useLanguage();
  const { tlProjects, tlTasks, tlCompletionRate, tlOverdueCount } = data;

  const activeTlTasks = tlTasks.filter((t) => (t.status || "").toLowerCase() !== "completed");

  return (
    <div className="space-y-8">
      {/* 4 Team Leader KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center text-2xl font-bold">
            🧢
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              {t("projectsTitle")}
            </p>
            <h3 className="text-2xl font-black text-white mt-1">{tlProjects.length}</h3>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-2xl font-bold">
            📝
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              {t("totalTasks")}
            </p>
            <h3 className="text-2xl font-black text-white mt-1">{tlTasks.length}</h3>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-300 flex items-center justify-center text-2xl font-bold">
            ⚠️
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              {t("overdueTasks")}
            </p>
            <h3 className="text-2xl font-black text-rose-400 mt-1">{tlOverdueCount}</h3>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-2xl font-bold">
            📈
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              {t("overallCompletionRateLabel")}
            </p>
            <h3 className="text-2xl font-black text-emerald-400 mt-1">{tlCompletionRate}%</h3>
          </div>
        </div>
      </div>

      {/* Active Team Tasks Execution List */}
      <div className="glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
          <span>📋</span> {t("activeTeamTasksTitle")}
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          {t("activeTeamTasksDesc")}
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-3 px-4">{t("taskNameLabel")}</th>
                <th className="py-3 px-4">{t("taskProjectLabel")}</th>
                <th className="py-3 px-4">{t("taskAssigneeLabel")}</th>
                <th className="py-3 px-4 text-center">{t("taskStatusLabel")}</th>
                <th className="py-3 px-4 text-center">{t("taskDueDateLabel")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-sm">
              {activeTlTasks.length > 0 ? (
                activeTlTasks.map((tItem) => (
                  <tr key={tItem.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">{tItem.title}</td>
                    <td className="py-3.5 px-4 text-slate-300">{tItem.projectName}</td>
                    <td className="py-3.5 px-4 text-teal-300 font-bold">{tItem.assigned_to_name || "-"}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-xs font-bold text-slate-300">
                        {tItem.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-400 text-xs">
                      📅 {tItem.due_date ? tItem.due_date.split("T")[0] : "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-400 text-sm">
                    {t("noActiveTeamTasksText")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
