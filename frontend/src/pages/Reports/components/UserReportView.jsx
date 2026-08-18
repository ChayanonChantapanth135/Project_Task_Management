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

/* ── Completion Ring ── */
function CompletionRing({ rate, gradientFrom = "#6366f1", gradientTo = "#a855f7", glowColor = "rgba(99,102,241,0.3)" }) {
  const { t } = useLanguage();
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center relative w-40 h-40">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <defs>
            <linearGradient id="user-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradientFrom} />
              <stop offset="100%" stopColor={gradientTo} />
            </linearGradient>
          </defs>
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3.2"
          />
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none" stroke="url(#user-ring-grad)" strokeWidth="3.2"
            strokeLinecap="round" strokeDasharray={`${rate}, 100`}
            style={{
              transition: "stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)",
            }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-3xl font-black text-white">{rate}%</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t("completed")}</span>
        </div>
      </div>
    </div>
  );
}

export default function UserReportView({ data }) {
  const { t, language } = useLanguage();
  const {
    myTasks,
    myCompletedCount,
    myPendingCount,
    myInProgressCount,
    myOverdueCount,
    myCompletionRate,
    myTaskTypeCounts,
  } = data;

  const formatTaskType = (type) => {
    if (!type) return "-";
    if (type === "แปล" || type === "Translate") return t("taskTypeTranslate") || "Translate";
    if (type === "สตอรี่บอร์ด" || type === "Storyboard & Script") return t("taskTypeStoryboard") || "Storyboard & Script";
    if (type === "ออกแบบ" || type === "Graphic & Design") return t("taskTypeGraphicDesign") || "Graphic & Design";
    if (type === "อนิเมชัน" || type === "Animation") return t("taskTypeAnimation") || "Animation";
    if (type === "ตัดต่อ" || type === "Video Editing" || type === "Video Edit") return t("taskTypeVideoEdit") || "Video Edit";
    if (type === "พัฒนาโปรแกรม" || type === "Development") return t("taskTypeDevelopment") || "Development";
    if (type === "อื่นๆ" || type === "Others") return t("taskTypeOthers") || "Others";
    return type;
  };

  return (
    <div className="space-y-8">
      {/* ── 4 Personal KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          icon={<svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
          iconGradient="linear-gradient(135deg, #0d9488, #14b8a6)"
          label={t("assignedTasksLabel")}
          value={myTasks.length}
          accentColor="linear-gradient(90deg, #14b8a6, #2dd4bf)"
        />
        <KpiCard
          icon={<svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
          iconGradient="linear-gradient(135deg, #059669, #10b981)"
          label={t("completedTasksLabel")}
          value={myCompletedCount}
          valueColor="text-emerald-400"
          accentColor="linear-gradient(90deg, #10b981, #34d399)"
        />
        <KpiCard
          icon={<svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>}
          iconGradient="linear-gradient(135deg, #dc2626, #ef4444)"
          label={t("overdueTasks")}
          value={myOverdueCount}
          valueColor="text-rose-400"
          accentColor="linear-gradient(90deg, #ef4444, #f87171)"
        />
        <KpiCard
          icon={<svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>}
          iconGradient="linear-gradient(135deg, #4f46e5, #6366f1)"
          label={t("overallCompletionRateLabel")}
          value={`${myCompletionRate}%`}
          valueColor="text-indigo-300"
          accentColor="linear-gradient(90deg, #6366f1, #a855f7)"
        />
      </div>

      {/* ── Personal Rate Ring + Task Type Breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ring */}
        <div className="rounded-3xl p-8 flex flex-col justify-between"
          style={{ background: "rgba(22,53,71,0.5)", backdropFilter: "blur(16px)", boxShadow: "0 16px 48px rgba(0,0,0,0.2)" }}
        >
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))" }}
              >
                <svg className="w-4 h-4 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                </svg>
              </span>
              {t("personalWorkRateTitle")}
            </h3>
            <p className="text-xs text-slate-400 mt-1 ml-11">{t("personalWorkRateDesc")}</p>
          </div>

          <CompletionRing rate={myCompletionRate} />

          <div className="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden mt-6">
            <div className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${myCompletionRate}%`,
                background: "linear-gradient(90deg, #6366f1, #a855f7)",
              }}
            />
          </div>
        </div>

        {/* Task Type Breakdown */}
        <div className="lg:col-span-2 rounded-3xl p-8 flex flex-col justify-between"
          style={{ background: "rgba(22,53,71,0.5)", backdropFilter: "blur(16px)", boxShadow: "0 16px 48px rgba(0,0,0,0.2)" }}
        >
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))" }}
              >
                <svg className="w-4 h-4 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                </svg>
              </span>
              {t("workloadDistributionTypeTitle")}
            </h3>
            <p className="text-xs text-slate-400 mt-1 ml-11">{t("workloadDistributionTypeDesc")}</p>
          </div>

          {(() => {
            const allTypes = [
              {
                label: t("taskTypeTranslate"),
                count: myTaskTypeCounts.translate || 0,
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/>
                  </svg>
                ),
                color: "#2dd4bf",
                bg: "rgba(20,184,166,0.08)",
                borderColor: "rgba(20,184,166,0.2)",
              },
              {
                label: t("taskTypeStoryboard"),
                count: myTaskTypeCounts.storyboard || 0,
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                ),
                color: "#f59e0b",
                bg: "rgba(245,158,11,0.08)",
                borderColor: "rgba(245,158,11,0.2)",
              },
              {
                label: t("taskTypeGraphicDesign"),
                count: myTaskTypeCounts.graphicDesign || 0,
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                ),
                color: "#ec4899",
                bg: "rgba(236,72,153,0.08)",
                borderColor: "rgba(236,72,153,0.2)",
              },
              {
                label: t("taskTypeAnimation"),
                count: myTaskTypeCounts.animation || 0,
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                color: "#06b6d4",
                bg: "rgba(6,182,212,0.08)",
                borderColor: "rgba(6,182,212,0.2)",
              },
              {
                label: t("taskTypeVideoEdit"),
                count: myTaskTypeCounts.videoEdit || 0,
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                  </svg>
                ),
                color: "#818cf8",
                bg: "rgba(99,102,241,0.08)",
                borderColor: "rgba(99,102,241,0.2)",
              },
              {
                label: t("taskTypeDevelopment"),
                count: myTaskTypeCounts.development || 0,
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                ),
                color: "#10b981",
                bg: "rgba(16,185,129,0.08)",
                borderColor: "rgba(16,185,129,0.2)",
              },
              {
                label: t("taskTypeOthers"),
                count: myTaskTypeCounts.others || 0,
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                  </svg>
                ),
                color: "#c084fc",
                bg: "rgba(168,85,247,0.08)",
                borderColor: "rgba(168,85,247,0.2)",
              },
            ];

            const activeTypes = allTypes.filter((item) => item.count > 0);
            const displayTypes = activeTypes.length > 0 ? activeTypes : allTypes;

            return (
              <div
                className={`grid gap-5 ${
                  displayTypes.length === 1
                    ? "grid-cols-1 max-w-xs mx-auto"
                    : displayTypes.length === 2
                    ? "grid-cols-1 sm:grid-cols-2 max-w-lg mx-auto"
                    : displayTypes.length === 3
                    ? "grid-cols-1 sm:grid-cols-3"
                    : displayTypes.length === 4
                    ? "grid-cols-2 sm:grid-cols-4"
                    : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                }`}
              >
                {displayTypes.map((item, i) => (
                  <div
                    key={i}
                    className="rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between items-center"
                    style={{ background: item.bg, border: `1px solid ${item.borderColor}` }}
                  >
                    <div
                      className="w-12 h-12 rounded-2xl mb-4 flex items-center justify-center"
                      style={{ color: item.color, background: `${item.bg}` }}
                    >
                      {item.icon}
                    </div>
                    <p className="text-3xl font-black" style={{ color: item.color }}>
                      {item.count}
                    </p>
                    <p
                      className="text-xs font-bold uppercase tracking-wider mt-2"
                      style={{ color: item.color, opacity: 0.85 }}
                    >
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>

      {/* ── Personal Tasks Table ── */}
      <div className="rounded-3xl p-8"
        style={{ background: "rgba(22,53,71,0.5)", backdropFilter: "blur(16px)", boxShadow: "0 16px 48px rgba(0,0,0,0.2)" }}
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
            {t("myTaskPerformanceSummaryTitle")}
          </h3>
          <p className="text-xs text-slate-400 mt-1 ml-11">{t("myTaskPerformanceSummaryDesc")}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] text-slate-500 uppercase tracking-wider"
                style={{ borderBottom: "1px solid rgba(51,65,85,0.4)" }}
              >
                <th className="py-3 px-4 font-bold">{t("taskNameLabel")}</th>
                <th className="py-3 px-4 font-bold">{t("taskProjectLabel")}</th>
                <th className="py-3 px-4 font-bold">{t("taskTypeLabel")}</th>
                <th className="py-3 px-4 font-bold text-center">{t("taskStatusLabel")}</th>
                <th className="py-3 px-4 font-bold text-center">{t("taskDueDateLabel")}</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {myTasks.length > 0 ? (
                myTasks.map((tItem) => {
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
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold"
                          style={{ background: "rgba(20,184,166,0.12)", color: "#2dd4bf" }}
                        >
                          {formatTaskType(tItem.taskType || tItem.task_type)}
                        </span>
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
