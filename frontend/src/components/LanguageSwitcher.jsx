import React from "react";
import { useLanguage } from "../lib/LanguageContext";

const LanguageSwitcher = ({ variant = "light", size = "sm" }) => {
  const { language, setLanguage } = useLanguage();

  const isDark = variant === "dark";

  return (
    <div
      className={`btn-group btn-group-${size}`}
      role="group"
      aria-label="Language Selector"
    >
      <button
        type="button"
        className={`btn btn-${size} py-1 px-2.5 transition-all ${
          language === "th"
            ? "btn-warning text-dark font-weight-bold shadow-sm"
            : isDark
            ? "btn-outline-light"
            : "btn-outline-secondary"
        }`}
        style={{ fontSize: "0.75rem", fontWeight: "bold" }}
        onClick={() => setLanguage("th")}
      >
        TH
      </button>
      <button
        type="button"
        className={`btn btn-${size} py-1 px-2.5 transition-all ${
          language === "en"
            ? "btn-warning text-dark font-weight-bold shadow-sm"
            : isDark
            ? "btn-outline-light"
            : "btn-outline-secondary"
        }`}
        style={{ fontSize: "0.75rem", fontWeight: "bold" }}
        onClick={() => setLanguage("en")}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSwitcher;
