import React from "react";

const TaskFilters = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  setCurrentPage,
  language,
  t,
}) => {
  return (
    <div className="glass-panel rounded-3xl p-6 mb-8 border border-white/5 bg-white/5 backdrop-blur-lg shadow-2xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ค้นหา */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            {language === "th" ? "ค้นหางาน" : "Search Task"}
          </label>
          <input
            type="text"
            placeholder={
              t("searchPlaceholder") ||
              "ค้นหาตามชื่องาน, โปรเจกต์, ผู้รับผิดชอบ..."
            }
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[#1e293b]/50  rounded-2xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all text-sm"
          />
        </div>

        {/* กรองสถานะ */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            {language === "th" ? "สถานะ" : "Status"}
          </label>
          <div className="relative w-full">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#1e293b]/50 rounded-2xl py-3 pl-4 pr-10 text-white focus:outline-none focus:border-teal-500 transition-all text-sm appearance-none"
            >
              <option value="All" className="bg-[#153648]">
                {language === "th" ? "ทุกสถานะ" : "All Statuses"}
              </option>
              <option value="Pending" className="bg-[#153648]">
                {t("pending") || "Pending"}
              </option>
              <option value="In Progress" className="bg-[#153648]">
                {t("inProgress") || "In Progress"}
              </option>
              <option value="Reviewing" className="bg-[#153648]">
                {t("reviewing") || "Reviewing"}
              </option>
              <option value="Completed" className="bg-[#153648]">
                {t("completed") || "Completed"}
              </option>
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>

        {/* กรองความสำคัญ */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            {language === "th" ? "ความสำคัญ" : "Priority"}
          </label>
          <div className="relative w-full">
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#1e293b]/50 rounded-2xl py-3 pl-4 pr-10 text-white focus:outline-none focus:border-teal-500 transition-all text-sm appearance-none"
            >
              <option value="All" className="bg-[#153648]">
                {language === "th" ? "ทุกระดับ" : "All Priorities"}
              </option>
              <option value="High" className="bg-[#153648]">
                {language === "th" ? "สูง" : "High"}
              </option>
              <option value="Medium" className="bg-[#153648]">
                {language === "th" ? "ปานกลาง" : "Medium"}
              </option>
              <option value="Low" className="bg-[#153648]">
                {language === "th" ? "ต่ำ" : "Low"}
              </option>
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskFilters;
