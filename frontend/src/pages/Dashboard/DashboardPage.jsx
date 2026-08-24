import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useLanguage } from "../../lib/LanguageContext";
import StatCard from "./components/StatCard";
import RecentActivity from "./components/RecentActivity";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import thLocale from "@fullcalendar/core/locales/th";
import Swal from "sweetalert2";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useDashboard } from "./hooks/useDashboard";

/**
 * คอมโพเนนต์หน้าแดชบอร์ดสรุปผล (DashboardPage Component) - Redesigned Dark Luxe Glassmorphism Theme
 */
const DashboardPage = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const pageRef = useRef(null);
  const blob1Ref = useRef(null);
  const blob2Ref = useRef(null);
  const blob3Ref = useRef(null);

  useGSAP(
    () => {
      gsap.to(blob1Ref.current, {
        x: 60,
        y: -40,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(blob2Ref.current, {
        x: -50,
        y: 50,
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(blob3Ref.current, {
        x: 40,
        y: 30,
        duration: 9,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    },
    { scope: pageRef },
  );

  const {
    isAdmin,
    isAdminOrManager,
    isTeamLeader,
    statsCards,
    projectStatus,
    taskStatus,
    recentActivities,
    projectAndTaskActivities,
    calendarEvents,
  } = useDashboard();

  return (
    <div
      ref={pageRef}
      className="min-h-screen flex flex-col font-sans relative overflow-hidden"
      style={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
    >
      <Header />

      {/* GSAP Animated Ambient Orbs */}
      <div
        ref={blob1Ref}
        className="absolute top-10 left-1/4 w-[450px] h-[450px] bg-teal-500/15 rounded-full filter blur-[100px] pointer-events-none"
      ></div>
      <div
        ref={blob2Ref}
        className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-600/20 rounded-full filter blur-[110px] pointer-events-none"
      ></div>
      <div
        ref={blob3Ref}
        className="absolute bottom-10 left-1/3 w-[500px] h-[500px] bg-cyan-600/15 rounded-full filter blur-[120px] pointer-events-none"
      ></div>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full animate-fade-in-up relative z-10">
        {/* Stats Cards */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 ${statsCards.length > 4 ? "lg:grid-cols-5" : "lg:grid-cols-4"} gap-6 mb-8`}
        >
          {statsCards.map((card, index) => (
            <StatCard key={index} {...card} />
          ))}
        </div>

        {(isAdminOrManager || isTeamLeader) && (
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
            <RecentActivity
              t={t}
              recentActivities={
                isAdmin ? recentActivities : projectAndTaskActivities
              }
            />
          </div>
        )}

        {/* Project Calendar */}
        <div className="mt-8 glass-panel rounded-3xl p-6 md:p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
            <span className="text-3xl">📅</span>
            <div>
              <h3 className="text-xl font-bold text-white">
                {isAdminOrManager
                  ? t("Project Calendar Title")
                  : isTeamLeader
                    ? t("managedProjectsCalendar")
                    : t("myTaskCalendar")}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {isAdminOrManager
                  ? t("projectCalendarDesc")
                  : isTeamLeader
                    ? t("managedProjectsCalendarDesc")
                    : t("myTaskCalendarDesc")}
              </p>
            </div>
          </div>

          <style>{`
            .project-calendar-container .fc {
              --fc-border-color: var(--border-surface);
              font-family: 'Inter', system-ui, sans-serif;
            }
            .project-calendar-container .fc-scrollgrid {
              border-radius: 16px !important;
              overflow: hidden !important;
              border: 1px solid var(--border-surface) !important;
            }
            .project-calendar-container .fc-toolbar-title {
              font-size: 1.25rem !important;
              font-weight: 800 !important;
              color: var(--text-primary) !important;
            }
            .project-calendar-container .fc-button {
              background: var(--bg-surface-hover) !important;
              border: 1px solid var(--border-surface) !important;
              color: var(--text-primary) !important;
              font-weight: 600 !important;
              border-radius: 12px !important;
              padding: 0.5rem 1rem !important;
              transition: all 0.2s ease !important;
            }
            .project-calendar-container .fc-button:hover {
              background: var(--brand-color) !important;
              color: #ffffff !important;
            }
            .project-calendar-container .fc-button-active {
              background: var(--brand-color) !important;
              color: #ffffff !important;
            }
            .project-calendar-container .fc-col-header-cell {
              background: var(--bg-surface-hover) !important;
              padding: 0.75rem 0 !important;
              border-color: var(--border-surface) !important;
            }
            .project-calendar-container .fc-col-header-cell-cushion {
              color: var(--text-secondary) !important;
              font-weight: 700 !important;
            }
            .project-calendar-container .fc-daygrid-day-number {
              color: var(--text-secondary) !important;
              font-weight: 600 !important;
              padding: 0.35rem 0.5rem !important;
            }
            .project-calendar-container .fc-daygrid-day:hover {
              background-color: var(--bg-surface-hover) !important;
            }
            .project-calendar-container .fc-day-today {
              background: rgba(59, 130, 246, 0.12) !important;
            }
            .project-calendar-container .fc-day-today .fc-daygrid-day-number {
              color: var(--brand-color) !important;
              font-weight: 800 !important;
            }
            .project-calendar-container .fc-event {
              border-radius: 6px !important;
              padding: 2px 4px !important;
              font-size: 0.75rem !important;
              font-weight: 600 !important;
              cursor: pointer !important;
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
                const props = info.event.extendedProps || {};
                const isTask = props.type === "task";
                const isProject = props.type === "project";

                const projectName = props.projectName || "";
                const dateStr = info.event.startStr || "";
                const eventTitle = info.event.title || "";

                const formatDisplayDate = (dStr) => {
                  if (!dStr) return "-";
                  const d = new Date(dStr);
                  if (isNaN(d.getTime())) {
                    return dStr;
                  }
                  if (language === "th") {
                    return d.toLocaleDateString("th-TH", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });
                  } else {
                    return d.toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });
                  }
                };

                const formattedDate = formatDisplayDate(dateStr);
                const dueDateText = language === "th" ? "กำหนดส่ง" : "Due Date";

                Swal.fire({
                  title: `<span style="font-size: 1.25rem; font-weight: 700; color: #1e293b;">${isTask ? `📋 ${eventTitle}` : `📁 ${eventTitle}`}</span>`,
                  html: `
                    <div style="font-family: inherit; text-align: center; color: #475569; font-size: 14px; margin-top: 8px;">
                      ${isTask && projectName ? `<p style="margin: 6px 0; color: #64748b;"><b>${language === "th" ? "โปรเจกต์" : "Project"}:</b> <span style="color: #0f172a; font-weight: 600;">${projectName}</span></p>` : ""}
                      <p style="margin: 6px 0; color: #64748b;"><b>${dueDateText}:</b> <span style="color: #e11d48; font-weight: 600;">${formattedDate}</span></p>
                    </div>
                  `,
                  icon: "info",
                  showConfirmButton: true,
                  confirmButtonText: isTask
                    ? language === "th"
                      ? "📌 ไปที่งานนี้"
                      : "📌 Go to My Tasks"
                    : language === "th"
                      ? "📁 ไปที่โปรเจกต์นี้"
                      : "📁 Go to Projects",
                  confirmButtonColor: "#0d9488",
                  showDenyButton: !isTask,
                  denyButtonText:
                    language === "th"
                      ? "📋 ดูงานทั้งหมด"
                      : "📋 Go to All Tasks",
                  denyButtonColor: "#6366f1",
                  showCancelButton: true,
                  cancelButtonText:
                    t("close") || (language === "th" ? "ปิด" : "Close"),
                  cancelButtonColor: "#94a3b8",
                  background: "#ffffff",
                  color: "#1e293b",
                  customClass: {
                    popup: "rounded-3xl shadow-2xl !border-0",
                  },
                }).then((result) => {
                  if (result.isConfirmed) {
                    if (isTask) {
                      navigate("/MyTasks");
                    } else {
                      navigate("/Projects");
                    }
                  } else if (result.isDenied) {
                    navigate("/AllTasks");
                  }
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
