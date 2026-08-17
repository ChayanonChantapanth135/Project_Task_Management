import React from "react";
import { Modal } from "react-bootstrap";

const UserModal = ({
  showAddModal,
  setShowAddModal,
  isEditMode,
  formData,
  handleInputChange,
  handleAvatarChange,
  avatarPreview,
  modalError,
  modalSuccess,
  handleCreateOrUpdateUser,
  t,
}) => {
  return (
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
            <span></span>{" "}
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

        <form onSubmit={handleCreateOrUpdateUser}>
          <div className="row g-3">
            {/* Left Column */}
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
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={isEditMode ? "••••••••" : ""}
                  required={!isEditMode}
                />
              </div>

              {/* First Name & Last Name */}
              <div className="row g-2">
                <div className="col">
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
                <div className="col">
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

            {/* Right Column */}
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
                    backgroundColor: avatarPreview ? "transparent" : "#0d6efd",
                    fontSize: "2rem",
                    fontWeight: "bold",
                    border: "2px solid #ddd",
                  }}
                >
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    formData.firstName
                      ? formData.firstName[0]?.toUpperCase()
                      : "U"
                  )}
                </div>
                <input
                  type="file"
                  id="avatarUploadInput"
                  className="d-none"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary px-3 rounded-lg"
                  onClick={() =>
                    document.getElementById("avatarUploadInput").click()
                  }
                >
                  {t("uploadPhotoBtn") || "อัปโหลดภาพ"}
                </button>
              </div>

              {/* Role Selection */}
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
                  required
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Project Manager</option>
                  <option value="storyboard">Storyboard</option>
                  <option value="animation">Animation</option>
                  <option value="designer">Designer</option>
                  <option value="programmer">Programmer</option>
                </select>
              </div>

              {/* Active Toggle Switch */}
              <div>
                <label
                  className="form-label text-secondary mb-2 d-block"
                  style={{ fontSize: "0.85rem", fontWeight: "600" }}
                >
                  {t("modalStatusLabel") || "สถานะการใช้งาน"}
                </label>
                <div className="form-check form-switch d-flex align-items-center gap-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="isActiveCheck"
                    name="isActive"
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
  );
};

export default UserModal;
