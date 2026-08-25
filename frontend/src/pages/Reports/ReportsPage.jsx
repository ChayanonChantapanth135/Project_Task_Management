import React, { useRef } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useLanguage } from "../../lib/LanguageContext";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { useReportsData } from "./hooks/useReportsData";
import ReportHeader from "./components/ReportHeader";
import AdminReportView from "./components/AdminReportView";
import ManagerReportView from "./components/ManagerReportView";
import TeamLeaderReportView from "./components/TeamLeaderReportView";
import UserReportView from "./components/UserReportView";

/**
 * คอมโพเนนต์หน้ารายงานโครงการและวิเคราะห์สถิติ (Reports & Analytics Page Component)
 * - สรุปข้อมูลวิเคราะห์ สถิติ และประสิทธิภาพการทำงาน ปรับการแสดงผลตามระดับสิทธิ์ของผู้ใช้งาน (Role-Based View)
 */
const ReportsPage = () => {
  const { t } = useLanguage();
  const reportData = useReportsData();
  const {
    loading,
    isAdmin,
    isManager,
    isTeamLeader,
    refreshData,
    exportToExcel,
    printReport,
  } = reportData;

  // Animation Refs
  const pageRef = useRef(null);
  const headerRef = useRef(null);
  const contentRef = useRef(null);

  useGSAP(() => {
    // Header entrance
    if (headerRef.current) {
      gsap.fromTo(headerRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }
      );
    }

    // Content entrance with stagger
    if (contentRef.current) {
      const sections = contentRef.current.querySelectorAll(":scope > div > div");
      if (sections.length > 0) {
        gsap.fromTo(sections,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: "power3.out", delay: 0.3 }
        );
      }
    }
  }, { scope: pageRef, dependencies: [loading] });

  // Role titles & descriptions
  let roleTitle = t("reportsHeaderTitle");
  let roleDesc = t("reportsHeaderDesc");

  if (isAdmin) {
    roleTitle = t("adminReportTitle");
    roleDesc = t("adminReportDesc");
  } else if (isManager) {
    roleTitle = t("managerReportTitle");
    roleDesc = t("managerReportDesc");
  } else if (isTeamLeader) {
    roleTitle = t("teamLeaderReportTitle");
    roleDesc = t("teamLeaderReportDesc");
  }

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

      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full relative z-10">
        <div ref={headerRef}>
          <ReportHeader
            roleTitle={roleTitle}
            roleDesc={roleDesc}
            onExportExcel={exportToExcel}
            onPrint={printReport}
            onRefresh={refreshData}
          />
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-32 gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
                style={{
                  borderTopColor: "#14b8a6",
                  borderRightColor: "#6366f1",
                  animationDuration: "1s",
                }}
              />
              <div className="absolute inset-2 rounded-full border-2 border-transparent animate-spin"
                style={{
                  borderBottomColor: "#a855f7",
                  borderLeftColor: "#06b6d4",
                  animationDuration: "1.5s",
                  animationDirection: "reverse",
                }}
              />
            </div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider animate-pulse">
              Loading analytics...
            </span>
          </div>
        ) : (
          <div ref={contentRef}>
            {isAdmin && <AdminReportView data={reportData} />}
            {isManager && <ManagerReportView data={reportData} />}
            {isTeamLeader && <TeamLeaderReportView data={reportData} />}
            {!isAdmin && !isManager && !isTeamLeader && (
              <UserReportView data={reportData} />
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ReportsPage;
