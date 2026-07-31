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
              <span>🕒</span> {t("myActivity") || "My Activity"}
            </h2>
            <p className="text-xs text-slate-400 mt-1">{t("myActivitySubtitle") || "View and track your own historical actions and logs"}</p>
          </div>
          <button
            className="px-5 py-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-all"
            onClick={fetchLogs}
            title={t("refreshBtn") || "Refresh"}
          >
            <span>⭮</span> {t("refreshBtn") || "รีเฟรชข้อมูล"}
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
