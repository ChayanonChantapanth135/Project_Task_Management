import React from "react";
import { useLanguage } from "../../../lib/LanguageContext";

export default function TeamLeaderReportView({ data }) {
  const { language } = useLanguage();
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
              {language === "th" ? "โปรเจกต์ที่รับผิดชอบ" : "Team Projects"}
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
              {language === "th" ? "งานทั้งหมดของทีม" : "Total Team Tasks"}
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
              {language === "th" ? "งานเกินกำหนดส่ง" : "Overdue Tasks"}
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
              {language === "th" ? "อัตราความสำเร็จของทีม" : "Team Completion Rate"}
            </p>
            <h3 className="text-2xl font-black text-emerald-400 mt-1">{tlCompletionRate}%</h3>
          </div>
        </div>
      </div>

      {/* Active Team Tasks Execution List */}
      <div className="glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
          <span>📋</span> {language === "th" ? "สถานะการดำเนินงานของทีมที่กำลังทำอยู่" : "Active Team Tasks Execution"}
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          {language === "th"
            ? "การติดตามงานคงค้างและงานที่กำลังดำเนินการของลูกทีม"
            : "Track ongoing and pending tasks assigned to your team members"}
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-3 px-4">{language === "th" ? "ชื่องาน" : "Task Name"}</th>
                <th className="py-3 px-4">{language === "th" ? "โครงการ" : "Project"}</th>
                <th className="py-3 px-4">{language === "th" ? "ผู้รับผิดชอบ" : "Assigned To"}</th>
                <th className="py-3 px-4 text-center">{language === "th" ? "สถานะ" : "Status"}</th>
                <th className="py-3 px-4 text-center">{language === "th" ? "กำหนดส่ง" : "Due Date"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-sm">
              {activeTlTasks.length > 0 ? (
                activeTlTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">{t.title}</td>
                    <td className="py-3.5 px-4 text-slate-300">{t.projectName}</td>
                    <td className="py-3.5 px-4 text-teal-300 font-bold">{t.assigned_to_name || "-"}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-xs font-bold text-slate-300">
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-400 text-xs">
                      📅 {t.due_date ? t.due_date.split("T")[0] : "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-400 text-sm">
                    {language === "th" ? "ไม่มีงานที่กำลังดำเนินการในทีม" : "No active team tasks."}
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
