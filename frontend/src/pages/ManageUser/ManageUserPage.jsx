import React, { useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/footer";
import ConfirmModal from "../../components/ConfirmModal";
import { useLanguage } from "../../lib/LanguageContext";
import { getCurrentUser } from "../../lib/auth";
import { useUserManagement } from "./hooks/useUserManagement";
import UserTable from "./components/UserTable";
import UserModal from "./components/UserModal";

const ManageUserPage = () => {
  const { t } = useLanguage();
  const userHook = useUserManagement(t);

  // Load current user profile (matching original effect)
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
          <h2
            className="fw-bold text-dark d-flex align-items-center gap-2 mb-0"
          >
            <span>👥</span> {t("manageUsersTitle")}
          </h2>
          <button
            className="btn btn-primary d-flex align-items-center gap-2 px-3 py-2 rounded-lg"
            style={{ fontSize: "0.9rem" }}
            onClick={userHook.handleOpenAdd}
          >
            <span>+</span> {t("addUserBtn")}
          </button>
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

      <Footer />
    </div>
  );
};

export default ManageUserPage;
