import React, { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

const translations = {
  en: {
    // Header & Navigation
    home: "Home",
    dashboard: "Dashboard",
    manageUsers: "Manage Users",
    projects: "Projects",
    allTasks: "All Tasks",
    reports: "Reports",
    profile: "Profile",
    myTask: "My Task",
    signOut: "Sign Out",
    login: "Login",
    loading: "Loading...",

    // Login Page
    loginTitle: "Login",
    emailLabel: "Email",
    passwordLabel: "Password",
    emailPlaceholder: "Enter Your Email",
    passwordPlaceholder: "Enter Your Password",
    fillAllFields: "Please Fill In All Fields",
    loginSuccess: "Login Successful! Redirecting...",
    loginFailed: "Login Failed. Please Try Again.",
    forgotPasswordLink: "Forgot Password?",
    resetPasswordTitle: "Reset Password",
    newPasswordLabel: "New Password",
    confirmPasswordLabel: "Confirm New Password",
    resetSuccess: "Password reset successfully! Redirecting to login...",
    passwordsMismatch: "Passwords do not match!",
    otpCodeLabel: "OTP",
    otpCodePlaceholder: "6-digit OTP code",
    sendOtpBtn: "Send OTP",

    // Home Page
    homeMessage: "Home For Unregistered Users",

    // Dashboard Page
    dashboardTitle: "Dashboard",
    allUsers: "All Users",
    manageUsersLink: "Manage Users →",
    allProjects: "All Projects",
    viewProjectsLink: "View Projects →",
    totalTasks: "Total Tasks",
    completedPrefix: "Completed: ",
    overdueTasks: "Overdue Tasks",
    actionRequired: "Action Required",
    taskStatus: "Task Status",
    pending: "Pending",
    inProgress: "In Progress",
    reviewing: "Reviewing",
    completed: "Completed",
    recentActivity: "Recent Activity",
    systemAdmin: "System Admin",
    loggedIn: "Logged In",
    minuteAgo: "1 Minute Ago",
    viewAll: "View All",

    // Dashboard Cards
    "-> Manage-Users": "→ Manage Users",
    "-> Projects": "→ Projects",
    "-> Reports": "→ Reports",

    // ManageUsers Page
    manageUsersTitle: "Manage Users",
    addUserBtn: "Add User",
    roleFilterAll: "All Roles",
    statusFilterAll: "All Statuses",
    activeLabel: "Active",
    suspendedLabel: "Suspended",
    searchPlaceholder: "Search by Name or Email...",
    searchBtn: "Search",
    showText: "Show",
    entriesPerPageText: "Entries",
    searchText: "Search:",
    colUser: "User",
    colEmail: "Email",
    colRole: "Role",
    colStatus: "Status",
    colLastLogin: "Last Login",
    colManage: "Manage",
    noUsersText: "No Users Found",
    showingText: "Showing",
    toText: "to",
    ofText: "of",
    entriesText: "Entries",
    prevText: "Previous",
    nextText: "Next",
    importUsersBtn: "Import Users",
    downloadTemplateBtn: "Download Template",
    importSuccess: "Users imported/updated successfully!",
    importFailed: "Import failed!",
    importConfirmTitle: "Confirm User Import",
    importConfirmDesc:
      "Are you sure you want to import users from {filename}? ({count} users found)",
    importResultTitle: "Import Completed",
    importResultDesc:
      "Successfully imported {imported} new users and updated {updated} existing users.",
    exportUsersBtn: "Export Users",

    // ManageUsers Modal
    addEditUserTitle: "Add / Edit User",
    editUserTitle: "Edit User Info",
    addUserTitle: "Add New User",
    backBtn: "← Back",
    modalEmailLabel: "Email",
    modalPasswordLabel: "Password",
    modalPasswordPlaceholder: "Set Password",
    modalPasswordEditPlaceholder: "Leave Blank to Keep Current",
    modalFirstNameLabel: "First Name",
    modalLastNameLabel: "Last Name",
    modalPhoneLabel: "Phone Number",
    modalAvatarLabel: "Profile Picture",
    modalChoosePhoto: "📷 Choose Photo",
    modalRemovePhoto: "Remove Photo",
    modalRoleLabel: "Role",
    modalActiveLabel: "Active",
    modalCancelBtn: "Cancel",
    modalSaveBtn: "✓ Save Changes",
    modalCreateBtn: "✓ Create User",
    uploadPhotoBtn: "Upload Photo",
    modalStatusLabel: "Status",
    youBadge: "You",

    // ManageUsers messages
    fillRequiredFields: "Please Fill In All Required (*) Fields",
    userUpdatedSuccess: "User Updated Successfully!",
    userCreatedSuccess: "New User Account Created Successfully!",
    userAddFailed: "Unable to Add User",
    userUpdateFailed: "Unable to Update User",
    suspendConfirm: "Do You Want to Suspend User",
    activateConfirm: "Do You Want to Reactivate User",
    confirmSuffix: "?",
    statusChangeFailed: "Unable to Change User Status",
    deleteConfirm: "Are You Sure You Want to Permanently Delete User",
    deleteSuffix: "from the System?",
    deleteFailed: "Unable to Delete User",

    // Projects Page
    projectManagementTitle: "Project Management",
    projectFlowSubtitle: "Project management structure according to Flowchart",
    searchProjectPlaceholder: "Search projects by name...",
    createProjectBtn: "+ Create New Project",
    projectListTitle: "Project List",
    colProjectName: "Project Name",
    colProgress: "Progress",
    colPriority: "Priority",
    colTeamLeader: "Team Leader",
    colDetailAction: "Detail / Action",
    viewBtn: "View",
    editBtn: "Edit",
    deleteBtn: "Delete",
    noProjectsFound: "No projects found",
    tableView: "Table View",
    boardView: "Board View",
    statusPending: "Pending",
    statusInProgress: "In Progress",
    statusReview: "Reviewing",
    statusCompleted: "Completed",
    endDateLabel: "End Date",
    deleteProjectConfirmTitle: "Confirm Project Deletion?",
    deleteUserConfirmTitle: "Confirm User Deletion?",
    deleteProjectConfirmDesc1: "The system will delete the project ",
    deleteProjectConfirmDesc2:
      " and perform a Cascade Delete on all related data (Tasks, Comments, Files).",
    cancelBtn: "Cancel",
    confirmDeleteBtn: "💥 Confirm Delete",
    confirmBtn: "Confirm",
    sortByPriorityLabel: "Sort Priority",
    sessionTimeoutTitle: "Session Expiration Warning",
    sessionTimeoutDesc:
      "Your login session is about to expire in {seconds} seconds. Would you like to continue using the web or exit?",
    sessionTimeoutStayBtn: "Stay / Use Web",
    sessionTimeoutExitBtn: "Exit / Logout",

    // Activity Page
    activityLogsTitle: "System Activity Logs",
    activityLogsSubtitle: "Monitor and track all system transaction logs",
    searchActivityPlaceholder: "Search username or details...",
    allActivities: "All Activities",
    aboutProjects: "About Projects",
    aboutUsers: "About Users",
    aboutSystem: "About System / Others",
    refreshBtn: "Refresh",
    loadingActivities: "Loading activity logs...",
    noActivitiesFound: "No activity logs found matching the filters",
    colAction: "Action",
    colDetails: "Details",
    colDoneBy: "Done By:",
  },

  th: {
    // Header & Navigation
    home: "หน้าแรก",
    dashboard: "แดชบอร์ด",
    manageUsers: "จัดการผู้ใช้งาน",
    projects: "โปรเจกต์",
    allTasks: "งานทั้งหมด",
    reports: "รายงาน",
    profile: "โปรไฟล์",
    myTask: "งานของฉัน",
    signOut: "ออกจากระบบ",
    login: "เข้าสู่ระบบ",
    loading: "กำลังโหลด...",

    // Login Page
    loginTitle: "เข้าสู่ระบบ",
    emailLabel: "อีเมล",
    passwordLabel: "รหัสผ่าน",
    emailPlaceholder: "ป้อนอีเมลของคุณ",
    passwordPlaceholder: "ป้อนรหัสผ่านของคุณ",
    fillAllFields: "กรุณากรอกข้อมูลให้ครบทุกช่อง",
    loginSuccess: "เข้าสู่ระบบสำเร็จ! กำลังนำทางไปยังหน้าแรก...",
    loginFailed: "การเข้าสู่ระบบล้มเหลว โปรดลองอีกครั้ง",
    forgotPasswordLink: "ลืมรหัสผ่าน?",
    resetPasswordTitle: "รีเซ็ตรหัสผ่าน",
    newPasswordLabel: "รหัสผ่านใหม่",
    confirmPasswordLabel: "ยืนยันรหัสผ่านใหม่",
    resetSuccess: "รีเซ็ตรหัสผ่านสำเร็จ! กำลังนำทางไปยังหน้าล็อกอิน...",
    passwordsMismatch: "รหัสผ่านไม่ตรงกัน!",
    otpCodeLabel: "รหัส OTP",
    otpCodePlaceholder: "กรอกรหัส OTP 6 หลัก",
    sendOtpBtn: "ส่งรหัส OTP",

    // Home Page
    homeMessage: "หน้าแรกสำหรับผู้ใช้ทั่วไป",

    // Dashboard Page
    dashboardTitle: "แดชบอร์ด",
    allUsers: "ผู้ใช้ทั้งหมด",
    manageUsersLink: "จัดการผู้ใช้ →",
    allProjects: "โปรเจคทั้งหมด",
    viewProjectsLink: "ดูโปรเจค →",
    totalTasks: "งานทั้งหมด",
    completedPrefix: "เสร็จแล้ว: ",
    overdueTasks: "งานเกินกำหนด",
    actionRequired: "ต้องดำเนินการด่วน",
    taskStatus: "สถานะงาน",
    pending: "รอดำเนินการ",
    inProgress: "กำลังทำ",
    reviewing: "รอตรวจสอบ",
    completed: "เสร็จแล้ว",
    recentActivity: "กิจกรรมล่าสุด",
    systemAdmin: "ผู้ดูแลระบบ",
    loggedIn: "เข้าสู่ระบบ",
    minuteAgo: "1 นาทีที่แล้ว",
    viewAll: "ดูทั้งหมด",

    // Dashboard Cards
    "-> Manage-Users": "→ จัดการผู้ใช้งาน",
    "-> Projects": "→ โปรเจกต์",
    "-> Reports": "→ รายงาน",

    // ManageUsers Page
    manageUsersTitle: "จัดการผู้ใช้งาน",
    addUserBtn: "เพิ่มผู้ใช้",
    roleFilterAll: "ทุกบทบาท",
    statusFilterAll: "ทุกสถานะ",
    activeLabel: "ใช้งานอยู่",
    suspendedLabel: "ถูกพักใช้งาน",
    searchPlaceholder: "ค้นหาด้วยชื่อหรืออีเมล...",
    searchBtn: "ค้นหา",
    showText: "แสดง",
    entriesPerPageText: "รายการ",
    searchText: "ค้นหา:",
    colUser: "ผู้ใช้",
    colEmail: "อีเมล",
    colRole: "บทบาท",
    colStatus: "สถานะ",
    colLastLogin: "เข้าใช้งานล่าสุด",
    colManage: "จัดการ",
    noUsersText: "ไม่พบผู้ใช้งาน",
    showingText: "แสดง",
    toText: "ถึง",
    ofText: "จาก",
    entriesText: "รายการ",
    prevText: "ก่อนหน้า",
    nextText: "ถัดไป",
    importUsersBtn: "นำเข้าผู้ใช้งาน",
    downloadTemplateBtn: "ดาวน์โหลดไฟล์ตัวอย่าง",
    importSuccess: "นำเข้า/อัปเดตข้อมูลผู้ใช้งานเรียบร้อยแล้ว!",
    importFailed: "การนำเข้าข้อมูลล้มเหลว!",
    importConfirmTitle: "ยืนยันการนำเข้าผู้ใช้งาน",
    importConfirmDesc:
      "คุณแน่ใจหรือไม่ว่าต้องการนำเข้าผู้ใช้งานจากไฟล์ {filename}? (พบข้อมูลทั้งหมด {count} รายการ)",
    importResultTitle: "นำเข้าข้อมูลเสร็จสิ้น",
    importResultDesc:
      "นำเข้าผู้ใช้งานใหม่สำเร็จ {imported} คน และอัปเดตผู้ใช้งานเดิม {updated} คน",
    exportUsersBtn: "ส่งออกผู้ใช้งาน",

    // ManageUsers Modal
    addEditUserTitle: "เพิ่ม / แก้ไขผู้ใช้",
    editUserTitle: "แก้ไขข้อมูลผู้ใช้",
    addUserTitle: "เพิ่มผู้ใช้ใหม่",
    backBtn: "← กลับ",
    modalEmailLabel: "อีเมล",
    modalPasswordLabel: "รหัสผ่าน",
    modalPasswordPlaceholder: "ตั้งรหัสผ่าน",
    modalPasswordEditPlaceholder: "เว้นว่างไว้หากไม่ต้องการเปลี่ยน",
    modalFirstNameLabel: "ชื่อ",
    modalLastNameLabel: "นามสกุล",
    modalPhoneLabel: "เบอร์โทรศัพท์",
    modalAvatarLabel: "รูปโปรไฟล์",
    modalChoosePhoto: "📷 เลือกรูป",
    modalRemovePhoto: "ลบรูป",
    modalRoleLabel: "บทบาท",
    modalActiveLabel: "ใช้งานอยู่",
    modalCancelBtn: "ยกเลิก",
    modalSaveBtn: "✓ บันทึกการแก้ไข",
    modalCreateBtn: "✓ สร้างผู้ใช้",
    uploadPhotoBtn: "อัปเดตภาพ",
    modalStatusLabel: "สถานะ",
    youBadge: "คุณ",

    // ManageUsers messages
    fillRequiredFields: "กรุณากรอกข้อมูลดาว (*) ให้ครบถ้วน",
    userUpdatedSuccess: "อัปเดตข้อมูลผู้ใช้เรียบร้อยแล้ว!",
    userCreatedSuccess: "สร้างบัญชีผู้ใช้ใหม่เรียบร้อยแล้ว!",
    userAddFailed: "ไม่สามารถเพิ่มผู้ใช้งานได้",
    userUpdateFailed: "ไม่สามารถแก้ไขข้อมูลผู้ใช้งานได้",
    suspendConfirm: "คุณต้องการพักใช้งานผู้ใช้",
    activateConfirm: "คุณต้องการเปิดใช้งานผู้ใช้",
    confirmSuffix: "ใช่หรือไม่?",
    statusChangeFailed: "ไม่สามารถเปลี่ยนสถานะผู้ใช้ได้",
    deleteConfirm: "คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้",
    deleteSuffix: "ออกจากระบบอย่างถาวร?",
    deleteFailed: "ไม่สามารถลบผู้ใช้ได้",

    // Projects Page
    projectManagementTitle: "จัดการโปรเจกต์",
    projectFlowSubtitle: "หน้าจัดการโปรเจกต์ตาม Flowchart",
    searchProjectPlaceholder: "ค้นหาโปรเจกต์ด้วยชื่อ...",
    createProjectBtn: "+ สร้างโปรเจกต์ใหม่",
    projectListTitle: "รายการโปรเจกต์",
    colProjectName: "ชื่อโปรเจกต์",
    colProgress: "ความคืบหน้า",
    colPriority: "ระดับความสำคัญ",
    colTeamLeader: "หัวหน้าทีม",
    colDetailAction: "รายละเอียด / การจัดการ",
    viewBtn: "ดูรายละเอียด",
    editBtn: "แก้ไข",
    deleteBtn: "ลบ",
    noProjectsFound: "ไม่พบข้อมูลโปรเจกต์",
    tableView: "แสดงแบบตาราง",
    boardView: "แสดงแบบบอร์ด",
    statusPending: "รอดำเนินการ",
    statusInProgress: "กำลังดำเนินการ",
    statusReview: "รอตรวจสอบ",
    statusCompleted: "เสร็จสิ้น",
    deleteUserConfirmTitle: "ยืนยันการลบผู้ใช้?",
    endDateLabel: "วันสิ้นสุด",
    deleteProjectConfirmTitle: "ยืนยันการลบโปรเจกต์?",
    deleteProjectConfirmDesc1: "ระบบจะทำการลบข้อมูลโปรเจกต์ ",
    deleteProjectConfirmDesc2:
      " และทำการ Cascade Delete ข้อมูลที่เกี่ยวโยงทั้งหมด (Tasks, Comments, Files)",
    cancelBtn: "ยกเลิก",
    confirmDeleteBtn: "💥 ยืนยันการลบ",
    confirmBtn: "ยืนยัน",
    sortByPriorityLabel: "เรียงตามความสำคัญ",
    sessionTimeoutTitle: "การแจ้งเตือนเซสชันหมดอายุ",
    sessionTimeoutDesc:
      "เซสชันการเข้าใช้งานของคุณจะหมดอายุในอีก {seconds} วินาที คุณต้องการใช้เว็บไซต์ต่อหรือจะออกจากระบบ?",
    sessionTimeoutStayBtn: "อยู่ต่อ / ใช้เว็บต่อ",
    sessionTimeoutExitBtn: "ออกจากระบบ",

    // Activity Page
    activityLogsTitle: "System Activity Logs",
    activityLogsSubtitle:
      "ตรวจสอบและติดตามประวัติการทำรายการกิจกรรมทั้งหมดของระบบ",
    searchActivityPlaceholder: "ค้นหาชื่อผู้ใช้หรือรายละเอียด...",
    allActivities: "กิจกรรมทั้งหมด",
    aboutProjects: "เกี่ยวกับโปรเจกต์",
    aboutUsers: "เกี่ยวกับผู้ใช้งาน",
    aboutSystem: "เกี่ยวกับระบบ / อื่น ๆ",
    refreshBtn: "รีเฟรชข้อมูล",
    loadingActivities: "กำลังโหลดบันทึกกิจกรรม...",
    noActivitiesFound: "ไม่พบบันทึกกิจกรรมตามเงื่อนไขที่เลือก",
    colAction: "Action",
    colDetails: "Details",
    colDoneBy: "ทำรายการโดย:",
  },
};

/**
 * ผู้ให้บริการเปลี่ยนภาษาของระบบ (LanguageProvider Component)
 * - กำหนดสถานะภาษาเริ่มต้น (ค่าเริ่มต้นคือ ภาษาไทย 'th' ดึงจาก localStorage)
 * - บันทึกการเปลี่ยนแปลงค่าภาษาลงใน localStorage เมื่อค่าภาษาเปลี่ยน
 */
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("language") || "th";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  /**
   * ฟังก์ชันสำหรับสลับภาษาระหว่างภาษาไทย (th) และภาษาอังกฤษ (en)
   */
  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "th" : "en"));
  };

  /**
   * ฟังก์ชันแปลคำศัพท์ตาม Key ที่กำหนด
   * @param {string} key - คีย์เวิร์ดคำศัพท์
   * @returns {string} คำที่แปลแล้ว (หากไม่มีในพจนานุกรม จะคืนค่า key กลับไป)
   */
  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, toggleLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

/**
 * Custom Hook สำหรับเรียกใช้งานข้อมูลภาษาและการแปลคำศัพท์ในคอมโพเนนต์อื่น ๆ
 * @returns {{language: string, setLanguage: Function, toggleLanguage: Function, t: Function}}
 */
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
