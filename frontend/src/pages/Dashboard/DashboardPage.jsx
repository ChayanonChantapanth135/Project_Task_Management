import React, { useState, useEffect, useRef } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useLanguage } from "../../lib/LanguageContext";
import axios from "axios";
import StatCard from "./components/StatCard";
import RecentActivity from "./components/RecentActivity";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import thLocale from "@fullcalendar/core/locales/th";
import Swal from "sweetalert2";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/**
 * คอมโพเนนต์หน้าแดชบอร์ดสรุปผล (DashboardPage Component) - Redesigned Dark Luxe Glassmorphism Theme
 */
const DashboardPage = () => {
  const { t, language } = useLanguage();
  const pageRef = useRef(null);
  const blob1Ref = useRef(null);
  const blob2Ref = useRef(null);
  const blob3Ref = useRef(null);

  useGSAP(() => {
    gsap.to(blob1Ref.current, { x: 60, y: -40, duration: 8, repeat: -1, yoyo: true, ease: "sine.inOut" });
    gsap.to(blob2Ref.current, { x: -50, y: 50, duration: 10, repeat: -1, yoyo: true, ease: "sine.inOut" });
    gsap.to(blob3Ref.current, { x: 40, y: 30, duration: 9, repeat: -1, yoyo: true, ease: "sine.inOut" });
  }, { scope: pageRef });
  const [stats, setStats] = useState({
    users: 0,
    projects: 0,
    tasks: 0,
    overdueTasks: 0,
    projectStatus: { pending: 0, inProgress: 0, review: 0, completed: 0 },
    taskStatus: { pending: 0, inProgress: 0, reviewing: 0, completed: 0 },
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get("/auth/dashboard-stats");
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    const fetchActivities = async () => {
      try {
        const response = await axios.get("/auth/activity-logs");
        setRecentActivities(response.data);
      } catch (error) {
        console.error("Error fetching activity logs:", error);
      }
    };
    const fetchProjects = async () => {
      try {
        const response = await axios.get("/auth/projects");
        setProjects(response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchStats();
    fetchActivities();
    fetchProjects();
  }, []);

  const calendarEvents = projects
    .map((project) => {
      const status = (project.status || "").toLowerCase();
      let color = "#ef4444";
      if (status === "completed") {
        color = "#10b981";
      } else if (status === "in progress" || status === "in_progress") {
        color = "#6366f1";
      } else if (status === "review") {
        color = "#f59e0b";
      }
      return {
        id: project.id,
        title: project.name,
        date: project.end_date ? project.end_date.split("T")[0] : "",
        color: color,
      };
    })
    .filter((event) => event.date);

  const statsCards = [
    {
      title: t("allUsers"),
      value: stats.users,
      link: t("manageUsersBtn") || "จัดการผู้ใช้งาน",
      path: "/ManageUsers",
      icon: "👥",
    },
    {
      title: t("allProjects"),
      value: stats.projects,
      link: t("projectsTitle") || "โปรเจกต์",
      path: "/Projects",
      icon: "📁",
    },
    {
      title: t("totalTasks"),
      value: stats.tasks,
      subtitle: `${t("completedPrefix") || "Completed:"} ${stats.taskStatus.completed}`,
      icon: "📋",
    },
    {
      title: t("overdueTasks"),
      value: stats.overdueTasks,
      link: t("reportsTitle") || "รายงาน",
      path: "/Reports",
      icon: "⚠️",
    },
  ];

  const projectStatus = [
    {
      label: t("statusPending"),
      value: stats.projectStatus?.pending || 0,
      badgeBg: "bg-[#1e293b] text-slate-400",
    },
    {
      label: t("statusInProgress"),
      value: stats.projectStatus?.inProgress || 0,
      badgeBg: "bg-indigo-500/20 text-indigo-300",
    },
    {
      label: t("statusReview"),
      value: stats.projectStatus?.review || 0,
      badgeBg: "bg-amber-500/20 text-amber-300",
    },
    {
      label: t("statusCompleted"),
      value: stats.projectStatus?.completed || 0,
      badgeBg: "bg-emerald-500/20 text-emerald-300",
    },
  ];

  const taskStatus = [
    {
      label: t("pending"),
      value: stats.taskStatus.pending,
      badgeBg: "bg-[#1e293b] text-slate-400",
    },
    {
      label: t("inProgress"),
      value: stats.taskStatus.inProgress,
      badgeBg: "bg-indigo-500/20 text-indigo-300",
    },
    {
      label: t("reviewing"),
      value: stats.taskStatus.reviewing,
      badgeBg: "bg-amber-500/20 text-amber-300",
    },
    {
      label: t("completed"),
      value: stats.taskStatus.completed,
      badgeBg: "bg-emerald-500/20 text-emerald-300",
    },
  ];

  return (
    <div ref={pageRef} className="min-h-screen flex flex-col bg-[#153648] text-slate-100 font-sans selection:bg-teal-500 selection:text-white relative overflow-hidden">
      <Header />

      {/* GSAP Animated Ambient Orbs */}
      <div ref={blob1Ref} className="absolute top-10 left-1/4 w-[450px] h-[450px] bg-teal-500/15 rounded-full filter blur-[100px] pointer-events-none"></div>
      <div ref={blob2Ref} className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-600/20 rounded-full filter blur-[110px] pointer-events-none"></div>
      <div ref={blob3Ref} className="absolute bottom-10 left-1/3 w-[500px] h-[500px] bg-cyan-600/15 rounded-full filter blur-[120px] pointer-events-none"></div>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full animate-fade-in-up relative z-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((card, index) => (
            <StatCard key={index} {...card} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Status Breakdown Panel */}
          <div className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-2xl">
            {/* Project Status */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">📁</span>
                <h3 className="text-xl font-bold text-white">
                  {t("projectStatus")}
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {projectStatus.map((status, index) => (
                  <div
                    key={index}
                    className="glass-card rounded-2xl p-4 text-center"
                  >
                    <p className="text-3xl font-black text-white">
                      {status.value}
                    </p>
                    <p className="text-xs text-slate-400 font-semibold mt-1">
                      {status.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <hr className="my-6 border-white/5" />

            {/* Task Status */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">⏱️</span>
                <h3 className="text-xl font-bold text-white">
                  {t("taskStatus")}
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {taskStatus.map((status, index) => (
                  <div
                    key={index}
                    className="glass-card rounded-2xl p-4 text-center"
                  >
                    <p className="text-3xl font-black text-white">
                      {status.value}
                    </p>
                    <p className="text-xs text-slate-400 font-semibold mt-1">
                      {status.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity Panel */}
          <RecentActivity t={t} recentActivities={recentActivities} />
        </div>

        {/* Project Calendar */}
        <div className="mt-8 glass-panel rounded-3xl p-6 md:p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
            <span className="text-3xl">📅</span>
            <div>
              <h3 className="text-xl font-bold text-white">
                {t("Project Calendar Title")}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {t("projectCalendarDesc")}
              </p>
            </div>
          </div>

          <style>{`
            .project-calendar-container .fc {
              --fc-border-color: rgba(255, 255, 255, 0.08);
              font-family: 'Inter', system-ui, sans-serif;
            }
            .project-calendar-container .fc-scrollgrid {
              border-radius: 16px !important;
              overflow: hidden !important;
              border: 1px solid rgba(255, 255, 255, 0.1) !important;
            }
            .project-calendar-container .fc-toolbar-title {
              font-size: 1.25rem !important;
              font-weight: 800 !important;
              color: #ffffff !important;
            }
            .project-calendar-container .fc-button {
              background: rgba(30, 41, 59, 0.6) !important;
              border: 1px solid rgba(255, 255, 255, 0.1) !important;
              color: #cbd5e1 !important;
              font-weight: 600 !important;
              border-radius: 12px !important;
              padding: 0.5rem 1rem !important;
            }
            .project-calendar-container .fc-button:hover {
              background: rgba(99, 102, 241, 0.3) !important;
              color: #ffffff !important;
            }
            .project-calendar-container .fc-col-header-cell {
              background: rgba(15, 23, 42, 0.9) !important;
              padding: 0.75rem 0 !important;
            }
            .project-calendar-container .fc-col-header-cell-cushion {
              color: #94a3b8 !important;
              font-weight: 700 !important;
            }
            .project-calendar-container .fc-daygrid-day-number {
              color: #cbd5e1 !important;
              font-weight: 600 !important;
            }
            .project-calendar-container .fc-day-today {
              background: rgba(99, 102, 241, 0.15) !important;
            }
          `}</style>

          <div className="project-calendar-container">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale={language === "th" ? thLocale : "en"}
              events={calendarEvents}
              eventClick={(info) => {
                info.jsEvent.preventDefault();
                Swal.fire({
                  title: info.event.title,
                  html: `<p><b>${t("dueDate") || "กำหนดส่ง"}:</b> ${info.event.startStr}</p>`,
                  icon: "info",
                  confirmButtonText: t("close") || "ปิด",
                  confirmButtonColor: "#6366f1",
                  background: "#0f172a",
                  color: "#ffffff",
                });
              }}
              height="auto"
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DashboardPage;
