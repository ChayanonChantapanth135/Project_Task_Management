import React from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { signIn } from "../lib/auth";
import { useLanguage } from "../lib/LanguageContext";
import LanguageSwitcher from "../components/LanguageSwitcher";

/**
 * คอมโพเนนต์หน้าล็อกอิน (Login Page Component)
 * - รับข้อมูล Email และ Password จากผู้ใช้
 * - ตรวจสอบความถูกต้องและส่งคำขอยืนยันตัวตนไปยังเซิร์ฟเวอร์
 * - จัดการบันทึกสถานะการล็อกอินและเปลี่ยนเส้นทางไปยังหน้า Dashboard
 */
const Login = () => {
  const { language, setLanguage, t } = useLanguage();
  const [values, setValues] = React.useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const navigate = useNavigate();

  /**
   * ฟังก์ชันรับและอัปเดตข้อมูลการกรอกฟิลด์อินพุตในแบบฟอร์ม
   */
  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  /**
   * ฟังก์ชันส่งแบบฟอร์มล็อกอิน (Submit handler)
   * - ตรวจสอบความครบถ้วนของข้อมูล
   * - ยิงคำขอ POST ไปหา /auth/login
   * - บันทึกโทเค็นเข้าสู่ระบบ และนำทางผู้ใช้ไปยัง Dashboard
   */
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
      const response = await axios.post(
        "http://127.0.0.1:3000/auth/login",
        values,
      );
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
        setMessage(response.data.message || "กรุณาเปลี่ยนรหัสผ่านก่อนเข้าใช้งานครั้งแรก");
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
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)",
        padding: "1rem",
        position: "relative",
        fontFamily: "'Segoe UI', 'Inter', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Background blobs */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: "-10%",
          width: "500px",
          height: "500px",
          background:
            "radial-gradient(circle, rgba(255,193,7,0.15) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-10%",
          right: "-10%",
          width: "400px",
          height: "400px",
          background:
            "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      {/* Language Switcher */}
      <div
        style={{
          position: "absolute",
          top: "1.5rem",
          right: "1.5rem",
          zIndex: 10,
        }}
      >
        <LanguageSwitcher variant="dark" />
      </div>

      {/* Card */}
      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRadius: "2rem",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow:
            "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset",
          padding: "2.5rem",
          width: "100%",
          maxWidth: "420px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Logo / Icon */}
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "1.25rem",
            background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem auto",
            boxShadow: "0 8px 24px rgba(251,191,36,0.4)",
            fontSize: "1.75rem",
          }}
        >
          🔐
        </div>

        {/* Title */}
        <h1
          style={{
            textAlign: "center",
            fontSize: "1.75rem",
            fontWeight: "800",
            color: "#ffffff",
            marginBottom: "0.25rem",
            letterSpacing: "-0.02em",
          }}
        >
          {t("loginTitle")}
        </h1>
        <p
          style={{
            textAlign: "center",
            color: "rgba(255,255,255,0.45)",
            fontSize: "0.875rem",
            marginBottom: "2rem",
          }}
        >
          {language === "th" ? "ยินดีต้อนรับ" : "Welcome"}
        </p>

        {/* Messages */}
        {message && (
          <div
            style={{
              marginBottom: "1rem",
              padding: "0.75rem 1rem",
              background: "rgba(16,185,129,0.15)",
              border: "1px solid rgba(16,185,129,0.4)",
              borderRadius: "0.875rem",
              color: "#6ee7b7",
              fontSize: "0.875rem",
            }}
          >
            ✅ {message}
          </div>
        )}
        {error && (
          <div
            style={{
              marginBottom: "1rem",
              padding: "0.75rem 1rem",
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.4)",
              borderRadius: "0.875rem",
              color: "#fca5a5",
              fontSize: "0.875rem",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.8rem",
                fontWeight: "600",
                color: "rgba(255,255,255,0.65)",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              {t("emailLabel")}
            </label>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "rgba(255,255,255,0.35)",
                  fontSize: "1rem",
                  pointerEvents: "none",
                }}
              >
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
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "0.75rem 1rem 0.75rem 2.75rem",
                  borderRadius: "0.875rem",
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.07)",
                  color: "#fff",
                  fontSize: "0.95rem",
                  outline: "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(251,191,36,0.6)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(251,191,36,0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255,255,255,0.12)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.8rem",
                fontWeight: "600",
                color: "rgba(255,255,255,0.65)",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              {t("passwordLabel")}
            </label>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "rgba(255,255,255,0.35)",
                  fontSize: "1rem",
                  pointerEvents: "none",
                }}
              >
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
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "0.75rem 3rem 0.75rem 2.75rem",
                  borderRadius: "0.875rem",
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.07)",
                  color: "#fff",
                  fontSize: "0.95rem",
                  outline: "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(251,191,36,0.6)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(251,191,36,0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255,255,255,0.12)";
                  e.target.style.boxShadow = "none";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.4)",
                  fontSize: "0.9rem",
                  padding: "0",
                  lineHeight: "1",
                }}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.85rem",
              borderRadius: "0.875rem",
              border: "none",
              background: loading
                ? "rgba(251,191,36,0.5)"
                : "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
              color: "#1a1a2e",
              fontSize: "1rem",
              fontWeight: "700",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              boxShadow: loading ? "none" : "0 8px 24px rgba(251,191,36,0.35)",
              letterSpacing: "0.02em",
              marginTop: "0.25rem",
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 12px 32px rgba(251,191,36,0.5)";
              }
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 8px 24px rgba(251,191,36,0.35)";
            }}
          >
            {loading
              ? language === "th"
                ? "กำลังเข้าสู่ระบบ..."
                : "Signing in..."
              : t("loginTitle")}
          </button>

          <div style={{ textAlign: "center", marginTop: "1.25rem" }}>
            <Link
              to="/ResetPassword"
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "0.875rem",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseOver={(e) => (e.target.style.color = "#fbbf24")}
              onMouseOut={(e) =>
                (e.target.style.color = "rgba(255,255,255,0.5)")
              }
            >
              {t("forgotPasswordLink")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
