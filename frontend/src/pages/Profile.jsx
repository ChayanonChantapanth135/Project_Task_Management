import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getCurrentUser, signIn } from "../lib/auth";
import { useLanguage } from "../lib/LanguageContext";
import { API_URL } from "../config";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/**
 * คอมโพเนนต์หน้าโปรไฟล์ (Profile Page Component) - Redesigned Dark Luxe Glassmorphism Theme
 */
const Profile = () => {
  const { t } = useLanguage();
  const fileInputRef = useRef(null);
  const pageRef = useRef(null);
  const blob1Ref = useRef(null);
  const blob2Ref = useRef(null);
  const blob3Ref = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);

  // Form Fields
  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  // Password Fields
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Feedback Messages
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // GSAP Background animations
  useGSAP(
    () => {
      gsap.to(blob1Ref.current, {
        x: 50,
        y: -30,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(blob2Ref.current, {
        x: -40,
        y: 40,
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(blob3Ref.current, {
        x: 30,
        y: 20,
        duration: 9,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    },
    { scope: pageRef },
  );

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          setErrorMsg("User session not found. Please log in.");
          setLoading(false);
          return;
        }

        // Fetch fresh details from DB
        const res = await axios.get(`/auth/users/${currentUser.id}`);
        const fullUser = res.data;

        setUser(fullUser);
        setFullname(fullUser.fullname || "");
        setPhone(fullUser.phone || "");

        if (fullUser.avatar) {
          const baseUrl = axios.defaults.baseURL || "http://127.0.0.1:3000";
          const finalUrl = fullUser.avatar.startsWith("http")
            ? fullUser.avatar
            : `${baseUrl}${fullUser.avatar}`;
          setAvatarPreview(finalUrl);
        }
      } catch (err) {
        console.error("Error fetching user details:", err);
        setErrorMsg(t("profileLoadFailed"));
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setSuccessMsg("");
      setErrorMsg("");
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!fullname.trim()) {
      setErrorMsg(t("profileUsernameEmpty"));
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMsg(t("passwordsMismatch") || "Passwords do not match");
      return;
    }

    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const formData = new FormData();
      formData.append("fullname", fullname.trim());
      formData.append("email", user.email);
      formData.append("phone", phone.trim());
      formData.append("role", user.role);
      formData.append("status", user.status || "active");
      formData.append("creatorId", user.id); // Logging creator activity

      if (newPassword) {
        formData.append("password", newPassword);
      }

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const response = await axios.put(`/auth/users/${user.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        setSuccessMsg(t("profileUpdateSuccess"));
        setNewPassword("");
        setConfirmPassword("");

        // Reload user details to refresh tokens/localStorage
        const res = await axios.get(`/auth/users/${user.id}`);
        const updatedUser = res.data;

        setUser(updatedUser);

        // Update local session
        const currentToken = localStorage.getItem("userToken");
        const expiresAt = localStorage.getItem("userTokenExpiresAt");

        await signIn({
          token: currentToken,
          expiresInSeconds: expiresAt
            ? Math.round((Number(expiresAt) - Date.now()) / 1000)
            : 2400,
          user: {
            id: updatedUser.id,
            name: updatedUser.fullname,
            email: updatedUser.email,
            role: updatedUser.role,
            avatar: updatedUser.avatar,
          },
        });
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setErrorMsg(
        err.response?.data?.message ||
          t("profileUpdateFailed"),
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center bg-[#153648] text-white"
        style={{ minHeight: "100vh" }}
      >
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={pageRef}
      className="min-h-screen flex flex-col bg-[#153648] text-slate-100 font-sans selection:bg-teal-500 selection:text-white relative overflow-hidden"
    >
      <Header />

      {/* GSAP Animated Ambient Orbs */}
      <div
        ref={blob1Ref}
        className="absolute top-10 left-1/4 w-[400px] h-[400px] bg-teal-500/10 rounded-full filter blur-[100px] pointer-events-none"
      ></div>
      <div
        ref={blob2Ref}
        className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-indigo-600/15 rounded-full filter blur-[110px] pointer-events-none"
      ></div>
      <div
        ref={blob3Ref}
        className="absolute bottom-10 left-1/3 w-[450px] h-[450px] bg-cyan-600/10 rounded-full filter blur-[120px] pointer-events-none"
      ></div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8 relative z-10">
        {/* Title */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3 tracking-tight">
            <span>👤</span> {t("profile") || "Profile"}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {t("profileSubtitle")}
          </p>
        </div>

        {/* Feedback Messages */}
        {successMsg && (
          <div className="mb-6 w-full py-3.5 px-5 rounded-2xl bg-[#0e3b40] text-emerald-400 text-sm font-semibold flex items-center gap-3 shadow-xl border-0 animate-fade-in-down">
            <span className="w-4 h-4 rounded bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] font-black">
              ✓
            </span>
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mb-6 w-full py-3.5 px-5 rounded-2xl bg-[#521c22] text-rose-300 text-sm font-semibold flex items-center gap-3 shadow-xl border-0 animate-fade-in-down">
            <span className="w-4 h-4 rounded bg-rose-500 text-slate-950 flex items-center justify-center text-[10px] font-black">
              !
            </span>
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Avatar & Summary */}
          <div className="lg:col-span-1">
            <div className="glass-panel rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
              {/* Avatar upload display */}
              <div className="relative group mb-4">
                <div
                  className="rounded-full overflow-hidden flex items-center justify-center text-white shadow-xl border-4 border-slate-700/50 bg-indigo-600 transition-all group-hover:border-teal-500/50 cursor-pointer"
                  style={{ width: "140px", height: "140px" }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Profile Avatar"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <span className="text-4xl font-extrabold">
                      {fullname ? fullname[0]?.toUpperCase() : "U"}
                    </span>
                  )}
                </div>

                {/* Click overlay */}
                <button
                  type="button"
                  className="absolute bottom-1 right-1 bg-teal-500 hover:bg-teal-400 text-slate-950 p-2.5 rounded-full shadow-lg transition-all hover:scale-110 flex items-center justify-center border-2 border-[#153648]"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload Image"
                >
                  <i className="bi bi-camera-fill text-sm"></i>
                </button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />

              <h4 className="text-xl font-bold text-white mb-1">
                {user?.fullname}
              </h4>
              <p className="text-xs text-slate-400 mb-4">{user?.email}</p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-indigo-500/20 text-indigo-300">
                  🛡️ {user?.role}
                </span>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300">
                  ✨ {user?.status === "active" ? "Active" : "Suspended"}
                </span>
              </div>

              <div className="w-full text-left bg-slate-800/40 rounded-2xl p-4 text-xs text-slate-300 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">{t("profileCreated")}:</span>
                  <span>
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t("profileRoleLevel")}:</span>
                  <span className="capitalize">{user?.role}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Edit Forms */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Profile Details Card */}
              <div className="glass-panel rounded-3xl p-6 shadow-2xl space-y-4">
                <h5 className="text-base font-bold text-teal-400 flex items-center gap-2 mb-2">
                  <i className="bi bi-person-gear"></i> {t("profilePersonalInfo")}
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Username */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-400 font-semibold">
                      {t("profileUsername")}
                    </label>
                    <input
                      type="text"
                      className="bg-slate-800/60 hover:bg-slate-800/80 focus:bg-slate-900/90 text-white rounded-2xl px-4 py-3 text-sm transition-all"
                      value={fullname}
                      onChange={(e) => setFullname(e.target.value)}
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-400 font-semibold">
                      {t("profilePhone")}
                    </label>
                    <input
                      type="tel"
                      className="bg-slate-800/60 hover:bg-slate-800/80 focus:bg-slate-900/90 text-white rounded-2xl px-4 py-3 text-sm transition-all"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+66XXXXXXXXX"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Email (Disabled) */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-400 font-semibold opacity-70">
                      {t("profileEmailDisabled")}
                    </label>
                    <input
                      type="email"
                      className="bg-slate-800/20 text-slate-500 rounded-2xl px-4 py-3 text-sm cursor-not-allowed"
                      value={user?.email || ""}
                      disabled
                    />
                  </div>
                </div>
              </div>

              {/* Password Card */}
              <div className="glass-panel rounded-3xl p-6 shadow-2xl space-y-4">
                <h5 className="text-base font-bold text-teal-400 flex items-center gap-2 mb-2">
                  <i className="bi bi-shield-lock"></i> {t("profileChangePassword")}
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* New Password */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-400 font-semibold">
                      {t("profileNewPassword")}
                    </label>
                    <input
                      type="password"
                      className="bg-slate-800/60 hover:bg-slate-800/80 focus:bg-slate-900/90 text-white rounded-2xl px-4 py-3 text-sm transition-all"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>

                  {/* Confirm Password */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-400 font-semibold">
                      {t("profileConfirmPassword")}
                    </label>
                    <input
                      type="password"
                      className="bg-slate-800/60 hover:bg-slate-800/80 focus:bg-slate-900/90 text-white rounded-2xl px-4 py-3 text-sm transition-all"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/20 transition-all hover:scale-[1.02] flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      <span>{t("profileSaving")}</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle-fill"></i>
                      <span>{t("profileSaveChanges")}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
