import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/footer";
import { useLanguage } from "../lib/LanguageContext";
import axios from "axios";

const Activity = () => {
  const { t } = useLanguage();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 6;

  // Fetch all activity logs from DB
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://127.0.0.1:3000/auth/activity-logs",
      );
      setLogs(response.data);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filter logs by search query and action category
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      (log.username &&
        log.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.details &&
        log.details.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.action &&
        log.action.toLowerCase().includes(searchQuery.toLowerCase()));

    let matchesAction = true;
    if (actionFilter !== "all") {
      if (actionFilter === "project") {
        matchesAction = log.action.toLowerCase().includes("project");
      } else if (actionFilter === "user") {
        matchesAction = log.action.toLowerCase().includes("user");
      } else if (actionFilter === "system") {
        matchesAction =
          !log.action.toLowerCase().includes("project") &&
          !log.action.toLowerCase().includes("user");
      }
    }

    return matchesSearch && matchesAction;
  });

  // Pagination calculations
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredLogs.slice(
    indexOfFirstEntry,
    indexOfLastEntry,
  );
  const totalPages = Math.ceil(filteredLogs.length / entriesPerPage);

  return (
    <div className="d-flex flex-column min-vh-100 bg-gray-100">
      <Header />

      <main
        className="flex-grow-1 container py-5"
        style={{ maxWidth: "900px" }}
      >
        {/* Page Title */}
        <div className="text-center mb-5">
          <h1 className="h2 fw-bold text-dark mb-2">📋 System Activity Logs</h1>
          <p className="text-muted mb-0">
            ตรวจสอบและติดตามประวัติการทำรายการกิจกรรมทั้งหมดของระบบ
          </p>
        </div>

        {/* Filters and Search Toolbar */}
        <div className="card shadow-sm border-0 rounded-lg overflow-hidden mb-4">
          <div className="card-body bg-white p-3.5">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    🔍
                  </span>
                  <input
                    type="search"
                    className="form-control bg-light border-start-0 ps-0 rounded-end-lg"
                    placeholder="ค้นหาชื่อผู้ใช้หรือรายละเอียด..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>
              <div className="col-12 col-md-6 d-flex gap-2">
                <select
                  className="form-select bg-light border-0 fw-medium rounded-lg"
                  value={actionFilter}
                  onChange={(e) => {
                    setActionFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">📂 กิจกรรมทั้งหมด</option>
                  <option value="project">📁 เกี่ยวกับโปรเจกต์</option>
                  <option value="user">👥 เกี่ยวกับผู้ใช้งาน</option>
                  <option value="system">⚙️ เกี่ยวกับระบบ / อื่น ๆ</option>
                </select>
                <button
                  className="btn btn-secondary d-flex align-items-center gap-1.5 px-3 rounded-lg"
                  onClick={fetchLogs}
                  title="รีเฟรชข้อมูล"
                >
                  🔄
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="card shadow-sm border-0 rounded-lg overflow-hidden">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted mt-2">กำลังโหลดบันทึกกิจกรรม...</p>
            </div>
          ) : currentEntries.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-uppercase text-muted small">
                  <tr>
                    <th className="px-4 py-3" style={{ width: "160px" }}>
                      Action
                    </th>
                    <th className="py-3">Details</th>
                    <th className="py-3" style={{ width: "160px" }}>
                      User
                    </th>
                    <th className="px-4 py-3" style={{ width: "220px" }}>
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentEntries.map((log, index) => {
                    // Badge styles
                    const act = log.action.toLowerCase();
                    let badgeClass = "bg-light text-dark";
                    if (act.includes("create"))
                      badgeClass = "bg-success-subtle text-success";
                    else if (act.includes("edit") || act.includes("update"))
                      badgeClass = "bg-warning-subtle text-warning";
                    else if (act.includes("delete"))
                      badgeClass = "bg-danger-subtle text-danger";
                    else if (act.includes("login"))
                      badgeClass = "bg-info-subtle text-info";
                    else if (act.includes("logout"))
                      badgeClass = "bg-secondary-subtle text-secondary";

                    return (
                      <tr key={index}>
                        <td className="px-4 py-3">
                          <span
                            className={`badge px-2.5 py-1.5 rounded text-xs fw-semibold ${badgeClass}`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 text-dark fw-medium">
                          {log.details}
                        </td>
                        <td className="py-3 text-muted fw-semibold">
                          👤 {log.username || "System Admin"}
                        </td>
                        <td className="px-4 py-3 text-muted small">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5 text-muted bg-white">
              <div className="fs-1 mb-2">📂</div>
              <p className="mb-0 fw-medium">
                ไม่พบบันทึกกิจกรรมตามเงื่อนไขที่เลือก
              </p>
            </div>
          )}
        </div>

        {/* Pagination Toolbar */}
        {!loading && totalPages > 1 && (
          <nav className="d-flex justify-content-center mt-5">
            <ul className="pagination shadow-sm rounded-lg overflow-hidden">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link py-2 px-3.5 border-0 bg-white text-dark"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                >
                  ย้อนกลับ
                </button>
              </li>
              {[...Array(totalPages)].map((_, i) => (
                <li
                  key={i}
                  className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                >
                  <button
                    className={`page-link py-2 px-3.5 border-0 ${
                      currentPage === i + 1
                        ? "bg-primary text-white"
                        : "bg-white text-dark"
                    }`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}
              <li
                className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
              >
                <button
                  className="page-link py-2 px-3.5 border-0 bg-white text-dark"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                >
                  ถัดไป
                </button>
              </li>
            </ul>
          </nav>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Activity;
