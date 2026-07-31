import React from "react";

export default function MyTaskFilters({ 
  searchQuery, 
  setSearchQuery, 
  statusFilter, 
  setStatusFilter, 
  t, 
  language 
}) {
  const statuses = ["All", "Pending", "In Progress", "Reviewing", "Completed"];

  return (
    <div className="glass-panel rounded-3xl p-5 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
      <div className="w-full md:w-72 relative">
        <input 
          type="text" 
          placeholder={language === "th" ? "ค้นหาชื่องาน หรือ โปรเจกต์..." : "Search by task or project..."}
          className="w-full bg-[#184157]/70 text-slate-100 rounded-full px-5 py-3 text-sm focus:ring-2 focus:ring-teal-400 transition-all placeholder:text-slate-400"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all whitespace-nowrap ${
              statusFilter === status 
                ? "bg-teal-500 text-[#112936] shadow-lg shadow-teal-500/25" 
                : "bg-[#184157]/50 hover:bg-[#184157] text-slate-300"
            }`}
          >
            {status === "All" 
              ? (language === "th" ? "ทั้งหมด" : "All") 
              : t(status.charAt(0).toLowerCase() + status.slice(1)) || status}
          </button>
        ))}
      </div>
    </div>
  );
}
