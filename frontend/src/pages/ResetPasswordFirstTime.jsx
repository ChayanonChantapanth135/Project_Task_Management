import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getCurrentUser, signOut, signIn } from "../lib/auth";
import { useLanguage } from "../lib/LanguageContext";
import LanguageSwitcher from "../components/LanguageSwitcher";

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

      // อัปเดตสถานะใน localStorage เพื่อลบ flag บังคับรีเซ็ตออก
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
            🔒
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
            {t("firstTimeResetTitle")}
          </h3>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.85rem" }}>
            {t("firstTimeResetDesc")}
          </p>
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
              {t("newPasswordLabel") || "New Password"}
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
                type="password"
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
          >
            {loading ? t("updatingPassword") : t("saveNewPassword")}
          </button>

          {/* Logout Button */}
          <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.5)",
                fontSize: "0.875rem",
                cursor: "pointer",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseOver={(e) => (e.target.style.color = "#f87171")}
              onMouseOut={(e) =>
                (e.target.style.color = "rgba(255,255,255,0.5)")
              }
            >
              {"← " + t("signOut")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordFirstTime;
