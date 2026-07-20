import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/footer";
import { useLanguage } from "../../lib/LanguageContext";
import axios from "axios";
import StatCard from "./components/StatCard";
import RecentActivity from "./components/RecentActivity";

/**
 * คอมโพเนนต์หน้าแดชบอร์ดสรุปผล (DashboardPage Component)
 * - แสดง Stat Cards สรุปยอดผู้ใช้, โครงการ, งานทั้งหมด และงานที่ล่าช้า
 * - แสดงสถานะของงานย่อยทั้งหมด (Pending, In Progress, Reviewing, Completed)
 * - แสดงประวัติกิจกรรมล่าสุดของระบบ (Recent Activities)
 * - ดึงข้อมูลสถิติจาก API /auth/dashboard-stats และ /auth/activity-logs
 */
const DashboardPage = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    users: 0,
    projects: 0,
    tasks: 0,
    overdueTasks: 0,
    taskStatus: {
      pending: 0,
      inProgress: 0,
      reviewing: 0,
      completed: 0,
    },
  });
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(
          "/auth/dashboard-stats"
        );
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    const fetchActivities = async () => {
      try {
        const response = await axios.get(
          "/auth/activity-logs"
        );
        setRecentActivities(response.data);
      } catch (error) {
        console.error("Error fetching activity logs:", error);
      }
    };
    fetchStats();
    fetchActivities();
  }, []);

  const statsCards = [
    {
      title: t("allUsers"),
      value: stats.users,
      link: t("-> Manage-Users"),
      path: "/ManageUsers",
      bgColor: "bg-blue-500",
      icon: "👥",
    },
    {
      title: t("allProjects"),
      value: stats.projects,
      link: t("-> Projects"),
      path: "/Projects",
      bgColor: "bg-teal-500",
      icon: "📁",
    },
    {
      title: t("totalTasks"),
      value: stats.tasks,
      subtitle: `${t("completedPrefix") || "Completed:"} ${stats.taskStatus.completed}`,
      bgColor: "bg-emerald-500",
      icon: "📋",
    },
    {
      title: t("overdueTasks"),
      value: stats.overdueTasks,
      link: t("-> Reports"),
      path: "/Reports",
      bgColor: "bg-red-500",
      icon: "⚠️",
    },
  ];

  const taskStatus = [
    {
      label: t("pending"),
      value: stats.taskStatus.pending,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
    {
      label: t("inProgress"),
      value: stats.taskStatus.inProgress,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: t("reviewing"),
      value: stats.taskStatus.reviewing,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
    },
    {
      label: t("completed"),
      value: stats.taskStatus.completed,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <main className="p-6 max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statsCards.map((card, index) => (
            <StatCard key={index} {...card} />
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* taskStatus */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">⏱️</span>
              <h3 className="text-lg font-semibold text-gray-800">
                {t("taskStatus")}
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {taskStatus.map((status, index) => (
                <div
                  key={index}
                  className={`${status.bgColor} rounded-lg p-4 text-center border border-gray-200 hover:shadow-md transition-shadow`}
                >
                  <p className={`text-3xl font-bold ${status.color}`}>
                    {status.value}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{status.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* recentActivities */}
          <RecentActivity t={t} recentActivities={recentActivities} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;
