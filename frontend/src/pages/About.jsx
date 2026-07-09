import React from "react";
import Header from "../components/Header";
import Footer from "../components/footer";
import { useLanguage } from "../lib/LanguageContext";

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
