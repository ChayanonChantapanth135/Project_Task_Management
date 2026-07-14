import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import logoB from "../assets/LogoW.png";
import { signOut, getCurrentUser } from "../lib/auth";
import { useLanguage } from "../lib/LanguageContext";
import axios from "axios";
import LanguageSwitcher from "./LanguageSwitcher";

/**
 * คอมโพเนนต์แถบเมนูด้านบน (Header / Navigation Bar Component)
 * - แสดงโลโก้ของระบบ
 * - แสดงลิงก์นำทางไปยังเมนูต่างๆ (Dashboard, Manage Users, Projects, Tasks, Reports)
 * - จัดการโหลดข้อมูลโปรไฟล์และรูปภาพอัปเดตล่าสุดของผู้ใช้ผ่าน API
 * - ให้ผู้ใช้งานล็อกเอาต์และสลับภาษาได้ผ่านวิดเจ็ต
 */
const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    /**
     * ฟังก์ชันตรวจสอบสถานะล็อกอินของผู้ใช้งาน
     * - เรียก getCurrentUser() เพื่อนำข้อมูลจาก localStorage มาตรวจสอบความถูกต้องและเช็กหมดอายุ
     * - ยิง API ไปยังหลังบ้านเพื่อดึงข้อมูลอัปเดตล่าสุด (รูปภาพโปรไฟล์ล่าสุด)
     */
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          // Fetch fresh user data (including latest avatar) from DB
          try {
            const res = await axios.get(`http://127.0.0.1:3000/auth/users/${currentUser.id}`);
            setUser({ ...currentUser, avatar: res.data.avatar });
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
    // รับฟังเหตุการณ์เมื่อมีการเปลี่ยนแปลงข้อมูลล็อกอิน (เช่น เข้าสู่ระบบหรือออกจากระบบที่หน้าต่างอื่น)
    window.addEventListener("authChanged", checkUser);
    window.addEventListener("storage", checkUser);
    return () => {
      window.removeEventListener("authChanged", checkUser);
      window.removeEventListener("storage", checkUser);
    };
  }, []);

  /**
   * ฟังก์ชันจัดการออกจากระบบ (Sign Out)
   * - เรียก signOut() เพื่อล้าง Token และแจ้งเตือนเซิร์ฟเวอร์
   * - รีเซ็ต state ผู้ใช้งาน และนำทางไปยังหน้า Home
   */
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

  return (
    <header className="p-3 mb-3 border-bottom bg-dark">
      <div className="container">
        {/* ✅ เปลี่ยนเป็น justify-content-between */}
        <div className="d-flex flex-wrap align-items-center justify-content-between">
          {/* Logo */}
          <Link
            to="/Home"
            className="d-flex align-items-center text-white mb-2 mb-lg-0 text-decoration-none"
          >
            <img
              src={logoB}
              alt="Logo"
              className="me-2"
              width="40"
              height="32"
              style={{
                mixBlendMode: "screen",
                filter: "invert(1)",
              }}
            />
          </Link>

          {/* Navigation Links - แสดงเฉพาะเมื่อ login */}
          {isLoggedIn && (
            <ul className="nav col-12 col-lg-auto mb-2 justify-content-center mb-md-0">
              <li>
                <Link to="/Dashboard" className="nav-link px-2 text-white">
                  {t("dashboard")}
                </Link>
              </li>
              {user?.role === "admin" && (
                <li>
                  <Link to="/ManageUsers" className="nav-link px-2 text-white">
                    {t("manageUsers")}
                  </Link>
                </li>
              )}
              <li>
                <Link to="/Projects" className="nav-link px-2 text-white">
                  {t("projects")}
                </Link>
              </li>
              <li>
                <Link to="/AllTasks" className="nav-link px-2 text-white">
                  {t("allTasks")}
                </Link>
              </li>
              <li>
                <Link to="/Reports" className="nav-link px-2 text-white">
                  {t("reports")}
                </Link>
              </li>
            </ul>
          )}

          {/* ✅ Language Switcher & Profile/Login - ชิดขวาเสมอ */}
          <div className="ms-auto d-flex align-items-center gap-3">
            {/* Language Toggle Buttons */}
            <LanguageSwitcher variant="dark" />

            <div>
              {loading ? (
                <div
                  className="spinner-border spinner-border-sm text-light"
                  role="status"
                >
                  <span className="visually-hidden">{t("loading")}</span>
                </div>
              ) : isLoggedIn ? (
                <Dropdown align="end">
                  <Dropdown.Toggle
                    variant="link"
                    className="p-0 border-0 d-flex align-items-center text-warning"
                    id="dropdown-profile"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt="Profile"
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          display: "block",
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center text-white"
                        style={{
                          width: 32,
                          height: 32,
                          backgroundColor: "#f59e0b",
                          fontSize: "0.8rem",
                          fontWeight: "bold",
                        }}
                      >
                        {user?.name?.[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Header>
                      <strong>{user?.name || "User"}</strong>
                      <br />
                      <small className="text-muted">{user?.email}</small>
                    </Dropdown.Header>
                    <Dropdown.Divider />
                    <Dropdown.Item as={Link} to="/Profile">
                      {t("profile")}
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/MyTasks">
                      {t("myTask")}
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item as="button" onClick={handleSignOut}>
                      {t("signOut")}
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <Link to="/login">
                  <button type="button" className="btn btn-outline-light">
                    {t("login")}
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
