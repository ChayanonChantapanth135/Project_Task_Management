import React, { createContext, useContext, useState, useEffect } from 'react';

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
    signOut: "Sign out",
    login: "Login",
    loading: "Loading...",

    // Login Page
    loginTitle: "Login",
    emailLabel: "Email",
    passwordLabel: "Password",
    emailPlaceholder: "Enter your email",
    passwordPlaceholder: "Enter your password",
    fillAllFields: "Please fill in all fields",
    loginSuccess: "Login successful! Redirecting...",
    loginFailed: "Login failed. Please try again.",

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
    minuteAgo: "1 minute ago",
    viewAll: "View All"
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
    viewAll: "ดูทั้งหมด"
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'th';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'th' : 'en');
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
