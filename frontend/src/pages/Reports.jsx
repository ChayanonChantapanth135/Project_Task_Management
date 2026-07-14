import React from "react";
import Header from "../components/Header";
import Footer from "../components/footer";

/**
 * คอมโพเนนต์หน้ารายงานโครงการ (Reports Page Component)
 * - สรุปข้อมูลวิเคราะห์ สถิติ และความคืบหน้าของโครงการ/งานทั้งหมดในระบบ
 */
const Reports = () => {
  return (
    <div>
      <Header />
      <div className="container mt-4">
        <h1>Projects Reports</h1>
        <p>Reports</p>
      </div>
      <Footer />
    </div>
  );
};

export default Reports;
