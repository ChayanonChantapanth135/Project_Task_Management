import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard/DashboardPage";
import Login from "./pages/Login";
// import Register from './pages/Register'
import { LanguageProvider } from "./lib/LanguageContext";
import Profile from "./pages/Profile";
import MyTask from "./pages/MyTasks";
import ManageUsers from "./pages/ManageUser/ManageUserPage";
import Projects from "./pages/ManageProject/ManageProjectPage";
import AllTasks from "./pages/AllTasks";
import Reports from "./pages/Reports";
import About from "./pages/About";
import Contract from "./pages/Contract";
import Activity from "./pages/Activity";
import ProtectedRoute from "./components/ProtectedRoute";
import SessionTimeoutHandler from "./components/SessionTimeoutHandler";
import ResetPassword from "./pages/ResetPassword";
import ResetPasswordFirstTime from "./pages/ResetPasswordFirstTime";

/**
 * คอมโพเนนต์หลักของระบบ (App Component)
 * - ห่อหุ้มแอปพลิเคชันด้วย LanguageProvider สำหรับจัดการเปลี่ยนภาษา (ไทย/อังกฤษ/ญี่ปุ่น/จีน)
 * - ใช้ React Router เพื่อกำหนดเส้นทาง URL ในระบบ (Routing)
 * - กำหนด ProtectedRoute สำหรับหน้าที่ต้องการล็อกอินก่อนเข้าถึง
 * - โหลด SessionTimeoutHandler เพื่อตรวจสอบและแจ้งเตือนเซสชันหมดอายุ
 */
function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <SessionTimeoutHandler />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/Home" element={<Home />} />
          <Route path="/About" element={<About />} />
          <Route path="/Contract" element={<Contract />} />
          <Route path="/login" element={<Login />} />
          <Route path="/ResetPassword" element={<ResetPassword />} />
          <Route path="/reset-password-first-time" element={<ResetPasswordFirstTime />} />
          {/* <Route path='/register' element={<Register />} /> */}

          {/* Protected Routes */}
          <Route
            path="/Dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/MyTasks"
            element={
              <ProtectedRoute>
                <MyTask />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ManageUsers"
            element={
              <ProtectedRoute>
                <ManageUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Projects"
            element={
              <ProtectedRoute>
                <Projects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/AllTasks"
            element={
              <ProtectedRoute>
                <AllTasks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Activity"
            element={
              <ProtectedRoute>
                <Activity />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
