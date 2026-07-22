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
    projectStatus: "Project Status",
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
    manageUsersBtn: "Manage Users",
    projectsTitle: "Projects",
    reportsTitle: "Reports",
    "Project Calendar Title": "Project Calendar",
    projectCalendarDesc: "Track project deadlines and statuses systematically",

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
    fillRequiredFieldsProject:
      "Please fill in all fields (Title, End Date, Team Leader)",
    projectCreatedSuccess:
      "New project created and notification sent to Team Leader successfully!",
    projectCreateFailed: "Unable to create project",
    projectUpdatedSuccess: "Project information updated successfully!",
    projectUpdateFailed: "Unable to update project",
    noPermissionDeleteProject: "No permission to delete project (Admin only)",
    projectDeletedSuccess: "Deleted project and all related data successfully!",
    projectDeleteFailed: "Unable to delete project",
    editProjectTitle: "Edit Project",
    modalProjectTitle: "Project Title",
    modalProjectStatus: "Status",
    modalProjectPriority: "Priority",
    modalProjectEndDate: "End Date",
    modalProjectTeamLeader: "Team Leader",
    modalSaveProject: "Save Changes",
    projectDetailsTitle: "Project Details",
    projectDetailsName: "Project Name",
    projectDetailsDueDate: "Due Date",
    projectDetailsLeader: "Team Leader",
    projectDetailsProgress: "Overall Progress",
    projectDetailsTaskList: "Project Tasks List",
    projectDetailsNoTasks: "No tasks in this project",
    projectDetailsClose: "Close Window",
    projectDetailsEdit: "Edit This Project",
    "Add Task": "Add Task",

    // Projects Page
    projectManagementTitle: "Project Management",
    projectFlowSubtitle: "Project management structure according to Flowchart",
    searchProjectPlaceholder: "Search projects by name...",
    createProjectBtn: "+ Create New Project",
    createProjectTitle: "Create New Project",
    createProjectBtnSubmit: "Create Project",
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
    CreateTask: "Create Task",
    "Create Task": "Create Task",

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
    colDoneBy: "Done By:",
    firstTimeResetTitle: "First Time Reset Password",
    firstTimeResetDesc:
      "Please change your password for safety before getting started",
    updatingPassword: "Updating...",
    saveNewPassword: "Save New Password",
    firstTimeResetSuccess:
      "Password updated successfully! Redirecting to dashboard...",
    firstTimeResetFailed: "Failed to reset password.",
    forceResetPrompt: "Please reset your password on first login",
    unassigned: "Unassigned",
    viewTaskDetail: "View Task Detail",
    Login: "Login",
    "Create New Project": "Created New Project",
    "Edit Project": "Edited Project",
    "Delete Project": "Deleted Project",
    "Create Task Success": "Created Task",
    "Update Task Status": "Updated Task Status",
    Logout: "Logout",
    "Reset Password": "Reset Password",
    "Reset Password First Time": "Reset Password First Time",
    "Import Users": "Imported Users",
    "Create User": "Created User",
    "Edit User": "Edited User Details",
    "Delete User": "Deleted User",
    "Suspend User": "Suspended User",
    "Activate User": "Activated User",
    taskDetailsTitle: "Task Details",
    taskProjectLabel: "Project",
    taskNameLabel: "Task Name",
    taskTypeLabel: "Task Type",
    taskDescLabel: "Description",
    taskPriorityLabel: "Priority",
    taskDueDateLabel: "Due Date",
    taskAssigneeLabel: "Assignee",
    noDescription: "-- No Description --",
    noAssignee: "-- Unassigned --",
    updateStatusBtn: "Update Status",
    taskStatusPending: "Pending",
    taskStatusInProgress: "In Progress",
    taskStatusReviewing: "Reviewing",
    taskStatusCompleted: "Completed",
    colDetails: "Details",
    colAction: "Action",
    colTime: "Date/Time",
    landingBadge:
      "🚀 Next-generation project and task management platform for teams",
    landingHeroTitle: "Manage projects and tasks in your team",
    landingHeroTitleAccent: "Easily, systematically, all-in-one place",
    landingHeroDesc:
      "Help your team work together smoothly, track deadlines via calendar, update task statuses in real-time, and systematically record activity logs.",
    goToDashboard: "Go to Dashboard 📊",
    getStartedBtn: "Get Started Free ✨",
    learnMoreBtn: "Learn More",
    statProductivity: "Increase productivity",
    statAlignment: "100% Team alignment",
    statMissedDeadlines: "Reduce missed deadlines",
    landingFeaturesTitle: "Key features to make your work seamless",
    landingFeaturesDesc:
      "Our system is carefully designed to answer every step of project and task management.",
    featureProjTitle: "Manage Projects",
    featureProjDesc:
      "Create main projects, assign Team Leaders, and track overall progress automatically.",
    featureTaskTitle: "Track Tasks",
    featureTaskDesc:
      "Control task status in detail: Pending, In Progress, Reviewing, or Completed.",
    featureCalTitle: "Project Calendar",
    featureCalDesc:
      "View due dates of all projects on an interactive calendar to prevent missing deadlines.",
    featureTeamTitle: "Activity Logs",
    featureTeamDesc:
      "Track chronological actions of everyone in the system transparently, knowing every update.",
    landingCtaTitle: "Ready to elevate your team's workflow?",
    landingCtaDesc:
      "Start organizing your projects systematically today, for free!",
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
    projectStatus: "สถานะโปรเจกต์",
    pending: "รอดำเนินการ",
    inProgress: "กำลังดำเนินการ",
    reviewing: "รอตรวจสอบ",
    completed: "เสร็จสิ้น",
    recentActivity: "กิจกรรมล่าสุด",
    systemAdmin: "ผู้ดูแลระบบ",
    loggedIn: "เข้าสู่ระบบ",
    minuteAgo: "1 นาทีที่แล้ว",
    viewAll: "ดูทั้งหมด",

    // Dashboard Cards
    manageUsersBtn: "จัดการผู้ใช้งาน",
    projectsTitle: "โปรเจกต์",
    reportsTitle: "รายงาน",
    "Project Calendar Title": "ปฏิทินกำหนดส่งงานโปรเจกต์",
    "Create New Project": "สร้างโปรเจกต์ใหม่",
    "Edit Project": "แก้ไขโปรเจกต์",
    "Create Task": "สร้างงานใหม่",
    "Edit Task": "แก้ไขงาน",
    projectCalendarDesc:
      "ติดตามกำหนดส่งงานและสถานะของแต่ละโครงการอย่างเป็นระบบ",

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
    fillRequiredFieldsProject:
      "กรุณากรอกข้อมูลให้ครบถ้วนทุกช่อง (Title, End Date, Team Leader)",
    projectCreatedSuccess:
      "สร้างโปรเจกต์ใหม่และส่งการแจ้งเตือนไปยัง Team Leader สำเร็จ!",
    projectCreateFailed: "ไม่สามารถสร้างโปรเจกต์ได้",
    projectUpdatedSuccess: "แก้ไขข้อมูลโปรเจกต์สำเร็จ!",
    projectUpdateFailed: "ไม่สามารถแก้ไขข้อมูลโปรเจกต์ได้",
    noPermissionDeleteProject: "ไม่มีสิทธิ์ลบโปรเจกต์ (เฉพาะ Admin เท่านั้น)",
    projectDeletedSuccess: "ลบโปรเจกต์พร้อมข้อมูลที่เกี่ยวข้องทั้งหมดสำเร็จ!",
    projectDeleteFailed: "ไม่สามารถลบโปรเจกต์ได้",
    editProjectTitle: "แก้ไขโปรเจกต์",
    modalProjectTitle: "หัวข้อโปรเจกต์ (Title)",
    modalProjectStatus: "สถานะ (Status)",
    modalProjectPriority: "ระดับความสำคัญ (Priority)",
    modalProjectEndDate: "วันที่สิ้นสุด (End Date)",
    modalProjectTeamLeader: "หัวหน้าทีม (Team Leader)",
    modalSaveProject: "บันทึกการแก้ไข",
    projectDetailsTitle: "รายละเอียดโปรเจกต์",
    projectDetailsName: "ชื่อโปรเจกต์",
    projectDetailsDueDate: "กำหนดส่ง",
    projectDetailsLeader: "หัวหน้าทีมผู้รับผิดชอบ",
    projectDetailsProgress: "ความคืบหน้าโดยรวม",
    projectDetailsTaskList: "รายการงานในโปรเจกต์",
    projectDetailsNoTasks: "ไม่มีงานที่ต้องทำในโปรเจกต์นี้",
    projectDetailsClose: "ปิดหน้าต่าง",
    projectDetailsEdit: "แก้ไขโปรเจกต์นี้",
    "Add Task": "เพิ่มงาน",

    // Projects Page
    projectManagementTitle: "จัดการโปรเจกต์",
    projectFlowSubtitle: "หน้าจัดการโปรเจกต์ตาม Flowchart",
    searchProjectPlaceholder: "ค้นหาโปรเจกต์ด้วยชื่อ...",
    createProjectBtn: "+ สร้างโปรเจกต์ใหม่",
    createProjectTitle: "สร้างโปรเจกต์ใหม่",
    createProjectBtnSubmit: "สร้างโปรเจกต์",
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
    "Create Task": "สร้างงาน",

    // Activity Page
    activityLogsTitle: "บันทึกกิจกรรมของระบบ",
    activityLogsSubtitle:
      "ตรวจสอบและติดตามประวัติการทำรายการกิจกรรมทั้งหมดของระบบ",
    searchActivityPlaceholder: "ค้นหาชื่อผู้ใช้หรือรายละเอียด...",
    allActivities: "กิจกรรมทั้งหมด",
    aboutProjects: "เกี่ยวกับโปรเจกต์",
    aboutUsers: "เกี่ยวกับผู้ใช้งาน",
    aboutSystem: "เกี่ยวกับระบบ / อื่น ๆ",
    refreshBtn: "รีเฟรชข้อมูล",
    loadingActivities: "กำลังโหลดบันทึกกิจกรรม...",
    colDoneBy: "ทำรายการโดย:",
    firstTimeResetTitle: "เปลี่ยนรหัสผ่านครั้งแรก",
    firstTimeResetDesc:
      "กรุณาเปลี่ยนรหัสผ่านเพื่อความปลอดภัยก่อนเริ่มต้นใช้งาน",
    updatingPassword: "กำลังเปลี่ยนรหัสผ่าน...",
    saveNewPassword: "บันทึกรหัสผ่านใหม่",
    firstTimeResetSuccess:
      "เปลี่ยนรหัสผ่านสำเร็จ! กำลังนำคุณเข้าสู่หน้าแดชบอร์ด...",
    firstTimeResetFailed: "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน",
    forceResetPrompt: "กรุณาเปลี่ยนรหัสผ่านก่อนเข้าใช้งานครั้งแรก",
    unassigned: "ยังไม่ได้ระบุผู้รับผิดชอบ",
    viewTaskDetail: "ดูรายละเอียดงาน",
    Login: "เข้าสู่ระบบ",
    "Create New Project": "สร้างโปรเจกต์ใหม่",
    "Edit Project": "แก้ไขโปรเจกต์",
    "Delete Project": "ลบโปรเจกต์",
    "Create Task Success": "สร้างงานใหม่",
    "Update Task Status": "อัปเดตสถานะงาน",
    Logout: "ออกจากระบบ",
    "Reset Password": "รีเซ็ตรหัสผ่าน",
    "Reset Password First Time": "รีเซ็ตรหัสผ่านครั้งแรก",
    "Import Users": "นำเข้าข้อมูลผู้ใช้งาน",
    "Create User": "สร้างบัญชีผู้ใช้งานใหม่",
    "Edit User": "แก้ไขข้อมูลผู้ใช้งาน",
    "Delete User": "ลบผู้ใช้งาน",
    "Suspend User": "ระงับการใช้งานผู้ใช้",
    "Activate User": "เปิดใช้งานผู้ใช้",
    taskDetailsTitle: "รายละเอียดงาน",
    taskProjectLabel: "โปรเจกต์",
    taskNameLabel: "ชื่องาน",
    taskTypeLabel: "ประเภทงาน",
    taskDescLabel: "รายละเอียด",
    taskPriorityLabel: "ความสำคัญ",
    taskDueDateLabel: "วันส่งงาน",
    taskAssigneeLabel: "ผู้รับผิดชอบ",
    noDescription: "-- ไม่มีรายละเอียด --",
    noAssignee: "-- ไม่ระบุผู้รับผิดชอบ --",
    updateStatusBtn: "อัปเดตสถานะ",
    taskStatusPending: "Pending (รอดำเนินการ)",
    taskStatusInProgress: "In Progress (กำลังดำเนินการ)",
    taskStatusReviewing: "Reviewing (กำลังตรวจสอบ)",
    taskStatusCompleted: "Completed (เสร็จสมบูรณ์)",
    colDetails: "รายละเอียด",
    colAction: "การจัดการ",
    colTime: "เวลา",
    landingBadge: "🚀 แพลตฟอร์มจัดการโปรเจกต์และงานสำหรับทีมยุคใหม่",
    landingHeroTitle: "บริหารจัดการโปรเจกต์และงานในทีม",
    landingHeroTitleAccent: "ง่าย ครบจบในที่เดียว และเป็นระบบ",
    landingHeroDesc:
      "ช่วยให้ทีมของคุณทำงานร่วมกันได้อย่างราบรื่น ติดตามกำหนดส่งงานผ่านปฏิทิน อัปเดตสถานะงานได้แบบเรียลไทม์ พร้อมบันทึกประวัติการทำงานของระบบอย่างเป็นระเบียบ",
    goToDashboard: "เข้าสู่หน้าแดชบอร์ด 📊",
    getStartedBtn: "เริ่มต้นใช้งานฟรี ✨",
    learnMoreBtn: "เรียนรู้เพิ่มเติม",
    statProductivity: "เพิ่มประสิทธิภาพการทำงาน",
    statAlignment: "ทีมทำงานสอดคล้องกัน 100%",
    statMissedDeadlines: "ลดการส่งงานล่าช้ากว่ากำหนด",
    landingFeaturesTitle: "ฟีเจอร์เด่นที่จะช่วยให้งานคุณราบรื่น",
    landingFeaturesDesc:
      "ระบบของเราออกแบบมาอย่างพิถีพิถันเพื่อตอบโจทย์ทุกขั้นตอนในการบริหารจัดการงานและโครงการ",
    featureProjTitle: "จัดการโปรเจกต์",
    featureProjDesc:
      "สร้างโปรเจกต์หลัก กำหนดหัวหน้าทีม และติดตามความคืบหน้าของโปรเจกต์ได้โดยอัตโนมัติ",
    featureTaskTitle: "ติดตามสถานะงาน",
    featureTaskDesc:
      "ควบคุมสถานะของงานย่อยได้อย่างละเอียด ไม่ว่าจะเป็นงานที่รอดำเนินการ, กำลังทำ, อยู่ระหว่างตรวจสอบ หรือเสร็จสิ้นแล้ว",
    featureCalTitle: "ปฏิทินส่งงาน",
    featureCalDesc:
      "ดูวันส่งงานของทุกโปรเจกต์ได้บนปฏิทินแบบ Interactive ป้องกันการลืมวันส่งงานสำคัญ",
    featureTeamTitle: "บันทึกประวัติกิจกรรม",
    featureTeamDesc:
      "ตรวจสอบประวัติการทำงานย้อนหลังของทุกคนในระบบได้อย่างโปร่งใส รู้ทุกการอัปเดตและการเปลี่ยนแปลง",
    landingCtaTitle: "พร้อมที่จะยกระดับการทำงานของทีมคุณแล้วหรือยัง?",
    landingCtaDesc:
      "เริ่มต้นจัดการโปรเจกต์ของคุณอย่างเป็นระบบตั้งแต่วันนี้ ใช้งานได้ฟรี!",
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
