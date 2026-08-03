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

  // Background Animation Refs
  const pageRef = useRef(null);
  const blob1Ref = useRef(null);
  const blob2Ref = useRef(null);
  const blob3Ref = useRef(null);

  useGSAP(() => {
    gsap.to(blob1Ref.current, { x: 50, y: -30, duration: 8, repeat: -1, yoyo: true, ease: "sine.inOut" });
    gsap.to(blob2Ref.current, { x: -40, y: 40, duration: 10, repeat: -1, yoyo: true, ease: "sine.inOut" });
    gsap.to(blob3Ref.current, { x: 30, y: 20, duration: 9, repeat: -1, yoyo: true, ease: "sine.inOut" });
  }, { scope: pageRef });

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
    <div ref={pageRef} className="min-h-screen flex flex-col bg-[#153648] text-slate-100 font-sans relative overflow-hidden">
      <Header />

      {/* Background Animated Blobs */}
      <div ref={blob1Ref} className="absolute top-10 left-1/4 w-[400px] h-[400px] bg-teal-500/10 rounded-full filter blur-[100px] pointer-events-none"></div>
      <div ref={blob2Ref} className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-indigo-600/15 rounded-full filter blur-[110px] pointer-events-none"></div>
      <div ref={blob3Ref} className="absolute bottom-10 left-1/3 w-[450px] h-[450px] bg-cyan-600/10 rounded-full filter blur-[120px] pointer-events-none"></div>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full relative z-10">
        <ReportHeader
          roleTitle={roleTitle}
          roleDesc={roleDesc}
          onExportExcel={exportToExcel}
          onPrint={printReport}
          onRefresh={refreshData}
        />

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
          </div>
        ) : (
          <div>
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
