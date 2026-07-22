import React, { useRef } from "react";
import Header from "../components/Header";
import Footer from "../components/footer";
import { useLanguage } from "../lib/LanguageContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/**
 * คอมโพเนนต์หน้าแรก (Home Page Component) - Redesigned with GSAP Animations & Ultra Modern Aesthetics
 */
const Home = () => {
  const { t } = useLanguage();
  const isLoggedIn = !!localStorage.getItem("userToken");
  const heroRef = useRef(null);
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
  }, { scope: heroRef });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  return (
    <div ref={heroRef} className="min-h-screen flex flex-col bg-[#153648] text-slate-100 font-sans selection:bg-teal-500 selection:text-white relative overflow-hidden">
      <Header />

      {/* GSAP Animated Ambient Orbs */}
      <div ref={blob1Ref} className="absolute top-10 left-1/4 w-[450px] h-[450px] bg-indigo-600/20 rounded-full filter blur-[100px] pointer-events-none"></div>
      <div ref={blob2Ref} className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-violet-600/20 rounded-full filter blur-[110px] pointer-events-none"></div>
      <div ref={blob3Ref} className="absolute bottom-10 left-1/3 w-[500px] h-[500px] bg-pink-600/15 rounded-full filter blur-[120px] pointer-events-none"></div>

      <main className="flex-1 z-10">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center relative"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-950/60 text-indigo-300 text-xs font-semibold mb-8 backdrop-blur-md shadow-lg shadow-indigo-500/10"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            {t("landingBadge") || "🚀 แพลตฟอร์มจัดการโปรเจกต์และงานสำหรับทีมยุคใหม่"}
          </motion.div>

          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-white leading-tight max-w-5xl mx-auto">
            {t("landingHeroTitle") || "บริหารจัดการโปรเจกต์และงานในทีม"}
            <span className="block mt-3 gradient-text">
              {t("landingHeroTitleAccent") || "ง่าย ครบจบในที่เดียว และเป็นระบบ"}
            </span>
          </h1>

          <p className="mt-8 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-normal">
            {t("landingHeroDesc") ||
              "ช่วยให้ทีมของคุณทำงานร่วมกันได้อย่างราบรื่น ติดตามกำหนดส่งงานผ่านปฏิทิน อัปเดตสถานะงานได้แบบเรียลไทม์ พร้อมบันทึกประวัติการทำงานของระบบอย่างเป็นระเบียบ"}
          </p>

          <div className="mt-12 flex flex-wrap justify-center gap-5">
            {isLoggedIn ? (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/Dashboard"
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-base glow-button no-underline inline-block"
                >
                  {t("goToDashboard") || "เข้าสู่หน้าแดชบอร์ด 📊"}
                </Link>
              </motion.div>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/Login"
                    className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-base glow-button no-underline inline-block"
                  >
                    {t("getStartedBtn") || "เริ่มต้นใช้งานฟรี ✨"}
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <a
                    href="#features"
                    className="px-8 py-4 rounded-2xl glass-panel text-slate-200 font-semibold text-base hover:bg-slate-800/80 transition-all duration-200 no-underline inline-block"
                  >
                    {t("learnMoreBtn") || "เรียนรู้เพิ่มเติม"}
                  </a>
                </motion.div>
              </>
            )}
          </div>
        </motion.section>

        {/* Highlight Stats */}
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="glass-panel rounded-3xl p-8 md:p-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center shadow-2xl">
              <motion.div whileHover={{ y: -5 }} className="p-4 transition-all">
                <div className="text-5xl font-extrabold gradient-text mb-2">10x</div>
                <div className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                  {t("statProductivity") || "เพิ่มประสิทธิภาพการทำงาน"}
                </div>
              </motion.div>
              <motion.div whileHover={{ y: -5 }} className="p-4 border-y md:border-y-0 md:border-x border-slate-800 transition-all">
                <div className="text-5xl font-extrabold gradient-text-emerald mb-2">100%</div>
                <div className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                  {t("statAlignment") || "ทีมทำงานสอดคล้องกัน 100%"}
                </div>
              </motion.div>
              <motion.div whileHover={{ y: -5 }} className="p-4 transition-all">
                <div className="text-5xl font-extrabold text-pink-400 mb-2">0</div>
                <div className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                  {t("statMissedDeadlines") || "ลดการส่งงานล่าช้ากว่ากำหนด"}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white">
              {t("landingFeaturesTitle") || "ฟีเจอร์เด่นที่จะช่วยให้งานคุณราบรื่น"}
            </h2>
            <p className="mt-4 text-slate-400 max-w-xl mx-auto text-base">
              {t("landingFeaturesDesc") || "ระบบของเราออกแบบมาอย่างพิถีพิถันเพื่อตอบโจทย์ทุกขั้นตอนในการบริหารจัดการงานและโครงการ"}
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {/* Feature 1 */}
            <motion.div variants={itemVariants} className="glass-card rounded-3xl p-8 cursor-pointer">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-3xl mb-6 shadow-inner">
                📁
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {t("featureProjTitle") || "จัดการโปรเจกต์"}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {t("featureProjDesc") || "สร้างโปรเจกต์หลัก กำหนดหัวหน้าทีม และติดตามความคืบหน้าของโปรเจกต์ได้โดยอัตโนมัติ"}
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div variants={itemVariants} className="glass-card rounded-3xl p-8 cursor-pointer">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-3xl mb-6 shadow-inner">
                ⏱️
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {t("featureTaskTitle") || "ติดตามสถานะงาน"}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {t("featureTaskDesc") || "ควบคุมสถานะของงานย่อยได้อย่างละเอียด ไม่ว่าจะเป็นงานที่รอดำเนินการ, กำลังทำ, อยู่ระหว่างตรวจสอบ หรือเสร็จสิ้นแล้ว"}
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div variants={itemVariants} className="glass-card rounded-3xl p-8 cursor-pointer">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center text-3xl mb-6 shadow-inner">
                📅
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {t("featureCalTitle") || "ปฏิทินส่งงาน"}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {t("featureCalDesc") || "ดูวันส่งงานของทุกโปรเจกต์ได้บนปฏิทินแบบ Interactive ป้องกันการลืมวันส่งงานสำคัญ"}
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div variants={itemVariants} className="glass-card rounded-3xl p-8 cursor-pointer">
              <div className="w-14 h-14 rounded-2xl bg-pink-500/20 flex items-center justify-center text-3xl mb-6 shadow-inner">
                👥
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {t("featureTeamTitle") || "บันทึกประวัติกิจกรรม"}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {t("featureTeamDesc") || "ตรวจสอบประวัติการทำงานย้อนหลังของทุกคนในระบบได้อย่างโปร่งใส รู้ทุกการอัปเดตและการเปลี่ยนแปลง"}
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* CTA Bottom Banner */}
        <section className="py-20 px-6 relative">
          <div className="max-w-5xl mx-auto glass-panel rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full filter blur-3xl pointer-events-none"></div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
              {t("landingCtaTitle") || "พร้อมที่จะยกระดับการทำงานของทีมคุณแล้วหรือยัง?"}
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto mb-10 text-base leading-relaxed">
              {t("landingCtaDesc") || "เริ่มต้นจัดการโปรเจกต์ของคุณอย่างเป็นระบบตั้งแต่วันนี้ ใช้งานได้ฟรี!"}
            </p>
            {isLoggedIn ? (
              <Link
                to="/Dashboard"
                className="px-10 py-4 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-extrabold shadow-xl text-base glow-button no-underline inline-block"
              >
                {t("goToDashboard") || "ไปที่แดชบอร์ดเลย 📊"}
              </Link>
            ) : (
              <Link
                to="/Login"
                className="px-10 py-4 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-extrabold shadow-xl text-base glow-button no-underline inline-block"
              >
                {t("getStartedBtn") || "เริ่มต้นสมัครใช้งานฟรี ✨"}
              </Link>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
