import React from "react";
import { useLanguage } from "../../../lib/LanguageContext";

export default function UserReportView({ data }) {
  const { language } = useLanguage();
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
              {language === "th" ? "งานที่ได้รับมอบหมาย" : "Assigned Tasks"}
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
              {language === "th" ? "งานที่ทำเสร็จแล้ว" : "Completed Tasks"}
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
              {language === "th" ? "งานเกินกำหนด" : "Overdue Tasks"}
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
              {language === "th" ? "อัตราการส่งงานตรงเวลา" : "Completion Rate"}
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
              <span>⭐</span> {language === "th" ? "ประสิทธิภาพการส่งงานส่วนบุคคล" : "Personal Work Rate"}
            </h3>
            <p className="text-xs text-slate-400">
              {language === "th"
                ? "สัดส่วนงานที่ท่านทำสำเร็จเปรียบเทียบกับภารกิจทั้งหมด"
                : "Ratio of your completed tasks against total assigned tasks"}
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
                <span className="text-[10px] text-slate-400 font-bold uppercase">{language === "th" ? "สำเร็จ" : "Done"}</span>
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
              <span>🏷️</span> {language === "th" ? "สัดส่วนจำแนกตามประเภทงาน" : "Workload Distribution by Type"}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              {language === "th"
                ? "แจกแจงปริมาณงานตามประเภทกิจกรรม เช่น งานแปล และ งานตัดต่อ"
                : "Task count categorized by task execution domain"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-4">
            <div className="glass-card rounded-2xl p-6 text-center border border-teal-500/20 bg-teal-500/5">
              <span className="text-3xl block mb-2">🌐</span>
              <p className="text-3xl font-black text-teal-300">{myTaskTypeCounts.translate}</p>
              <p className="text-xs text-teal-200 font-bold mt-2 uppercase">{language === "th" ? "งานแปล (Translate)" : "Translate"}</p>
            </div>

            <div className="glass-card rounded-2xl p-6 text-center border border-indigo-500/20 bg-indigo-500/5">
              <span className="text-3xl block mb-2">🎬</span>
              <p className="text-3xl font-black text-indigo-300">{myTaskTypeCounts.videoEdit}</p>
              <p className="text-xs text-indigo-200 font-bold mt-2 uppercase">{language === "th" ? "งานตัดต่อ (Video Edit)" : "Video Edit"}</p>
            </div>

            <div className="glass-card rounded-2xl p-6 text-center border border-purple-500/20 bg-purple-500/5">
              <span className="text-3xl block mb-2">📌</span>
              <p className="text-3xl font-black text-purple-300">{myTaskTypeCounts.others}</p>
              <p className="text-xs text-purple-200 font-bold mt-2 uppercase">{language === "th" ? "งานอื่นๆ (Others)" : "Others"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Tasks Table */}
      <div className="glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
          <span>📋</span> {language === "th" ? "สรุปภารกิจของฉัน" : "My Task Performance Summary"}
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          {language === "th"
            ? "ตารางสรุปรายการงานทั้งหมดที่ท่านรับผิดชอบพร้อมสถานะและกำหนดส่ง"
            : "Detailed list of all your assigned tasks with execution status"}
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-3 px-4">{language === "th" ? "ชื่องาน" : "Task Name"}</th>
                <th className="py-3 px-4">{language === "th" ? "โครงการ" : "Project"}</th>
                <th className="py-3 px-4">{language === "th" ? "ประเภท" : "Type"}</th>
                <th className="py-3 px-4 text-center">{language === "th" ? "สถานะ" : "Status"}</th>
                <th className="py-3 px-4 text-center">{language === "th" ? "กำหนดส่ง" : "Due Date"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-sm">
              {myTasks.length > 0 ? (
                myTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">{t.title}</td>
                    <td className="py-3.5 px-4 text-slate-300">{t.projectName}</td>
                    <td className="py-3.5 px-4 text-teal-300 font-bold">{t.taskType || "-"}</td>
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
                    {language === "th" ? "ไม่มีภารกิจในขณะนี้" : "No assigned tasks."}
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
