import React from "react";
import { Modal } from "react-bootstrap";

const CreateProjectModal = ({
  showCreateModal,
  setShowCreateModal,
  handleCreateSubmit,
  formData,
  setFormData,
  teamLeaders,
  t,
}) => {
  return (
    <Modal
      show={showCreateModal}
      onHide={() => setShowCreateModal(false)}
      centered
    >
      <Modal.Body className="p-4" style={{ borderRadius: "1rem" }}>
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
          <h5 className="fw-bold mb-0">🆕 {t("createProjectTitle")}</h5>
          <button
            className="btn-close"
            onClick={() => setShowCreateModal(false)}
          ></button>
        </div>
        <form onSubmit={handleCreateSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-bold">
              {t("modalProjectTitle")} *
            </label>
            <input
              type="text"
              className="form-control rounded-lg"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-bold">
              {t("modalProjectPriority")}
            </label>
            <select
              className="form-select rounded-lg"
              value={formData.priority}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, priority: e.target.value }))
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
              value={formData.endDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, endDate: e.target.value }))
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
              value={formData.teamLeaderId}
              onChange={(e) =>
                setFormData((prev) => ({
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
              onClick={() => setShowCreateModal(false)}
            >
              {t("cancelBtn")}
            </button>
            <button
              type="submit"
              className="btn btn-primary px-4 py-2 rounded-lg"
            >
              🚀 {t("createProjectBtnSubmit")}
            </button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default CreateProjectModal;
