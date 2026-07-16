import React from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useLanguage } from "../lib/LanguageContext";
import LanguageSwitcher from "../components/LanguageSwitcher";

/**
 * คอมโพเนนต์หน้ารีเซ็ตรหัสผ่าน (Reset Password Page Component)
 * - ออกแบบให้มีหน้าตาสวยงามระดับพรีเมียม (Glassmorphism) สอดคล้องกับหน้าล็อกอิน
 * - รับข้อมูลอีเมล รหัสผ่านใหม่ และยืนยันรหัสผ่านใหม่
 * - ทำการตรวจสอบความถูกต้องฝั่งหน้าบ้านก่อนส่งไปยังหลังบ้านเพื่อรีเซ็ตรหัสผ่าน
 */
const ResetPassword = () => {
  const { language, t } = useLanguage();
  const [values, setValues] = React.useState({
    email: "",
    otpCode: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const navigate = useNavigate();

  const [otpCooldown, setOtpCooldown] = React.useState(() => {
    const savedExpiry = localStorage.getItem("otp_expiry");
    if (savedExpiry) {
      const remaining = Math.ceil((parseInt(savedExpiry, 10) - Date.now()) / 1000);
      return remaining > 0 ? remaining : 0;
    }
    return 0;
  });

  React.useEffect(() => {
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
          : "Please enter your email first.",
      );
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await axios.post("http://127.0.0.1:3000/auth/send-otp", {
        email: values.email,
      });
      const receivedOtp = response.data.otpCode;

      // ตั้งเวลาคูลดาวน์ 3 นาที (180 วินาที) และบันทึกลง localStorage เพื่อกันการ refresh หน้าเว็บ
      const expiryTime = Date.now() + 180 * 1000;
      localStorage.setItem("otp_expiry", expiryTime.toString());
      setOtpCooldown(180);

      setMessage(
        language === "th"
          ? `ส่งรหัส OTP ไปยังอีเมลของท่านแล้ว`
          : `OTP sent to your email`,
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (language === "th" ? "ไม่สามารถส่ง OTP ได้" : "Failed to send OTP."),
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
      const response = await axios.post(
        "http://127.0.0.1:3000/auth/reset-password",
        {
          email: values.email,
          otpCode: values.otpCode,
          password: values.password,
        },
      );

      setMessage(response.data.message || t("resetSuccess"));
      setValues({ email: "", otpCode: "", password: "", confirmPassword: "" });

      // นำทางกลับไปยังหน้า Login หลังจากรีเซ็ตสำเร็จใน 2.5 วินาที
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
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-10%",
          right: "-10%",
          width: "500px",
          height: "500px",
          background:
            "radial-gradient(circle, rgba(13,110,253,0.12) 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      {/* Language Switcher container in top-right */}
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

      {/* Glassmorphism Reset Password Card */}
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "rgba(255, 255, 255, 0.04)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderRadius: "1.5rem",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 24px 48px rgba(0, 0, 0, 0.35)",
          padding: "2.5rem 2rem",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <span
            style={{
              fontSize: "2.5rem",
              filter: "drop-shadow(0 4px 8px rgba(251,191,36,0.3))",
            }}
          >
            🔑
          </span>
          <h3
            style={{
              color: "#fff",
              fontWeight: "800",
              marginTop: "0.75rem",
              marginBottom: "0.25rem",
              letterSpacing: "-0.02em",
            }}
          >
            {t("resetPasswordTitle")}
          </h3>
        </div>

        {/* Success/Error Alerts */}
        {error && (
          <div
            className="alert alert-danger d-flex align-items-center gap-2 mb-3"
            style={{
              borderRadius: "0.75rem",
              fontSize: "0.9rem",
              background: "rgba(220, 53, 69, 0.15)",
              border: "1px solid rgba(220, 53, 69, 0.2)",
              color: "#f87171",
            }}
          >
            <span>⚠️</span>
            <div>{error}</div>
          </div>
        )}

        {message && (
          <div
            className="alert alert-success d-flex align-items-center gap-2 mb-3"
            style={{
              borderRadius: "0.75rem",
              fontSize: "0.9rem",
              background: "rgba(25, 135, 84, 0.15)",
              border: "1px solid rgba(25, 135, 84, 0.2)",
              color: "#34d399",
            }}
          >
            <span>✅</span>
            <div>{message}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          {/* Email Input */}
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
                  padding: "0.75rem 7.2rem 0.75rem 2.75rem",
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
                className="btn btn-warning btn-sm"
                onClick={handleSendOtp}
                disabled={loading || otpCooldown > 0}
                style={{
                  position: "absolute",
                  right: "0.5rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  padding: "4px 12px",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  borderRadius: "0.6rem",
                  boxShadow: otpCooldown > 0 ? "none" : "0 2px 8px rgba(251,191,36,0.2)",
                  border: "none",
                  zIndex: 3,
                  cursor: (loading || otpCooldown > 0) ? "not-allowed" : "pointer",
                  backgroundColor: otpCooldown > 0 ? "rgba(251, 191, 36, 0.2)" : undefined,
                  color: otpCooldown > 0 ? "#fbbf24" : undefined,
                  opacity: "1",
                }}
              >
                {loading
                  ? t("loading...")
                  : otpCooldown > 0
                  ? language === "th"
                    ? `รอ ${Math.floor(otpCooldown / 60)}:${(otpCooldown % 60).toString().padStart(2, "0")} นาที`
                    : `${Math.floor(otpCooldown / 60)}:${(otpCooldown % 60).toString().padStart(2, "0")} min`
                  : t("sendOtpBtn")}
              </button>
            </div>
          </div>

          {/*otp code  */}
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
              {t("otpCodeLabel")}
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
                id="otpCode"
                type="text"
                name="otpCode"
                placeholder={t("otpCodePlaceholder")}
                value={values.otpCode}
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

          {/* New Password Input */}
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
              {t("newPasswordLabel")}
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

          {/* Confirm New Password Input */}
          <div>
            <label
              htmlFor="confirmPassword"
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
              {t("confirmPasswordLabel")}
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
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder={t("passwordPlaceholder")}
                value={values.confirmPassword}
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
              marginTop: "0.5rem",
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
                ? "กำลังรีเซ็ต..."
                : "Resetting..."
              : t("resetPasswordTitle")}
          </button>

          {/* Back to Login Link */}
          <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
            <Link
              to="/login"
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
              {language === "th" ? "← กลับไปหน้าล็อกอิน" : "← Back to Login"}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
