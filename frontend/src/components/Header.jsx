import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import logoB from "../assets/LogoW.png";
import { signOut, getCurrentUser } from "../lib/auth";
import { useLanguage } from "../lib/LanguageContext";
import axios from "axios";
import LanguageSwitcher from "./LanguageSwitcher";
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

  const [showThemeModal, setShowThemeModal] = useState(false);
  const [appearance, setAppearance] = useState(() => localStorage.getItem("appearance") || "Dark");
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem("accentColor") || "Blue");

  useEffect(() => {
    localStorage.setItem("appearance", appearance);
    
    let mode = appearance;
    if (appearance === "Auto") {
      mode = window.matchMedia('(prefers-color-scheme: dark)').matches ? "Dark" : "Light";
    }

    if (mode === "Light") {
      document.body.style.backgroundColor = "#f8fafc";
      document.body.style.color = "#0f172a";
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      document.body.style.backgroundColor = "#153648";
      document.body.style.color = "#f1f5f9";
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
  }, [appearance]);

  useEffect(() => {
    localStorage.setItem("accentColor", accentColor);
    const colorMaps = {
      Black: {
        "600": "#0f0f0f",
        "500": "#1e1e1e",
        "400": "#3c3c3c",
        "300": "#7c7c7c",
        "200": "#bcbcbc"
      },
      Purple: {
        "600": "#9333ea",
        "500": "#a855f7",
        "400": "#c084fc",
        "300": "#d8b4fe",
        "200": "#e9d5ff"
      },
      Blue: {
        "600": "#2563eb",
        "500": "#3b82f6",
        "400": "#60a5fa",
        "300": "#93c5fd",
        "200": "#bfdbfe"
      },
      Pink: {
        "600": "#db2777",
        "500": "#ec4899",
        "400": "#f472b6",
        "300": "#f9a8d4",
        "200": "#fbcfe8"
      },
      Violet: {
        "600": "#7c3aed",
        "500": "#8b5cf6",
        "400": "#a78bfa",
        "300": "#c4b5fd",
        "200": "#ddd6fe"
      },
      Indigo: {
        "600": "#4f46e5",
        "500": "#6366f1",
        "400": "#818cf8",
        "300": "#a5b4fc",
        "200": "#c7d2fe"
      },
      Orange: {
        "600": "#ea580c",
        "500": "#f97316",
        "400": "#fb923c",
        "300": "#fdbb2f",
        "200": "#ffedd5"
      },
      Teal: {
        "600": "#0d9488",
        "500": "#14b8a6",
        "400": "#2dd4bf",
        "300": "#5eead4",
        "200": "#99f6e4"
      },
      Bronze: {
        "600": "#854d0e",
        "500": "#a16207",
        "400": "#ca8a04",
        "300": "#fef08a",
        "200": "#fef9c3"
      },
      Mint: {
        "600": "#059669",
        "500": "#10b981",
        "400": "#34d399",
        "300": "#6ee7b7",
        "200": "#a7f3d0"
      }
    };
    const activeMap = colorMaps[accentColor] || colorMaps.Blue;
    document.documentElement.style.setProperty("--color-indigo-600", activeMap["600"]);
    document.documentElement.style.setProperty("--color-indigo-500", activeMap["500"]);
    document.documentElement.style.setProperty("--color-indigo-400", activeMap["400"]);
    document.documentElement.style.setProperty("--color-indigo-300", activeMap["300"]);
    document.documentElement.style.setProperty("--color-indigo-200", activeMap["200"]);
    document.documentElement.style.setProperty("--accent-color", activeMap["500"]);
  }, [accentColor]);

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
        <Link to="/Home" className="flex items-center gap-3 no-underline group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-500 p-0.5 shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#153648] rounded-[10px] flex items-center justify-center">
              <img
                src={logoB}
                alt="Logo"
                className="w-6 h-6 filter invert mix-blend-screen"
              />
            </div>
          </div>
          <span className="text-lg font-black tracking-wider text-white">
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
            {["admin", "manager", "project_manager", "team_leader"].includes(user?.role?.toLowerCase().replace(/\s+/g, "_")) && (
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
            )}
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
        <div className="flex items-center gap-4">
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
                        {user.role}
                      </span>
                    )}
                  </Dropdown.Header>
                  <Dropdown.Divider className="my-1 border-white/5" />
                  <Dropdown.Item
                    as={Link}
                    to="/Profile"
                    className="rounded-full px-3 py-2 text-slate-300 hover:text-white hover:bg-indigo-600/30 font-medium transition-colors bg-transparent d-flex align-items-center gap-2"
                  >
                    <ion-icon name="person-outline" style={{ fontSize: "16px" }}></ion-icon>
                    <span>{t("profile")}</span>
                  </Dropdown.Item>
                  {user?.role === "admin" && (
                    <Dropdown.Item
                      as={Link}
                      to="/MyTasks"
                      className="rounded-full px-3 py-2 text-slate-300 hover:text-white hover:bg-indigo-600/30 font-medium transition-colors bg-transparent d-flex align-items-center gap-2"
                    >
                      <ion-icon name="clipboard-outline" style={{ fontSize: "16px" }}></ion-icon>
                      <span>{t("myTask")}</span>
                    </Dropdown.Item>
                  )}
                  <Dropdown.Item
                    as={Link}
                    to="/MyActivity"
                    className="rounded-full px-3 py-2 text-slate-300 hover:text-white hover:bg-indigo-600/30 font-medium transition-colors bg-transparent d-flex align-items-center gap-2"
                  >
                    <ion-icon name="time-outline" style={{ fontSize: "16px" }}></ion-icon>
                    <span>{t("myActivity")}</span>
                  </Dropdown.Item>
                  <Dropdown.Item
                    as="button"
                    onClick={() => setShowThemeModal(true)}
                    className="rounded-full px-3 py-2 text-slate-300 hover:text-white hover:bg-indigo-600/30 font-medium transition-colors w-full text-left bg-transparent d-flex align-items-center gap-2"
                  >
                    <ion-icon name="color-palette-outline" style={{ fontSize: "16px" }}></ion-icon>
                    <span>{t("themes") || "Themes"}</span>
                  </Dropdown.Item>
                  <Dropdown.Divider className="my-1 border-white/5" />
                  <Dropdown.Item
                    as="button"
                    onClick={handleSignOut}
                    className="rounded-full px-3 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 font-medium transition-colors w-full text-left bg-transparent d-flex align-items-center gap-2"
                  >
                    <ion-icon name="log-out-outline" style={{ fontSize: "16px" }}></ion-icon>
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

                {["admin", "manager", "project_manager", "team_leader"].includes(user?.role?.toLowerCase().replace(/\s+/g, "_")) && (
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
                )}

                <Dropdown.Item
                  as={Link}
                  to={user?.role === "admin" ? "/AllTasks" : "/MyTasks"}
                  className={`rounded-xl px-3 py-2.5 font-bold text-sm transition-all flex items-center gap-3 no-underline mt-1 ${
                    isActive(user?.role === "admin" ? "/alltasks" : "/mytasks")
                      ? "bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-md"
                      : "text-slate-200 hover:bg-slate-800/80 hover:text-white bg-transparent"
                  }`}
                >
                  <span className="text-base">📋</span>
                  <span className="whitespace-nowrap">{user?.role === "admin" ? t("allTasks") : t("myTask")}</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4 overflow-y-auto">
          <div className="bg-[#1e1e1e] rounded-2xl w-full max-w-md p-6 relative shadow-2xl text-slate-200 my-auto">
            {/* Modal Title */}
            <h3 className="text-lg font-bold text-white mb-6">Themes</h3>

            {/* Close Button */}
            <button
              onClick={() => setShowThemeModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Appearance Section */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Appearance</h4>
              <div className="flex gap-4">
                {/* Light */}
                <div className="flex flex-col items-center gap-2">
                  <div
                    onClick={() => setAppearance("Light")}
                    className={`w-28 h-16 rounded-xl border-2 flex flex-col p-1.5 cursor-pointer bg-white transition-all ${
                      appearance === "Light" ? "border-[#3b82f6]" : "border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="w-3 h-3 rounded bg-[#3b82f6]"></div>
                      <div className="h-1.5 w-10 bg-slate-200 rounded"></div>
                    </div>
                    <div className="h-1 w-14 bg-slate-200 rounded mb-1"></div>
                    <div className="h-1 w-10 bg-slate-200 rounded"></div>
                  </div>
                  <span className={`text-xs font-bold ${appearance === "Light" ? "text-white" : "text-slate-400"}`}>Light</span>
                </div>

                {/* Dark */}
                <div className="flex flex-col items-center gap-2">
                  <div
                    onClick={() => setAppearance("Dark")}
                    className={`w-28 h-16 rounded-xl border-2 flex flex-col p-1.5 cursor-pointer bg-[#2c2c2c] transition-all ${
                      appearance === "Dark" ? "border-[#3b82f6]" : "border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="w-3 h-3 rounded bg-[#3b82f6]"></div>
                      <div className="h-1.5 w-10 bg-slate-700 rounded"></div>
                    </div>
                    <div className="h-1 w-14 bg-slate-700 rounded mb-1"></div>
                    <div className="h-1 w-10 bg-slate-700 rounded"></div>
                  </div>
                  <span className={`text-xs font-bold ${appearance === "Dark" ? "text-white" : "text-slate-400"}`}>Dark</span>
                </div>

                {/* Auto */}
                <div className="flex flex-col items-center gap-2">
                  <div
                    onClick={() => setAppearance("Auto")}
                    className={`w-28 h-16 rounded-xl border-2 flex overflow-hidden cursor-pointer transition-all ${
                      appearance === "Auto" ? "border-[#3b82f6]" : "border-transparent"
                    }`}
                  >
                    <div className="flex-1 bg-white p-1.5 flex flex-col animate-none">
                      <div className="w-3 h-3 rounded bg-[#3b82f6] mb-1.5"></div>
                      <div className="h-1 w-8 bg-slate-200 rounded"></div>
                    </div>
                    <div className="flex-1 bg-[#2c2c2c] p-1.5 flex flex-col">
                      <div className="h-3 w-8 mb-1.5"></div>
                      <div className="h-1 w-8 bg-slate-700 rounded"></div>
                    </div>
                  </div>
                  <span className={`text-xs font-bold ${appearance === "Auto" ? "text-white" : "text-slate-400"}`}>Auto</span>
                </div>
              </div>
            </div>

            {/* Accent Color Section */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">ClickUp theme</h4>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: "Black", code: "#1e1e1e" },
                  { name: "Purple", code: "#a855f7" },
                  { name: "Blue", code: "#3b82f6" },
                  { name: "Pink", code: "#ec4899" },
                  { name: "Violet", code: "#8b5cf6" },
                  { name: "Indigo", code: "#6366f1" },
                  { name: "Orange", code: "#f97316" },
                  { name: "Teal", code: "#14b8a6" },
                  { name: "Bronze", code: "#a16207" },
                  { name: "Mint", code: "#10b981" }
                ].map((color) => (
                  <div
                    key={color.name}
                    onClick={() => setAccentColor(color.name)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                      accentColor === color.name
                        ? "bg-[#3b82f6]/10 border border-[#3b82f6]"
                        : "bg-[#18181c] hover:bg-[#25252a]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-md" style={{ backgroundColor: color.code }}></span>
                      <span className="text-xs font-bold text-slate-300">{color.name}</span>
                    </div>
                    {accentColor === color.name && (
                      <div className="w-4 h-4 rounded bg-[#3b82f6] flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
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
