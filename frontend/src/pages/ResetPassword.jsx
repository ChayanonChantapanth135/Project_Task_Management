import React, { useRef, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useLanguage } from "../lib/LanguageContext";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/**
 * คอมโพเนนต์หน้ารีเซ็ตรหัสผ่าน (Reset Password Page Component) - Redesigned Ultra-Modern Glassmorphic Theme
 */
const ResetPassword = () => {
  const { language, t } = useLanguage();
  const [values, setValues] = useState({
    email: "",
    otpCode: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const containerRef = useRef(null);
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);

  const [otpCooldown, setOtpCooldown] = useState(() => {
    const savedExpiry = localStorage.getItem("otp_expiry");
    if (savedExpiry) {
      const remaining = Math.ceil((parseInt(savedExpiry, 10) - Date.now()) / 1000);
      return remaining > 0 ? remaining : 0;
    }
    return 0;
  });

  useGSAP(() => {
    gsap.to(orb1Ref.current, {
      x: 40,
      y: -40,
      duration: 6,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
    gsap.to(orb2Ref.current, {
      x: -40,
      y: 40,
      duration: 8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }, { scope: containerRef });

  useEffect(() => {
    let timer;
    if (otpCooldown > 0) {
      timer = setInterval(() => {
        setOtpCooldown((prev) => {
          if (prev <= 1) {
            localStorage.removeItem("otp_expiry");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [otpCooldown]);

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async () => {
    if (!values.email) {
      setError(
        language === "th"
          ? "กรุณากรอกอีเมลก่อนส่ง OTP"
          : "Please enter your email first."
      );
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await axios.post("/auth/send-otp", {
        email: values.email,
      });

      const expiryTime = Date.now() + 180 * 1000;
      localStorage.setItem("otp_expiry", expiryTime.toString());
      setOtpCooldown(180);

      setMessage(
        language === "th"
          ? "ส่งรหัส OTP ไปยังอีเมลของท่านแล้ว"
          : "OTP sent to your email"
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (language === "th" ? "ไม่สามารถส่ง OTP ได้" : "Failed to send OTP.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (
      !values.email ||
      !values.otpCode ||
      !values.password ||
      !values.confirmPassword
    ) {
      setError(t("fillAllFields"));
      return;
    }

    if (values.password !== values.confirmPassword) {
      setError(t("passwordsMismatch"));
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/auth/reset-password", {
        email: values.email,
        otpCode: values.otpCode,
        password: values.password,
      });

      setMessage(response.data.message || t("resetSuccess"));
      setValues({ email: "", otpCode: "", password: "", confirmPassword: "" });

      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.message || t("loginFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex items-center justify-center bg-[#153648] p-4 relative overflow-hidden font-sans selection:bg-teal-500 selection:text-white"
    >
      {/* Background Animated GSAP Glowing Orbs */}
      <div
        ref={orb1Ref}
        className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-teal-500/25 rounded-full filter blur-[120px] pointer-events-none"
      />
      <div
        ref={orb2Ref}
        className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-cyan-500/20 rounded-full filter blur-[120px] pointer-events-none"
      />

      {/* Language Switcher Positioned Top-Right */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageSwitcher variant="dark" />
      </div>

      {/* Main Glassmorphic Reset Password Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
        className="glass-panel w-full max-w-md p-8 md:p-10 rounded-3xl z-10 shadow-2xl relative"
      >
        {/* Icon Header */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-500 p-0.5 mx-auto mb-6 shadow-lg shadow-teal-500/30">
          <div className="w-full h-full bg-[#153648] rounded-[14px] flex items-center justify-center text-2xl">
            🔑
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-black text-center text-white mb-2 tracking-tight">
          {t("resetPasswordTitle")}
        </h1>
        <p className="text-center text-slate-400 text-sm mb-8 font-normal">
          {language === "th"
            ? "กรอกข้อมูลและรหัส OTP เพื่อตั้งรหัสผ่านใหม่"
            : "Enter details and OTP code to set new password"}
        </p>

        {/* Feedback Messages */}
        {message && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/15 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            ✅ {message}
          </div>
        )}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/15 text-rose-300 text-xs font-semibold flex items-center gap-2">
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              {t("emailLabel")}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">
                📩
              </span>
              <input
                id="email"
                type="email"
                name="email"
                placeholder={t("emailPlaceholder")}
                value={values.email}
                onChange={handleChange}
                required
                className="w-full bg-slate-900/60 rounded-2xl py-3 pl-11 pr-28 text-white text-sm focus:outline-none transition-all placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading || otpCooldown > 0}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all disabled:opacity-50"
              >
                {loading
                  ? "..."
                  : otpCooldown > 0
                  ? `${Math.floor(otpCooldown / 60)}:${(otpCooldown % 60)
                      .toString()
                      .padStart(2, "0")}`
                  : t("sendOtpBtn")}
              </button>
            </div>
          </div>

          {/* OTP Code */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              {t("otpCodeLabel")}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">
                🔢
              </span>
              <input
                id="otpCode"
                type="text"
                name="otpCode"
                placeholder={t("otpCodePlaceholder")}
                value={values.otpCode}
                onChange={handleChange}
                required
                className="w-full bg-slate-900/60 rounded-2xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none transition-all placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              {t("newPasswordLabel")}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">
                🔑
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder={t("passwordPlaceholder")}
                value={values.password}
                onChange={handleChange}
                required
                className="w-full bg-slate-900/60 rounded-2xl py-3 pl-11 pr-11 text-white text-sm focus:outline-none transition-all placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors text-sm"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              {t("confirmPasswordLabel")}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">
                🔑
              </span>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder={t("passwordPlaceholder")}
                value={values.confirmPassword}
                onChange={handleChange}
                required
                className="w-full bg-slate-900/60 rounded-2xl py-3 pl-11 pr-11 text-white text-sm focus:outline-none transition-all placeholder:text-slate-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-base glow-button transition-all disabled:opacity-50 mt-4"
          >
            {loading
              ? language === "th"
                ? "กำลังรีเซ็ต..."
                : "Resetting..."
              : t("resetPasswordTitle")}
          </button>

          <div className="text-center pt-3">
            <Link
              to="/login"
              className="text-xs text-slate-400 hover:text-indigo-400 transition-colors no-underline font-medium"
            >
              {language === "th" ? "← กลับไปหน้าล็อกอิน" : "← Back to Login"}
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
