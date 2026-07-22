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
 * คอมโพเนนต์หน้าจัดการผู้ใช้ของระบบ (ManageUserPage Component) - Redesigned Dark Luxe Glassmorphism Theme
 */
const ManageUserPage = () => {
  const { t } = useLanguage();
  const userHook = useUserManagement(t);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      userHook.setCurrentUser(user);
    };
    fetchUser();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#153648] text-slate-100 font-sans selection:bg-teal-500 selection:text-white">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 animate-fade-in-up">
        {/* Header Title Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3 tracking-tight">
              <span>👥</span> {t("manageUsersTitle")}
            </h2>
            <p className="text-xs text-slate-400 mt-1">จัดการผู้ใช้งานและสิทธิ์การเข้าถึงระบบ</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/FormatForm.csv"
              download
              className="px-4 py-2.5 rounded-xl glass-card text-slate-300 hover:text-white text-xs font-semibold no-underline"
            >
              📥 {t("downloadTemplateBtn")}
            </a>
            <button
              className="px-4 py-2.5 rounded-xl glass-card text-slate-300 hover:text-white text-xs font-semibold"
              onClick={() => fileInputRef.current?.click()}
            >
              📤 {t("importUsersBtn")}
            </button>
            <button
              className="px-4 py-2.5 rounded-xl glass-card text-emerald-400 hover:text-emerald-300 text-xs font-semibold"
              onClick={userHook.handleExportCSV}
            >
              📊 {t("exportUsersBtn")}
            </button>
            <button
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-xs glow-button"
              onClick={userHook.handleOpenAdd}
            >
              + {t("addUserBtn")}
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
              className="hidden"
            />
          </div>
        </div>

        {/* Top Filters Block */}
        <div className="glass-panel rounded-3xl p-5 mb-8 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <select
                className="w-full bg-slate-800/60 hover:bg-slate-800/80 rounded-2xl py-3 px-4 text-white text-xs font-medium focus:outline-none border-0 transition-all cursor-pointer"
                value={userHook.roleFilter}
                onChange={(e) => userHook.setRoleFilter(e.target.value)}
              >
                <option value="all" className="bg-slate-900">{t("roleFilterAll")}</option>
                <option value="Admin" className="bg-slate-900">Admin</option>
                <option value="Project Manager" className="bg-slate-900">Project Manager</option>
                <option value="Team Leader" className="bg-slate-900">Team Leader</option>
                <option value="Video Editor" className="bg-slate-900">Video Editor</option>
                <option value="Translator" className="bg-slate-900">Translator</option>
              </select>
            </div>
            <div>
              <select
                className="w-full bg-slate-800/60 hover:bg-slate-800/80 rounded-2xl py-3 px-4 text-white text-xs font-medium focus:outline-none border-0 transition-all cursor-pointer"
                value={userHook.statusFilter}
                onChange={(e) => userHook.setStatusFilter(e.target.value)}
              >
                <option value="all" className="bg-slate-900">{t("statusFilterAll")}</option>
                <option value="active" className="bg-slate-900">{t("activeLabel")}</option>
                <option value="suspended" className="bg-slate-900">{t("suspendedLabel")}</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <div className="relative">
                <input
                  type="text"
                  className="w-full bg-slate-800/60 hover:bg-slate-800/80 rounded-2xl py-3 pl-10 pr-4 text-white text-xs font-medium focus:outline-none transition-all placeholder:text-slate-400"
                  placeholder={t("searchPlaceholder")}
                  value={userHook.searchQuery}
                  onChange={(e) => userHook.setSearchQuery(e.target.value)}
                />
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">🔍</span>
              </div>
            </div>
          </div>
        </div>

        {userHook.loading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
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
