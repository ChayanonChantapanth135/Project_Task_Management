import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/footer";
import { useLanguage } from "../lib/LanguageContext";
import { getCurrentUser } from "../lib/auth";
import axios from "axios";
import { Modal } from "react-bootstrap";

const ManageUsers = () => {
  const { t } = useLanguage();
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter and pagination states
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [globalSearch, setGlobalSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Add/Edit User states
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: "",
    isActive: true,
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const uploadAvatarIfNeeded = async (userId) => {
    if (!avatarFile) return;
    const form = new FormData();
    form.append("avatar", avatarFile);
    try {
      await axios.post(
        `http://127.0.0.1:3000/auth/upload-avatar/${userId}`,
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
    } catch (err) {
      console.error("Avatar upload failed:", err);
    }
  };

  const handleEditClick = (user) => {
    setIsEditMode(true);
    setSelectedUserId(user.id);

    const nameParts = user.name.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    setFormData({
      email: user.email,
      password: "", // Optional during edit
      firstName: firstName,
      lastName: lastName,
      phone: "",
      role: user.role,
      isActive: user.status === "active",
    });
    setAvatarFile(null);
    setAvatarPreview(user.avatar || null);
    setModalError("");
    setModalSuccess("");
    setShowAddModal(true);
  };

  const handleAddNewClick = () => {
    setIsEditMode(false);
    setSelectedUserId(null);
    setFormData({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
      role: "Admin",
      isActive: true,
    });
    setAvatarFile(null);
    setAvatarPreview(null);
    setModalError("");
    setModalSuccess("");
    setShowAddModal(true);
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    setModalError("");
    setModalSuccess("");

    if (
      !formData.email ||
      (!isEditMode && !formData.password) ||
      !formData.firstName ||
      !formData.lastName
    ) {
      setModalError(t("fillRequiredFields"));
      return;
    }

    try {
      const payload = {
        username: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        role: formData.role,
        status: formData.isActive ? "active" : "suspended",
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      if (isEditMode) {
        await axios.put(
          `http://127.0.0.1:3000/auth/users/${selectedUserId}`,
          payload,
        );
        await uploadAvatarIfNeeded(selectedUserId);
        setModalSuccess(t("userUpdatedSuccess"));
      } else {
        const res = await axios.post(
          "http://127.0.0.1:3000/auth/users",
          payload,
        );
        const newId = res.data?.id;
        if (newId) await uploadAvatarIfNeeded(newId);
        setModalSuccess(t("userCreatedSuccess"));
      }

      setFormData({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        phone: "",
        role: "Admin",
        isActive: true,
      });
      setAvatarFile(null);
      setAvatarPreview(null);

      fetchUsers();

      setTimeout(() => {
        setShowAddModal(false);
        setIsEditMode(false);
        setSelectedUserId(null);
        setModalSuccess("");
      }, 1500);
    } catch (err) {
      setModalError(err.response?.data?.message || t("userAddFailed"));
    }
  };

  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === "active" ? "suspended" : "active";
    const confirmMsg =
      nextStatus === "suspended"
        ? `${t("suspendConfirm")} ${user.name} ${t("confirmSuffix")}`
        : `${t("activateConfirm")} ${user.name} ${t("confirmSuffix")}`;

    if (window.confirm(confirmMsg)) {
      try {
        const nameParts = user.name.split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        await axios.put(`http://127.0.0.1:3000/auth/users/${user.id}`, {
          username: user.name,
          email: user.email,
          role: user.role,
          status: nextStatus,
        });
        fetchUsers();
      } catch (err) {
        alert(t("statusChangeFailed"));
      }
    }
  };

  const handleDeleteUser = async (user) => {
    if (
      window.confirm(`${t("deleteConfirm")} ${user.name} ${t("deleteSuffix")}`)
    ) {
      try {
        await axios.delete(`http://127.0.0.1:3000/auth/users/${user.id}`);
        fetchUsers();
      } catch (err) {
        alert(t("deleteFailed"));
      }
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:3000/auth/users");
      const mappedUsers = response.data.map((u) => {
        const name = u.username || "User";
        const initials =
          name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) || "U";

        // Map lowercase role value from MySQL table to display roles
        let displayRole = "User";
        if (u.role === "admin") displayRole = "Admin";
        else if (u.role === "manager") displayRole = "Project Manager";
        else if (u.role === "team_leader") displayRole = "Team Leader";
        else if (u.role === "video_editor") displayRole = "Video Editor";
        else if (u.role === "translator") displayRole = "Translator";

        return {
          id: u.id,
          name: name,
          email: u.email,
          role: displayRole,
          status: u.status || "active",
          avatar: u.avatar || null,
          lastLogin: u.created_at
            ? new Date(u.created_at).toLocaleDateString()
            : "-",
          initials: initials,
        };
      });
      setUsers(mappedUsers);
    } catch (error) {
      console.error("Error fetching users from MySQL:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    const fetchUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };
    fetchUser();
  }, []);

  // Filter logic
  const filteredUsers = users.filter((user) => {
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;

    // Search by either Top Search button or Global live search
    const matchesTopSearch =
      searchQuery === "" ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGlobalSearch =
      globalSearch === "" ||
      user.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(globalSearch.toLowerCase());

    return (
      matchesRole && matchesStatus && matchesTopSearch && matchesGlobalSearch
    );
  });

  // Pagination logic
  const totalEntries = filteredUsers.length;
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredUsers.slice(
    indexOfFirstEntry,
    indexOfLastEntry,
  );
  const totalPages = Math.ceil(totalEntries / entriesPerPage);

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case "Admin":
        return { backgroundColor: "#6391b9ff", color: "#fff" };
      case "Project Manager":
        return { backgroundColor: "#5fc2cfff", color: "#fff" };
      case "Team Leader":
        return { backgroundColor: "#33968dff", color: "#fff" };
      default:
        return { backgroundColor: "#adb5bd", color: "#212529" };
    }
  };

  return (
    <div className="min-h-screen bg-light">
      <Header />

      <main className="container my-4" style={{ maxWidth: "1200px" }}>
        {/* Header Title Row */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2
            className="h4 d-flex align-items-center gap-2 mb-0"
            style={{ fontWeight: "700" }}
          >
            <span style={{ fontSize: "1.5rem" }}>👥</span>{" "}
            {t("manageUsersTitle")}
          </h2>
          <button
            className="btn btn-primary d-flex align-items-center gap-2 px-3 py-2 rounded-lg"
            style={{ fontSize: "0.9rem" }}
            onClick={handleAddNewClick}
          >
            <span>👤+</span> {t("addUserBtn")}
          </button>
        </div>

        {/* Top Filters Block */}
        <div className="card border-0 shadow-sm mb-4 rounded-lg">
          <div className="card-body p-3">
            <div className="row g-2">
              <div className="col-md-3">
                <select
                  className="form-select rounded-lg"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="all">{t("roleFilterAll")}</option>
                  <option value="Admin">Admin</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="Team Leader">Team Leader</option>
                  <option value="Video Editor">Video Editor</option>
                  <option value="Translator">Translator</option>
                </select>
              </div>
              <div className="col-md-3">
                <select
                  className="form-select rounded-lg"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">{t("statusFilterAll")}</option>
                  <option value="active">{t("activeLabel")}</option>
                  <option value="suspended">{t("suspendedLabel")}</option>
                </select>
              </div>
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control rounded-lg"
                  placeholder={t("searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="col-md-2">
                <button className="btn btn-outline-primary w-100 rounded-lg d-flex align-items-center justify-content-center gap-2">
                  🔍 {t("searchBtn")}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Users Table Card */}
        <div className="card border-0 shadow-sm rounded-lg overflow-hidden">
          <div className="card-body p-4">
            {/* Show entries and Search row */}
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
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted">{t("searchText")}</span>
                <input
                  type="search"
                  className="form-control form-control-sm rounded-lg"
                  style={{ width: "200px" }}
                  value={globalSearch}
                  onChange={(e) => {
                    setGlobalSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />
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
                    // Check if current row represents the logged in user
                    const isSelf =
                      currentUser && currentUser.email === user.email;

                    return (
                      <tr key={user.id}>
                        {/* User Avatar Initials + Name */}
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
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

                        {/* Email */}
                        <td>{user.email}</td>

                        {/* Role Badges */}
                        <td>
                          <span
                            className="badge rounded px-2.5 py-1.5"
                            style={getRoleBadgeStyle(user.role)}
                          >
                            {user.role}
                          </span>
                        </td>

                        {/* Status Badges */}
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

                        {/* Last Login */}
                        <td className="text-muted">{user.lastLogin}</td>

                        {/* Action buttons */}
                        <td className="text-end">
                          <div className="d-inline-flex gap-1">
                            <button
                              className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 py-1 px-2 rounded-lg"
                              onClick={() => handleEditClick(user)}
                            >
                              ✏️
                            </button>
                            <button
                              className={`btn btn-sm ${user.status === "suspended" ? "btn-outline-success" : "btn-outline-warning"} d-inline-flex align-items-center py-1 px-2 rounded-lg`}
                              onClick={() => handleToggleStatus(user)}
                            >
                              {user.status === "suspended" ? "🔓 " : "⏸️ "}
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger d-inline-flex align-items-center py-1 px-2 rounded-lg"
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

            {/* Pagination & Show entries footer */}
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 mt-4 pt-3 border-top">
              <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                {t("showingText")}{" "}
                {totalEntries === 0 ? 0 : indexOfFirstEntry + 1} {t("toText")}{" "}
                {Math.min(indexOfLastEntry, totalEntries)} {t("ofText")}{" "}
                {totalEntries} {t("entriesText")}
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
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages),
                          )
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
      </main>

      {/* Add User Modal */}
      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        size="lg"
        centered
      >
        <Modal.Body className="p-4" style={{ borderRadius: "1rem" }}>
          {/* Modal Header */}
          <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
            <h5
              className="modal-title d-flex align-items-center gap-2"
              style={{ fontWeight: "700" }}
            >
              <span>👤+</span>{" "}
              {isEditMode ? t("editUserTitle") : t("addUserTitle")}
            </h5>
            <button
              className="btn btn-sm btn-outline-secondary px-3 py-1.5 rounded-lg"
              onClick={() => setShowAddModal(false)}
            >
              {t("backBtn")}
            </button>
          </div>

          {modalError && (
            <div
              className="alert alert-danger py-2 px-3 rounded-lg mb-3"
              style={{ fontSize: "0.85rem" }}
            >
              ⚠️ {modalError}
            </div>
          )}
          {modalSuccess && (
            <div
              className="alert alert-success py-2 px-3 rounded-lg mb-3"
              style={{ fontSize: "0.85rem" }}
            >
              ✅ {modalSuccess}
            </div>
          )}

          <form onSubmit={handleAddUserSubmit}>
            <div className="row g-3">
              {/* Left Column (col-md-8) */}
              <div className="col-md-8 d-flex flex-column gap-3">
                {/* Email */}
                <div>
                  <label
                    className="form-label text-secondary mb-1"
                    style={{ fontSize: "0.85rem", fontWeight: "600" }}
                  >
                    {t("modalEmailLabel")}{" "}
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="form-control rounded-lg"
                    placeholder="example@domain.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label
                    className="form-label text-secondary mb-1"
                    style={{ fontSize: "0.85rem", fontWeight: "600" }}
                  >
                    {t("modalPasswordLabel")}{" "}
                    {!isEditMode && <span className="text-danger">*</span>}
                  </label>
                  <input
                    type="password"
                    name="password"
                    className="form-control rounded-lg"
                    placeholder={
                      isEditMode
                        ? t("modalPasswordEditPlaceholder")
                        : t("modalPasswordPlaceholder")
                    }
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!isEditMode}
                  />
                </div>

                {/* First Name & Last Name */}
                <div className="row g-2">
                  <div className="col-md-6">
                    <label
                      className="form-label text-secondary mb-1"
                      style={{ fontSize: "0.85rem", fontWeight: "600" }}
                    >
                      {t("modalFirstNameLabel")}{" "}
                      <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      className="form-control rounded-lg"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label
                      className="form-label text-secondary mb-1"
                      style={{ fontSize: "0.85rem", fontWeight: "600" }}
                    >
                      {t("modalLastNameLabel")}{" "}
                      <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      className="form-control rounded-lg"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label
                    className="form-label text-secondary mb-1"
                    style={{ fontSize: "0.85rem", fontWeight: "600" }}
                  >
                    {t("modalPhoneLabel")}
                  </label>
                  <input
                    type="text"
                    name="phone"
                    className="form-control rounded-lg"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Right Column (col-md-4) */}
              <div className="col-md-4 d-flex flex-column gap-3">
                {/* Avatar Upload */}
                <div className="text-center">
                  <label
                    className="form-label text-secondary mb-2 d-block"
                    style={{ fontSize: "0.85rem", fontWeight: "600" }}
                  >
                    {t("modalAvatarLabel")}
                  </label>
                  <div
                    className="mx-auto rounded-circle overflow-hidden d-flex align-items-center justify-content-center text-white mb-2"
                    style={{
                      width: "90px",
                      height: "90px",
                      backgroundColor: avatarPreview
                        ? "transparent"
                        : "#0d6efd",
                      fontSize: "2rem",
                      fontWeight: "bold",
                      cursor: "pointer",
                      border: "2px dashed #0d6efd",
                    }}
                    onClick={() =>
                      document.getElementById("avatarFileInput").click()
                    }
                  >
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar Preview"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <span>
                        {formData.firstName?.[0]?.toUpperCase() || "👤"}
                      </span>
                    )}
                  </div>
                  <input
                    id="avatarFileInput"
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleAvatarChange}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm rounded-pill px-3"
                    onClick={() =>
                      document.getElementById("avatarFileInput").click()
                    }
                  >
                    {t("modalChoosePhoto")}
                  </button>
                  {avatarPreview && (
                    <button
                      type="button"
                      className="btn btn-link btn-sm text-danger mt-1 d-block mx-auto"
                      onClick={() => {
                        setAvatarFile(null);
                        setAvatarPreview(null);
                      }}
                    >
                      {t("modalRemovePhoto")}
                    </button>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label
                    className="form-label text-secondary mb-1"
                    style={{ fontSize: "0.85rem", fontWeight: "600" }}
                  >
                    {t("modalRoleLabel")} <span className="text-danger">*</span>
                  </label>
                  <select
                    name="role"
                    className="form-select rounded-lg"
                    value={formData.role}
                    onChange={handleInputChange}
                  >
                    <option value="Admin">Admin</option>
                    <option value="Project Manager">Project Manager</option>
                    <option value="Team Leader">Team Leader</option>
                    <option value="Video Editor">Video Editor</option>
                    <option value="Translator">Translator</option>
                  </select>
                </div>

                {/* Active Checkbox */}
                <div className="form-check mt-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    id="isActiveCheck"
                    className="form-check-input"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  <label
                    className="form-check-label text-secondary"
                    htmlFor="isActiveCheck"
                    style={{ fontSize: "0.9rem", fontWeight: "600" }}
                  >
                    {t("modalActiveLabel")}
                  </label>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
              <button
                type="button"
                className="btn btn-secondary px-4 rounded-lg"
                onClick={() => setShowAddModal(false)}
              >
                {t("modalCancelBtn")}
              </button>
              <button
                type="submit"
                className="btn btn-primary px-4 rounded-lg d-flex align-items-center gap-2"
              >
                {isEditMode ? t("modalSaveBtn") : t("modalCreateBtn")}
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      <Footer />
    </div>
  );
};

export default ManageUsers;
