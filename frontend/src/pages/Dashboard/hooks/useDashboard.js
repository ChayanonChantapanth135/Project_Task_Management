import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { getCurrentUser } from "../../../lib/auth";
import { useLanguage } from "../../../lib/LanguageContext";

export const useDashboard = () => {
  const { t, language } = useLanguage();
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
  const isManager = userRole === "manager" || userRole === "project_manager";

  // Filter user's assigned tasks
  const myTasks = useMemo(() => {
    const list = [];
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
              list.push({
                ...task,
                projectName: project.name,
                projectId: project.id,
                projectDueDate: project.end_date,
              });
            }
          });
        }
      });
    }
    return list;
  }, [currentUser, projects]);

  // Calendar Events
  const calendarEvents = useMemo(() => {
    if (isAdminOrManager || isTeamLeader) {
      return projects
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
            extendedProps: {
              type: "project",
              projectId: project.id,
              projectName: project.name,
              status: project.status,
              priority: project.priority,
            },
          };
        })
        .filter((event) => event.date);
    } else {
      return myTasks
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
            extendedProps: {
              type: "task",
              taskId: task.id,
              taskTitle: task.title,
              projectName: task.projectName || task.project,
              projectId: task.projectId,
              status: task.status,
              priority: task.priority,
            },
          };
        })
        .filter((event) => event.date);
    }
  }, [isAdminOrManager, isTeamLeader, projects, currentUser, myTasks]);

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

  const managedProjects = useMemo(() => {
    return projects.filter((p) => {
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
  }, [projects, isAdmin, isManager, currentUser]);

  const tlProjects = useMemo(() => {
    return projects.filter((project) => {
      return (
        project.teamLeaderId === currentUser?.id ||
        project.team_leader_id === currentUser?.id ||
        project.teamLeaderName === currentUser?.fullname ||
        project.teamLeaderName === currentUser?.name ||
        project.created_by === currentUser?.id
      );
    });
  }, [projects, currentUser]);

  const currentProjectStatus = useMemo(() => {
    if (isAdmin) {
      return {
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
      };
    }
    if (isManager) {
      return {
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
      };
    }
    if (isTeamLeader) {
      return {
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
      };
    }
    return stats.projectStatus;
  }, [isAdmin, isManager, isTeamLeader, projects, managedProjects, tlProjects, stats.projectStatus]);

  const allTasksAcrossProjects = useMemo(() => {
    const list = [];
    if (projects && Array.isArray(projects)) {
      projects.forEach((proj) => {
        if (proj.tasks && Array.isArray(proj.tasks)) {
          list.push(...proj.tasks);
        }
      });
    }
    return list;
  }, [projects]);

  const currentTaskStatus = useMemo(() => {
    if (isAdmin) {
      return {
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
      };
    }
    return {
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
  }, [isAdmin, allTasksAcrossProjects, myTasks]);

  const statsCards = useMemo(() => {
    if (isAdmin) {
      return [
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
      ];
    }
    if (isManager) {
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
    }
    return [
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
  }, [
    isAdmin,
    isManager,
    language,
    myCompletedCount,
    myInProgressCount,
    myOverdueCount,
    myPendingCount,
    myTasks.length,
    managedProjects,
    stats,
    t,
  ]);

  const projectStatus = useMemo(() => [
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
  ], [currentProjectStatus, t]);

  const taskStatus = useMemo(() => [
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
  ], [currentTaskStatus, t]);

  const projectAndTaskActivities = useMemo(() => {
    return recentActivities.filter((activity) => {
      const action = (activity.action || "").toLowerCase();
      return !action.includes("login") && !action.includes("logout");
    });
  }, [recentActivities]);

  return {
    currentUser,
    userRole,
    isAdmin,
    isAdminOrManager,
    isTeamLeader,
    isManager,
    statsCards,
    projectStatus,
    taskStatus,
    recentActivities,
    projectAndTaskActivities,
    calendarEvents,
  };
};
