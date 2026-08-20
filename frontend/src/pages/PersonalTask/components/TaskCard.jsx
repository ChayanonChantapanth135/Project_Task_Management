import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { useLanguage } from "../../../lib/LanguageContext";

const TaskCard = ({ task, column, index, onEdit, onDelete }) => {
  const { language } = useLanguage();

  if (!task) return null;

  // ฟังก์ชันแปลงวันที่ตามภาษา (ไทย = วัน เดือน พ.ศ. / อังกฤษ = วัน เดือน ค.ศ.)
  const formatTaskDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);

    if (language === "th") {
      // รูปแบบไทย: 20 ส.ค. 2569
      return d.toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } else {
      // รูปแบบสากล/อังกฤษ: 20 Aug 2026
      return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  };

  // ตรวจสอบสถานะวันครบกำหนด (Due Date Urgency)
  const getDateStatus = () => {
    if (!task.task_date || task.is_completed || task.status === "completed") {
      return null;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(task.task_date);
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return "overdue";
    } else if (diffDays <= 1) {
      return "due-soon";
    }
    return "normal";
  };

  // จัดการสีและสไตล์ของป้ายสถานะตามรูปตัวอย่าง (Soft Tinted Pill Style)
  const getStatusBadge = () => {
    const status = (
      task.status || (task.is_completed ? "completed" : column?.id || "todo")
    ).toLowerCase();
    if (
      status.includes("complete") ||
      status === "completed" ||
      task.is_completed
    ) {
      return {
        text: column?.title || "Completed",
        className: "bg-emerald-500/20 text-emerald-300",
      };
    }
    if (
      status.includes("progress") ||
      status === "in-progress" ||
      status === "in_progress"
    ) {
      return {
        text: column?.title || "In Progress",
        className: "bg-amber-500/20 text-amber-300",
      };
    }
    return {
      text: column?.title || "To Do",
      className: "bg-blue-500/20 text-blue-300",
    };
  };

  const dateStatus = getDateStatus();
  const statusBadge = getStatusBadge();

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`p-4 mb-3 rounded-xl select-none group shadow-md ${
            snapshot.isDragging
              ? "bg-[#1e293b] ring-2 ring-teal-400 shadow-2xl"
              : dateStatus === "overdue"
                ? "bg-[#33222a] hover:bg-[#3d2732]"
                : dateStatus === "due-soon"
                  ? "bg-[#352e22] hover:bg-[#3f3729]"
                  : "bg-[#243746] hover:bg-[#2c4254]"
          }`}
          style={{
            ...provided.draggableProps.style,
          }}
        >
          <div className="flex items-start justify-between gap-2 mb-2.5">
            <h4
              className={`text-sm font-medium leading-snug flex-1 ${
                task.is_completed ? "line-through text-slate-400" : "text-white"
              }`}
            >
              {task.title}
            </h4>

            {/* Action Buttons: Edit & Delete */}
            <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                }}
                title={language === "th" ? "แก้ไขงานนี้" : "Edit task"}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-700/60 hover:bg-blue-600/30 text-slate-300 hover:text-blue-400 text-xs transition-colors cursor-pointer"
              >
                ✏️
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task);
                }}
                title={language === "th" ? "ลบงานนี้" : "Delete task"}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-700/60 hover:bg-red-600/30 text-slate-300 hover:text-red-400 text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Status Badge & วันที่กำหนด */}
          <div className="flex items-center justify-between gap-2 mt-2">
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-lg inline-block flex-shrink-0 tracking-wide ${statusBadge.className}`}
            >
              {statusBadge.text}
            </span>

            {/* วันที่กำหนดพร้อมไฮไลท์เตือนตามกำหนดส่ง (ไร้กรอบขาว) */}
            {task.task_date && (
              <div
                className={`text-[11px] font-medium flex items-center gap-1.5 px-2.5 py-1 rounded-md ${
                  dateStatus === "overdue"
                    ? "bg-red-500/25 text-red-300"
                    : dateStatus === "due-soon"
                      ? "bg-amber-500/25 text-amber-300"
                      : "text-slate-400"
                }`}
              >
                <span>
                  {dateStatus === "overdue"
                    ? "⚠️"
                    : dateStatus === "due-soon"
                      ? "⏰"
                      : "📅"}
                </span>
                <span className="whitespace-nowrap font-medium">
                  {formatTaskDate(task.task_date)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default React.memo(TaskCard);
