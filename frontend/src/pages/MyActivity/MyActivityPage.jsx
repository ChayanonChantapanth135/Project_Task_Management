import React, { useRef } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useLanguage } from "../../lib/LanguageContext";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useMyActivityLogs } from "./hooks/useMyActivityLogs";
import MyActivityFilter from "./components/MyActivityFilter";
import MyActivityTable from "./components/MyActivityTable";

/**
 * คอมโพเนนต์หน้าบันทึกกิจกรรมส่วนตัวย้อนหลัง (MyActivityPage Component) - Clean Modular Architecture
 */
const MyActivityPage = () => {
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

  const {
    loading,
    searchQuery,
    setSearchQuery,
    actionFilter,
    setActionFilter,
    currentPage,
    setCurrentPage,
    entriesPerPage,
    setEntriesPerPage,
    fetchLogs,
    filteredLogs,
    currentEntries,
    indexOfFirstEntry,
    indexOfLastEntry,
    totalPages,
  } = useMyActivityLogs();

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
      <div ref={blob1Ref} className="absolute top-10 left-1/4 w-[450px] h-[450px] bg-teal-500/15 rounded-full filter blur-[100px] pointer-events-none"></div>
      <div ref={blob2Ref} className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-600/20 rounded-full filter blur-[110px] pointer-events-none"></div>
      <div ref={blob3Ref} className="absolute bottom-10 left-1/3 w-[500px] h-[500px] bg-cyan-600/15 rounded-full filter blur-[120px] pointer-events-none"></div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 animate-fade-in-up relative z-10">
        {/* Header Title Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3 tracking-tight">
              <span>🕒</span> {t("myActivity") || "My Activity"}
            </h2>
            <p className="text-xs text-slate-400 mt-1">{t("myActivitySubtitle") || "View and track your own historical actions and logs"}</p>
          </div>
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="group px-5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 flex items-center gap-2"
            style={{
              background: "rgba(30,41,59,0.7)",
              color: "#94a3b8",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(30,41,59,0.9)";
              e.currentTarget.style.color = "#e2e8f0";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(30,41,59,0.7)";
              e.currentTarget.style.color = "#94a3b8";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
            }}
            title={t("refreshDataBtn") || t("refreshBtn") || "Refresh"}
          >
            <svg
              className={`w-3.5 h-3.5 ${
                loading
                  ? "animate-spin text-teal-400"
                  : "group-hover:rotate-180 transition-transform duration-500"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {t("refreshDataBtn") || t("refreshBtn") || "รีเฟรชข้อมูล"}
          </button>
        </div>

        {/* Filters and Search Toolbar */}
        <MyActivityFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          actionFilter={actionFilter}
          setActionFilter={setActionFilter}
          setCurrentPage={setCurrentPage}
          t={t}
        />

        {/* Table View */}
        <MyActivityTable
          loading={loading}
          currentEntries={currentEntries}
          filteredLogs={filteredLogs}
          entriesPerPage={entriesPerPage}
          setEntriesPerPage={setEntriesPerPage}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          indexOfFirstEntry={indexOfFirstEntry}
          indexOfLastEntry={indexOfLastEntry}
          t={t}
        />
      </main>

      <Footer />
    </div>
  );
};

export default MyActivityPage;
