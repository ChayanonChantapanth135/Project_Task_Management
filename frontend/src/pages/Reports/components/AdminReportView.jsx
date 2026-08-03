import React from "react";
import { useLanguage } from "../../../lib/LanguageContext";

export default function AdminReportView({ data }) {
  const { t } = useLanguage();
  const {
    totalProjects,
    totalTasks,
    totalUsers,
    overallCompletionRate,
    projectStatusCounts,
    userWorkloadList,
    projects,
  } = data;

  return (
    <div className="space-y-8">
      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel rounded-3xl p-6 flex items-center gap-4 border border-white/10 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center text-2xl font-bold">
            📁
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              {t("allProjects")}
            </p>
            <h3 className="text-2xl font-black text-white mt-1">{totalProjects}</h3>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 flex items-center gap-4 border border-white/10 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-2xl font-bold">
            ⏱️
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              {t("totalTasks")}
            </p>
            <h3 className="text-2xl font-black text-white mt-1">{totalTasks}</h3>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 flex items-center gap-4 border border-white/10 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center text-2xl font-bold">
            👥
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              {t("totalActiveUsers")}
            </p>
            <h3 className="text-2xl font-black text-white mt-1">{totalUsers}</h3>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 flex items-center gap-4 border border-white/10 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-2xl font-bold">
            📈
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              {t("overallCompletionRateLabel")}
            </p>
            <h3 className="text-2xl font-black text-emerald-400 mt-1">
              {overallCompletionRate}%
            </h3>
          </div>
        </div>
      </div>

      {/* System Progress & Project Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Overall Completion Meter */}
        <div className="glass-panel rounded-3xl p-8 border border-white/10 flex flex-col justify-between shadow-2xl">
          <div>
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
              <span>🎯</span> {t("systemDeliveryEfficiency")}
            </h3>
            <p className="text-xs text-slate-400">
              {t("systemDeliveryDesc")}
            </p>
          </div>

          <div className="my-8 text-center">
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
                  className="text-emerald-400 transition-all duration-1000 ease-out"
                  strokeDasharray={`${overallCompletionRate}, 100`}
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black text-white">{overallCompletionRate}%</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">{t("completed")}</span>
              </div>
            </div>
          </div>

          <div className="w-full bg-slate-800/80 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-teal-400 to-emerald-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${overallCompletionRate}%` }}
            ></div>
          </div>
        </div>

        {/* Project Status Breakdown Grid */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
              <span>📊</span> {t("projectStatusBreakdownTitle")}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              {t("projectStatusBreakdownDesc")}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="glass-card rounded-2xl p-5 text-center border border-white/5">
              <span className="text-2xl block mb-2">⏳</span>
              <p className="text-2xl font-black text-slate-300">{projectStatusCounts.pending}</p>
              <p className="text-xs text-slate-400 font-bold mt-1 uppercase">{t("pending")}</p>
            </div>
            <div className="glass-card rounded-2xl p-5 text-center border border-indigo-500/20 bg-indigo-500/5">
              <span className="text-2xl block mb-2">⚙️</span>
              <p className="text-2xl font-black text-indigo-400">{projectStatusCounts.inProgress}</p>
              <p className="text-xs text-indigo-300 font-bold mt-1 uppercase">{t("inProgress")}</p>
            </div>
            <div className="glass-card rounded-2xl p-5 text-center border border-amber-500/20 bg-amber-500/5">
              <span className="text-2xl block mb-2">🔍</span>
              <p className="text-2xl font-black text-amber-400">{projectStatusCounts.review}</p>
              <p className="text-xs text-amber-300 font-bold mt-1 uppercase">{t("reviewing")}</p>
            </div>
            <div className="glass-card rounded-2xl p-5 text-center border border-emerald-500/20 bg-emerald-500/5">
              <span className="text-2xl block mb-2">✅</span>
              <p className="text-2xl font-black text-emerald-400">{projectStatusCounts.completed}</p>
              <p className="text-xs text-emerald-300 font-bold mt-1 uppercase">{t("completed")}</p>
            </div>
          </div>

          {/* Project Health Progress List */}
          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
            {projects.slice(0, 5).map((p) => (
              <div key={p.id} className="glass-card rounded-xl p-3 flex items-center justify-between">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-white truncate">{p.name}</span>
                    <span className="text-xs font-bold text-teal-400">{p.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-teal-500 h-2 rounded-full transition-all"
                      style={{ width: `${p.progress || 0}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold whitespace-nowrap">
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Workload Breakdown Table */}
      <div className="glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
          <span>👥</span> {t("userWorkloadMatrixTitle")}
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          {t("userWorkloadMatrixDesc")}
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-3 px-4">{t("colUser")}</th>
                <th className="py-3 px-4">{t("colRole")}</th>
                <th className="py-3 px-4 text-center">{t("assignedTasksLabel")}</th>
                <th className="py-3 px-4 text-center">{t("completedTasksLabel")}</th>
                <th className="py-3 px-4">{t("progressRateLabel")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-sm">
              {userWorkloadList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-white">{item.fullname}</p>
                    <p className="text-xs text-slate-400">{item.email}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
                      {item.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-200">
                    {item.assignedCount}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-emerald-400">
                    {item.completedCount}
                  </td>
                  <td className="py-3.5 px-4 min-w-[160px]">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-slate-800 rounded-full h-2">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all"
                          style={{ width: `${item.rate}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-white w-10 text-right">{item.rate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
