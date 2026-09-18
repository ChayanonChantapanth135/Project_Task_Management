import React from "react";
import { useLanguage } from "../lib/LanguageContext";
import { motion } from "framer-motion";

/**
 * คอมโพเนนต์ตัวสลับภาษาแบบ Slide Bar (Interactive Toggle Switch Component)
 * - สวิตช์สไลด์แบบ Capsule/Pill พร้อมอนิเมชัน Framer Motion สำหรับสลับ TH ↔ EN
 * - รองรับธีม Light / Dark
 */
const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();
  const isEn = language === "en";

  return (
    <div
      role="group"
      aria-label="Language selection"
      className="inline-flex items-center p-1 rounded-full transition-all select-none shadow-inner"
      style={{
        background: "var(--bg-surface-hover)",
        border: "1px solid var(--border-surface)",
      }}
    >
      <button
        type="button"
        onClick={() => setLanguage("th")}
        className="px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer focus:outline-none"
        style={{
          backgroundColor: !isEn ? "var(--brand-color)" : "transparent",
          color: !isEn ? "#ffffff" : "var(--text-secondary)",
          boxShadow: !isEn ? "0 2px 6px rgba(0,0,0,0.2)" : "none",
        }}
      >
        TH
      </button>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className="px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer focus:outline-none"
        style={{
          backgroundColor: isEn ? "var(--brand-color)" : "transparent",
          color: isEn ? "#ffffff" : "var(--text-secondary)",
          boxShadow: isEn ? "0 2px 6px rgba(0,0,0,0.2)" : "none",
        }}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSwitcher;

