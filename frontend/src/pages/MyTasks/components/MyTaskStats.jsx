import React from "react";

export default function MyTaskStats({ stats, t, language }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      <div className="glass-card rounded-2xl p-4 flex flex-col justify-between">
        <span className="text-slate-400 text-xs font-bold uppercase">
          {language === "th" ? "งานทั้งหมด" : "Total Tasks"}
        </span>
        <span className="text-3xl font-black text-white mt-2">{stats.total}</span>
      </div>
      
      <div className="glass-card rounded-2xl p-4 flex flex-col justify-between border-l-4 border-amber-500!">
        <span className="text-amber-500 text-xs font-bold uppercase">
          {t("pending") || "รอดำเนินการ"}
        </span>
        <span className="text-3xl font-black text-amber-500 mt-2">{stats.pending}</span>
      </div>

      <div className="glass-card rounded-2xl p-4 flex flex-col justify-between border-l-4 border-sky-400!">
        <span className="text-sky-400 text-xs font-bold uppercase">
          {t("inProgress") || "กำลังทำ"}
        </span>
        <span className="text-3xl font-black text-sky-400 mt-2">{stats.inProgress}</span>
      </div>

      <div className="glass-card rounded-2xl p-4 flex flex-col justify-between border-l-4 border-purple-400!">
        <span className="text-purple-400 text-xs font-bold uppercase">
          {t("reviewing") || "รอตรวจสอบ"}
        </span>
        <span className="text-3xl font-black text-purple-400 mt-2">{stats.reviewing}</span>
      </div>

      <div className="glass-card rounded-2xl p-4 flex flex-col justify-between border-l-4 border-emerald-400!">
        <span className="text-emerald-400 text-xs font-bold uppercase">
          {t("completed") || "เสร็จสมบูรณ์"}
        </span>
        <span className="text-3xl font-black text-emerald-400 mt-2">{stats.completed}</span>
      </div>
    </div>
  );
}
