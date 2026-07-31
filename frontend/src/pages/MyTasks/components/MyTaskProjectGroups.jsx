import React from "react";

export default function MyTaskProjectGroups({ 
  projectGroups, 
  handleManageClick, 
  language 
}) {
  return (
    <div className="space-y-6">
      {projectGroups.map((group) => (
        <div key={group.name} className="project-group-card glass-panel rounded-3xl p-6 transition-all">
          
          {/* Project Header */}
          <div className="flex items-center justify-between border-b border-slate-700/50 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📁</span>
              <div>
                <h2 className="text-xl font-bold text-white leading-tight">{group.name}</h2>
                <span className="text-xs text-teal-400 mt-1 block">
                  {group.tasks.length} {language === "th" ? "งานที่ได้รับมอบหมาย" : "assigned tasks"}
                </span>
              </div>
            </div>
          </div>

          {/* Tasks Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="py-3 px-4 text-center">{language === "th" ? "ชื่องาน" : "Task Name"}</th>
                  <th className="py-3 px-4 text-center">{language === "th" ? "ประเภท" : "Type"}</th>
                  <th className="py-3 px-4 text-center">{language === "th" ? "ความสำคัญ" : "Priority"}</th>
                  <th className="py-3 px-4 text-center">{language === "th" ? "สถานะ" : "Status"}</th>
                  <th className="py-3 px-4 text-center">{language === "th" ? "กำหนดส่ง" : "Due Date"}</th>
                  <th className="py-3 px-4 text-center">{language === "th" ? "การจัดการ" : "Action"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-sm">
                {group.tasks.map((task) => {
                  const statusColors = {
                    Pending: "bg-amber-500/10 text-amber-500",
                    "In Progress": "bg-sky-500/10 text-sky-400",
                    Reviewing: "bg-purple-500/10 text-purple-400",
                    Completed: "bg-emerald-500/10 text-emerald-400"
                  };

                  const priorityColors = {
                    High: "bg-rose-500/10 text-rose-500",
                    Medium: "bg-orange-500/10 text-orange-500",
                    Low: "bg-slate-500/20 text-slate-400"
                  };

                  const translateStatus = (status) => {
                    if (language === "th") {
                      if (status === "Pending") return "รอดำเนินการ";
                      if (status === "In Progress") return "กำลังทำ";
                      if (status === "Reviewing") return "รอตรวจสอบ";
                      if (status === "Completed") return "เสร็จสิ้น";
                    }
                    return status;
                  };

                  const translatePriority = (priority) => {
                    if (language === "th") {
                      if (priority === "High") return "สูง";
                      if (priority === "Medium") return "ปานกลาง";
                      if (priority === "Low") return "ต่ำ";
                    }
                    return priority;
                  };

                  const formatTaskType = (type) => {
                    if (!type) return "-";
                    if (type === "แปล") return language === "th" ? "แปล" : "Translate";
                    if (type === "ตัดต่อ") return language === "th" ? "ตัดต่อ" : "Video Edit";
                    if (type === "อื่นๆ") return language === "th" ? "อื่นๆ" : "Others";
                    return type;
                  };

                  return (
                    <tr key={task.id} className="hover:bg-slate-800/30 transition-all group">
                      <td className="py-3.5 px-4 text-center font-semibold text-white group-hover:text-teal-300 transition-colors">
                        {task.title}
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-300">
                        {formatTaskType(task.taskType)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${priorityColors[task.priority]}`}>
                          {translatePriority(task.priority)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[task.status]}`}>
                          {translateStatus(task.status)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-400 text-xs">
                        📅 {task.dueDate}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          className="px-4 py-1.5 bg-[#184157] hover:bg-teal-500 hover:text-[#112936] text-slate-200 text-xs font-bold rounded-full transition-all"
                          onClick={() => handleManageClick(task)}
                        >
                          {language === "th" ? "จัดการ" : "Manage"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      ))}
    </div>
  );
}
