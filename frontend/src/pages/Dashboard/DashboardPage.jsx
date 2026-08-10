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

import { getCurrentUser } from "../../lib/auth";

/**
 * คอมโพเนนต์หน้าแดชบอร์ดสรุปผล (DashboardPage Component) - Redesigned Dark Luxe Glassmorphism Theme
 */
const DashboardPage = () => {
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

  const [currentUser, setCurrentUser] = useState(null);
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
    const fetchUser = async () => {
      try {
        const u = await getCurrentUser();
        setCurrentUser(u);
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };
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
        const response = await axios.get("/auth/activity-logs?limit=20");
        setRecentActivities(response.data.slice(0, 20));
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
    fetchUser();
    fetchStats();
    fetchActivities();
    fetchProjects();
  }, []);

  const userRole = currentUser?.role
    ? currentUser.role.toLowerCase().trim().replace(/\s+/g, "_")
    : "";
  const isAdmin = userRole === "admin";
  const isAdminOrManager =
    userRole === "admin" ||
    userRole === "manager" ||
    userRole === "project_manager";
  const isTeamLeader = userRole === "team_leader";

  const myTasks = [];
  if (currentUser && projects && projects.length > 0) {
    const userId = Number(currentUser.id);
    const userFullname = (currentUser.fullname || currentUser.name || "")
      .trim()
      .toLowerCase();
    const userName = (currentUser.name || "").trim().toLowerCase();

    projects.forEach((project) => {
      if (project.tasks && Array.isArray(project.tasks)) {
        project.tasks.forEach((task) => {
          const taskAssigneeId = task.assigned_to
            ? Number(task.assigned_to)
            : null;
          const taskAssigneeName = (task.assigned_to_name || "")
            .trim()
            .toLowerCase();

          const isAssigned =
            (taskAssigneeId !== null && taskAssigneeId === userId) ||
            (userFullname && taskAssigneeName === userFullname) ||
            (userName && taskAssigneeName === userName);

          if (isAssigned) {
            myTasks.push({
              ...task,
              projectDueDate: project.end_date,
            });
          }
        });
      }
    });
  }

  const calendarEvents =
    isAdminOrManager || isTeamLeader
      ? projects
          .filter((project) => {
            if (isAdminOrManager) return true;
            if (isTeamLeader) {
              return (
                project.teamLeaderId === currentUser?.id ||
                project.team_leader_id === currentUser?.id ||
                project.teamLeaderName === currentUser?.fullname ||
                project.teamLeaderName === currentUser?.name ||
                project.created_by === currentUser?.id
              );
            }
            return false;
          })
          .map((project) => {
            const status = (project.status || "").toLowerCase();
            let color = "#ef4444";
            if (status === "completed") {
              color = "#10b981";
            } else if (status === "in progress" || status === "in_progress") {
              color = "#6366f1";
            } else if (status === "review" || status === "reviewing") {
              color = "#f59e0b";
            }
            return {
              id: project.id,
              title: project.name,
              date: project.end_date ? project.end_date.split("T")[0] : "",
              color: color,
            };
          })
          .filter((event) => event.date)
      : myTasks
          .map((task) => {
            const status = (task.status || "").toLowerCase();
            let color = "#ef4444";
            if (status === "completed") {
              color = "#10b981";
            } else if (status === "in progress" || status === "in_progress") {
              color = "#6366f1";
            } else if (status === "review" || status === "reviewing") {
              color = "#f59e0b";
            }
            const taskDate = task.due_date || task.dueDate;
            return {
              id: task.id,
              title: task.title,
              date: taskDate ? taskDate.split("T")[0] : "",
              color: color,
            };
          })
          .filter((event) => event.date);

  const myPendingCount = myTasks.filter(
    (t) => (t.status || "").toLowerCase() === "pending",
  ).length;
  const myInProgressCount = myTasks.filter((t) => {
    const s = (t.status || "").toLowerCase();
    return s === "in progress" || s === "in_progress";
  }).length;
  const myCompletedCount = myTasks.filter(
    (t) => (t.status || "").toLowerCase() === "completed",
  ).length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const myOverdueCount = myTasks.filter((t) => {
    const status = (t.status || "").toLowerCase();
    if (status === "completed") return false;
    const taskDue = t.due_date || t.dueDate;
    if (!taskDue) return false;
    const dueDate = new Date(taskDue);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  }).length;

  const isManager = userRole === "manager" || userRole === "project_manager";

  const managedProjects = projects.filter((p) => {
    if (isAdmin) return true;
    if (isManager) {
      return (
        p.created_by === currentUser?.id ||
        p.manager_id === currentUser?.id ||
        p.managerId === currentUser?.id
      );
    }
    return false;
  });

  const managedTasks = [];
  managedProjects.forEach((project) => {
    if (project.tasks && Array.isArray(project.tasks)) {
      project.tasks.forEach((task) => {
        managedTasks.push(task);
      });
    }
  });

  const statsCards = isAdmin
    ? [
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
        {
          title: t("overdueProjects"),
          value: stats.overdueProjects,
          link: t("reportsTitle") || "รายงาน",
          path: "/Reports",
          icon: "⚠️",
        },
      ]
    : isManager
      ? (() => {
          const pendingP = managedProjects.filter(
            (p) => (p.status || "").toLowerCase() === "pending",
          ).length;
          const inProgressP = managedProjects.filter((p) => {
            const s = (p.status || "").toLowerCase();
            return s === "in progress" || s === "in_progress";
          }).length;
          const completedP = managedProjects.filter(
            (p) => (p.status || "").toLowerCase() === "completed",
          ).length;

          const todayObj = new Date();
          todayObj.setHours(0, 0, 0, 0);
          const overdueP = managedProjects.filter((p) => {
            const s = (p.status || "").toLowerCase();
            if (s === "completed") return false;
            const endD = p.end_date || p.endDate;
            if (!endD) return false;
            const d = new Date(endD);
            d.setHours(0, 0, 0, 0);
            return d < todayObj;
          }).length;

          return [
            {
              title:
                language === "th" ? "โปรเจกต์ทั้งหมดของฉัน" : "All My Projects",
              value: managedProjects.length,
              link: language === "th" ? "โปรเจกต์ของฉัน" : "My Project",
              path: "/Projects",
              icon: "📁",
            },
            {
              title: t("pending") || "Pending",
              value: pendingP,
              link: language === "th" ? "โปรเจกต์ของฉัน" : "My Project",
              path: "/Projects",
              icon: "⏳",
            },
            {
              title: t("inProgress") || "In Progress",
              value: inProgressP,
              link: language === "th" ? "โปรเจกต์ของฉัน" : "My Project",
              path: "/Projects",
              icon: "⚡",
            },
            {
              title: t("completed") || "Completed",
              value: completedP,
              link: language === "th" ? "โปรเจกต์ของฉัน" : "My Project",
              path: "/Projects",
              icon: "✅",
            },
            {
              title:
                language === "th" ? "โปรเจกต์เกินกำหนด" : "Overdue Projects",
              value: overdueP,
              link: language === "th" ? "โปรเจกต์ของฉัน" : "My Project",
              path: "/Projects",
              icon: "⚠️",
            },
          ];
        })()
      : [
          {
            title:
              t("allMyTasks") ||
              (language === "th" ? "งานทั้งหมดของฉัน" : "All My Tasks"),
            value: myTasks.length,
            link: t("myTask") || "งานของฉัน",
            path: "/MyTasks",
            icon: "📋",
          },
          {
            title: t("pending") || "Pending",
            value: myPendingCount,
            link: t("myTask") || "งานของฉัน",
            path: "/MyTasks",
            icon: "⏳",
          },
          {
            title: t("inProgress") || "In Progress",
            value: myInProgressCount,
            link: t("myTask") || "งานของฉัน",
            path: "/MyTasks",
            icon: "⚡",
          },
          {
            title: t("completed") || "Completed",
            value: myCompletedCount,
            link: t("myTask") || "งานของฉัน",
            path: "/MyTasks",
            icon: "✅",
          },
          {
            title: t("overdueTasks") || "Overdue Tasks",
            value: myOverdueCount,
            link: t("myTask") || "งานของฉัน",
            path: "/MyTasks",
            icon: "⚠️",
          },
        ];

  const tlProjects = projects.filter((project) => {
    return (
      project.teamLeaderId === currentUser?.id ||
      project.team_leader_id === currentUser?.id ||
      project.teamLeaderName === currentUser?.fullname ||
      project.teamLeaderName === currentUser?.name ||
      project.created_by === currentUser?.id
    );
  });

  const tlTasks = [];
  tlProjects.forEach((project) => {
    if (project.tasks && Array.isArray(project.tasks)) {
      project.tasks.forEach((task) => {
        tlTasks.push(task);
      });
    }
  });

  const currentProjectStatus = isAdmin
    ? {
        pending: projects.filter(
          (p) => (p.status || "").toLowerCase() === "pending",
        ).length,
        inProgress: projects.filter((p) => {
          const s = (p.status || "").toLowerCase();
          return s === "in progress" || s === "in_progress";
        }).length,
        review: projects.filter((p) => {
          const s = (p.status || "").toLowerCase();
          return s === "review" || s === "reviewing";
        }).length,
        completed: projects.filter(
          (p) => (p.status || "").toLowerCase() === "completed",
        ).length,
      }
    : isManager
      ? {
          pending: managedProjects.filter(
            (p) => (p.status || "").toLowerCase() === "pending",
          ).length,
          inProgress: managedProjects.filter((p) => {
            const s = (p.status || "").toLowerCase();
            return s === "in progress" || s === "in_progress";
          }).length,
          review: managedProjects.filter((p) => {
            const s = (p.status || "").toLowerCase();
            return s === "review" || s === "reviewing";
          }).length,
          completed: managedProjects.filter(
            (p) => (p.status || "").toLowerCase() === "completed",
          ).length,
        }
      : isTeamLeader
        ? {
            pending: tlProjects.filter(
              (p) => (p.status || "").toLowerCase() === "pending",
            ).length,
            inProgress: tlProjects.filter((p) => {
              const s = (p.status || "").toLowerCase();
              return s === "in progress" || s === "in_progress";
            }).length,
            review: tlProjects.filter((p) => {
              const s = (p.status || "").toLowerCase();
              return s === "review" || s === "reviewing";
            }).length,
            completed: tlProjects.filter(
              (p) => (p.status || "").toLowerCase() === "completed",
            ).length,
          }
        : stats.projectStatus;

  const allTasksAcrossProjects = [];
  if (projects && Array.isArray(projects)) {
    projects.forEach((proj) => {
      if (proj.tasks && Array.isArray(proj.tasks)) {
        allTasksAcrossProjects.push(...proj.tasks);
      }
    });
  }

  const currentTaskStatus = isAdmin
    ? {
        pending: allTasksAcrossProjects.filter(
          (t) => (t.status || "").toLowerCase() === "pending",
        ).length,
        inProgress: allTasksAcrossProjects.filter((t) => {
          const s = (t.status || "").toLowerCase();
          return s === "in progress" || s === "in_progress";
        }).length,
        reviewing: allTasksAcrossProjects.filter((t) => {
          const s = (t.status || "").toLowerCase();
          return s === "review" || s === "reviewing";
        }).length,
        completed: allTasksAcrossProjects.filter(
          (t) => (t.status || "").toLowerCase() === "completed",
        ).length,
      }
    : {
        pending: myTasks.filter(
          (t) => (t.status || "").toLowerCase() === "pending",
        ).length,
        inProgress: myTasks.filter((t) => {
          const s = (t.status || "").toLowerCase();
          return s === "in progress" || s === "in_progress";
        }).length,
        reviewing: myTasks.filter((t) => {
          const s = (t.status || "").toLowerCase();
          return s === "review" || s === "reviewing";
        }).length,
        completed: myTasks.filter(
          (t) => (t.status || "").toLowerCase() === "completed",
        ).length,
      };

  const projectStatus = [
    {
      label: t("statusPending"),
      value: currentProjectStatus?.pending || 0,
      badgeBg: "bg-[#1e293b] text-slate-400",
    },
    {
      label: t("statusInProgress"),
      value: currentProjectStatus?.inProgress || 0,
      badgeBg: "bg-indigo-500/20 text-indigo-300",
    },
    {
      label: t("statusReview"),
      value: currentProjectStatus?.review || 0,
      badgeBg: "bg-amber-500/20 text-amber-300",
    },
    {
      label: t("statusCompleted"),
      value: currentProjectStatus?.completed || 0,
      badgeBg: "bg-emerald-500/20 text-emerald-300",
    },
  ];

  const taskStatus = [
    {
      label: t("pending"),
      value: currentTaskStatus?.pending || 0,
      badgeBg: "bg-[#1e293b] text-slate-400",
    },
    {
      label: t("inProgress"),
      value: currentTaskStatus?.inProgress || 0,
      badgeBg: "bg-indigo-500/20 text-indigo-300",
    },
    {
      label: t("reviewing"),
      value: currentTaskStatus?.reviewing || 0,
      badgeBg: "bg-amber-500/20 text-amber-300",
    },
    {
      label: t("completed"),
      value: currentTaskStatus?.completed || 0,
      badgeBg: "bg-emerald-500/20 text-emerald-300",
    },
  ];

  const projectAndTaskActivities = recentActivities.filter((activity) => {
    const action = (activity.action || "").toLowerCase();
    return !action.includes("login") && !action.includes("logout");
  });

  return (
    <div
      ref={pageRef}
      className="min-h-screen flex flex-col bg-[#153648] text-slate-100 font-sans selection:bg-teal-500 selection:text-white relative overflow-hidden"
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
