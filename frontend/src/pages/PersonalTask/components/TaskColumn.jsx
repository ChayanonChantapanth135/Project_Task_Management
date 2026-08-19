import React, { useState } from "react";
import { Droppable } from "@hello-pangea/dnd";
import TaskCard from "./TaskCard";

const TaskColumn = ({ column, tasks, onAddTask, onEditTask, onDeleteTask }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="rounded-2xl p-5 flex flex-col bg-[#1c2c38]/90 shadow-xl">
      {/* Header ของคอลัมน์ */}
      <div
        className="flex items-center justify-between mb-4 pb-3 border-b border-gray-700/50"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center gap-2.5">
          <span
            className="w-3.5 h-3.5 rounded-full inline-block shadow-sm"
            style={{ backgroundColor: column.color }}
          ></span>
          <h3 className="text-sm font-bold text-white tracking-wider">
            {column.title}
          </h3>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full text-slate-300 bg-slate-700/50">
            {tasks.length}
          </span>
        </div>

        <button
          title="Add Task"
          onClick={() => onAddTask(column.id)}
          className={`text-slate-400 hover:text-white w-7 h-7 rounded-lg flex items-center justify-center text-lg cursor-pointer bg-slate-700/30 hover:bg-slate-700/60 transition-opacity ${
            isHovered ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        >
          +
        </button>
      </div>

      {/* พื้นที่ Droppable */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-[360px] rounded-xl p-2.5 ${
              snapshot.isDraggingOver
                ? "bg-slate-700/40 ring-2 ring-dashed ring-teal-400/50"
                : "bg-transparent"
            }`}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                column={column}
                index={index}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default TaskColumn;
