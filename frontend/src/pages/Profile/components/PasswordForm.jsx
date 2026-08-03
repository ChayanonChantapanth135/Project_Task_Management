import React from "react";

const PasswordForm = ({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  t,
}) => {
  return (
    <div className="glass-panel rounded-3xl p-6 shadow-2xl space-y-4">
      <h5 className="text-base font-bold text-teal-400 flex items-center gap-2 mb-2">
        <i className="bi bi-shield-lock"></i>{" "}
        {t("profileChangePassword")}
      </h5>

      <div className="flex flex-col gap-4">
        {/* Current Password */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400 font-semibold">
            {t("profileCurrentPassword") || "Current Password"}
          </label>
          <input
            type="password"
            className="bg-slate-800/60 hover:bg-slate-800/80 focus:bg-slate-900/90 text-white rounded-2xl px-4 py-3 text-sm transition-all"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

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
    </div>
  );
};

export default PasswordForm;
