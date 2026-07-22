import React, { useState, useRef } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useLanguage } from "../lib/LanguageContext";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/**
 * คอมโพเนนต์หน้าติดต่อเรา (Contract / Contact Page Component) - Redesigned Dark Luxe Glassmorphism Theme
 */
const Contract = () => {
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
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ fullName: "", email: "", subject: "", message: "" });
    setTimeout(() => setSubmitted(false), 5000);
  };

  const contactInfos = [
    {
      icon: "📍",
      titleKey: "contactAddressLabel",
      valKey: "contactAddressVal",
      gradient: "from-blue-500/20 to-teal-500/20",
    },
    {
      icon: "📧",
      titleKey: "contactEmailLabel",
      val: "support@rnmtask.com / contact@rnmtask.com",
      gradient: "from-indigo-500/20 to-purple-500/20",
    },
    {
      icon: "📞",
      titleKey: "contactPhoneLabel",
      val: "+66 2 123 4567 / +66 81 234 5678",
      gradient: "from-emerald-500/20 to-cyan-500/20",
    },
    {
      icon: "⏰",
      titleKey: "contactHoursLabel",
      valKey: "contactHoursVal",
      gradient: "from-amber-500/20 to-rose-500/20",
    },
  ];

  return (
    <div ref={pageRef} className="min-h-screen flex flex-col bg-[#153648] text-slate-100 font-sans selection:bg-teal-500 selection:text-white relative overflow-hidden">
      <Header />

      {/* GSAP Animated Ambient Orbs */}
      <div ref={blob1Ref} className="absolute top-10 left-1/4 w-[450px] h-[450px] bg-cyan-500/15 rounded-full filter blur-[100px] pointer-events-none"></div>
      <div ref={blob2Ref} className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-600/20 rounded-full filter blur-[110px] pointer-events-none"></div>
      <div ref={blob3Ref} className="absolute bottom-10 left-1/3 w-[500px] h-[500px] bg-teal-600/15 rounded-full filter blur-[120px] pointer-events-none"></div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 animate-fade-in-up relative z-10">
        {/* Hero Header */}
        <div className="glass-panel rounded-3xl p-8 md:p-12 mb-10 shadow-2xl relative overflow-hidden text-center flex flex-col items-center">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 max-w-3xl flex flex-col items-center">
            <span className="inline-block px-3.5 py-1.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-extrabold tracking-wider mb-4 border border-cyan-500/30 uppercase">
              📞 {t("contractTitle")}
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4 tracking-tight">
              {t("contractTitle")}
            </h1>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed font-medium">
              {t("contractSubtitle")}
            </p>
          </div>
        </div>

        {/* Success Alert Toast */}
        {submitted && (
          <div className="mb-8 w-full py-4 px-6 rounded-2xl bg-[#0e3b40] text-emerald-400 text-sm font-semibold flex items-center gap-3 shadow-xl border-0 animate-fade-in-down">
            <span className="w-5 h-5 rounded bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black">
              ✓
            </span>
            <span>{t("sendMessageSuccess")}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Contact Cards */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <span>🏢</span> {t("contactInfoTitle")}
            </h2>
            {contactInfos.map((info, idx) => (
              <div
                key={idx}
                className={`glass-card rounded-2xl p-5 border border-white/10 bg-gradient-to-br ${info.gradient} flex items-start gap-4 hover:-translate-y-0.5 transition-all`}
              >
                <span className="text-2xl p-3 bg-slate-900/60 rounded-xl">
                  {info.icon}
                </span>
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {t(info.titleKey)}
                  </h3>
                  <p className="text-sm font-semibold text-white mt-1 leading-relaxed">
                    {info.valKey ? t(info.valKey) : info.val}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="glass-panel rounded-3xl p-8 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span>✉️</span> {t("sendMessageTitle")}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    {t("formFullName")} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    placeholder={t("formFullNamePlaceholder")}
                    className="w-full bg-slate-900/70 hover:bg-slate-900 focus:bg-slate-900 text-white rounded-xl px-4 py-3 text-sm border-0 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    {t("formEmail")} *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder={t("formEmailPlaceholder")}
                    className="w-full bg-slate-900/70 hover:bg-slate-900 focus:bg-slate-900 text-white rounded-xl px-4 py-3 text-sm border-0 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    {t("formSubject")} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    placeholder={t("formSubjectPlaceholder")}
                    className="w-full bg-slate-900/70 hover:bg-slate-900 focus:bg-slate-900 text-white rounded-xl px-4 py-3 text-sm border-0 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    {t("formMessage")} *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder={t("formMessagePlaceholder")}
                    className="w-full bg-slate-900/70 hover:bg-slate-900 focus:bg-slate-900 text-white rounded-xl px-4 py-3 text-sm border-0 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-teal-500/25 transition-all glow-button"
                >
                  {t("sendMessageBtn")}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contract;
