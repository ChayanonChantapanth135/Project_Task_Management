import React from "react";

const TaskPagination = ({ currentPage, setCurrentPage, totalPages, language }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-4">
      <button
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-2xl bg-white/5 border-0 text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
      >
        {language === "th" ? "ก่อนหน้า" : "Previous"}
      </button>
      <span className="text-slate-400 text-sm px-4">
        {language === "th" ? "หน้า" : "Page"} {currentPage} / {totalPages}
      </span>
      <button
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-2xl bg-white/5 border-0 text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
      >
        {language === "th" ? "ถัดไป" : "Next"}
      </button>
    </div>
  );
};

export default TaskPagination;
