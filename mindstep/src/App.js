import React, { useState, useEffect } from 'react';
import { api } from './utils/api';
import SignUpPage from './components/pages/SignUpPage';
import LoginPage from './components/pages/LoginPage';
import PersonaCoachApp from './components/pages/PersonaCoachApp';

// --- Main App Component ---
export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isSigningUp, setIsSigningUp] = useState(false);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check session on page load
    useEffect(() => {
        // Note: Auto-login logic can be implemented here by calling /api/home
        // Currently disabled to force login screen as per previous request or default behavior
        setLoading(false);
    }, []);

    const handleLogin = async (userType) => {
        try {
            const data = await api("/api/home");
            setUserData({ nickname: data.user_id, type: data.type || userType, ...data.user });
            setIsLoggedIn(true);
        } catch (err) {
            console.error("Failed to fetch user data:", err);
        }
    };

    const handleSignUp = async (data) => {
        try {
            await api("/api/register", "POST", {
                user_id: data.ID,
                password: data.password,
                type: data.type,
                gender: data.gender,
                age: data.age,
                job: data.job,
                mbti: data.mbti,
                email: data.email
            });
            alert("회원가입 완료! 로그인해주세요.");
            setIsSigningUp(false);
        } catch (err) {
            alert(err.message || "회원가입 실패");
        }
    };

    const handleLogout = async () => {
        try {
            await api("/api/logout", "POST");
            setIsLoggedIn(false);
            setIsSigningUp(false);
            setUserData(null);
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>로딩중...</div>;
    }

    if (isLoggedIn) {
        return <PersonaCoachApp userData={userData} onLogout={handleLogout} />;
    }

    if (isSigningUp) {
        return <SignUpPage onSignUp={handleSignUp} onCancel={() => setIsSigningUp(false)} />;
    }

    return <LoginPage onLogin={handleLogin} onSignUpClick={() => setIsSigningUp(true)} />;
}
