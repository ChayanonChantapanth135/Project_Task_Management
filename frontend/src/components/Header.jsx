import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import logoW from "../assets/LogoW.png";
import logoB from "../assets/LogoB.png";
import { signOut, getCurrentUser } from "../lib/auth";
import { useLanguage } from "../lib/LanguageContext";
import { useTheme } from "../lib/ThemeContext";
import axios from "axios";
import LanguageSwitcher from "./LanguageSwitcher";
import NotificationBell from "./NotificationBell";
import { API_URL } from "../config";

/**
 * คอมโพเนนต์แถบเมนูด้านบน (Header / Navigation Bar Component) - Redesigned Glassmorphic Floating Header
 */
const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();
  const {
    appearance,
    setAppearance,
    accentColor,
    setAccentColor,
    isDark,
    currentAccent,
    availableAccents,
  } = useTheme();

  const [showThemeModal, setShowThemeModal] = useState(false);
  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          try {
            const res = await axios.get(`/auth/users/${currentUser.id}`);
            setUser({
              ...currentUser,
              avatar: res.data.avatar,
              role: res.data.role,
            });
          } catch {
            setUser(currentUser);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
    window.addEventListener("authChanged", checkUser);
    window.addEventListener("storage", checkUser);
    return () => {
      window.removeEventListener("authChanged", checkUser);
      window.removeEventListener("storage", checkUser);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      navigate("/Home");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const isLoggedIn = user !== null;

  const isActive = (path) =>
    location.pathname.toLowerCase() === path.toLowerCase();

  return (
    <>
      <header className="sticky top-0 z-50 px-4 py-3 bg-[#153648]/90 backdrop-blur-2xl shadow-xl shadow-black/20 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/Home"
            className="flex items-center gap-2 no-underline group"
          >
            <span
              className="text-xl font-black tracking-wider transition-transform group-hover:scale-105"
              style={{ color: "var(--text-primary)" }}
            >
              PROJECT <span className="gradient-text">TASK</span>
            </span>
          </Link>

          {/* Navigation Links */}
          {isLoggedIn && (
            <nav className="hidden md:flex items-center gap-1 bg-slate-800/80 p-1.5 rounded-2xl backdrop-blur-md">
              <Link
                to="/Dashboard"
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all no-underline ${
                  isActive("/dashboard")
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {t("dashboard")}
              </Link>
              {user?.role === "admin" && (
                <Link
                  to="/ManageUsers"
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all no-underline ${
                    isActive("/manageusers")
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {t("manageUsers")}
                </Link>
              )}
              <Link
                to="/PersonalTask"
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all no-underline ${
                  isActive("/PersonalTask")
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {t("personalTask")}
              </Link>
              <Link
                to="/Projects"
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all no-underline ${
                  isActive("/projects")
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {t("projects")}
              </Link>
              <Link
                to={user?.role === "admin" ? "/AllTasks" : "/MyTasks"}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all no-underline ${
                  isActive(user?.role === "admin" ? "/alltasks" : "/mytasks")
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {user?.role === "admin" ? t("allTasks") : t("myTask")}
              </Link>
              <Link
                to="/Reports"
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all no-underline ${
                  isActive("/reports")
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {t("reports")}
              </Link>
            </nav>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-3 sm:gap-4">
            {isLoggedIn && <NotificationBell />}
            <LanguageSwitcher variant="dark" />

            <div>
              {loading ? (
                <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
              ) : isLoggedIn ? (
                <Dropdown align="end">
                  <Dropdown.Toggle
                    variant="link"
                    className="p-0 border-0 flex items-center no-underline focus:ring-0 after:hidden shadow-none"
                    id="dropdown-profile"
                  >
                    <div className="p-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 hover:scale-105 transition-transform">
                      {user?.avatar ? (
                        <img
                          src={
                            user.avatar.startsWith("http")
                              ? user.avatar
                              : `${API_URL}${user.avatar}`
                          }
                          alt="Profile"
                          className="w-9 h-9 rounded-full object-cover border-2 border-[#153648]"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-slate-800 border-2 border-[#153648] flex items-center justify-center text-teal-400 font-bold text-sm">
                          {user?.name?.[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="bg-[#0f172a] shadow-2xl p-2 text-slate-200 mt-2 min-w-[200px] border-0">
                    <Dropdown.Header className="px-3 py-2 bg-transparent">
                      <strong className="text-white text-base block">
                        {user?.name || "User"}
                      </strong>
                      <small className="text-slate-400 text-xs block truncate">
                        {user?.email}
                      </small>
                      {user?.role && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
                          {(() => {
                            const r = String(user.role).toLowerCase().trim();
                            if (
                              r === "manager" ||
                              r === "project_manager" ||
                              r === "project manager"
                            )
                              return "Project Manager";
                            if (r === "storyboard") return "Storyboard";
                            if (r === "animation") return "Animation";
                            if (r === "designer") return "Designer";
                            if (r === "programmer") return "Programmer";
                            if (r === "admin") return "Admin";
                            return user.role
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (c) => c.toUpperCase());
                          })()}
                        </span>
                      )}
                    </Dropdown.Header>
                    <Dropdown.Divider className="my-1 border-white/5" />
                    <Dropdown.Item
                      as={Link}
                      to="/Profile"
                      className="rounded-full px-3 py-2 text-slate-300 hover:text-white hover:bg-indigo-600/30 font-medium transition-colors bg-transparent d-flex align-items-center gap-2"
                    >
                      <ion-icon
                        name="person-outline"
                        style={{ fontSize: "16px" }}
                      ></ion-icon>
                      <span>{t("profile")}</span>
                    </Dropdown.Item>
                    {user?.role === "admin" && (
                      <Dropdown.Item
                        as={Link}
                        to="/MyTasks"
                        className="rounded-full px-3 py-2 text-slate-300 hover:text-white hover:bg-indigo-600/30 font-medium transition-colors bg-transparent d-flex align-items-center gap-2"
                      >
                        <ion-icon
                          name="clipboard-outline"
                          style={{ fontSize: "16px" }}
                        ></ion-icon>
                        <span>{t("myTask")}</span>
                      </Dropdown.Item>
                    )}
                    <Dropdown.Item
                      as={Link}
                      to="/MyActivity"
                      className="rounded-full px-3 py-2 text-slate-300 hover:text-white hover:bg-indigo-600/30 font-medium transition-colors bg-transparent d-flex align-items-center gap-2"
                    >
                      <ion-icon
                        name="time-outline"
                        style={{ fontSize: "16px" }}
                      ></ion-icon>
                      <span>{t("myActivity")}</span>
                    </Dropdown.Item>
                    <Dropdown.Item
                      as="button"
                      onClick={() => setShowThemeModal(true)}
                      className="rounded-full px-3 py-2 text-slate-300 hover:text-white hover:bg-indigo-600/30 font-medium transition-colors w-full text-left bg-transparent d-flex align-items-center gap-2"
                    >
                      <ion-icon
                        name="color-palette-outline"
                        style={{ fontSize: "16px" }}
                      ></ion-icon>
                      <span>{t("themes") || "Themes"}</span>
                    </Dropdown.Item>
                    <Dropdown.Divider className="my-1 border-white/5" />
                    <Dropdown.Item
                      as="button"
                      onClick={handleSignOut}
                      className="rounded-full px-3 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 font-medium transition-colors w-full text-left bg-transparent d-flex align-items-center gap-2"
                    >
                      <ion-icon
                        name="log-out-outline"
                        style={{ fontSize: "16px" }}
                      ></ion-icon>
                      <span>{t("signOut")}</span>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <Link to="/login" className="no-underline">
                  <button
                    type="button"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-sm glow-button transition-all"
                  >
                    {t("login")}
                  </button>
                </Link>
              )}
            </div>

            {/* Mobile Navigation Dropdown Menu */}
            {isLoggedIn && (
              <Dropdown align="end" className="md:hidden">
                <Dropdown.Toggle
                  variant="link"
                  className="p-2 text-slate-300 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-700 transition-colors focus:outline-none border-0 no-underline after:hidden shadow-none flex items-center justify-center"
                  id="dropdown-mobile-nav"
                  aria-label="Mobile Navigation Menu"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </Dropdown.Toggle>

                <Dropdown.Menu className="bg-[#0f172a]/95 backdrop-blur-2xl border border-slate-800 shadow-2xl p-2 text-slate-200 mt-2 min-w-[220px] rounded-2xl">
                  <Dropdown.Item
                    as={Link}
                    to="/Dashboard"
                    className={`rounded-xl px-3 py-2.5 font-bold text-sm transition-all flex items-center gap-3 no-underline ${
                      isActive("/dashboard")
                        ? "bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-md"
                        : "text-slate-200 hover:bg-slate-800/80 hover:text-white bg-transparent"
                    }`}
                  >
                    <span className="text-base">📊</span>
                    <span className="whitespace-nowrap">{t("dashboard")}</span>
                  </Dropdown.Item>

                  {user?.role === "admin" && (
                    <Dropdown.Item
                      as={Link}
                      to="/ManageUsers"
                      className={`rounded-xl px-3 py-2.5 font-bold text-sm transition-all flex items-center gap-3 no-underline mt-1 ${
                        isActive("/manageusers")
                          ? "bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-md"
                          : "text-slate-200 hover:bg-slate-800/80 hover:text-white bg-transparent"
                      }`}
                    >
                      <span className="text-base">👥</span>
                      <span className="whitespace-nowrap">
                        {t("manageUsers")}
                      </span>
                    </Dropdown.Item>
                  )}

                  <Dropdown.Item
                    as={Link}
                    to="/PersonalTask"
                    className={`rounded-xl px-3 py-2.5 font-bold text-sm transition-all flex items-center gap-3 no-underline mt-1 ${
                      isActive("/PersonalTask")
                        ? "bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-md"
                        : "text-slate-200 hover:bg-slate-800/80 hover:text-white bg-transparent"
                    }`}
                  >
                    <span className="text-base">📝</span>
                    <span className="whitespace-nowrap">
                      {t("personalTask")}
                    </span>
                  </Dropdown.Item>

                  <Dropdown.Item
                    as={Link}
                    to="/Projects"
                    className={`rounded-xl px-3 py-2.5 font-bold text-sm transition-all flex items-center gap-3 no-underline mt-1 ${
                      isActive("/projects")
                        ? "bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-md"
                        : "text-slate-200 hover:bg-slate-800/80 hover:text-white bg-transparent"
                    }`}
                  >
                    <span className="text-base">📂</span>
                    <span className="whitespace-nowrap">{t("projects")}</span>
                  </Dropdown.Item>

                  <Dropdown.Item
                    as={Link}
                    to={user?.role === "admin" ? "/AllTasks" : "/MyTasks"}
                    className={`rounded-xl px-3 py-2.5 font-bold text-sm transition-all flex items-center gap-3 no-underline mt-1 ${
                      isActive(
                        user?.role === "admin" ? "/alltasks" : "/mytasks",
                      )
                        ? "bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-md"
                        : "text-slate-200 hover:bg-slate-800/80 hover:text-white bg-transparent"
                    }`}
                  >
                    <span className="text-base">📋</span>
                    <span className="whitespace-nowrap">
                      {user?.role === "admin" ? t("allTasks") : t("myTask")}
                    </span>
                  </Dropdown.Item>

                  <Dropdown.Item
                    as={Link}
                    to="/Reports"
                    className={`rounded-xl px-3 py-2.5 font-bold text-sm transition-all flex items-center gap-3 no-underline mt-1 ${
                      isActive("/reports")
                        ? "bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-md"
                        : "text-slate-200 hover:bg-slate-800/80 hover:text-white bg-transparent"
                    }`}
                  >
                    <span className="text-base">📈</span>
                    <span className="whitespace-nowrap">{t("reports")}</span>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </div>
        </div>
      </header>

      {/* Themes Modal */}
      {showThemeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60  animate-fade-in p-4 overflow-y-auto">
          <div
            className="rounded-3xl w-full max-w-md p-6 relative shadow-2xl my-auto transition-all"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-surface)",
              color: "var(--text-primary)",
            }}
          >
            {/* Modal Title */}
            <h3
              className="text-xl font-bold mb-6"
              style={{ color: "var(--text-primary)" }}
            >
              Themes
            </h3>

            {/* Close Button */}
            <button
              onClick={() => setShowThemeModal(false)}
              className="absolute top-6 right-6 cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
              style={{ color: "var(--text-secondary)" }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Appearance Section */}
            <div className="mb-6">
              <h4
                className="text-xs font-bold uppercase tracking-wider mb-3"
                style={{ color: "var(--text-secondary)" }}
              >
                APPEARANCE
              </h4>
              <div className="flex gap-4">
                {/* Light */}
                <div className="flex flex-col items-center gap-2">
                  <div
                    onClick={() => setAppearance("Light")}
                    className={`w-28 h-16 rounded-2xl border-2 flex flex-col p-2 cursor-pointer bg-white transition-all ${
                      appearance === "Light"
                        ? "border-[#3b82f6] shadow-lg shadow-blue-500/20"
                        : "border-slate-200/80 opacity-80 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div>
                      <div className="h-1.5 w-10 bg-slate-200 rounded"></div>
                    </div>
                    <div className="h-1 w-14 bg-slate-200 rounded mb-1"></div>
                    <div className="h-1 w-10 bg-slate-200 rounded"></div>
                  </div>
                  <span
                    className="text-xs font-bold"
                    style={{
                      color:
                        appearance === "Light"
                          ? "var(--text-primary)"
                          : "var(--text-secondary)",
                    }}
                  >
                    Light
                  </span>
                </div>

                {/* Dark */}
                <div className="flex flex-col items-center gap-2">
                  <div
                    onClick={() => setAppearance("Dark")}
                    className={`w-28 h-16 rounded-2xl border-2 flex flex-col p-2 cursor-pointer bg-[#2c2c2c] transition-all ${
                      appearance === "Dark"
                        ? "border-[#3b82f6] shadow-lg shadow-blue-500/20"
                        : "border-transparent opacity-80 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div>
                      <div className="h-1.5 w-10 bg-slate-600 rounded"></div>
                    </div>
                    <div className="h-1 w-14 bg-slate-600 rounded mb-1"></div>
                    <div className="h-1 w-10 bg-slate-600 rounded"></div>
                  </div>
                  <span
                    className="text-xs font-bold"
                    style={{
                      color:
                        appearance === "Dark"
                          ? "var(--text-primary)"
                          : "var(--text-secondary)",
                    }}
                  >
                    Dark
                  </span>
                </div>

                {/* Auto */}
                <div className="flex flex-col items-center gap-2">
                  <div
                    onClick={() => setAppearance("Auto")}
                    className={`w-28 h-16 rounded-2xl border-2 flex overflow-hidden cursor-pointer transition-all ${
                      appearance === "Auto"
                        ? "border-[#3b82f6] shadow-lg shadow-blue-500/20"
                        : "border-slate-300/40 opacity-80 hover:opacity-100"
                    }`}
                  >
                    <div className="flex-1 bg-white p-2 flex flex-col">
                      <div className="w-3 h-3 rounded-full bg-[#3b82f6] mb-1.5"></div>
                      <div className="h-1 w-8 bg-slate-200 rounded"></div>
                    </div>
                    <div className="flex-1 bg-[#2c2c2c] p-2 flex flex-col">
                      <div className="h-3 w-8 mb-1.5"></div>
                      <div className="h-1 w-8 bg-slate-600 rounded"></div>
                    </div>
                  </div>
                  <span
                    className="text-xs font-bold"
                    style={{
                      color:
                        appearance === "Auto"
                          ? "var(--text-primary)"
                          : "var(--text-secondary)",
                    }}
                  >
                    Auto
                  </span>
                </div>
              </div>
            </div>

            {/* Accent Color Section */}
            <div>
              <h4
                className="text-xs font-bold uppercase tracking-wider mb-3"
                style={{ color: "var(--text-secondary)" }}
              >
                CLICKUP THEME
              </h4>
              <div className="grid grid-cols-3 gap-2.5">
                {Object.values(availableAccents).map((color) => (
                  <div
                    key={color.name}
                    onClick={() => setAccentColor(color.name)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-2xl cursor-pointer transition-all shadow-sm"
                    style={{
                      background:
                        accentColor === color.name
                          ? "rgba(59, 130, 246, 0.15)"
                          : "var(--bg-surface-hover)",
                      border:
                        accentColor === color.name
                          ? `1.5px solid ${color.code}`
                          : "1px solid var(--border-surface)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: color.code }}
                      ></span>
                      <span
                        className="text-xs font-semibold"
                        style={{
                          color:
                            accentColor === color.name
                              ? "var(--text-primary)"
                              : "var(--text-secondary)",
                        }}
                      >
                        {color.name}
                      </span>
                    </div>
                    {accentColor === color.name && (
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: color.code }}
                      >
                        <svg
                          className="w-2.5 h-2.5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
