import React from "react";
import { Link } from "react-router-dom";

/**
 * คอมโพเนนต์แสดงบันทึกกิจกรรมล่าสุดบนแดชบอร์ด (RecentActivity Component) - Glassmorphism Theme
 */
const RecentActivity = ({ t, recentActivities }) => {
  return (
    <div className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-2xl">
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <h3 className="text-xl font-bold text-white">{t("recentActivity")}</h3>
          </div>
          <Link
            to="/Activity"
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-slate-300 no-underline"
          >
            {t("viewAll")} &rarr;
          </Link>
        </div>

        <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1">
          {recentActivities.map((activity, index) => (
            <div
              key={index}
              className="glass-card rounded-2xl p-4 flex justify-between items-start transition-all"
            >
              <div>
                <p className="font-bold text-white text-sm">
                  {activity.fullname || activity.username || activity.user || "System"}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{t(activity.action)}</p>
              </div>
              <span className="text-xs text-slate-500 font-medium whitespace-nowrap ml-2">
                {activity.created_at
                  ? new Date(activity.created_at).toLocaleString()
                  : activity.time || ""}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;
