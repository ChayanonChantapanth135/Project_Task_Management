import React, { useEffect, useRef } from "react";
import Header from "../../components/Header";
import Footer from "../../components/footer";
import ConfirmModal from "../../components/ConfirmModal";
import { useLanguage } from "../../lib/LanguageContext";
import { getCurrentUser } from "../../lib/auth";
import { useUserManagement } from "./hooks/useUserManagement";
import UserTable from "./components/UserTable";
import UserModal from "./components/UserModal";

/**
 * คอมโพเนนต์หน้าจัดการผู้ใช้ของระบบ (ManageUserPage Component)
 * - แสดงตารางรายชื่อผู้ใช้ที่ผ่านตัวกรองบทบาท (Role) สถานะ (Status) และแถบค้นหา (Search)
 * - เรียกใช้งาน useUserManagement Custom Hook สำหรับดำเนินตรรกะเบื้องหลัง
 * - แสดงและควบคุมการทำงานร่วมกับ Modals สำหรับเพิ่ม/แก้ไขผู้ใช้งาน ยืนยันการระงับ หรือยืนยันการลบผู้ใช้
 */
const ManageUserPage = () => {
  const { t } = useLanguage();
  const userHook = useUserManagement(t);
  const fileInputRef = useRef(null);

  // โหลดโปรไฟล์ผู้ใช้ปัจจุบันเพื่อนำมาเปรียบเทียบสิทธิ์และไม่ให้ลบบัญชีตัวเองโดยไม่ได้ตั้งใจ
  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      userHook.setCurrentUser(user);
    };
    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <main className="container my-4" style={{ maxWidth: "1200px" }}>
        {/* Header Title Row */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold text-dark d-flex align-items-center gap-2 mb-0">
            <span>👥</span> {t("manageUsersTitle")}
          </h2>
          <div className="d-flex gap-2">
            <a
              href="/FormatForm.csv"
              download
              className="btn btn-secondary d-flex align-items-center gap-2 px-3 py-2 rounded-lg"
              style={{ fontSize: "0.9rem" }}
            >
              {t("downloadTemplateBtn")}
            </a>
            <button
              className="btn btn-primary d-flex align-items-center gap-2 px-3 py-2 rounded-lg"
              style={{ fontSize: "0.9rem" }}
              onClick={() => fileInputRef.current?.click()}
            >
              {t("importUsersBtn")}
            </button>
            <button
              className="btn btn-success d-flex align-items-center gap-2 px-3 py-2 rounded-lg"
              style={{ fontSize: "0.9rem" }}
              onClick={userHook.handleExportCSV}
            >
              {t("exportUsersBtn")}
            </button>
            <button
              className="btn btn-primary d-flex align-items-center gap-2 px-3 py-2 rounded-lg"
              style={{ fontSize: "0.9rem" }}
              onClick={userHook.handleOpenAdd}
            >
              <span>+</span> {t("addUserBtn")}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  userHook.handleImportCSV(file);
                  e.target.value = "";
                }
              }}
              accept=".csv"
              style={{ display: "none" }}
            />
          </div>
        </div>

        {/* Top Filters Block */}
        <div className="card border-0 shadow-sm mb-4 rounded-lg">
          <div className="card-body p-3">
            <div className="row g-2">
              <div className="col-md-3">
                <select
                  className="form-select rounded-lg"
                  value={userHook.roleFilter}
                  onChange={(e) => userHook.setRoleFilter(e.target.value)}
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
                  value={userHook.statusFilter}
                  onChange={(e) => userHook.setStatusFilter(e.target.value)}
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
                  value={userHook.searchQuery}
                  onChange={(e) => userHook.setSearchQuery(e.target.value)}
                />
              </div>
              <div className="col-md-2">
                <button className="btn btn-primary w-100 rounded-lg d-flex align-items-center justify-content-center gap-2">
                  🔍 {t("searchBtn")}
                </button>
              </div>
            </div>
          </div>
        </div>

        {userHook.loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <UserTable
            filteredUsers={userHook.filteredUsers}
            currentUser={userHook.currentUser}
            currentPage={userHook.currentPage}
            setCurrentPage={userHook.setCurrentPage}
            entriesPerPage={userHook.entriesPerPage}
            setEntriesPerPage={userHook.setEntriesPerPage}
            t={t}
            handleOpenEdit={userHook.handleOpenEdit}
            handleToggleStatus={userHook.handleToggleStatus}
            handleDeleteUser={userHook.handleDeleteUser}
          />
        )}
      </main>

      {/* Add/Edit User Modal */}
      <UserModal
        showAddModal={userHook.showAddModal}
        setShowAddModal={userHook.setShowAddModal}
        isEditMode={userHook.isEditMode}
        formData={userHook.formData}
        handleInputChange={userHook.handleInputChange}
        handleAvatarChange={userHook.handleAvatarChange}
        avatarPreview={userHook.avatarPreview}
        modalError={userHook.modalError}
        modalSuccess={userHook.modalSuccess}
        handleCreateOrUpdateUser={userHook.handleCreateOrUpdateUser}
        t={t}
      />

      {/* DELETE CONFIRM MODAL */}
      <ConfirmModal
        show={userHook.showDeleteModal}
        onHide={() => userHook.setShowDeleteModal(false)}
        title={t("deleteUserConfirmTitle")}
        description={
          userHook.selectedUserForDelete && (
            <>
              {t("deleteConfirm")}{" "}
              <strong>"{userHook.selectedUserForDelete.name}"</strong>{" "}
              {t("deleteSuffix")}
            </>
          )
        }
        onConfirm={userHook.handleDeleteConfirm}
        confirmText={t("confirmDeleteBtn")}
        cancelText={t("cancelBtn")}
        type="danger"
      />

      {/* STATUS TOGGLE CONFIRM MODAL */}
      <ConfirmModal
        show={userHook.showStatusModal}
        onHide={() => userHook.setShowStatusModal(false)}
        title={
          userHook.selectedUserForStatus?.status === "active"
            ? t("suspendConfirm")
            : t("activateConfirm")
        }
        description={
          userHook.selectedUserForStatus && (
            <>
              {userHook.selectedUserForStatus.status === "active"
                ? `${t("suspendConfirm")} "${userHook.selectedUserForStatus.name}" ${t("confirmSuffix")}`
                : `${t("activateConfirm")} "${userHook.selectedUserForStatus.name}" ${t("confirmSuffix")}`}
            </>
          )
        }
        onConfirm={userHook.handleStatusConfirm}
        confirmText={t("confirmBtn")}
        cancelText={t("cancelBtn")}
        type="warning"
      />

      {/* IMPORT CONFIRM MODAL */}
      <ConfirmModal
        show={userHook.showImportConfirm}
        onHide={() => userHook.setShowImportConfirm(false)}
        title={t("importConfirmTitle")}
        description={
          t("importConfirmDesc")
            ? t("importConfirmDesc")
                .replace("{filename}", userHook.importFileName)
                .replace("{count}", userHook.importUsersList.length)
            : ""
        }
        onConfirm={userHook.handleImportConfirm}
        confirmText={t("confirmBtn")}
        cancelText={t("cancelBtn")}
        type="warning"
      />

      {/* IMPORT RESULT SUCCESS MODAL */}
      <ConfirmModal
        show={userHook.showImportResult}
        onHide={() => userHook.setShowImportResult(false)}
        title={t("importResultTitle")}
        description={
          t("importResultDesc")
            ? t("importResultDesc")
                .replace("{imported}", userHook.importResultDetails.imported)
                .replace("{updated}", userHook.importResultDetails.updated)
            : ""
        }
        onConfirm={() => userHook.setShowImportResult(false)}
        confirmText={t("confirmBtn")}
        cancelText={t("cancelBtn")}
        type="success"
      />

      <Footer />
    </div>
  );
};

export default ManageUserPage;
