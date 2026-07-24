import React, { useState, useEffect, useRef } from "react";

const roleLabels = {
  team_leader: "👑 Team Leader",
  translator: "🗣️ Translator",
  video_editor: "🎬 Video Editor",
  manager: "💼 Project Manager",
  admin: "🔑 Admin",
};

export default function SearchableUserSelect({
  users = [],
  value = "",
  onChange,
  placeholder = "-- Select Assignee --",
  allowedRoles = null,
  required = false,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Reset search query when dropdown opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

  // Find currently selected user
  const selectedUser = users.find((u) => String(u.id) === String(value));

  // Filter and group users
  const filteredUsers = users.filter((u) => {
    // Check role filter
    if (allowedRoles) {
      if (!allowedRoles.includes(u.role)) return false;
    } else {
      // Default: exclude standard 'user' role
      if (u.role === "user") return false;
    }

    // Check search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const usernameMatch =
        u.username && u.username.toLowerCase().includes(query);
      const roleMatch = u.role && u.role.toLowerCase().includes(query);
      const roleLabelMatch =
        u.role &&
        roleLabels[u.role] &&
        roleLabels[u.role].toLowerCase().includes(query);
      return usernameMatch || roleMatch || roleLabelMatch;
    }

    return true;
  });

  // Group by role
  const grouped = filteredUsers.reduce((acc, u) => {
    const role = u.role || "user";
    if (!acc[role]) acc[role] = [];
    acc[role].push(u);
    return acc;
  }, {});

  const handleSelect = (userId) => {
    onChange({ target: { name: "assignedTo", value: userId } });
    setIsOpen(false);
  };

  return (
    <div className={`position-relative ${className}`} ref={containerRef}>
      {/* Hidden input to satisfy HTML5 validation if required */}
      {required && (
        <input
          type="text"
          value={value || ""}
          required
          tabIndex={-1}
          style={{
            position: "absolute",
            opacity: 0,
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            pointerEvents: "none",
          }}
          readOnly
        />
      )}

      {/* Dropdown Button */}
      <div
        className="form-select rounded-lg text-sm py-2 d-flex align-items-center justify-content-between"
        style={{ cursor: "pointer", minHeight: "38px" }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedUser ? "text-dark" : "text-muted"}>
          {selectedUser ? selectedUser.username : placeholder}
        </span>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="position-absolute w-100 bg-white border rounded shadow-sm mt-1"
          style={{
            zIndex: 1050,
            maxHeight: "300px",
            overflowY: "auto",
          }}
        >
          {/* Search Box */}
          <div className="p-2 border-bottom sticky-top bg-white">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="🔍 Search username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Options */}
          <div className="py-1">
            {/* Unassigned / Clear option */}
            <div
              className={`py-2 px-3 text-sm text-danger cursor-pointer hover:bg-slate-100 ${
                !value ? "bg-slate-50 fw-bold" : ""
              }`}
              style={{ cursor: "pointer" }}
              onClick={() => handleSelect("")}
            >
              -- Clear / Unassigned --
            </div>

            {Object.keys(grouped).length === 0 ? (
              <div className="text-muted text-center py-3 text-sm">
                No users found
              </div>
            ) : (
              Object.entries(grouped).map(([role, list]) => (
                <div key={role}>
                  <div
                    className="bg-light px-3 py-1 text-xs fw-bold text-secondary text-uppercase border-top border-bottom"
                    style={{ fontSize: "0.75rem", color: "#6c757d" }}
                  >
                    {roleLabels[role] || role}
                  </div>
                  {list.map((u) => {
                    const isSelected = String(u.id) === String(value);
                    return (
                      <div
                        key={u.id}
                        className={`py-2 px-3 text-sm cursor-pointer hover:bg-slate-100 ${
                          isSelected ? "bg-primary text-white hover:bg-primary-dark" : "text-slate-800"
                        }`}
                        style={{
                          cursor: "pointer",
                          color: isSelected ? "#ffffff" : "#212529",
                        }}
                        onClick={() => handleSelect(u.id)}
                      >
                        {u.username}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
