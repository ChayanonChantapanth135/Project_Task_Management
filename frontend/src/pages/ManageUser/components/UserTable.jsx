import React from "react";
// นำเข้า API_URL สำหรับนำไปแสดงผลรูปโปรไฟล์ของผู้ใช้ให้สอดคล้องกับพอร์ตเซิร์ฟเวอร์แบบไดนามิก
import { API_URL } from "../../../config";

const getRoleBadgeStyle = (role) => {
  switch (role) {
    case "Admin":
      return { backgroundColor: "#0e09f3ff", color: "#fff" };
    case "Project Manager":
      return { backgroundColor: "#f30e99ff", color: "#fff" };
    case "Team Leader":
      return { backgroundColor: "#f3680eff", color: "#fff" };
    default:
      return { backgroundColor: "#f4ffc2ff", color: "#212529" };
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
    <div className="card border-0 shadow-sm rounded-lg overflow-hidden">
      <div className="card-body p-4">
        {/* Show entries row */}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 mb-4">
          <div className="d-flex align-items-center gap-2">
            <span>{t("showText")}</span>
            <select
              className="form-select form-select-sm rounded-lg"
              style={{ width: "70px" }}
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
        <div className="table-responsive">
          <table className="table align-middle table-hover mb-0">
            <thead
              className="table-light text-secondary"
              style={{ fontSize: "0.85rem", fontWeight: "600" }}
            >
              <tr>
                <th scope="col" className="border-0">
                  {t("colUser")}
                </th>
                <th scope="col" className="border-0">
                  {t("colEmail")}
                </th>
                <th scope="col" className="border-0">
                  {t("colRole")}
                </th>
                <th scope="col" className="border-0">
                  {t("colStatus")}
                </th>
                <th scope="col" className="border-0">
                  {t("colLastLogin")}
                </th>
                <th scope="col" className="border-0 text-end">
                  {t("colManage")}
                </th>
              </tr>
            </thead>
            <tbody style={{ fontSize: "0.9rem" }}>
              {currentEntries.map((user) => {
                const isSelf = currentUser && currentUser.email === user.email;
                return (
                  <tr key={user.id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        {user.avatar ? (
                          <img
                            src={
                              user.avatar.startsWith("http")
                                ? user.avatar
                                : `${API_URL}${user.avatar}`
                            }
                            alt={user.name}
                            className="rounded-circle"
                            style={{
                              width: "36px",
                              height: "36px",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-white"
                            style={{
                              width: "36px",
                              height: "36px",
                              fontSize: "0.85rem",
                              fontWeight: "bold",
                              backgroundColor: "#0d6efd",
                            }}
                          >
                            {user.initials}
                          </div>
                        )}
                        <div className="d-flex align-items-center gap-2">
                          <span
                            className="font-weight-bold"
                            style={{ color: "#333" }}
                          >
                            {user.name}
                          </span>
                          {isSelf && (
                            <span
                              className="badge bg-info text-white rounded-pill px-2 py-1"
                              style={{ fontSize: "0.7rem" }}
                            >
                              {t("youBadge")}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span
                        className="badge rounded px-2.5 py-1.5"
                        style={getRoleBadgeStyle(user.role)}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td>
                      {user.status === "active" ? (
                        <span className="badge bg-success px-2 py-1">
                          {t("activeLabel")}
                        </span>
                      ) : (
                        <span className="badge bg-danger px-2 py-1">
                          {t("suspendedLabel")}
                        </span>
                      )}
                    </td>
                    <td className="text-muted">{user.lastLogin}</td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-1">
                        <button
                          className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 py-1 px-2 rounded-lg"
                          onClick={() => handleOpenEdit(user)}
                        >
                          ✏️
                        </button>
                        <button
                          className={`btn btn-sm ${user.status === "suspended" ? "btn-success" : "btn-warning"} d-inline-flex align-items-center py-1 px-2 rounded-lg`}
                          onClick={() => handleToggleStatus(user)}
                        >
                          {user.status === "suspended" ? "🔓 " : "⏸️ "}
                        </button>
                        <button
                          className="btn btn-sm btn-danger d-inline-flex align-items-center py-1 px-2 rounded-lg"
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
                  <td colSpan={6} className="text-center text-muted py-4">
                    {t("noUsersText")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 mt-4 pt-3 border-top">
          <span className="text-muted" style={{ fontSize: "0.85rem" }}>
            {t("showingText")} {totalEntries === 0 ? 0 : indexOfFirstEntry + 1}{" "}
            {t("toText")} {Math.min(indexOfLastEntry, totalEntries)}{" "}
            {t("ofText")} {totalEntries} {t("entriesText")}
          </span>

          {totalPages > 1 && (
            <nav aria-label="Page navigation">
              <ul className="pagination pagination-sm mb-0">
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link rounded-lg px-2.5 py-1.5"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                  >
                    {t("prevText")}
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <li
                      key={page}
                      className={`page-item ${currentPage === page ? "active" : ""}`}
                    >
                      <button
                        className="page-link rounded-lg px-3 py-1.5"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    </li>
                  ),
                )}
                <li
                  className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
                >
                  <button
                    className="page-link rounded-lg px-2.5 py-1.5"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                  >
                    {t("nextText")}
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserTable;
