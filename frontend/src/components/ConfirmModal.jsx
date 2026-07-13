import React from "react";
import { Modal } from "react-bootstrap";

const ConfirmModal = ({
  show,
  onHide,
  title,
  description,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger" // "danger", "warning", "info", "success"
}) => {
  // Map types to styles and emojis
  let emoji = "🚨";
  let titleColor = "text-danger";
  let confirmBtnClass = "btn-danger";

  if (type === "warning") {
    emoji = "⚠️";
    titleColor = "text-warning";
    confirmBtnClass = "btn-warning text-dark";
  } else if (type === "info") {
    emoji = "ℹ️";
    titleColor = "text-info";
    confirmBtnClass = "btn-info text-white";
  } else if (type === "success") {
    emoji = "✅";
    titleColor = "text-success";
    confirmBtnClass = "btn-success text-white";
  }

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Body className="p-4" style={{ borderRadius: "1rem" }}>
        <div className="text-center mb-4">
          <span className="fs-1">{emoji}</span>
          <h5 className={`fw-bold mt-2 ${titleColor}`}>
            {title}
          </h5>
          <div className="text-muted mt-1 small">
            {description}
          </div>
        </div>
        <div className="d-flex gap-2 justify-content-center">
          <button
            type="button"
            className="btn btn-light border px-4 py-2 rounded-lg w-50"
            onClick={onHide}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`btn ${confirmBtnClass} px-4 py-2 rounded-lg w-50`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ConfirmModal;
