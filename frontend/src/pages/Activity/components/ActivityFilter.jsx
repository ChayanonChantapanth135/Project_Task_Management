import React from "react";

const ActivityFilter = ({
  searchQuery,
  setSearchQuery,
  actionFilter,
  setActionFilter,
  setCurrentPage,
  t,
}) => {
  return (
    <div className="glass-panel rounded-3xl p-5 mb-8 shadow-2xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">
            🔍
          </span>
          <input
            type="search"
            className="w-full bg-slate-800/60 hover:bg-slate-800/80 rounded-2xl py-3 pl-10 pr-4 text-white text-xs font-medium focus:outline-none transition-all placeholder:text-slate-400"
            placeholder={t("searchActivityPlaceholder")}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div>
          <select
            className="w-full bg-slate-800/60 hover:bg-slate-800/80 rounded-2xl py-3 px-4 text-white text-xs font-medium focus:outline-none border-0 transition-all cursor-pointer"
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all" className="bg-slate-900">{t("allActivities")}</option>
            <option value="project" className="bg-slate-900">{t("aboutProjects")}</option>
            <option value="user" className="bg-slate-900">{t("aboutUsers")}</option>
            <option value="system" className="bg-slate-900">{t("aboutSystem")}</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ActivityFilter;
