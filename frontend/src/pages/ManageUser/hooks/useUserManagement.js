import { useState, useEffect } from "react";
import axios from "axios";

export const useUserManagement = (t) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters and Pagination
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [globalSearch, setGlobalSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Add/Edit User states
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: "",
    isActive: true,
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");

  // Delete & Status confirm modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedUserForStatus, setSelectedUserForStatus] = useState(null);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:3000/auth/users");
      const mappedUsers = response.data.map((u) => {
        const name = u.username || "User";
        const initials =
          name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) || "U";

        let displayRole = "User";
        if (u.role === "admin") displayRole = "Admin";
        else if (u.role === "manager") displayRole = "Project Manager";
        else if (u.role === "team_leader") displayRole = "Team Leader";
        else if (u.role === "video_editor") displayRole = "Video Editor";
        else if (u.role === "translator") displayRole = "Translator";

        return {
          id: u.id,
          name: name,
          email: u.email,
          role: displayRole,
          status: u.status || "active",
          avatar: u.avatar || null,
          lastLogin: u.created_at
            ? new Date(u.created_at).toLocaleDateString()
            : "-",
          initials: initials,
        };
      });
      setUsers(mappedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setSelectedUserId(null);
    setFormData({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
      role: "user",
      isActive: true,
    });
    setAvatarFile(null);
    setAvatarPreview(null);
    setModalError("");
    setModalSuccess("");
    setShowAddModal(true);
  };

  const handleOpenEdit = (user) => {
    setIsEditMode(true);
    setSelectedUserId(user.id);
    const nameParts = user.name.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    let dbRole = "user";
    if (user.role === "Admin") dbRole = "admin";
    else if (user.role === "Project Manager") dbRole = "manager";
    else if (user.role === "Team Leader") dbRole = "team_leader";
    else if (user.role === "Video Editor") dbRole = "video_editor";
    else if (user.role === "Translator") dbRole = "translator";

    setFormData({
      email: user.email,
      password: "", // blank password means unchanged
      firstName: firstName,
      lastName: lastName,
      phone: "", // phone number mapping if exists
      role: dbRole,
      isActive: user.status === "active",
    });
    setAvatarFile(null);
    setAvatarPreview(user.avatar ? `http://127.0.0.1:3000${user.avatar}` : null);
    setModalError("");
    setModalSuccess("");
    setShowAddModal(true);
  };

  const handleCreateOrUpdateUser = async (e) => {
    e.preventDefault();
    setModalError("");
    setModalSuccess("");

    const data = new FormData();
    data.append("username", `${formData.firstName} ${formData.lastName}`.trim());
    data.append("email", formData.email);
    if (formData.password) {
      data.append("password", formData.password);
    }
    data.append("role", formData.role);
    data.append("status", formData.isActive ? "active" : "suspended");
    if (avatarFile) {
      data.append("avatar", avatarFile);
    }

    try {
      if (isEditMode) {
        await axios.put(`http://127.0.0.1:3000/auth/users/${selectedUserId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setModalSuccess(t("userUpdateSuccess") || "บันทึกการแก้ไขเรียบร้อยแล้ว!");
      } else {
        await axios.post("http://127.0.0.1:3000/auth/register", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setModalSuccess(t("userCreatedSuccess") || "สร้างบัญชีผู้ใช้ใหม่เรียบร้อยแล้ว!");
      }
      setTimeout(() => {
        setShowAddModal(false);
        fetchUsers();
      }, 1500);
    } catch (err) {
      setModalError(err.response?.data?.message || t("userAddFailed"));
    }
  };

  const handleToggleStatus = (user) => {
    setSelectedUserForStatus(user);
    setShowStatusModal(true);
  };

  const handleStatusConfirm = async () => {
    if (!selectedUserForStatus) return;
    const nextStatus = selectedUserForStatus.status === "active" ? "suspended" : "active";
    try {
      await axios.put(`http://127.0.0.1:3000/auth/users/${selectedUserForStatus.id}`, {
        username: selectedUserForStatus.name,
        email: selectedUserForStatus.email,
        role: selectedUserForStatus.role,
        status: nextStatus,
      });
      fetchUsers();
      setShowStatusModal(false);
    } catch (err) {
      alert(t("statusChangeFailed"));
    }
  };

  const handleDeleteUser = (user) => {
    setSelectedUserForDelete(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUserForDelete) return;
    try {
      await axios.delete(`http://127.0.0.1:3000/auth/users/${selectedUserForDelete.id}`);
      fetchUsers();
      setShowDeleteModal(false);
    } catch (err) {
      alert(t("deleteFailed"));
    }
  };

  // Filtered Users computation
  const filteredUsers = users.filter((user) => {
    const matchesRole = roleFilter === "all" || user.role.toLowerCase().replace(" ", "_") === roleFilter.toLowerCase();
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;

    const matchesTopSearch =
      searchQuery === "" ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGlobalSearch =
      globalSearch === "" ||
      user.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(globalSearch.toLowerCase());

    return matchesRole && matchesStatus && matchesTopSearch && matchesGlobalSearch;
  });

  return {
    currentUser,
    setCurrentUser,
    users,
    loading,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    globalSearch,
    setGlobalSearch,
    entriesPerPage,
    setEntriesPerPage,
    currentPage,
    setCurrentPage,
    showAddModal,
    setShowAddModal,
    isEditMode,
    formData,
    avatarPreview,
    modalError,
    modalSuccess,
    showDeleteModal,
    setShowDeleteModal,
    selectedUserForDelete,
    showStatusModal,
    setShowStatusModal,
    selectedUserForStatus,
    handleInputChange,
    handleAvatarChange,
    handleOpenAdd,
    handleOpenEdit,
    handleCreateOrUpdateUser,
    handleToggleStatus,
    handleStatusConfirm,
    handleDeleteUser,
    handleDeleteConfirm,
    filteredUsers,
  };
};
