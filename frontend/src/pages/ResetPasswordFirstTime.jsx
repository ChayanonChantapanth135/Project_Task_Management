import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getCurrentUser, signOut, signIn } from "../lib/auth";
import { useLanguage } from "../lib/LanguageContext";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/**
 * คอมโพเนนต์หน้ารีเซ็ตรหัสผ่านครั้งแรก (Reset Password First Time Component) - Ultra-Modern Glassmorphic Theme
 */
const ResetPasswordFirstTime = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [values, setValues] = useState({
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const containerRef = useRef(null);
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);

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
    const fetchUser = async () => {
      const user = await getCurrentUser();
      if (!user) {
        navigate("/login");
      } else {
        setCurrentUser(user);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!values.password || !values.confirmPassword) {
      setError(t("fillAllFields"));
      return;
    }

    if (values.password !== values.confirmPassword) {
      setError(t("passwordsMismatch") || "Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/auth/reset-password-first-time", {
        userId: currentUser.id,
        password: values.password,
      });

      setMessage(t("firstTimeResetSuccess"));

      const updatedUser = { ...currentUser, is_force_reset: 0 };
      const token = localStorage.getItem("userToken");
      const expiresAt = localStorage.getItem("userTokenExpiresAt");
      const expiresInSeconds = expiresAt ? Math.round((Number(expiresAt) - Date.now()) / 1000) : 1200;

      await signIn({
        token,
        expiresInSeconds,
        user: updatedUser,
      });

      setTimeout(() => {
        navigate("/Dashboard");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || t("firstTimeResetFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
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

      {/* Main Glassmorphic Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
        className="glass-panel w-full max-w-md p-8 md:p-10 rounded-3xl z-10 shadow-2xl relative"
      >
        {/* Icon Header */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-500 p-0.5 mx-auto mb-6 shadow-lg shadow-teal-500/30">
          <div className="w-full h-full bg-[#153648] rounded-[14px] flex items-center justify-center text-2xl">
            🔒
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-black text-center text-white mb-2 tracking-tight">
          {t("firstTimeResetTitle")}
        </h1>
        <p className="text-center text-slate-400 text-sm mb-8 font-normal">
          {t("firstTimeResetDesc")}
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
          {/* New Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              {t("newPasswordLabel") || "New Password"}
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
            {loading ? t("updatingPassword") : t("saveNewPassword")}
          </button>

          <div className="text-center pt-3">
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs text-slate-400 hover:text-rose-400 transition-colors bg-transparent border-0 p-0 font-medium"
            >
              {"← " + t("signOut")}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPasswordFirstTime;
