import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/footer";
import { useLanguage } from "../../lib/LanguageContext";
import ConfirmModal from "../../components/ConfirmModal";
import ProjectCard from "./components/ProjectCard";
import ProjectFilter from "./components/ProjectFilter";
import ProjectTable from "./components/ProjectTable";

import { useProjectManagement } from "./hooks/useProjectManagement";
import CreateProjectModal from "./components/CreateProjectModal";
import EditProjectModal from "./components/EditProjectModal";
import ProjectDetailModal from "./components/ProjectDetailModal";
import AddTaskModal from "./components/AddTaskModal";
import ViewTaskModal from "./components/ViewTaskModal";

/**
 * คอมโพเนนต์หน้าจัดการโครงการ (ManageProjectPage Component) - Redesigned Dark Luxe Glassmorphism Theme
 */
const ManageProjectPage = () => {
  const { t } = useLanguage();
  const {
    currentUser,
    viewMode,
    setViewMode,
    sortByPriority,
    setSortByPriority,
    teamLeaders,
    users,
    searchQuery,
    setSearchQuery,
    successMessage,
    setSuccessMessage,
    errorMessage,
    setErrorMessage,
    showCreateModal,
    setShowCreateModal,
    showEditModal,
    setShowEditModal,
    showDetailModal,
    setShowDetailModal,
    showDeleteModal,
    setShowDeleteModal,
    showAddTaskModal,
    setShowAddTaskModal,
    showViewTaskModal,
    setShowViewTaskModal,
    selectedProject,
    setSelectedProject,
    selectedTask,
    setSelectedTask,
    tempStatus,
    setTempStatus,
    formData,
    setFormData,
    editFormData,
    setEditFormData,
    taskFormData,
    setTaskFormData,
    filteredProjects,
    fetchProjects,
    handleCreateSubmit,
    handleViewDetails,
    handleOpenEdit,
    handleEditSubmit,
    handleOpenDelete,
    handleDeleteConfirm,
    handleAddTaskSubmit,
  } = useProjectManagement(t);

  return (
    <div className="min-h-screen flex flex-col bg-[#153648] text-slate-100 font-sans selection:bg-teal-500 selection:text-white">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 animate-fade-in-up">
        {/* Header and Title */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3 tracking-tight">
              <span>📂</span> {t("projectManagementTitle")}
            </h2>
            <p className="text-xs text-slate-400 mt-1">บริหารจัดการโครงการและทีมงานที่รับผิดชอบ</p>
          </div>
        </div>

        {/* Global Toast Alerts */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-6 flex items-center gap-2 shadow-lg">
            <span>✅</span>
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold mb-6 flex items-center gap-2 shadow-lg">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Filter panel */}
        <ProjectFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewMode={viewMode}
          setViewMode={setViewMode}
          handleOpenCreate={() => setShowCreateModal(true)}
          t={t}
        />

        {viewMode === "table" ? (
          <ProjectTable
            filteredProjects={filteredProjects}
            t={t}
            sortByPriority={sortByPriority}
            setSortByPriority={setSortByPriority}
            handleViewDetails={handleViewDetails}
            handleOpenEdit={handleOpenEdit}
            handleOpenDelete={handleOpenDelete}
          />
        ) : (
          /* Grid Card View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  t={t}
                  handleViewDetails={handleViewDetails}
                  handleOpenEdit={handleOpenEdit}
                  handleOpenDelete={handleOpenDelete}
                />
              ))
            ) : (
              <div className="col-span-full">
                <div className="glass-panel rounded-3xl p-12 text-center border border-white/10">
                  <div className="text-4xl mb-3">📂</div>
                  <p className="text-sm font-semibold text-slate-400">
                    {t("noProjectsFound")}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* CREATE MODAL */}
      <CreateProjectModal
        showCreateModal={showCreateModal}
        setShowCreateModal={setShowCreateModal}
        handleCreateSubmit={handleCreateSubmit}
        formData={formData}
        setFormData={setFormData}
        teamLeaders={teamLeaders}
        t={t}
      />

      {/* EDIT MODAL */}
      <EditProjectModal
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        handleEditSubmit={handleEditSubmit}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
        teamLeaders={teamLeaders}
        t={t}
      />

      {/* DETAIL MODAL */}
      <ProjectDetailModal
        showDetailModal={showDetailModal}
        setShowDetailModal={setShowDetailModal}
        selectedProject={selectedProject}
        setSelectedTask={setSelectedTask}
        setTempStatus={setTempStatus}
        setShowViewTaskModal={setShowViewTaskModal}
        setShowAddTaskModal={setShowAddTaskModal}
        t={t}
      />

      {/* DELETE CONFIRM MODAL */}
      <ConfirmModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        title={t("deleteProjectConfirmTitle")}
        description={
          selectedProject && (
            <>
              {t("deleteProjectConfirmDesc1")}
              <strong>"{selectedProject.name}"</strong>
              {t("deleteProjectConfirmDesc2")}
            </>
          )
        }
        onConfirm={handleDeleteConfirm}
        confirmText={t("confirmDeleteBtn")}
        cancelText={t("cancelBtn")}
        type="danger"
      />

      {/* ADD TASK MODAL */}
      <AddTaskModal
        showAddTaskModal={showAddTaskModal}
        setShowAddTaskModal={setShowAddTaskModal}
        selectedProject={selectedProject}
        taskFormData={taskFormData}
        setTaskFormData={setTaskFormData}
        users={users}
        handleAddTaskSubmit={handleAddTaskSubmit}
        t={t}
      />

      {/* VIEW TASK DETAIL MODAL */}
      <ViewTaskModal
        showViewTaskModal={showViewTaskModal}
        setShowViewTaskModal={setShowViewTaskModal}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        selectedTask={selectedTask}
        tempStatus={tempStatus}
        setTempStatus={setTempStatus}
        currentUser={currentUser}
        setSuccessMessage={setSuccessMessage}
        setErrorMessage={setErrorMessage}
        fetchProjects={fetchProjects}
        t={t}
      />

      <Footer />
    </div>
  );
};

export default ManageProjectPage;
