import React, { useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { signIn } from "../lib/auth";
import { useLanguage } from "../lib/LanguageContext";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/**
 * คอมโพเนนต์หน้าล็อกอิน (Login Page Component) - Redesigned Ultra-Modern Glassmorphic Login
 */
const Login = () => {
  const { language, t } = useLanguage();
  const [values, setValues] = React.useState({ email: "", password: "" });
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const navigate = useNavigate();

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

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!values.email || !values.password) {
      setError(t("fillAllFields"));
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/auth/login", values);
      const token = response.data.token;

      if (!token) {
        setError("Login failed: token not found");
        setLoading(false);
        return;
      }

      await signIn({
        token,
        expiresInSeconds: response.data.expiresInSeconds || 1200,
        user: response.data.user || {
          email: values.email,
          name: values.email.split("@")[0],
          role: response.data.role || "user",
        },
      });

      if (response.data.requirePasswordReset) {
        setMessage(t("forceResetPrompt"));
        setValues({ email: "", password: "" });
        setTimeout(() => {
          navigate("/reset-password-first-time");
        }, 1500);
        return;
      }

      setMessage(response.data.message || t("loginSuccess"));
      setValues({ email: "", password: "" });

      if (response.status === 201) {
        navigate("/Dashboard");
      }
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

      {/* Main Glassmorphic Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
        className="glass-panel w-full max-w-md p-8 md:p-10 rounded-3xl z-10 shadow-2xl relative"
      >
        {/* Icon Header */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-500 p-0.5 mx-auto mb-6 shadow-lg shadow-teal-500/30">
          <div className="w-full h-full bg-[#153648] rounded-[14px] flex items-center justify-center text-2xl">
            🔐
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-black text-center text-white mb-2 tracking-tight">
          {t("loginTitle")}
        </h1>
        <p className="text-center text-slate-400 text-sm mb-8 font-normal">
          {language === "th" ? "ยินดีต้อนรับสู่ระบบบริหารงาน" : "Welcome back to the portal"}
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
        <form onSubmit={handleSubmit} className="space-y-5">
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
                className="w-full bg-slate-900/60 rounded-2xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none transition-all placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              {t("passwordLabel")}
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-base glow-button transition-all disabled:opacity-50 mt-2"
          >
            {loading
              ? language === "th"
                ? "กำลังเข้าสู่ระบบ..."
                : "Signing in..."
              : t("loginTitle")}
          </button>

          <div className="text-center pt-3">
            <Link
              to="/ResetPassword"
              className="text-xs text-slate-400 hover:text-indigo-400 transition-colors no-underline font-medium"
            >
              {t("forgotPasswordLink")}
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
