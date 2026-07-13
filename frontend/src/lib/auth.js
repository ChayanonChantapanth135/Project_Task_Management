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

export const signIn = async ({ token, user, expiresInSeconds = 1200 }) => {
    localStorage.setItem('userToken', token);
    localStorage.setItem('userData', JSON.stringify(user));
    localStorage.setItem('userTokenExpiresAt', String(Date.now() + expiresInSeconds * 1000));
    window.dispatchEvent(new Event('authChanged'));
};

export const renewToken = async () => {
    const token = localStorage.getItem('userToken');
    if (!token) return false;
    try {
        const axios = (await import('axios')).default;
        const response = await axios.post('http://127.0.0.1:3000/auth/refresh', { token });
        const { token: newToken, user, expiresInSeconds } = response.data;
        await signIn({ token: newToken, user, expiresInSeconds });
        return true;
    } catch (e) {
        console.error("Token renewal failed:", e);
        return false;
    }
};

export const signOut = async () => {
    try {
        const userData = localStorage.getItem('userData');
        if (userData) {
            const user = JSON.parse(userData);
            const axios = (await import('axios')).default;
            await axios.post('http://127.0.0.1:3000/auth/logout', { userId: user.id });
        }
    } catch (e) {
        console.error("Logout log failed:", e);
    }
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('userTokenExpiresAt');
    window.dispatchEvent(new Event('authChanged'));
};
