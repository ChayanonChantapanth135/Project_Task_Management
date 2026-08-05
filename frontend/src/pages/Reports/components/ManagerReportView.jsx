import React from "react";
import { useLanguage } from "../../../lib/LanguageContext";

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

export default function ManagerReportView({ data }) {
  const { t } = useLanguage();
  const { managedProjects, managedTasks, managerCompletionRate } = data;
  const onTrackCount = managedProjects.filter((p) => (p.status || "").toLowerCase() !== "delayed").length;

  return (
    <div className="space-y-8">
      {/* ── 4 KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          icon={<svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>}
          iconGradient="linear-gradient(135deg, #0d9488, #14b8a6)"
          label={t("projectsTitle")}
          value={managedProjects.length}
          accentColor="linear-gradient(90deg, #14b8a6, #2dd4bf)"
        />
        <KpiCard
          icon={<svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>}
          iconGradient="linear-gradient(135deg, #4f46e5, #6366f1)"
          label={t("totalTasks")}
          value={managedTasks.length}
          accentColor="linear-gradient(90deg, #6366f1, #818cf8)"
        />
        <KpiCard
          icon={<svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>}
          iconGradient="linear-gradient(135deg, #059669, #10b981)"
          label={t("onTrackProjectsLabel")}
          value={onTrackCount}
          valueColor="text-emerald-400"
          accentColor="linear-gradient(90deg, #10b981, #34d399)"
        />
        <KpiCard
          icon={<svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>}
          iconGradient="linear-gradient(135deg, #0891b2, #06b6d4)"
          label={t("overallCompletionRateLabel")}
          value={`${managerCompletionRate}%`}
          valueColor="text-cyan-300"
          accentColor="linear-gradient(90deg, #06b6d4, #22d3ee)"
        />
      </div>

      {/* ── Project Progress Cards ── */}
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </span>
            {t("managedProjectsProgressTitle")}
          </h3>
          <p className="text-xs text-slate-400 mt-1 ml-11">{t("managedProjectsProgressDesc")}</p>
        </div>

        <div className="space-y-4">
          {managedProjects.length > 0 ? (
            managedProjects.map((p) => (
              <div key={p.id}
                className="rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 hover:bg-white/[0.03]"
                style={{ background: "rgba(15,23,42,0.3)" }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="text-sm font-bold text-white truncate">{p.name}</h4>
                    <StatusPill status={p.status} />
                  </div>
                  <p className="text-xs text-slate-400">
                    {t("colTeamLeader")}:{" "}
                    <strong className="text-slate-300">{p.teamLeaderName || "-"}</strong>
                    <span className="mx-2 text-slate-600">|</span>
                    {t("endDateLabel")}: {p.end_date ? p.end_date.split("T")[0] : "-"}
                  </p>
                </div>

                <div className="w-full md:w-60 shrink-0">
                  <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                    <span className="text-slate-400">{t("colProgress")}</span>
                    <span className="text-teal-400 tabular-nums">{p.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${p.progress || 0}%`,
                        background: `linear-gradient(90deg, #14b8a6, ${(p.progress || 0) > 70 ? "#10b981" : "#6366f1"})`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-slate-400 text-sm">
              {t("noManagedProjectsText")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
