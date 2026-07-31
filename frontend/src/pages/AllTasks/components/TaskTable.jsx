import React from "react";

const TaskTable = ({
  currentItems,
  language,
  t,
  itemsPerPage,
  setItemsPerPage,
  setCurrentPage,
  onManageClick,
}) => {
  return (
    <div className="glass-panel rounded-3xl p-6 overflow-hidden border-0 bg-white/5 backdrop-blur-lg shadow-2xl mb-6">
      {/* Show entries row */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
          <span>{t("showText") || "Show"}</span>
          <div className="relative">
            <select
              className="bg-slate-900/80 rounded-xl pl-3 pr-8 py-1.5 text-white text-xs focus:outline-none appearance-none font-bold cursor-pointer"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-white">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
          <span>{t("entriesPerPageText") || "Entries"}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-slate-300 text-xs font-bold uppercase tracking-wider">
              <th className="py-4 px-6">{language === "th" ? "ชื่องาน" : "Task Name"}</th>
              <th className="py-4 px-6">{language === "th" ? "โปรเจกต์" : "Project"}</th>
              <th className="py-4 px-6">{language === "th" ? "ผู้รับผิดชอบ" : "Assignee"}</th>
              <th className="py-4 px-6 text-center">{language === "th" ? "ความสำคัญ" : "Priority"}</th>
              <th className="py-4 px-6 text-center">{language === "th" ? "สถานะ" : "Status"}</th>
              <th className="py-4 px-6 text-center">{language === "th" ? "วันส่งมอบ" : "Due Date"}</th>
              <th className="py-4 px-6 text-center">{language === "th" ? "จัดการ" : "Action"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {currentItems.length > 0 ? (
              currentItems.map((task) => (
                <tr key={task.id} className="hover:bg-white/5 transition-colors duration-200">
                  <td className="py-4 px-6 font-semibold text-white">{task.title}</td>
                  <td className="py-4 px-6 text-slate-300">
                    <span className="bg-[#1e293b]/60 px-2.5 py-1 rounded-lg text-xs whitespace-nowrap">
                      {task.project}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-300 whitespace-nowrap">{task.assignee}</td>
                  <td className="py-4 px-6 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                        task.priority === "High"
                          ? "bg-red-500/20 text-red-300"
                          : task.priority === "Medium"
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-blue-500/20 text-blue-300"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                        task.status === "Completed"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : task.status === "In Progress"
                          ? "bg-indigo-500/20 text-indigo-300"
                          : task.status === "Reviewing"
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-slate-500/20 text-slate-300"
                      }`}
                    >
                      {task.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center text-slate-400 font-mono whitespace-nowrap">{task.dueDate}</td>
                  <td className="py-4 px-6 text-center whitespace-nowrap">
                    <button
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white rounded-xl transition-all text-xs"
                      onClick={() => onManageClick(task)}
                    >
                      {language === "th" ? "จัดการ" : "Manage"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="py-8 text-center text-slate-500">
                  {language === "th" ? "ไม่พบข้อมูลงานที่ค้นหา" : "No tasks found matching current filters."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskTable;
