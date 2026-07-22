import React from "react";
import { API_URL } from "../../../config";

const getRoleBadgeStyle = (role) => {
  switch (role) {
    case "Admin":
      return "bg-indigo-500/20 text-indigo-300";
    case "Project Manager":
      return "bg-pink-500/20 text-pink-300";
    case "Team Leader":
      return "bg-amber-500/20 text-amber-300";
    default:
      return "bg-slate-800 text-slate-300";
  }
};

const UserTable = ({
  filteredUsers,
  currentUser,
  currentPage,
  setCurrentPage,
  entriesPerPage,
  setEntriesPerPage,
  t,
  handleOpenEdit,
  handleToggleStatus,
  handleDeleteUser,
}) => {
  const totalEntries = filteredUsers.length;
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredUsers.slice(
    indexOfFirstEntry,
    indexOfLastEntry,
  );
  const totalPages = Math.ceil(totalEntries / entriesPerPage);

  return (
    <div className="glass-panel rounded-3xl p-6 shadow-2xl overflow-hidden">
      {/* Show entries row */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <span>{t("showText")}</span>
          <select
            className="bg-slate-900/80 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none"
            value={entriesPerPage}
            onChange={(e) => {
              setEntriesPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span>{t("entriesPerPageText")}</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-slate-400 font-bold">
              <th className="py-4 px-4">{t("colUser")}</th>
              <th className="py-4 px-4">{t("colEmail")}</th>
              <th className="py-4 px-4">{t("colRole")}</th>
              <th className="py-4 px-4">{t("colStatus")}</th>
              <th className="py-4 px-4">{t("colLastLogin")}</th>
              <th className="py-4 px-4 text-center w-36">{t("colManage")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm text-slate-200">
            {currentEntries.map((user) => {
              const isSelf = currentUser && currentUser.email === user.email;
              return (
                <tr
                  key={user.id}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img
                          src={
                            user.avatar.startsWith("http")
                              ? user.avatar
                              : `${API_URL}${user.avatar}`
                          }
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-indigo-600/30 flex items-center justify-center font-bold text-xs text-indigo-300">
                          {user.initials}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">
                          {user.name}
                        </span>
                        {isSelf && (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold">
                            {t("youBadge")}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-400 text-xs">
                    <div>{user.email}</div>
                    {user.phone && user.phone !== "-" && (
                      <div className="text-[11px] text-teal-400 font-mono mt-0.5">📞 {user.phone}</div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${getRoleBadgeStyle(user.role)}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    {user.status === "active" ? (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                        {t("activeLabel")}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 text-xs font-semibold">
                        {t("suspendedLabel")}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-slate-400 text-xs">
                    {user.lastLogin}
                  </td>
                  <td className="py-4 px-4 text-center w-36">
                    <div className="inline-flex items-center gap-2 justify-center">
                      <button
                        className="p-2 rounded-xl bg-white/5 text-slate-300 transition-colors hover:scale-110"
                        onClick={() => handleOpenEdit(user)}
                      >
                        ✏️
                      </button>
                      <button
                        className={`p-2 rounded-xl transition-colors ${user.status === "suspended" ? "bg-emerald-500/20 text-emerald-300 hover:scale-110" : "bg-amber-500/20 text-amber-300 hover:scale-110"}`}
                        onClick={() => handleToggleStatus(user)}
                      >
                        {user.status === "suspended" ? "🔓" : "⏸️"}
                      </button>
                      <button
                        className="p-2 rounded-xl bg-rose-500/20 text-rose-300 transition-colors hover:scale-110"
                        onClick={() => handleDeleteUser(user)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {currentEntries.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="text-center text-slate-500 py-8 text-sm"
                >
                  {t("noUsersText")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-white/5 text-xs text-slate-400">
        <span>
          {t("showingText")} {totalEntries === 0 ? 0 : indexOfFirstEntry + 1}{" "}
          {t("toText")} {Math.min(indexOfLastEntry, totalEntries)} {t("ofText")}{" "}
          {totalEntries} {t("entriesText")}
        </span>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-40 transition-colors"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              {t("prevText")}
            </button>
            <span className="px-3 py-1.5 font-bold text-white bg-indigo-600 rounded-xl">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-40 transition-colors"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
            >
              {t("nextText")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserTable;
