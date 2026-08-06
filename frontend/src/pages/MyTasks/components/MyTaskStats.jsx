import React from "react";

export default function MyTaskStats({ stats, t, language }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      <div className="group relative overflow-hidden glass-card rounded-2xl p-4 flex flex-col justify-between">
        <span className="text-slate-400 text-xs font-bold uppercase">
          {language === "th" ? "งานทั้งหมด" : "Total Tasks"}
        </span>
        <span className="text-3xl font-black text-white mt-2">{stats.total}</span>
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/10 rounded-full filter blur-xl group-hover:bg-indigo-500/20 transition-all pointer-events-none"></div>
      </div>
      
      <div className="group relative overflow-hidden glass-card rounded-2xl p-4 flex flex-col justify-between border-l-4 border-amber-500!">
        <span className="text-amber-500 text-xs font-bold uppercase">
          {t("pending") || "รอดำเนินการ"}
        </span>
        <span className="text-3xl font-black text-amber-500 mt-2">{stats.pending}</span>
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-500/10 rounded-full filter blur-xl group-hover:bg-amber-500/20 transition-all pointer-events-none"></div>
      </div>

      <div className="group relative overflow-hidden glass-card rounded-2xl p-4 flex flex-col justify-between border-l-4 border-sky-400!">
        <span className="text-sky-400 text-xs font-bold uppercase">
          {t("inProgress") || "กำลังทำ"}
        </span>
        <span className="text-3xl font-black text-sky-400 mt-2">{stats.inProgress}</span>
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-sky-500/10 rounded-full filter blur-xl group-hover:bg-sky-500/20 transition-all pointer-events-none"></div>
      </div>

      <div className="group relative overflow-hidden glass-card rounded-2xl p-4 flex flex-col justify-between border-l-4 border-purple-400!">
        <span className="text-purple-400 text-xs font-bold uppercase">
          {t("reviewing") || "รอตรวจสอบ"}
        </span>
        <span className="text-3xl font-black text-purple-400 mt-2">{stats.reviewing}</span>
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-purple-500/10 rounded-full filter blur-xl group-hover:bg-purple-500/20 transition-all pointer-events-none"></div>
      </div>

      <div className="group relative overflow-hidden glass-card rounded-2xl p-4 flex flex-col justify-between border-l-4 border-emerald-400!">
        <span className="text-emerald-400 text-xs font-bold uppercase">
          {t("completed") || "เสร็จสมบูรณ์"}
        </span>
        <span className="text-3xl font-black text-emerald-400 mt-2">{stats.completed}</span>
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/10 rounded-full filter blur-xl group-hover:bg-emerald-500/20 transition-all pointer-events-none"></div>
      </div>
    </div>
  );
}
