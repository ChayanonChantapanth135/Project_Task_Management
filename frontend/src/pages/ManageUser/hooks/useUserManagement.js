import { useState, useEffect } from "react";
import axios from "axios";
// นำเข้า API_URL สำหรับใช้ต่อคำนำหน้าของรูปภาพโปรไฟล์ (Avatar) แบบไดนามิก
import { API_URL } from "../../../config";

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
  const [pageSuccessMessage, setPageSuccessMessage] = useState("");

  // Delete & Status confirm modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedUserForStatus, setSelectedUserForStatus] = useState(null);

  // Import users modals state
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [importUsersList, setImportUsersList] = useState([]);
  const [importFileName, setImportFileName] = useState("");
  const [showImportResult, setShowImportResult] = useState(false);
  const [importResultDetails, setImportResultDetails] = useState({ imported: 0, updated: 0 });

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/auth/users");
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
          phone: u.phone || "-",
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

  // Reset page to 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter, statusFilter, searchQuery]);

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
      phone: user.phone && user.phone !== "-" ? user.phone : "",
      role: dbRole,
      isActive: user.status === "active",
    });
    setAvatarFile(null);
    setAvatarPreview(user.avatar ? (user.avatar.startsWith("http") ? user.avatar : `${API_URL}${user.avatar}`) : null);
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
    data.append("phone", formData.phone || "");
    data.append("role", formData.role);
    data.append("status", formData.isActive ? "active" : "suspended");
    if (avatarFile) {
      data.append("avatar", avatarFile);
    }
    data.append("creatorId", currentUser?.id || "");

    try {
      if (isEditMode) {
        await axios.put(`/auth/users/${selectedUserId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setModalSuccess(t("userUpdatedSuccess") || "บันทึกการแก้ไขเรียบร้อยแล้ว!");
      } else {
        await axios.post("/auth/users", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setModalSuccess(t("userCreatedSuccess") || "สร้างบัญชีผู้ใช้ใหม่เรียบร้อยแล้ว!");
      }
      setTimeout(() => {
        setShowAddModal(false);
        fetchUsers();
      }, 1500);
    } catch (err) {
      setModalError(err.response?.data?.message || (isEditMode ? t("userUpdateFailed") : t("userAddFailed")));
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
      await axios.put(`/auth/users/${selectedUserForStatus.id}`, {
        username: selectedUserForStatus.name,
        email: selectedUserForStatus.email,
        role: selectedUserForStatus.role,
        status: nextStatus,
        creatorId: currentUser?.id || "",
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
      await axios.delete(`/auth/users/${selectedUserForDelete.id}`, {
        params: { creatorId: currentUser?.id || "" }
      });
      fetchUsers();
      setShowDeleteModal(false);
      setPageSuccessMessage(t("deleteUserSuccess") || "Delete Success");
      setTimeout(() => setPageSuccessMessage(""), 4000);
    } catch (err) {
      alert(t("deleteFailed") || "การลบข้อมูลล้มเหลว กรุณาลองใหม่อีกครั้ง");
    }
  };

  // ฟังก์ชันอ่านและตรวจสอบไฟล์ CSV ก่อนนำเข้า
  const handleImportCSV = async (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const lines = text.split(/\r?\n/);
      if (lines.length <= 1) {
        alert(t("importFailed") + " (Empty file)");
        return;
      }

      // ดึงรายชื่อ Header คอลัมน์จากแถวแรกสุด
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const parsedUsers = [];

      // วนลูปอ่านข้อมูลผู้ใช้แต่ละแถว
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const columns = line.split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
        if (columns.length < headers.length) continue;

        const userObj = {};
        headers.forEach((header, idx) => {
          userObj[header] = columns[idx] || "";
        });
        parsedUsers.push(userObj);
      }

      if (parsedUsers.length === 0) {
        alert(t("importFailed") + " (No valid rows)");
        return;
      }

      // เก็บข้อมูลที่ประมวลผลได้ลง State และเปิดป๊อปอัปยืนยันการนำเข้า
      setImportUsersList(parsedUsers);
      setImportFileName(file.name);
      setShowImportConfirm(true);
    };
    reader.readAsText(file);
  };

  // ฟังก์ชันกดยืนยันการนำเข้าและส่งข้อมูลไปยังหลังบ้านเพื่อบันทึก
  const handleImportConfirm = async () => {
    try {
      setLoading(true);
      setShowImportConfirm(false);
      const response = await axios.post("/auth/users/import", {
        users: importUsersList,
        userId: currentUser?.id,
      });
      // จัดเก็บข้อมูลสถิติจำนวนที่สร้างใหม่และอัปเดตเพื่อนำไปรายงานผล
      setImportResultDetails({
        imported: response.data.imported || 0,
        updated: response.data.updated || 0,
      });
      setShowImportResult(true); // เปิดป๊อปอัปรายงานผลสำเร็จ
      await fetchUsers(); // โหลดตารางผู้ใช้ใหม่
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || t("importFailed"));
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันส่งออกรายชื่อผู้ใช้ทั้งหมดเป็นไฟล์ CSV
  const handleExportCSV = () => {
    if (users.length === 0) {
      alert("No users to export");
      return;
    }

    // ส่วนหัวของไฟล์ CSV ตามรูปแบบตัวอย่าง
    const csvHeaders = "username,email,role,status\n";
    const csvRows = users.map(u => {
      // แปลงชื่อบทบาทการแสดงผลกลับเป็นรหัสบทบาทตัวพิมพ์เล็กสำหรับเก็บข้อมูล
      let rawRole = "user";
      if (u.role === "Admin") rawRole = "admin";
      else if (u.role === "Project Manager") rawRole = "manager";
      else if (u.role === "Team Leader") rawRole = "team_leader";
      else if (u.role === "Video Editor") rawRole = "video_editor";
      else if (u.role === "Translator") rawRole = "translator";

      const name = `"${(u.name || '').replace(/"/g, '""')}"`;
      const email = `"${(u.email || '').replace(/"/g, '""')}"`;
      const role = `"${rawRole}"`;
      const status = `"${u.status || 'active'}"`;
      
      return `${name},${email},${role},${status}`;
    }).join("\n");

    // ใส่ BOM เพื่อให้เปิดโปรแกรม Microsoft Excel แล้วอักษรไทยไม่เพี้ยน
    const csvContent = "\uFEFF" + csvHeaders + csvRows;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `users_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Users computation
  const filteredUsers = users.filter((user) => {
    const matchesRole = roleFilter === "all" || user.role.toLowerCase() === roleFilter.toLowerCase();
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
    pageSuccessMessage,
    setPageSuccessMessage,
    showDeleteModal,
    setShowDeleteModal,
    selectedUserForDelete,
    showStatusModal,
    setShowStatusModal,
    selectedUserForStatus,
    showImportConfirm,
    setShowImportConfirm,
    importFileName,
    importUsersList,
    showImportResult,
    setShowImportResult,
    importResultDetails,
    handleInputChange,
    handleAvatarChange,
    handleOpenAdd,
    handleOpenEdit,
    handleCreateOrUpdateUser,
    handleToggleStatus,
    handleStatusConfirm,
    handleDeleteUser,
    handleDeleteConfirm,
    handleImportCSV,
    handleImportConfirm,
    handleExportCSV,
    filteredUsers,
  };
};
