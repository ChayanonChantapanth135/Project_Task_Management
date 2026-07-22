import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

/**
 * คอมโพเนนต์หน้าโปรไฟล์ (Profile Page Component)
 * - แสดงและแก้ไขข้อมูลส่วนตัวของผู้ใช้งาน รวมถึงรูปภาพโปรไฟล์ (Avatar)
 */
const Profile = () => {
  return (
    <div>
      <Header />
      <div className="container mt-4">
        <h1>Profile</h1>
        <p>Profile</p>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
