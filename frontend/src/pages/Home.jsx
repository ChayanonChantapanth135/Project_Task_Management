import React from "react";
import Header from "../components/Header";
import Footer from "../components/footer";
import { useLanguage } from "../lib/LanguageContext";

const Home = () => {
  const { t } = useLanguage();

  return (
    <div>
      <Header />
      <div className="container mt-4">
        <h1 className="text-3xl text-blue-400">Home</h1>
        <p className="text-blue-400">Home</p>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
