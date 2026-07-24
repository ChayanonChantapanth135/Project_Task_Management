import React from "react";

const TaskStats = ({ stats, language, t }) => {
  const statItems = [
    {
      label: language === "th" ? "งานทั้งหมด" : "Total",
      value: stats.total,
      color: "text-blue-400",
    },
    {
      label: t("pending") || "รอดำเนินการ",
      value: stats.pending,
      color: "text-slate-400",
    },
    {
      label: t("inProgress") || "กำลังทำ",
      value: stats.inProgress,
      color: "text-indigo-400",
    },
    {
      label: t("reviewing") || "รอตรวจสอบ",
      value: stats.reviewing,
      color: "text-amber-400",
    },
    {
      label: t("completed") || "เสร็จสิ้น",
      value: stats.completed,
      color: "text-emerald-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      {statItems.map((stat, idx) => (
        <div
          key={idx}
          className="glass-card rounded-2xl p-4 text-center border border-white/5 bg-white/5 backdrop-blur-md"
        >
          <span className={`text-2xl md:text-3xl font-black ${stat.color}`}>
            {stat.value}
          </span>
          <p className="text-xs font-semibold text-slate-400 mt-1">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
};

export default TaskStats;
