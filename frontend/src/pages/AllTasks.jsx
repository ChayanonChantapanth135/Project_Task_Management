import React from "react";
import Header from "../components/Header";
import Footer from "../components/footer";

/**
 * คอมโพเนนต์หน้างานทั้งหมดในระบบ (All Tasks Page Component)
 * - แสดงและติดตามสถานะงานทั้งหมดจากทุกโปรเจกต์
 */
const AllTasks = () => {
  return (
    <div>
      <Header />
      <div className="container mt-4">
        <h1>All Tasks</h1>
        <p>All Tasks</p>
      </div>
      <Footer />
    </div>
  );
};

export default AllTasks;
