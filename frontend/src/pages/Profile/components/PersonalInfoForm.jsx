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
    <div className="glass-panel rounded-3xl p-6 shadow-2xl space-y-4">
      <h5 className="text-base font-bold text-teal-400 flex items-center gap-2 mb-2">
        <ion-icon name="person-circle-outline" style={{ fontSize: "20px" }}></ion-icon>
        <span>{t("profilePersonalInfo")}</span>
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
        {/* Email */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400 font-semibold">
            {t("profileEmail") || "Email"}
          </label>
          <input
            type="email"
            className="bg-slate-800/30 text-slate-500 rounded-2xl px-4 py-3 text-sm cursor-not-allowed opacity-70"
            value={email || ""}
            disabled
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoForm;
