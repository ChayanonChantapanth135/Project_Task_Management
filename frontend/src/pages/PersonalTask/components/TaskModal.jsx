import React, { useState, useEffect } from "react";
import CustomDateInput from "../../../components/CustomDateInput";
import { useLanguage } from "../../../lib/LanguageContext";

const TaskModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  columnTitle = "",
}) => {
  const { language } = useLanguage();
  const isThai = language === "th";

  const [title, setTitle] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title || "");
        const rawDate = initialData.task_date || "";
        const iso = rawDate.includes("T") ? rawDate.split("T")[0] : rawDate;
        setTaskDate(iso);
      } else {
        setTitle("");
        setTaskDate("");
      }
      setError("");
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError(isThai ? "กรุณากรอกชื่องาน" : "Please enter task title");
      return;
    }
    onSubmit({
      title: title.trim(),
      task_date: taskDate || null,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(15, 23, 42, 0.6)",
      }}
      onClick={onClose}
    >
      <div
        className="bg-white text-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative overflow-visible"
        style={{
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          border: "1px solid rgba(226, 232, 240, 0.8)",
          animation: "modalZoomIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes modalZoomIn {
            from { opacity: 0; transform: scale(0.95) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span>{initialData ? "✏️" : "✨"}</span>
              <span>
                {initialData
                  ? isThai
                    ? "แก้ไข Task"
                    : "Edit Task"
                  : isThai
                  ? `เพิ่ม Task ใหม่ ${columnTitle ? `(${columnTitle})` : ""}`
                  : `Add New Task ${columnTitle ? `(${columnTitle})` : ""}`}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isThai
                ? "กรอกรายละเอียดงานส่วนตัวของคุณ"
                : "Fill in your personal task details"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Error alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 overflow-visible">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {isThai ? "ชื่องาน" : "Task Title"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              placeholder={
                isThai ? "กรอกชื่องานของคุณ..." : "Enter task title..."
              }
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError("");
              }}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {isThai ? "วันที่กำหนด" : "Due Date"}
            </label>
            <CustomDateInput
              value={taskDate}
              onChange={(e) => setTaskDate(e.target.value)}
              name="taskDate"
              placeholder="DD/MM/YYYY"
              placement="top"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 mt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {isThai ? "ยกเลิก" : "Cancel"}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 transition-all cursor-pointer hover:scale-102 active:scale-98"
            >
              {initialData
                ? isThai
                  ? "บันทึกการแก้ไข"
                  : "Save Changes"
                : isThai
                ? "บันทึก"
                : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
