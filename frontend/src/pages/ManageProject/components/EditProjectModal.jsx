import React from "react";
import { Modal } from "react-bootstrap";

const EditProjectModal = ({
  showEditModal,
  setShowEditModal,
  handleEditSubmit,
  editFormData,
  setEditFormData,
  teamLeaders,
  t,
}) => {
  return (
    <Modal
      show={showEditModal}
      onHide={() => setShowEditModal(false)}
      centered
    >
      <Modal.Body className="p-4" style={{ borderRadius: "1rem" }}>
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
          <h5 className="fw-bold mb-0">✏️ {t("editProjectTitle")}</h5>
          <button
            className="btn-close"
            onClick={() => setShowEditModal(false)}
          ></button>
        </div>
        <form onSubmit={handleEditSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-bold">
              {t("modalProjectTitle")} *
            </label>
            <input
              type="text"
              className="form-control rounded-lg"
              value={editFormData.name}
              onChange={(e) =>
                setEditFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-bold">
              {t("modalProjectStatus")}
            </label>
            <select
              className="form-select rounded-lg"
              value={editFormData.status}
              onChange={(e) =>
                setEditFormData((prev) => ({
                  ...prev,
                  status: e.target.value,
                }))
              }
            >
              <option value="pending">{t("pending")}</option>
              <option value="in_progress">{t("inProgress")}</option>
              <option value="review">{t("reviewing")}</option>
              <option value="completed">{t("completed")}</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label small fw-bold">
              {t("modalProjectPriority")}
            </label>
            <select
              className="form-select rounded-lg"
              value={editFormData.priority}
              onChange={(e) =>
                setEditFormData((prev) => ({
                  ...prev,
                  priority: e.target.value,
                }))
              }
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label small fw-bold">
              {t("modalProjectEndDate")} *
            </label>
            <input
              type="date"
              className="form-control rounded-lg"
              value={editFormData.endDate}
              onChange={(e) =>
                setEditFormData((prev) => ({
                  ...prev,
                  endDate: e.target.value,
                }))
              }
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-bold">
              {t("modalProjectTeamLeader")} *
            </label>
            <select
              className="form-select rounded-lg"
              value={editFormData.teamLeaderId}
              onChange={(e) =>
                setEditFormData((prev) => ({
                  ...prev,
                  teamLeaderId: e.target.value,
                }))
              }
              required
            >
              <option value="">-- {t("modalProjectTeamLeader")} --</option>
              {teamLeaders.map((leader) => (
                <option key={leader.id} value={leader.id}>
                  {leader.username}
                </option>
              ))}
            </select>
          </div>
          <div className="d-flex justify-content-end gap-2 pt-3 border-top mt-4">
            <button
              type="button"
              className="btn btn-secondary px-4 py-2 rounded-lg"
              onClick={() => setShowEditModal(false)}
            >
              {t("cancelBtn")}
            </button>
            <button
              type="submit"
              className="btn btn-primary px-4 py-2 rounded-lg"
            >
              💾 {t("modalSaveProject")}
            </button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default EditProjectModal;
