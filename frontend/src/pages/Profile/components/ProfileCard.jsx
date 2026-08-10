import React from "react";
import { formatDate } from "../../../lib/dateUtils";

const ProfileCard = ({
  user,
  fullname,
  avatarPreview,
  fileInputRef,
  handleAvatarChange,
  t,
  language,
}) => {
  return (
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
          <ion-icon name="camera-outline" style={{ fontSize: "16px" }}></ion-icon>
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
          🛡️ {(() => {
            const r = String(user?.role || "").toLowerCase().trim();
            if (r === "manager" || r === "project_manager" || r === "project manager") return "Project Manager";
            if (r === "team_leader" || r === "team leader" || r === "tl") return "Team Leader";
            if (r === "video_editor" || r === "video editor") return "Video Editor";
            if (r === "translator") return "Translator";
            if (r === "admin") return "Admin";
            return (user?.role || "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
          })()}
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
              ? formatDate(user.created_at, language)
              : "-"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">
            {t("profileRoleLevel")}:
          </span>
          <span className="capitalize">
            {(() => {
              const r = String(user?.role || "").toLowerCase().trim();
              if (r === "manager" || r === "project_manager" || r === "project manager") return "Project Manager";
              if (r === "team_leader" || r === "team leader" || r === "tl") return "Team Leader";
              if (r === "video_editor" || r === "video editor") return "Video Editor";
              if (r === "translator") return "Translator";
              if (r === "admin") return "Admin";
              return (user?.role || "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
            })()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
