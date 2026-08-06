import React from "react";
import { Link } from "react-router-dom";

/**
 * คอมโพเนนต์การ์ดสถิติ (StatCard Component) - Redesigned Glassmorphic StatCard
 */
const StatCard = ({ title, value, subtitle, link, path, icon, glowColor = "bg-indigo-500/10 group-hover:bg-indigo-500/20" }) => {
  return (
    <div className="glass-card rounded-2xl p-6 text-white relative overflow-hidden group">
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full filter blur-xl transition-all pointer-events-none ${glowColor}`}></div>
      
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{title}</p>
          <p className="text-4xl font-black gradient-text tracking-tight mt-1">{value}</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
      
      <div className="mt-5 pt-3 border-t border-white/5">
        {subtitle ? (
          <p className="text-xs text-slate-400 font-medium">{subtitle}</p>
        ) : (
          <Link
            to={path}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-bold no-underline inline-flex items-center gap-1.5 transition-colors"
          >
            <span>&rarr;</span> {typeof link === "string" ? link.replace(/^[←\->\s]+|[←\->\s]+$/g, "") : link}
          </Link>
        )}
      </div>
    </div>
  );
};

export default StatCard;
