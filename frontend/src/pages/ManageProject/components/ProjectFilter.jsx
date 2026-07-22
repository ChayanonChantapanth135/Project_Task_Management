import React from "react";

const ProjectFilter = ({
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  handleOpenCreate,
  t,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
      {/* Search Input */}
      <div className="relative w-full md:w-96">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">
          🔍
        </span>
        <input
          type="text"
          className="w-full bg-slate-800/60 hover:bg-slate-800/80 rounded-2xl py-3 pl-10 pr-4 text-white text-xs font-medium focus:outline-none transition-all placeholder:text-slate-400"
          placeholder={t("searchProjectPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Toolbar Controls */}
      <div className="flex items-center gap-4 w-full md:w-auto justify-end">
        {/* View Switcher Segmented Control */}
        <div className="flex items-center p-1.5 bg-slate-800/60 rounded-full">
          <button
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
              viewMode === "table"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                : "text-slate-400 hover:text-white"
            }`}
            onClick={() => setViewMode("table")}
          >
            📋 {t("tableView")}
          </button>
          <button
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
              viewMode === "board"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                : "text-slate-400 hover:text-white"
            }`}
            onClick={() => setViewMode("board")}
          >
            🗂️ {t("boardView")}
          </button>
        </div>

        {/* Create Button */}
        <button
          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-xs glow-button"
          onClick={handleOpenCreate}
        >
          {t("createProjectBtn")}
        </button>
      </div>
    </div>
  );
};

export default ProjectFilter;
