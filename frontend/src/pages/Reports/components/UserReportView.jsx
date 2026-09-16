import React, { useState, useEffect, useMemo } from "react";
import { useLanguage } from "../../../lib/LanguageContext";
import { formatDate } from "../../../lib/dateUtils";

/* ── Reusable KPI Card ── */
function KpiCard({ icon, iconGradient, label, value, valueColor = "", accentColor }) {
  return (
    <div className="group relative rounded-3xl p-6 transition-all duration-500 hover:-translate-y-1 shadow-md"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-surface)",
        backdropFilter: "blur(16px)",
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
          <p className="text-[11px] font-bold uppercase tracking-wider truncate" style={{ color: "var(--text-secondary)" }}>{label}</p>
          <h3 className={`text-2xl font-black mt-0.5 ${valueColor}`} style={!valueColor ? { color: "var(--text-primary)" } : {}}>{value}</h3>
        </div>
      </div>
    </div>
  );
}

/* ── Status Pill ── */
function StatusPill({ status }) {
  const { t } = useLanguage();
  const s = (status || "").toLowerCase();
  let bg = "rgba(100,116,139,0.2)"; let color = "#94a3b8"; let dot = "#94a3b8";
  let text = status;
  if (s === "completed") {
    bg = "rgba(16,185,129,0.15)"; color = "#34d399"; dot = "#10b981";
    text = t("statusCompleted") || "เสร็จสิ้น";
  } else if (s === "in progress" || s === "in_progress") {
    bg = "rgba(99,102,241,0.15)"; color = "#818cf8"; dot = "#6366f1";
    text = t("statusInProgress") || "กำลังดำเนินการ";
  } else if (s === "review" || s === "reviewing") {
    bg = "rgba(245,158,11,0.15)"; color = "#fbbf24"; dot = "#f59e0b";
    text = t("statusReview") || "รอตรวจสอบ";
  } else if (s === "pending") {
    bg = "rgba(100,116,139,0.15)"; color = "#cbd5e1"; dot = "#94a3b8";
    text = t("statusPending") || "รอดำเนินการ";
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold" style={{ background: bg, color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: dot }} />
      {text}
    </span>
  );
}

/* ── Completion Ring ── */
function CompletionRing({ rate, gradientFrom = "#6366f1", gradientTo = "#a855f7" }) {
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
            fill="none" stroke="var(--border-surface)" strokeWidth="3.2"
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
          <span className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>{rate}%</span>
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>{t("completed")}</span>
        </div>
      </div>
    </div>
  );
}

export default function UserReportView({ data }) {
  const { t, language } = useLanguage();
  const {
    myTasks = [],
    myCompletedCount = 0,
    myPendingCount = 0,
    myInProgressCount = 0,
    myOverdueCount = 0,
    myCompletionRate = 0,
    myTaskTypeCounts = {},
  } = data || {};

  // Table state similar to ProjectTable & ManageUserPage
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortByPriority, setSortByPriority] = useState("none"); // "none" | "asc" | "desc"
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

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

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let result = [...(myTasks || [])];

    // Search query filter (title or project name)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (task) =>
          (task.title || task.name || "").toLowerCase().includes(q) ||
          (task.projectName || "").toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((task) => {
        const s = (task.status || "").toLowerCase();
        if (statusFilter === "pending") return s === "pending";
        if (statusFilter === "in progress") return s === "in progress" || s === "in_progress";
        if (statusFilter === "review") return s === "review" || s === "reviewing";
        if (statusFilter === "completed") return s === "completed";
        return true;
      });
    }

    // Task Type filter
    if (typeFilter !== "all") {
      result = result.filter((task) => {
        const type = (task.taskType || task.task_type || "").toLowerCase().trim();
        if (typeFilter === "translate") return type === "แปล" || type.includes("translate");
        if (typeFilter === "storyboard") return type === "สตอรี่บอร์ด" || type.includes("storyboard") || type.includes("script") || type === "บท";
        if (typeFilter === "graphicDesign") return type === "ออกแบบ" || type.includes("design") || type.includes("graphic") || type.includes("ภาพ");
        if (typeFilter === "animation") return type === "อนิเมชัน" || type.includes("animat");
        if (typeFilter === "videoEdit") return type === "ตัดต่อ" || type.includes("video") || type.includes("ตัดต่อ");
        if (typeFilter === "development") return type === "พัฒนาโปรแกรม" || type.includes("dev") || type.includes("code") || type.includes("program");
        if (typeFilter === "others") return type === "อื่นๆ" || type.includes("other");
        return true;
      });
    }

    // Sort by priority
    if (sortByPriority !== "none") {
      const priorityOrder = { High: 3, high: 3, Medium: 2, medium: 2, Low: 1, low: 1 };
      result.sort((a, b) => {
        const pA = priorityOrder[a.priority] || 2;
        const pB = priorityOrder[b.priority] || 2;
        return sortByPriority === "asc" ? pA - pB : pB - pA;
      });
    }

    return result;
  }, [myTasks, searchQuery, statusFilter, typeFilter, sortByPriority]);

  const totalEntries = filteredTasks.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage) || 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [totalEntries, entriesPerPage]);

  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const indexOfLastEntry = safeCurrentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredTasks.slice(indexOfFirstEntry, indexOfLastEntry);

  const startEntry = totalEntries === 0 ? 0 : indexOfFirstEntry + 1;
  const endEntry = Math.min(indexOfLastEntry, totalEntries);

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
        <div className="rounded-3xl p-8 flex flex-col justify-between shadow-lg"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-surface)",
            backdropFilter: "blur(16px)",
          }}
        >
          <div className="mb-4">
            <h3 className="text-lg font-bold flex items-center gap-3" style={{ color: "var(--text-primary)" }}>
              <span className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))" }}
              >
                <svg className="w-4 h-4 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                </svg>
              </span>
              {t("personalWorkRateTitle")}
            </h3>
            <p className="text-xs mt-1 ml-11" style={{ color: "var(--text-secondary)" }}>{t("personalWorkRateDesc")}</p>
          </div>

          <CompletionRing rate={myCompletionRate} />

          <div className="w-full rounded-full h-2 overflow-hidden mt-6" style={{ background: "var(--border-surface)" }}>
            <div className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${myCompletionRate}%`,
                background: "linear-gradient(90deg, #6366f1, #a855f7)",
              }}
            />
          </div>
        </div>

        {/* Task Type Breakdown */}
        <div className="lg:col-span-2 rounded-3xl p-8 flex flex-col justify-between shadow-lg"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-surface)",
            backdropFilter: "blur(16px)",
          }}
        >
          <div className="mb-6">
            <h3 className="text-lg font-bold flex items-center gap-3" style={{ color: "var(--text-primary)" }}>
              <span className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))" }}
              >
                <svg className="w-4 h-4 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                </svg>
              </span>
              {t("workloadDistributionTypeTitle")}
            </h3>
            <p className="text-xs mt-1 ml-11" style={{ color: "var(--text-secondary)" }}>{t("workloadDistributionTypeDesc")}</p>
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
                    className="rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between items-center shadow-sm"
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

      {/* ── Personal Tasks Table (Styled like ProjectTable) ── */}
      <div className="glass-panel rounded-3xl p-6 shadow-2xl overflow-hidden mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-3" style={{ color: "var(--text-primary)" }}>
              <span className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))" }}
              >
                <svg className="w-4 h-4 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </span>
              {t("myTaskPerformanceSummaryTitle")}
            </h3>
            <p className="text-xs mt-1 ml-11" style={{ color: "var(--text-secondary)" }}>{t("myTaskPerformanceSummaryDesc")}</p>
          </div>

          {/* Show Entries Dropdown */}
          <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold self-end md:self-auto">
            <span>{t("showText") || "Show"}</span>
            <div className="relative">
              <select
                className="rounded-xl pl-3 pr-8 py-1.5 text-xs focus:outline-none appearance-none font-bold cursor-pointer"
                style={{
                  background: "var(--bg-surface-hover)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-surface)",
                }}
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <div 
                className="absolute inset-y-0 right-2 flex items-center pointer-events-none"
                style={{ color: "var(--text-secondary)" }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <span>{t("entriesPerPageText") || "Entries"}</span>
          </div>
        </div>

        {/* Filters Bar: Search, Status Filter, Task Type Filter */}
        <div
          className="rounded-2xl p-4 mb-6 shadow-sm"
          style={{
            background: "var(--bg-surface-hover)",
            border: "1px solid var(--border-surface)",
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
            {/* Search Input */}
            <div className="lg:col-span-2">
              <label className="block text-[11px] font-bold mb-1.5" style={{ color: "var(--text-secondary)" }}>
                {t("searchWork") || "ค้นหางาน"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full rounded-xl py-2 pl-9 pr-3 text-xs font-medium focus:outline-none transition-all shadow-sm"
                  style={{
                    background: "var(--bg-surface)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-surface)",
                  }}
                  placeholder={t("searchWorkPlaceholder") || "ค้นหาด้วยชื่องาน หรือชื่อโปรเจกต์..."}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-[11px] font-bold mb-1.5" style={{ color: "var(--text-secondary)" }}>
                {t("taskStatusLabel") || "สถานะ"}
              </label>
              <div className="relative">
                <select
                  className="w-full rounded-xl py-2 pl-3 pr-8 text-xs font-medium focus:outline-none transition-all cursor-pointer appearance-none shadow-sm"
                  style={{
                    background: "var(--bg-surface)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-surface)",
                  }}
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">{t("allStatus") || "ทุกสถานะ"}</option>
                  <option value="pending">{t("statusPending") || "รอดำเนินการ"}</option>
                  <option value="in progress">{t("statusInProgress") || "กำลังดำเนินการ"}</option>
                  <option value="review">{t("statusReview") || "รอตรวจสอบ"}</option>
                  <option value="completed">{t("statusCompleted") || "เสร็จสิ้น"}</option>
                </select>
                <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Task Type Filter */}
            <div>
              <label className="block text-[11px] font-bold mb-1.5" style={{ color: "var(--text-secondary)" }}>
                {t("taskTypeLabel") || "ประเภทงาน"}
              </label>
              <div className="relative">
                <select
                  className="w-full rounded-xl py-2 pl-3 pr-8 text-xs font-medium focus:outline-none transition-all cursor-pointer appearance-none shadow-sm"
                  style={{
                    background: "var(--bg-surface)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-surface)",
                  }}
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">{t("allTaskTypes") || "ทุกประเภทงาน"}</option>
                  <option value="translate">{t("taskTypeTranslate") || "แปล"}</option>
                  <option value="storyboard">{t("taskTypeStoryboard") || "สตอรี่บอร์ด"}</option>
                  <option value="graphicDesign">{t("taskTypeGraphicDesign") || "ออกแบบ"}</option>
                  <option value="animation">{t("taskTypeAnimation") || "อนิเมชัน"}</option>
                  <option value="videoEdit">{t("taskTypeVideoEdit") || "ตัดต่อ"}</option>
                  <option value="development">{t("taskTypeDevelopment") || "พัฒนาโปรแกรม"}</option>
                  <option value="others">{t("taskTypeOthers") || "อื่นๆ"}</option>
                </select>
                <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table Component */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-300 font-bold">
                <th className="py-4 px-6">{t("taskNameLabel") || "TASK NAME"}</th>
                <th className="py-4 px-6">{t("taskProjectLabel") || "PROJECT"}</th>
                <th className="py-4 px-6">{t("taskTypeLabel") || "TASK TYPE"}</th>
                <th
                  className="py-4 px-6 text-center cursor-pointer select-none"
                  onClick={() => {
                    if (sortByPriority === "none") setSortByPriority("desc");
                    else if (sortByPriority === "desc") setSortByPriority("asc");
                    else setSortByPriority("none");
                  }}
                >
                  {t("priority") || "PRIORITY"}{" "}
                  <span>
                    {sortByPriority === "none"
                      ? "⇅"
                      : sortByPriority === "desc"
                        ? "↓"
                        : "↑"}
                  </span>
                </th>
                <th className="py-4 px-6 text-center">{t("taskStatusLabel") || "STATUS"}</th>
                <th className="py-4 px-6 text-center">{t("taskDueDateLabel") || "DUE DATE"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-slate-200">
              {currentEntries.length > 0 ? (
                currentEntries.map((tItem) => {
                  const statusLower = (tItem.status || "").toLowerCase();
                  const deadlineStyle = (() => {
                    const due = tItem.due_date || tItem.dueDate;
                    if (!due || statusLower === "completed") return {};
                    const now = new Date();
                    const end = new Date(due);
                    const endDay = new Date(end);
                    endDay.setHours(23, 59, 59, 999);

                    if (now > endDay) {
                      return {
                        backgroundColor: "rgba(244, 63, 94, 0.15)", // light red
                      };
                    }

                    const diffTime = endDay.getTime() - now.getTime();
                    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
                    if (diffTime >= 0 && diffTime <= threeDaysMs) {
                      return {
                        backgroundColor: "rgba(245, 158, 11, 0.15)", // light yellow
                      };
                    }
                    return {};
                  })();

                  const priority = tItem.priority || "Medium";
                  const priorityClass =
                    priority === "High"
                      ? "bg-rose-500/20 text-rose-300"
                      : priority === "Medium"
                      ? "bg-amber-500/20 text-amber-300"
                      : "bg-blue-500/20 text-blue-300";

                  return (
                    <tr key={tItem.id} className="hover:bg-white/5 transition-colors">
                      {/* Task Name */}
                      <td className="py-4 px-6 font-bold text-white rounded-l-2xl whitespace-nowrap" style={deadlineStyle}>
                        {tItem.title || tItem.name || "-"}
                      </td>

                      {/* Project Name */}
                      <td className="py-4 px-6 text-slate-300 whitespace-nowrap" style={deadlineStyle}>
                        {tItem.projectName || "-"}
                      </td>

                      {/* Task Type */}
                      <td className="py-4 px-6 whitespace-nowrap" style={deadlineStyle}>
                        <span
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold"
                          style={{ background: "rgba(20,184,166,0.12)", color: "#0d9488" }}
                        >
                          {formatTaskType(tItem.taskType || tItem.task_type)}
                        </span>
                      </td>

                      {/* Priority Pill */}
                      <td className="py-4 px-6 text-center whitespace-nowrap" style={deadlineStyle}>
                        <span className={`inline-block px-3.5 py-1 rounded-full text-xs font-bold ${priorityClass}`}>
                          {priority}
                        </span>
                      </td>

                      {/* Status Pill */}
                      <td className="py-4 px-6 text-center whitespace-nowrap" style={deadlineStyle}>
                        <StatusPill status={tItem.status} />
                      </td>

                      {/* Due Date */}
                      <td className="py-4 px-6 text-center text-slate-400 font-mono whitespace-nowrap rounded-r-2xl" style={deadlineStyle}>
                        {formatDate(tItem.due_date || tItem.dueDate, language)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-500">
                    <div className="text-4xl mb-2">📋</div>
                    <p className="text-sm font-semibold">{t("noAssignedTasksText") || "No tasks found"}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-white/5 text-xs text-slate-400">
          <span>
            {t("showingText") || "Showing"} {totalEntries === 0 ? 0 : startEntry}{" "}
            {t("toText") || "to"} {endEntry} {t("ofText") || "of"}{" "}
            {totalEntries} {t("entriesText") || "Entries"}
          </span>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold disabled:opacity-40 transition-all cursor-pointer shadow-sm hover:shadow-md"
                style={{
                  background: "var(--bg-surface-hover)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-surface)",
                }}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                {t("prevText") || "Previous"}
              </button>
              <span
                className="px-3.5 py-1.5 font-bold rounded-xl text-xs pagination-badge shadow-md"
                style={{
                  background: "var(--brand-color)",
                  color: "#FFFFFF",
                }}
              >
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold disabled:opacity-40 transition-all cursor-pointer shadow-sm hover:shadow-md"
                style={{
                  background: "var(--bg-surface-hover)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-surface)",
                }}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
              >
                {t("nextText") || "Next"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
