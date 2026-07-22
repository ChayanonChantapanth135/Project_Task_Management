import React from "react";
import { useLanguage } from "../lib/LanguageContext";
import { motion } from "framer-motion";

/**
 * คอมโพเนนต์ตัวสลับภาษาแบบ Slide Bar (Interactive Toggle Switch Component)
 * - สวิตช์สไลด์แบบ Capsule/Pill พร้อมอนิเมชัน Framer Motion สำหรับสลับ TH ↔ EN
 * - รองรับธีม Light / Dark
 */
const LanguageSwitcher = ({ variant = "light" }) => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "th" ? "en" : "th");
  };

  const isEn = language === "en";
  const isDark = variant === "dark";

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      title={isEn ? "Switch to Thai (TH)" : "Switch to English (EN)"}
      aria-label="Toggle language switch"
      className={`relative inline-flex items-center h-8 w-16 p-1 transition-colors duration-300 focus:outline-none select-none cursor-pointer border-0 ${
        isEn
          ? isDark
            ? "bg-slate-800"
            : "bg-slate-700"
          : isDark
            ? "bg-indigo-600"
            : "bg-indigo-500"
      }`}
      style={{
        borderRadius: "9999px",
        boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.25)",
      }}
    >
      {/* Background Labels */}
      <span className="absolute left-2.5 text-[10px] font-extrabold text-white/90 pointer-events-none select-none">
        TH
      </span>
      <span className="absolute right-2.5 text-[10px] font-extrabold text-white/90 pointer-events-none select-none">
        EN
      </span>

      {/* Sliding White Circle Thumb */}
      <motion.div
        className="w-6 h-6 bg-white shadow-md flex items-center justify-center text-[10px] font-black text-slate-800 z-10"
        style={{ borderRadius: "50%" }}
        animate={{ x: isEn ? 32 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
      >
        {isEn ? "EN" : "TH"}
      </motion.div>
    </button>
  );
};

export default LanguageSwitcher;
