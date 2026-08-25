import React from "react";
import { useLanguage } from "../../../lib/LanguageContext";

export default function MyTaskProjectGroups({
  projectGroups,
  handleManageClick,
}) {
  const { t, language } = useLanguage();

  const formatDueDateDisplay = (dateVal) => {
    if (!dateVal || dateVal === "-") return "-";
    try {
      const dateStr = String(dateVal).trim();
      let year, month, day;

      if (dateStr.includes("/")) {
        const parts = dateStr.split("/");
        if (parts.length === 3) {
          day = parseInt(parts[0], 10);
          month = parseInt(parts[1], 10);
          let y = parseInt(parts[2], 10);
          if (y > 2500) y -= 543;
          year = y;
        }
      } else if (dateStr.includes("-")) {
        const parts = dateStr.split("T")[0].split("-");
        if (parts.length === 3) {
          year = parseInt(parts[0], 10);
          month = parseInt(parts[1], 10);
          day = parseInt(parts[2], 10);
        }
      }

      if (!year || !month || !day) {
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return dateVal;
        day = d.getDate();
        month = d.getMonth() + 1;
        year = d.getFullYear();
      }

      const displayYear = language === "th" ? year + 543 : year;
      const formattedDay = String(day).padStart(2, "0");
      const formattedMonth = String(month).padStart(2, "0");

      return `${formattedDay}/${formattedMonth}/${displayYear}`;
    } catch (e) {
      return dateVal;
    }
  };

  return (
    <div className="space-y-6">
      {projectGroups.map((group) => (
        <div
          key={group.name}
          className="project-group-card glass-panel rounded-3xl p-6 transition-all"
        >
          {/* Project Header */}
          <div className="flex items-center justify-between border-b border-slate-700/50 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📁</span>
              <div>
                <h2 className="text-xl font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
                  {group.name}
                </h2>
                <span className="text-xs mt-1 block font-semibold" style={{ color: "var(--brand-color)" }}>
                  {group.tasks.length} {t("assignedTasksText")}
                </span>
              </div>
            </div>
          </div>

          {/* Tasks Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr 
                  className="text-xs uppercase tracking-wider font-bold"
                  style={{
                    color: "var(--text-secondary)",
                    borderBottom: "1px solid var(--border-surface)",
                  }}
                >
                  <th className="py-3 px-4 text-center">
                    {t("taskNameLabel")}
                  </th>
                  <th className="py-3 px-4 text-center">
                    {t("taskTypeLabel")}
                  </th>
                  <th className="py-3 px-4 text-center">
                    {t("taskPriorityLabel")}
                  </th>
                  <th className="py-3 px-4 text-center">
                    {t("taskStatusLabel")}
                  </th>
                  <th className="py-3 px-4 text-center">
                    {t("taskDueDateLabel")}
                  </th>
                  <th className="py-3 px-4 text-center">{t("colManage")}</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm" style={{ borderColor: "var(--border-surface)" }}>
                {group.tasks.map((task) => {
                  const statusColors = {
                    Pending: "badge-status-todo",
                    "In Progress": "badge-status-in-progress",
                    Reviewing: "badge-status-in-review",
                    Completed: "badge-status-completed",
                  };

                  const priorityColors = {
                    High: "bg-red-500/20 text-red-400",
                    Medium: "bg-amber-500/20 text-amber-400",
                    Low: "bg-blue-500/20 text-blue-400",
                  };

                  const translateStatus = (status) => {
                    const s = String(status).toLowerCase();
                    if (s === "pending") return t("pending");
                    if (s === "in progress" || s === "in_progress")
                      return t("inProgress");
                    if (s === "reviewing" || s === "review")
                      return t("reviewing");
                    if (s === "completed") return t("completed");
                    return status;
                  };

                  const translatePriority = (priority) => {
                    const p = String(priority).toLowerCase();
                    if (p === "high") return t("priorityHigh");
                    if (p === "medium") return t("priorityMedium");
                    if (p === "low") return t("priorityLow");
                    return priority;
                  };

                  const formatTaskType = (type) => {
                    if (!type) return "-";
                    if (type === "แปล" || type === "Translate")
                      return t("taskTypeTranslate");
                    if (type === "สตอรี่บอร์ด" || type === "Storyboard & Script")
                      return t("taskTypeStoryboard");
                    if (type === "ออกแบบ" || type === "Graphic & Design")
                      return t("taskTypeGraphicDesign");
                    if (type === "อนิเมชัน" || type === "Animation")
                      return t("taskTypeAnimation");
                    if (type === "ตัดต่อ" || type === "Video Editing" || type === "Video Edit")
                      return t("taskTypeVideoEdit");
                    if (type === "พัฒนาโปรแกรม" || type === "Development")
                      return t("taskTypeDevelopment");
                    if (type === "อื่นๆ" || type === "Others")
                      return t("taskTypeOthers");
                    return type;
                  };

                  const getTaskRowStyle = (tItem) => {
                    if (tItem.status === "Completed") return {};
                    const targetDateStr = tItem.rawDueDate || tItem.dueDate;
                    if (!targetDateStr || targetDateStr === "-") return {};

                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    let dueDate;
                    if (tItem.rawDueDate) {
                      dueDate = new Date(tItem.rawDueDate);
                    } else if (String(targetDateStr).includes("/")) {
                      const [d, m, y] = targetDateStr.split("/");
                      dueDate = new Date(`${y}-${m}-${d}`);
                    } else {
                      dueDate = new Date(targetDateStr);
                    }

                    if (isNaN(dueDate.getTime())) return {};
                    dueDate.setHours(0, 0, 0, 0);

                    const diffTime = dueDate - today;
                    const diffDays = Math.ceil(
                      diffTime / (1000 * 60 * 60 * 24),
                    );

                    if (diffDays < 0) {
                      return { backgroundColor: "rgba(225, 29, 72, 0.12)" };
                    } else if (diffDays <= 3) {
                      return { backgroundColor: "rgba(245, 158, 11, 0.15)" };
                    }
                    return {};
                  };

                  return (
                    <tr
                      key={task.id}
                      className="hover:bg-slate-500/5 transition-all group"
                      style={getTaskRowStyle(task)}
                    >
                      <td className="py-3.5 px-4 text-center font-bold first:rounded-l-xl last:rounded-r-xl" style={{ color: "var(--text-primary)" }}>
                        {task.title}
                      </td>
                      <td className="py-3.5 px-4 text-center font-medium first:rounded-l-xl last:rounded-r-xl" style={{ color: "var(--text-secondary)" }}>
                        {formatTaskType(task.taskType)}
                      </td>
                      <td className="py-3.5 px-4 text-center first:rounded-l-xl last:rounded-r-xl">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${priorityColors[task.priority]}`}
                        >
                          {translatePriority(task.priority)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center first:rounded-l-xl last:rounded-r-xl">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[task.status]}`}
                        >
                          {translateStatus(task.status)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-xs font-semibold first:rounded-l-xl last:rounded-r-xl" style={{ color: "var(--text-secondary)" }}>
                        {formatDueDateDisplay(task.rawDueDate || task.dueDate)}
                      </td>
                      <td className="py-3.5 px-4 text-center first:rounded-l-xl last:rounded-r-xl">
                        <button
                          className="px-4 py-1.5 text-xs font-bold rounded-2xl transition-all cursor-pointer shadow-sm hover:shadow-md"
                          style={{
                            background: "var(--bg-surface-hover)",
                            color: "var(--text-primary)",
                            border: "1px solid var(--border-surface)",
                          }}
                          onClick={() => handleManageClick(task)}
                        >
                          {t("colManage")}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
