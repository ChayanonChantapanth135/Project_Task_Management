import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useLanguage } from "../../lib/LanguageContext";
import { usePersonalTasks } from "./hook/usePersonalTasks";
import TaskBoard from "./components/TaskBoard";

const PersonalTaskPage = () => {
  const { t, language } = useLanguage();
  const {
    data,
    loading,
    handleDragEnd,
    handleAddTask,
    handleEditTask,
    handleDeleteTask,
  } = usePersonalTasks();

  return (
    <div className="min-h-screen flex flex-col bg-[#153648] text-slate-100 font-sans relative">
      <Header />

      {/* Background Static Blobs */}
      <div className="absolute top-10 left-1/4 w-[400px] h-[400px] bg-teal-500/10 rounded-full filter blur-[100px] pointer-events-none -z-0"></div>
      <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-indigo-600/15 rounded-full filter blur-[110px] pointer-events-none -z-0"></div>
      <div className="absolute bottom-10 left-1/3 w-[450px] h-[450px] bg-cyan-600/10 rounded-full filter blur-[120px] pointer-events-none -z-0"></div>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full relative z-10">
        {/* Title Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-white tracking-wide flex items-center gap-3">
              📋 {language === "th" ? "งานส่วนตัวของฉัน" : "Personal Tasks"}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {language === "th"
                ? "จัดการรายการงานส่วนตัวของคุณด้วยระบบ Kanban ลากและวาง"
                : "Manage your personal tasks with drag-and-drop Kanban board"}
            </p>
          </div>

          <button
            onClick={() => handleAddTask("todo")}
            className="px-5 py-2.5 rounded-2xl text-sm font-bold text-white shadow-lg flex items-center gap-2 cursor-pointer bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600"
          >
            <span className="text-lg leading-none">+</span>
            <span>{language === "th" ? "เพิ่ม Task ใหม่" : "Add New Task"}</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-400"></div>
          </div>
        ) : (
          <TaskBoard
            data={data}
            onDragEnd={handleDragEnd}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default PersonalTaskPage;
