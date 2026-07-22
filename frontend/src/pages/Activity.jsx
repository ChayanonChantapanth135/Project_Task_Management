import React, { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useLanguage } from "../lib/LanguageContext";
import axios from "axios";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/**
 * คอมโพเนนต์หน้าบันทึกกิจกรรมย้อนหลัง (Activity Page Component) - Redesigned Dark Luxe Glassmorphism Theme
 */
const Activity = () => {
  const { t } = useLanguage();
  const pageRef = useRef(null);
  const blob1Ref = useRef(null);
  const blob2Ref = useRef(null);
  const blob3Ref = useRef(null);

  useGSAP(() => {
    gsap.to(blob1Ref.current, { x: 60, y: -40, duration: 8, repeat: -1, yoyo: true, ease: "sine.inOut" });
    gsap.to(blob2Ref.current, { x: -50, y: 50, duration: 10, repeat: -1, yoyo: true, ease: "sine.inOut" });
    gsap.to(blob3Ref.current, { x: 40, y: 30, duration: 9, repeat: -1, yoyo: true, ease: "sine.inOut" });
  }, { scope: pageRef });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  /**
   * ดึงประวัติกิจกรรมการทำงานทั้งหมดจาก API หลังบ้าน
   */
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/auth/activity-logs");
      setLogs(response.data);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filter logs by search query and action category
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      (log.username &&
        log.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.details &&
        log.details.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.action &&
        log.action.toLowerCase().includes(searchQuery.toLowerCase()));

    let matchesAction = true;
    if (actionFilter !== "all") {
      if (actionFilter === "project") {
        matchesAction = log.action.toLowerCase().includes("project");
      } else if (actionFilter === "user") {
        matchesAction = log.action.toLowerCase().includes("user");
      } else if (actionFilter === "system") {
        matchesAction =
          !log.action.toLowerCase().includes("project") &&
          !log.action.toLowerCase().includes("user");
      }
    }

    return matchesSearch && matchesAction;
  });

  // Pagination calculations
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredLogs.slice(
    indexOfFirstEntry,
    indexOfLastEntry
  );
  const totalPages = Math.ceil(filteredLogs.length / entriesPerPage);

  return (
    <div ref={pageRef} className="min-h-screen flex flex-col bg-[#153648] text-slate-100 font-sans selection:bg-teal-500 selection:text-white relative overflow-hidden">
      <Header />

      {/* GSAP Animated Ambient Orbs */}
      <div ref={blob1Ref} className="absolute top-10 left-1/4 w-[450px] h-[450px] bg-teal-500/15 rounded-full filter blur-[100px] pointer-events-none"></div>
      <div ref={blob2Ref} className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-600/20 rounded-full filter blur-[110px] pointer-events-none"></div>
      <div ref={blob3Ref} className="absolute bottom-10 left-1/3 w-[500px] h-[500px] bg-cyan-600/15 rounded-full filter blur-[120px] pointer-events-none"></div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 animate-fade-in-up relative z-10">
        {/* Header Title Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3 tracking-tight">
              <span>📋</span> {t("activityLogsTitle")}
            </h2>
            <p className="text-xs text-slate-400 mt-1">{t("activityLogsSubtitle")}</p>
          </div>
          <button
            className="px-5 py-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-all"
            onClick={fetchLogs}
            title={t("refreshBtn")}
          >
            <span>⭮</span> {t("refreshBtn") || "รีเฟรชข้อมูล"}
          </button>
        </div>

        {/* Filters and Search Toolbar */}
        <div className="glass-panel rounded-3xl p-5 mb-8 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">
                🔍
              </span>
              <input
                type="search"
                className="w-full bg-slate-800/60 hover:bg-slate-800/80 rounded-2xl py-3 pl-10 pr-4 text-white text-xs font-medium focus:outline-none transition-all placeholder:text-slate-400"
                placeholder={t("searchActivityPlaceholder")}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div>
              <select
                className="w-full bg-slate-800/60 hover:bg-slate-800/80 rounded-2xl py-3 px-4 text-white text-xs font-medium focus:outline-none border-0 transition-all cursor-pointer"
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all" className="bg-slate-900">{t("allActivities")}</option>
                <option value="project" className="bg-slate-900">{t("aboutProjects")}</option>
                <option value="user" className="bg-slate-900">{t("aboutUsers")}</option>
                <option value="system" className="bg-slate-900">{t("aboutSystem")}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="glass-panel rounded-3xl p-6 shadow-2xl overflow-hidden">
          {/* Show entries row */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span>{t("showText") || "Show"}</span>
              <select
                className="bg-slate-900/80 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none cursor-pointer"
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>{t("entriesPerPageText") || "Entries"}</span>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-slate-400 text-xs mt-3">{t("loadingActivities")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-slate-400 font-bold">
                    <th className="py-4 px-4 text-left">{t("colAction")}</th>
                    <th className="py-4 px-4 text-left">{t("colDetails")}</th>
                    <th className="py-4 px-4 text-center">{t("colUser")}</th>
                    <th className="py-4 px-4 text-center">{t("colTime")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm text-slate-200">
                  {currentEntries.length > 0 ? (
                    currentEntries.map((log, index) => {
                      const act = log.action.toLowerCase();
                      let badgeClass = "bg-slate-800 text-slate-300";
                      if (act.includes("create"))
                        badgeClass = "bg-emerald-500/20 text-emerald-300";
                      else if (act.includes("edit") || act.includes("update"))
                        badgeClass = "bg-amber-500/20 text-amber-300";
                      else if (act.includes("delete"))
                        badgeClass = "bg-rose-500/20 text-rose-300";
                      else if (act.includes("login"))
                        badgeClass = "bg-indigo-500/20 text-indigo-300";
                      else if (act.includes("logout"))
                        badgeClass = "bg-slate-700 text-slate-300";

                      return (
                        <tr key={index} className="hover:bg-white/5 transition-colors">
                          <td className="py-4 px-4 text-left">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${badgeClass}`}>
                              {t(log.action)}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-white font-medium text-xs text-left">
                            {log.details}
                          </td>
                          <td className="py-4 px-4 text-slate-300 text-xs font-semibold text-center">
                            👤 {log.username || t("systemAdmin")}
                          </td>
                          <td className="py-4 px-4 text-center text-slate-400 text-xs">
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-12 text-slate-500">
                        <div className="text-4xl mb-2">📂</div>
                        <p className="text-sm font-semibold">{t("noActivitiesFound")}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {!loading && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-white/5 text-xs text-slate-400">
              <span>
                {t("showingText") || "แสดง"} {indexOfFirstEntry + 1} - {Math.min(indexOfLastEntry, filteredLogs.length)} {t("ofText") || "จาก"} {filteredLogs.length} {t("entriesText") || "รายการ"}
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-40 transition-colors"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                >
                  {t("prevText") || "ย้อนกลับ"}
                </button>
                <span className="px-3.5 py-1.5 font-bold text-white bg-indigo-600 rounded-full">
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-40 transition-colors"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                >
                  {t("nextText") || "ถัดไป"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Activity;
