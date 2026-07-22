import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

/**
 * คอมโพเนนต์หน้างานของฉัน (My Tasks Page Component)
 * - แสดงรายการงานที่ได้รับมอบหมายเฉพาะของผู้ใช้งานปัจจุบันที่ล็อกอินอยู่
 */
const MyTasks = () => {
  return (
    <div>
      <Header />
      <div className="container mt-4">
        <h1>My Tasks</h1>
        <p>My Tasks</p>
      </div>
      <Footer />
    </div>
  );
};

export default MyTasks;
