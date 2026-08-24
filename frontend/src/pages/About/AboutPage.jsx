import React, { useRef } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useLanguage } from "../../lib/LanguageContext";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import AboutFeatures from "./components/AboutFeatures";
import TechStackGrid from "./components/TechStackGrid";

/**
 * คอมโพเนนต์หน้าเกี่ยวกับเรา (AboutPage Component) - Clean Modular Architecture
 */
const AboutPage = () => {
  const { t } = useLanguage();
  const pageRef = useRef(null);
  const blob1Ref = useRef(null);
  const blob2Ref = useRef(null);
  const blob3Ref = useRef(null);

  useGSAP(() => {
    // GSAP Floating Ambient Background Blobs
    gsap.to(blob1Ref.current, {
      x: 60,
      y: -40,
      duration: 8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
    gsap.to(blob2Ref.current, {
      x: -50,
      y: 50,
      duration: 10,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
    gsap.to(blob3Ref.current, {
      x: 40,
      y: 30,
      duration: 9,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }, { scope: pageRef });

  const features = [
    {
      icon: "📊",
      titleKey: "featureAnalyticsTitle",
      descKey: "featureAnalyticsDesc",
      badge: "Analytics",
      gradient: "from-blue-500/20 to-teal-500/20",
    },
    {
      icon: "📂",
      titleKey: "featureWorkflowTitle",
      descKey: "featureWorkflowDesc",
      badge: "Workflow",
      gradient: "from-indigo-500/20 to-purple-500/20",
    },
    {
      icon: "🛡️",
      titleKey: "featureAccessTitle",
      descKey: "featureAccessDesc",
      badge: "Security",
      gradient: "from-emerald-500/20 to-cyan-500/20",
    },
    {
      icon: "📜",
      titleKey: "featureAuditTitle",
      descKey: "featureAuditDesc",
      badge: "Audit Trail",
      gradient: "from-amber-500/20 to-rose-500/20",
    },
  ];

  const techStack = [
    { name: "React 18", category: "Frontend Framework", icon: "⚛️" },
    { name: "Vite", category: "Build Tool & HMR", icon: "⚡" },
    { name: "Node.js & Express", category: "Backend REST API", icon: "🟢" },
    { name: "MySQL 8", category: "Relational Database", icon: "🐬" },
    { name: "Tailwind CSS", category: "Styling & Tokens", icon: "🎨" },
    { name: "Glassmorphism UI", category: "Design System", icon: "💎" },
  ];

  return (
    <div 
      ref={pageRef} 
      className="min-h-screen flex flex-col font-sans relative overflow-hidden"
      style={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
    >
      <Header />

      {/* GSAP Animated Ambient Orbs */}
      <div ref={blob1Ref} className="absolute top-10 left-1/4 w-[450px] h-[450px] bg-teal-500/15 rounded-full filter blur-[100px] pointer-events-none"></div>
      <div ref={blob2Ref} className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-600/20 rounded-full filter blur-[110px] pointer-events-none"></div>
      <div ref={blob3Ref} className="absolute bottom-10 left-1/3 w-[500px] h-[500px] bg-cyan-600/15 rounded-full filter blur-[120px] pointer-events-none"></div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 animate-fade-in-up relative z-10">
        {/* Hero Section */}
        <div className="glass-panel rounded-3xl p-8 md:p-12 mb-10 shadow-2xl relative overflow-hidden text-center flex flex-col items-center">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 max-w-3xl flex flex-col items-center">
            <span className="inline-block px-3.5 py-1.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-extrabold tracking-wider mb-4 uppercase">
              🚀 {t("aboutTitle")}
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4 tracking-tight">
              {t("aboutTitle")}
            </h1>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed font-medium">
              {t("aboutSubtitle")}
            </p>
          </div>
        </div>

        {/* Vision & Mission Section */}
        <div className="glass-card rounded-3xl p-8 mb-10 shadow-xl border border-white/10">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-3 flex items-center gap-3">
            <span>🎯</span> {t("aboutVisionTitle")}
          </h2>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            {t("aboutVisionDesc")}
          </p>
        </div>

        {/* Core Features Grid */}
        <AboutFeatures features={features} t={t} />

        {/* Tech Stack Grid */}
        <TechStackGrid techStack={techStack} t={t} />
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;
