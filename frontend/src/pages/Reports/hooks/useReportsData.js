import { useState, useEffect } from "react";
import axios from "axios";
import { getCurrentUser } from "../../../lib/auth";
import * as XLSX from "xlsx";

export const useReportsData = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      setCurrentUser(user);

      const [projRes, usersRes] = await Promise.all([
        axios.get("/auth/projects"),
        axios.get("/auth/users").catch(() => ({ data: [] })),
      ]);

      setProjects(projRes.data || []);
      setUsers(usersRes.data || []);
    } catch (err) {
      console.error("Error loading reports data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const userRole = currentUser?.role
    ? currentUser.role.toLowerCase().trim().replace(/\s+/g, "_")
    : "";

  const isAdmin = userRole === "admin";
  const isManager = userRole === "manager" || userRole === "project_manager";
  const isTeamLeader = userRole === "team_leader";
  const isUser = !isAdmin && !isManager && !isTeamLeader;

  // Flatten all tasks from projects
  const allTasks = [];
  projects.forEach((proj) => {
    if (proj.tasks && Array.isArray(proj.tasks)) {
      proj.tasks.forEach((t) => {
        allTasks.push({
          ...t,
          projectName: proj.name,
          projectDueDate: proj.end_date,
        });
      });
    }
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // --- Admin Metrics ---
  const totalProjects = projects.length;
  const totalTasks = allTasks.length;
  const totalUsers = users.length;

  const completedTasksCount = allTasks.filter(
    (t) => (t.status || "").toLowerCase() === "completed"
  ).length;

  const overallCompletionRate =
    totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

  const projectStatusCounts = {
    pending: projects.filter((p) => (p.status || "").toLowerCase() === "pending").length,
    inProgress: projects.filter((p) => {
      const s = (p.status || "").toLowerCase();
      return s === "in progress" || s === "in_progress";
    }).length,
    review: projects.filter((p) => {
      const s = (p.status || "").toLowerCase();
      return s === "review" || s === "reviewing";
    }).length,
    completed: projects.filter((p) => (p.status || "").toLowerCase() === "completed").length,
  };

  const userWorkloadList = users.map((u) => {
    const assignedTasks = allTasks.filter(
      (t) =>
        t.assigned_to === u.id ||
        t.assigned_to_name === u.fullname ||
        t.assigned_to_name === u.name
    );
    const completedCount = assignedTasks.filter(
      (t) => (t.status || "").toLowerCase() === "completed"
    ).length;

    return {
      id: u.id,
      name: u.name,
      fullname: u.fullname || u.name,
      email: u.email,
      role: u.role,
      avatar: u.avatar,
      assignedCount: assignedTasks.length,
      completedCount: completedCount,
      rate: assignedTasks.length > 0 ? Math.round((completedCount / assignedTasks.length) * 100) : 0,
    };
  });

  // --- Manager Metrics ---
  const managedProjects = projects.filter((p) => {
    if (isAdmin) return true;
    return p.created_by === currentUser?.id || p.manager_id === currentUser?.id;
  });

  const managedTasks = [];
  managedProjects.forEach((p) => {
    if (p.tasks && Array.isArray(p.tasks)) {
      p.tasks.forEach((t) => managedTasks.push(t));
    }
  });

  const managedCompletedCount = managedTasks.filter(
    (t) => (t.status || "").toLowerCase() === "completed"
  ).length;

  const managerCompletionRate =
    managedTasks.length > 0
      ? Math.round((managedCompletedCount / managedTasks.length) * 100)
      : 0;

  // --- Team Leader Metrics ---
  const tlProjects = projects.filter((p) => {
    if (isAdmin) return true;
    return (
      p.teamLeaderId === currentUser?.id ||
      p.team_leader_id === currentUser?.id ||
      p.teamLeaderName === currentUser?.fullname ||
      p.teamLeaderName === currentUser?.name ||
      p.created_by === currentUser?.id
    );
  });

  const tlTasks = [];
  tlProjects.forEach((p) => {
    if (p.tasks && Array.isArray(p.tasks)) {
      p.tasks.forEach((t) => tlTasks.push(t));
    }
  });

  const tlCompletedCount = tlTasks.filter(
    (t) => (t.status || "").toLowerCase() === "completed"
  ).length;

  const tlCompletionRate =
    tlTasks.length > 0 ? Math.round((tlCompletedCount / tlTasks.length) * 100) : 0;

  const tlOverdueCount = tlTasks.filter((t) => {
    const s = (t.status || "").toLowerCase();
    if (s === "completed") return false;
    const due = t.due_date || t.dueDate;
    if (!due) return false;
    const dueDateObj = new Date(due);
    dueDateObj.setHours(0, 0, 0, 0);
    return dueDateObj < today;
  }).length;

  // --- User Metrics ---
  const myTasks = allTasks.filter(
    (t) =>
      t.assigned_to === currentUser?.id ||
      t.assigned_to_name === currentUser?.fullname ||
      t.assigned_to_name === currentUser?.name
  );

  const myCompletedCount = myTasks.filter(
    (t) => (t.status || "").toLowerCase() === "completed"
  ).length;

  const myPendingCount = myTasks.filter(
    (t) => (t.status || "").toLowerCase() === "pending"
  ).length;

  const myInProgressCount = myTasks.filter((t) => {
    const s = (t.status || "").toLowerCase();
    return s === "in progress" || s === "in_progress";
  }).length;

  const myOverdueCount = myTasks.filter((t) => {
    const s = (t.status || "").toLowerCase();
    if (s === "completed") return false;
    const due = t.due_date || t.dueDate;
    if (!due) return false;
    const dueDateObj = new Date(due);
    dueDateObj.setHours(0, 0, 0, 0);
    return dueDateObj < today;
  }).length;

  const myCompletionRate =
    myTasks.length > 0 ? Math.round((myCompletedCount / myTasks.length) * 100) : 0;

  const myTaskTypeCounts = {
    translate: myTasks.filter((t) => t.taskType === "แปล" || t.taskType === "Translate").length,
    videoEdit: myTasks.filter((t) => t.taskType === "ตัดต่อ" || t.taskType === "Video Edit").length,
    others: myTasks.filter((t) => t.taskType === "อื่นๆ" || t.taskType === "Others").length,
  };

  // Export to Excel helper
  const exportToExcel = () => {
    let exportData = [];
    let fileName = "Report.xlsx";

    if (isAdmin) {
      fileName = "System_Analytics_Report.xlsx";
      exportData = userWorkloadList.map((item) => ({
        User: item.fullname,
        Email: item.email,
        Role: item.role,
        "Assigned Tasks": item.assignedCount,
        "Completed Tasks": item.completedCount,
        "Completion Rate (%)": `${item.rate}%`,
      }));
    } else if (isManager) {
      fileName = "Project_Manager_Report.xlsx";
      exportData = managedProjects.map((p) => ({
        "Project Name": p.name,
        "Team Leader": p.teamLeaderName || "-",
        Progress: `${p.progress || 0}%`,
        Status: p.status,
        "End Date": p.end_date ? p.end_date.split("T")[0] : "-",
      }));
    } else if (isTeamLeader) {
      fileName = "Team_Leader_Report.xlsx";
      exportData = tlTasks.map((t) => ({
        "Task Title": t.title,
        Project: t.projectName,
        "Assigned To": t.assigned_to_name || "-",
        Status: t.status,
        Priority: t.priority,
        "Due Date": t.due_date ? t.due_date.split("T")[0] : "-",
      }));
    } else {
      fileName = "My_Task_Performance.xlsx";
      exportData = myTasks.map((t) => ({
        "Task Title": t.title,
        Project: t.projectName,
        Type: t.taskType,
        Status: t.status,
        Priority: t.priority,
        "Due Date": t.due_date ? t.due_date.split("T")[0] : "-",
      }));
    }

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report Summary");
    XLSX.writeFile(workbook, fileName);
  };

  const printReport = () => {
    window.print();
  };

  return {
    currentUser,
    loading,
    isAdmin,
    isManager,
    isTeamLeader,
    isUser,
    userRole,
    refreshData: loadData,

    // Admin metrics
    totalProjects,
    totalTasks,
    totalUsers,
    overallCompletionRate,
    projectStatusCounts,
    userWorkloadList,
    projects,

    // Manager metrics
    managedProjects,
    managedTasks,
    managerCompletionRate,

    // TL metrics
    tlProjects,
    tlTasks,
    tlCompletionRate,
    tlOverdueCount,

    // User metrics
    myTasks,
    myCompletedCount,
    myPendingCount,
    myInProgressCount,
    myOverdueCount,
    myCompletionRate,
    myTaskTypeCounts,

    // Export helpers
    exportToExcel,
    printReport,
  };
};
