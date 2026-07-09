import React from "react";
import Header from "../components/Header";
import Footer from "../components/footer";
import { useLanguage } from "../lib/LanguageContext";

const Contract = () => {
  const { t } = useLanguage();
  return (
    <div>
      <Header />
      <div className="container mt-4">
        <h1>Contract</h1>
        <p>Contract</p>
      </div>
      <Footer />
    </div>
  );
};

export default Contract;
