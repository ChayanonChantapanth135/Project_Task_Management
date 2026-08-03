import React from "react";
import { useLanguage } from "../../../lib/LanguageContext";

export default function UserReportView({ data }) {
  const { t } = useLanguage();
  const {
    myTasks,
    myCompletedCount,
    myPendingCount,
    myInProgressCount,
    myOverdueCount,
    myCompletionRate,
    myTaskTypeCounts,
  } = data;

  return (
    <div className="space-y-8">
      {/* 4 Personal KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center text-2xl font-bold">
            🎯
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              {t("assignedTasksLabel")}
            </p>
            <h3 className="text-2xl font-black text-white mt-1">{myTasks.length}</h3>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-2xl font-bold">
            ✅
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              {t("completedTasksLabel")}
            </p>
            <h3 className="text-2xl font-black text-emerald-400 mt-1">{myCompletedCount}</h3>
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
            <h3 className="text-2xl font-black text-rose-400 mt-1">{myOverdueCount}</h3>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-2xl font-bold">
            📈
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              {t("overallCompletionRateLabel")}
            </p>
            <h3 className="text-2xl font-black text-indigo-300 mt-1">{myCompletionRate}%</h3>
          </div>
        </div>
      </div>

      {/* Task Type Breakdown & Personal Meter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Personal Rate Ring */}
        <div className="glass-panel rounded-3xl p-8 border border-white/10 flex flex-col justify-between shadow-2xl">
          <div>
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
              <span>⭐</span> {t("personalWorkRateTitle")}
            </h3>
            <p className="text-xs text-slate-400">
              {t("personalWorkRateDesc")}
            </p>
          </div>

          <div className="my-6 text-center">
            <div className="inline-flex items-center justify-center relative w-36 h-36">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.8"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-indigo-400 transition-all duration-1000 ease-out"
                  strokeDasharray={`${myCompletionRate}, 100`}
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black text-white">{myCompletionRate}%</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">{t("completed")}</span>
              </div>
            </div>
          </div>

          <div className="w-full bg-slate-800/80 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-teal-400 h-full rounded-full transition-all duration-700"
              style={{ width: `${myCompletionRate}%` }}
            ></div>
          </div>
        </div>

        {/* Task Type Breakdown Cards */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
              <span>🏷️</span> {t("workloadDistributionTypeTitle")}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              {t("workloadDistributionTypeDesc")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-4">
            <div className="glass-card rounded-2xl p-6 text-center border border-teal-500/20 bg-teal-500/5">
              <span className="text-3xl block mb-2">🌐</span>
              <p className="text-3xl font-black text-teal-300">{myTaskTypeCounts.translate}</p>
              <p className="text-xs text-teal-200 font-bold mt-2 uppercase">{t("taskTypeTranslate")}</p>
            </div>

            <div className="glass-card rounded-2xl p-6 text-center border border-indigo-500/20 bg-indigo-500/5">
              <span className="text-3xl block mb-2">🎬</span>
              <p className="text-3xl font-black text-indigo-300">{myTaskTypeCounts.videoEdit}</p>
              <p className="text-xs text-indigo-200 font-bold mt-2 uppercase">{t("taskTypeVideoEdit")}</p>
            </div>

            <div className="glass-card rounded-2xl p-6 text-center border border-purple-500/20 bg-purple-500/5">
              <span className="text-3xl block mb-2">📌</span>
              <p className="text-3xl font-black text-purple-300">{myTaskTypeCounts.others}</p>
              <p className="text-xs text-purple-200 font-bold mt-2 uppercase">{t("taskTypeOthers")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Tasks Table */}
      <div className="glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
          <span>📋</span> {t("myTaskPerformanceSummaryTitle")}
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          {t("myTaskPerformanceSummaryDesc")}
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-3 px-4">{t("taskNameLabel")}</th>
                <th className="py-3 px-4">{t("taskProjectLabel")}</th>
                <th className="py-3 px-4">{t("taskTypeLabel")}</th>
                <th className="py-3 px-4 text-center">{t("taskStatusLabel")}</th>
                <th className="py-3 px-4 text-center">{t("taskDueDateLabel")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-sm">
              {myTasks.length > 0 ? (
                myTasks.map((tItem) => (
                  <tr key={tItem.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">{tItem.title}</td>
                    <td className="py-3.5 px-4 text-slate-300">{tItem.projectName}</td>
                    <td className="py-3.5 px-4 text-teal-300 font-bold">{tItem.taskType || "-"}</td>
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
                    {t("noAssignedTasksText")}
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
