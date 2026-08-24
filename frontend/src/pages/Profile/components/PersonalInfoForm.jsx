import React from "react";

const PersonalInfoForm = ({
  fullname,
  setFullname,
  phone,
  setPhone,
  email,
  setEmail,
  t,
}) => {
  return (
    <div className="glass-panel rounded-3xl p-6 shadow-xl space-y-4">
      <h5 className="text-base font-bold flex items-center gap-2 mb-2" style={{ color: "var(--brand-color)" }}>
        <ion-icon name="person-circle-outline" style={{ fontSize: "20px" }}></ion-icon>
        <span>{t("profilePersonalInfo")}</span>
      </h5>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Username */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
            {t("profileUsername")}
          </label>
          <input
            type="text"
            className="rounded-2xl px-4 py-3 text-sm font-medium transition-all focus:outline-none"
            style={{
              background: "var(--bg-surface-hover)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-surface)",
            }}
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            required
          />
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
            {t("profilePhone")}
          </label>
          <input
            type="tel"
            className="rounded-2xl px-4 py-3 text-sm font-medium transition-all focus:outline-none placeholder:text-slate-400"
            style={{
              background: "var(--bg-surface-hover)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-surface)",
            }}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+66XXXXXXXXX"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
            {t("profileEmail") || "Email"}
          </label>
          <input
            type="email"
            className="rounded-2xl px-4 py-3 text-sm font-medium cursor-not-allowed opacity-60"
            style={{
              background: "var(--bg-surface-hover)",
              color: "var(--text-secondary)",
              border: "1px dashed var(--border-surface)",
            }}
            value={email || ""}
            disabled
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoForm;
