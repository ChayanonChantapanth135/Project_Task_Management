import React from "react";
import { useLanguage } from "../../../lib/LanguageContext";
import { formatDate } from "../../../lib/dateUtils";

/* ── Reusable KPI Card ── */
function KpiCard({ icon, iconGradient, label, value, valueColor = "text-white", accentColor }) {
  return (
    <div className="group relative rounded-3xl p-6 transition-all duration-500 hover:-translate-y-1"
      style={{
        background: "rgba(22,53,71,0.6)",
        backdropFilter: "blur(16px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
      }}
    >
      <div className="absolute top-0 left-6 right-6 h-[2px] rounded-full opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ background: accentColor }}
      />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: iconGradient }}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider truncate">{label}</p>
          <h3 className={`text-2xl font-black mt-0.5 ${valueColor}`}>{value}</h3>
        </div>
      </div>
    </div>
  );
}

/* ── Status Pill ── */
function StatusPill({ status }) {
  const s = (status || "").toLowerCase();
  let bg = "rgba(100,116,139,0.2)"; let color = "#94a3b8"; let dot = "#94a3b8";
  if (s === "completed") { bg = "rgba(16,185,129,0.15)"; color = "#34d399"; dot = "#10b981"; }
  else if (s === "in progress" || s === "in_progress") { bg = "rgba(99,102,241,0.15)"; color = "#818cf8"; dot = "#6366f1"; }
  else if (s === "review" || s === "reviewing") { bg = "rgba(245,158,11,0.15)"; color = "#fbbf24"; dot = "#f59e0b"; }
  else if (s === "pending") { bg = "rgba(100,116,139,0.15)"; color = "#cbd5e1"; dot = "#94a3b8"; }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold" style={{ background: bg, color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: dot }} />
      {status}
    </span>
  );
}

/* ── Priority Badge ── */
function PriorityBadge({ priority }) {
  const p = (priority || "").toLowerCase();
  let bg = "rgba(100,116,139,0.15)"; let color = "#94a3b8";
  if (p === "high" || p === "สูง") { bg = "rgba(239,68,68,0.15)"; color = "#f87171"; }
  else if (p === "medium" || p === "ปานกลาง") { bg = "rgba(245,158,11,0.15)"; color = "#fbbf24"; }
  else if (p === "low" || p === "ต่ำ") { bg = "rgba(34,211,238,0.15)"; color = "#22d3ee"; }
  return (
    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase" style={{ background: bg, color }}>
      {priority || "-"}
    </span>
  );
}

export default function TeamLeaderReportView({ data }) {
  const { t, language } = useLanguage();
  const { tlProjects, tlTasks, tlCompletionRate, tlOverdueCount } = data;
  const activeTlTasks = tlTasks.filter((t) => (t.status || "").toLowerCase() !== "completed");

  return (
    <div className="space-y-8">
      {/* ── 4 KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          icon={<svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>}
          iconGradient="linear-gradient(135deg, #0d9488, #14b8a6)"
          label={t("projectsTitle")}
          value={tlProjects.length}
          accentColor="linear-gradient(90deg, #14b8a6, #2dd4bf)"
        />
        <KpiCard
          icon={<svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>}
          iconGradient="linear-gradient(135deg, #4f46e5, #6366f1)"
          label={t("totalTasks")}
          value={tlTasks.length}
          accentColor="linear-gradient(90deg, #6366f1, #818cf8)"
        />
        <KpiCard
          icon={<svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>}
          iconGradient="linear-gradient(135deg, #dc2626, #ef4444)"
          label={t("overdueTasks")}
          value={tlOverdueCount}
          valueColor="text-rose-400"
          accentColor="linear-gradient(90deg, #ef4444, #f87171)"
        />
        <KpiCard
          icon={<svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>}
          iconGradient="linear-gradient(135deg, #059669, #10b981)"
          label={t("overallCompletionRateLabel")}
          value={`${tlCompletionRate}%`}
          valueColor="text-emerald-400"
          accentColor="linear-gradient(90deg, #10b981, #34d399)"
        />
      </div>

      {/* ── Active Team Tasks Table ── */}
      <div className="rounded-3xl p-8"
        style={{
          background: "rgba(22,53,71,0.5)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 16px 48px rgba(0,0,0,0.2)",
        }}
      >
        <div className="mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
              style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))" }}
            >
              <svg className="w-4 h-4 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </span>
            {t("activeTeamTasksTitle")}
          </h3>
          <p className="text-xs text-slate-400 mt-1 ml-11">{t("activeTeamTasksDesc")}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] text-slate-500 uppercase tracking-wider"
                style={{ borderBottom: "1px solid rgba(51,65,85,0.4)" }}
              >
                <th className="py-3 px-4 font-bold">{t("taskNameLabel")}</th>
                <th className="py-3 px-4 font-bold">{t("taskProjectLabel")}</th>
                <th className="py-3 px-4 font-bold">{t("taskAssigneeLabel")}</th>
                <th className="py-3 px-4 font-bold text-center">{t("taskStatusLabel")}</th>
                <th className="py-3 px-4 font-bold text-center">{t("taskDueDateLabel")}</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {activeTlTasks.length > 0 ? (
                activeTlTasks.map((tItem) => {
                  const isOverdue = (() => {
                    const s = (tItem.status || "").toLowerCase();
                    if (s === "completed") return false;
                    const due = tItem.due_date || tItem.dueDate;
                    if (!due) return false;
                    const d = new Date(due); d.setHours(0,0,0,0);
                    const today = new Date(); today.setHours(0,0,0,0);
                    return d < today;
                  })();

                  return (
                    <tr key={tItem.id}
                      className="transition-all duration-300 hover:bg-white/[0.03]"
                      style={{ borderBottom: "1px solid rgba(51,65,85,0.15)" }}
                    >
                      <td className="py-3.5 px-4 font-semibold text-white">{tItem.title}</td>
                      <td className="py-3.5 px-4 text-slate-400 text-xs">{tItem.projectName}</td>
                      <td className="py-3.5 px-4">
                        <span className="text-teal-300 font-bold text-xs">{tItem.assigned_to_name || "-"}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <StatusPill status={tItem.status} />
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`text-xs font-bold ${isOverdue ? "text-rose-400" : "text-slate-400"}`}>
                          {formatDate(tItem.due_date || tItem.dueDate, language)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-slate-400 text-sm">
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
