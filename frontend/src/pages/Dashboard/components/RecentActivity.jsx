import React from "react";
import { Link } from "react-router-dom";

/**
 * คอมโพเนนต์แสดงบันทึกกิจกรรมล่าสุดบนแดชบอร์ด (RecentActivity Component)
 * @param {Function} t - ฟังก์ชันช่วยแปลภาษา
 * @param {Array} recentActivities - รายการกิจกรรมล่าสุดที่ดึงมาจาก API
 */
const RecentActivity = ({ t, recentActivities }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 h-full flex flex-col justify-between" style={{ minHeight: "500px" }}>
      <div className="flex flex-col h-full justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">📊</span>
              <h3 className="text-lg font-semibold text-gray-800">
                {t("recentActivity")}
              </h3>
            </div>
            <Link
              to="/Activity"
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-decoration-none text-gray-700"
            >
              {t("viewAll")}
            </Link>
          </div>
          <div className="space-y-1 overflow-y-auto pr-1" style={{ maxHeight: "380px" }}>
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex justify-between items-start py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 px-2 rounded transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {activity.username || activity.user || "System"}
                  </p>
                  <p className="text-sm text-gray-500">{t(activity.action)}</p>
                </div>
                <span className="text-sm text-gray-400 whitespace-nowrap">
                  {activity.created_at
                    ? new Date(activity.created_at).toLocaleString()
                    : activity.time || ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;
