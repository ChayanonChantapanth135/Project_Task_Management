import React from "react";
import { Draggable } from "@hello-pangea/dnd";

const TaskCard = ({ task, column, index, onEdit, onDelete }) => {
  const columnTitle = column?.title || (task.is_completed ? "COMPLETED" : "TO DO");
  const columnColor = column?.color || (task.is_completed ? "#00b884" : "#007aeb");

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
              : "bg-[#243746] hover:bg-[#2c4254]"
          }`}
          style={{
            ...provided.draggableProps.style,
          }}
        >
          <div className="flex items-start justify-between gap-2 mb-2.5">
            <h4
              className={`text-sm font-medium leading-snug flex-1 ${
                task.is_completed
                  ? "line-through text-slate-400"
                  : "text-white"
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
                title="แก้ไขงานนี้"
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
                title="ลบงานนี้"
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-700/60 hover:bg-red-600/30 text-slate-300 hover:text-red-400 text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Status Badge (สีทึบ ตัวอักษรดำ) */}
          <div className="flex items-center justify-between gap-2 mt-2">
            <span
              className="text-[11px] font-bold tracking-wider px-2.5 py-0.5 rounded-md inline-block uppercase text-slate-900 shadow-sm"
              style={{
                backgroundColor: columnColor,
              }}
            >
              {columnTitle}
            </span>

            {/* วันที่กำหนด */}
            {task.task_date && (
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <span>📅</span>
                <span>
                  {new Date(task.task_date).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
