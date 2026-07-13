import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/footer";
import { Link } from "react-router-dom";
import { useLanguage } from "../lib/LanguageContext";
import axios from "axios";

const Dashboard = () => {
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
      completed: 0
    }
  });
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:3000/auth/dashboard-stats");
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    const fetchActivities = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:3000/auth/activity-logs");
        setRecentActivities(response.data);
      } catch (error) {
        console.error("Error fetching activity logs:", error);
      }
    };
    fetchStats();
    fetchActivities();
  }, []);

  // ข้อมูล Stats Cards
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

  // ข้อมูลสถานะงาน
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
            <div
              key={index}
              className={`${card.bgColor} rounded-lg p-4 text-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm opacity-90">{card.title}</p>
                  <p className="text-4xl font-bold mt-1">{card.value}</p>
                </div>
                <span className="text-3xl opacity-80">{card.icon}</span>
              </div>
              <div className="mt-4 pt-3 border-t border-white/30">
                {card.subtitle ? (
                  <p className="text-sm opacity-90">{card.subtitle}</p>
                ) : (
                  <Link
                    to={card.path}
                    className="text-sm opacity-90 hover:opacity-100 text-white text-decoration-none d-block"
                  >
                    {card.link}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* สถานะงาน */}
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

          {/* กิจกรรมล่าสุด */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">📊</span>
                <h3 className="text-lg font-semibold text-gray-800">
                  {t("recentActivity")}
                </h3>
              </div>
              <Link
                to="/Activity"
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-decoration-none text-gray-700"
              >
                {t("viewAll")}
              </Link>
            </div>
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex justify-between items-start py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 px-2 rounded transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-800">{activity.username || activity.user || "System"}</p>
                    <p className="text-sm text-gray-500">
                      {activity.action}
                      {activity.details ? ` - ${activity.details}` : ""}
                    </p>
                  </div>
                  <span className="text-sm text-gray-400 whitespace-nowrap">
                    {activity.created_at ? new Date(activity.created_at).toLocaleString() : (activity.time || "")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
