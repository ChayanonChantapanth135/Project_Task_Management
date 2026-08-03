import React, { useRef } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProfileCard from "./components/ProfileCard";
import PersonalInfoForm from "./components/PersonalInfoForm";
import PasswordForm from "./components/PasswordForm";
import { useProfile } from "./hooks/useProfile";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const ProfilePage = () => {
  const {
    t,
    language,
    loading,
    saving,
    user,
    fullname,
    setFullname,
    phone,
    setPhone,
    email,
    setEmail,
    avatarPreview,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    successMsg,
    errorMsg,
    handleAvatarChange,
    handleSaveProfile,
  } = useProfile();

  const fileInputRef = useRef(null);
  const pageRef = useRef(null);
  const blob1Ref = useRef(null);
  const blob2Ref = useRef(null);
  const blob3Ref = useRef(null);

  // GSAP Background animations
  useGSAP(() => {
    if (blob1Ref.current) {
      gsap.to(blob1Ref.current, {
        x: 50,
        y: -30,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }
    if (blob2Ref.current) {
      gsap.to(blob2Ref.current, {
        x: -40,
        y: 40,
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }
    if (blob3Ref.current) {
      gsap.to(blob3Ref.current, {
        x: 30,
        y: 20,
        duration: 9,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }
  });

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
          <p className="text-xs text-slate-400 mt-1">{t("profileSubtitle")}</p>
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
            <ProfileCard
              user={user}
              fullname={fullname}
              avatarPreview={avatarPreview}
              fileInputRef={fileInputRef}
              handleAvatarChange={handleAvatarChange}
              t={t}
              language={language}
            />
          </div>

          {/* Right Column: Edit Forms */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <PersonalInfoForm
                fullname={fullname}
                setFullname={setFullname}
                phone={phone}
                setPhone={setPhone}
                email={email}
                setEmail={setEmail}
                t={t}
              />

              <PasswordForm
                currentPassword={currentPassword}
                setCurrentPassword={setCurrentPassword}
                newPassword={newPassword}
                setNewPassword={setNewPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                t={t}
              />

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

export default ProfilePage;
