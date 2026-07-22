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

  const isActive = (path) => location.pathname.toLowerCase() === path.toLowerCase();

  return (
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
            RNM <span className="gradient-text">TASK</span>
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
              to="/AllTasks"
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all no-underline ${
                isActive("/alltasks")
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              {t("allTasks")}
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
                    <strong className="text-white text-base block">{user?.name || "User"}</strong>
                    <small className="text-slate-400 text-xs block truncate">{user?.email}</small>
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
                    className="rounded-full px-3 py-2 text-slate-300 hover:text-white hover:bg-indigo-600/30 font-medium transition-colors bg-transparent"
                  >
                    👤 {t("profile")}
                  </Dropdown.Item>
                  <Dropdown.Item
                    as={Link}
                    to="/MyTasks"
                    className="rounded-full px-3 py-2 text-slate-300 hover:text-white hover:bg-indigo-600/30 font-medium transition-colors bg-transparent"
                  >
                    📋 {t("myTask")}
                  </Dropdown.Item>
                  <Dropdown.Divider className="my-1 border-white/5" />
                  <Dropdown.Item
                    as="button"
                    onClick={handleSignOut}
                    className="rounded-full px-3 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 font-medium transition-colors w-full text-left bg-transparent"
                  >
                    🚪 {t("signOut")}
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Link to="/login" className="no-underline">
                <button type="button" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-sm glow-button transition-all">
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
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
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
                    <span className="whitespace-nowrap">{t("manageUsers")}</span>
                  </Dropdown.Item>
                )}

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
                  to="/AllTasks"
                  className={`rounded-xl px-3 py-2.5 font-bold text-sm transition-all flex items-center gap-3 no-underline mt-1 ${
                    isActive("/alltasks")
                      ? "bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-md"
                      : "text-slate-200 hover:bg-slate-800/80 hover:text-white bg-transparent"
                  }`}
                >
                  <span className="text-base">📋</span>
                  <span className="whitespace-nowrap">{t("allTasks")}</span>
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
  );
};

export default Header;
