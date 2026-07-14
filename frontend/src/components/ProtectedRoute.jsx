import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../lib/auth';

/**
 * คอมโพเนนต์ป้องกันหน้าเว็บ (ProtectedRoute Component)
 * - ตรวจสอบสถานะการเข้าสู่ระบบของผู้ใช้งานก่อนอนุญาตให้เข้าถึงเนื้อหา (children)
 * - หากยังไม่ได้เข้าสู่ระบบ (หรือเซสชันหมดอายุ) จะทำการนำทางไปยังหน้า Login (/login) ทันที
 * - แสดง Spinner โหลดดิ้งระหว่างรอตรวจสอบสถานะความถูกต้อง
 */
const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    /**
     * ฟังก์ชันตรวจสอบสถานะล็อกอินของผู้ใช้งานเพื่อความปลอดภัยฝั่ง Client
     */
    const checkAuth = async () => {
      const user = await getCurrentUser();
      setAuthenticated(user !== null);
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', background: '#1a1a2e' }}>
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
