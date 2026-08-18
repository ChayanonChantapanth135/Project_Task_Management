import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const PersonalTaskPage = () => {
  return (
    <div className="min-h-screen bg-[#153648]">
      <Header />
      <div className="flex justify-center items-center min-h-[calc(100vh-130px)]">
        <h3 className="text-2xl text-white font-bold">PersonalTaskPage</h3>
      </div>
      <Footer />
    </div>
  );
};

export default PersonalTaskPage;
