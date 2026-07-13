import React from "react";

const ProjectFilter = ({
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  handleOpenCreate,
  t
}) => {
  return (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mb-4">
      {/* Search Input */}
      <div className="position-relative w-100 w-md-50" style={{ maxWidth: "400px" }}>
        <span className="position-absolute top-50 start-0 translate-middle-y ps-3 text-muted">🔍</span>
        <input
          type="text"
          className="form-control rounded-lg ps-5"
          placeholder={t("searchProjectPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Toolbar Controls */}
      <div className="d-flex w-100 w-md-auto justify-content-end align-items-center gap-3">

        {/* View Switcher Segmented Control */}
        <div className="btn-group p-1 bg-light rounded-lg border">
          <button
            className={`btn btn-sm px-3 rounded-lg border-0 transition-all ${
              viewMode === "table" ? "bg-white shadow-xs fw-semibold text-dark" : "text-secondary"
            }`}
            style={{ fontSize: "0.85rem" }}
            onClick={() => setViewMode("table")}
          >
            📋 {t("tableView")}
          </button>
          <button
            className={`btn btn-sm px-3 rounded-lg border-0 transition-all ${
              viewMode === "board" ? "bg-white shadow-xs fw-semibold text-dark" : "text-secondary"
            }`}
            style={{ fontSize: "0.85rem" }}
            onClick={() => setViewMode("board")}
          >
            🗂️ {t("boardView")}
          </button>
        </div>

        {/* Create Button */}
        <button
          className="btn btn-primary d-flex align-items-center gap-2 px-3.5 py-2 text-sm rounded-lg shadow-sm"
          onClick={handleOpenCreate}
        >
          {t("createProjectBtn")}
        </button>
      </div>
    </div>
  );
};

export default ProjectFilter;
