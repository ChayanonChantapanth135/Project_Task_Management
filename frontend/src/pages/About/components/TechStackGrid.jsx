import React from "react";

const TechStackGrid = ({ techStack, t }) => {
  return (
    <div className="glass-panel rounded-3xl p-8 shadow-xl">
      <h2 className="text-xl md:text-2xl font-extrabold text-white mb-6 flex items-center gap-3">
        <span>💻</span> {t("techStackTitle")}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {techStack.map((tech, idx) => (
          <div
            key={idx}
            className="bg-slate-900/70 hover:bg-slate-800 rounded-2xl p-4 text-center border border-slate-700/50 transition-all hover:scale-105"
          >
            <div className="text-2xl mb-2">{tech.icon}</div>
            <div className="text-sm font-bold text-white">{tech.name}</div>
            <div className="text-[10px] text-slate-400 mt-1">{tech.category}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechStackGrid;
