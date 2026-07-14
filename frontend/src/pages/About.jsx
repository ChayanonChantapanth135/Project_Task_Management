import React from "react";
import Header from "../components/Header";
import Footer from "../components/footer";
import { useLanguage } from "../lib/LanguageContext";

/**
 * คอมโพเนนต์หน้าเกี่ยวกับเรา (About Page Component)
 * - แสดงรายละเอียดเกี่ยวกัยบริษัท/ระบบงาน
 */
const About = () => {
  const { t } = useLanguage();
  return (
    <div>
      <Header />
      <div className="container mt-4">
        <h1>About</h1>
        <p>About</p>
      </div>
      <Footer />
    </div>
  );
};

export default About;
