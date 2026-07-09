// lib/auth.js

// Function สำหรับดึงข้อมูล user ปัจจุบัน
export const getCurrentUser = async () => {
    // ตัวอย่าง: ดึงจาก localStorage หรือ API
    const userToken = localStorage.getItem('userToken');
    const userData = localStorage.getItem('userData');
    const expiresAt = Number(localStorage.getItem('userTokenExpiresAt'));
    
    if (!userToken || !userData) {
        return null;
    }

    if (expiresAt && Date.now() >= expiresAt) {
        await signOut();
        return null;
    }

    try {
        // return parsed user data
        return JSON.parse(userData);
        // ตัวอย่าง return: { id: 1, name: 'John', email: 'john@example.com', role: 'user', profilePic: '...' }
    } catch (error) {
        return null;
    }
};

export const signIn = async ({ token, user, expiresInSeconds = 600 }) => {
    localStorage.setItem('userToken', token);
    localStorage.setItem('userData', JSON.stringify(user));
    localStorage.setItem('userTokenExpiresAt', String(Date.now() + expiresInSeconds * 1000));
    window.dispatchEvent(new Event('authChanged'));
};

export const signOut = async () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('userTokenExpiresAt');
    window.dispatchEvent(new Event('authChanged'));
};
