import React, { useState } from 'react';
import { api } from '../../utils/api';

const loginStyles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', backgroundColor: '#E8EDF4' },
    card: { textAlign: 'center', width: '100%', maxWidth: '350px' },
    logo: { fontSize: '42px', fontWeight: 'bold', color: '#1A2B45', marginBottom: '10px' },
    subtitle: { fontSize: '16px', color: '#555', marginBottom: '40px' },
    form: { display: 'flex', flexDirection: 'column', gap: '8px' },
    input: { padding: '12px', fontSize: '16px', border: '1px solid #BDC3C7', borderRadius: '4px', outline: 'none', marginBottom: '12px' },
    loginBtn: { padding: '14px', fontSize: '18px', fontWeight: 'bold', backgroundColor: '#6C7EE1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginBottom: '8px' },
    signupBtn: { padding: '14px', fontSize: '16px', backgroundColor: 'transparent', color: '#6C7EE1', border: '1px solid #6C7EE1', borderRadius: '8px', cursor: 'pointer', marginTop: '5px' }
};

export default function LoginPage({ onLogin, onSignUpClick }) {
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userId.trim() || !password.trim()) {
            setError("아이디와 비밀번호를 입력해주세요.");
            return;
        }

        try {
            const result = await api("/api/login", "POST", { user_id: userId, password });
            onLogin(result.type || 'Type A');
        } catch (err) {
            setError(err.message || "로그인 실패");
        }
    };

    return (
        <div style={loginStyles.container}>
            <div style={loginStyles.card}>
                <h1 style={loginStyles.logo}>MindStep</h1>
                <p style={loginStyles.subtitle}>나를 위한 AI 행동 코칭</p>
                <form onSubmit={handleSubmit} style={loginStyles.form}>
                    <input type="text" placeholder="ID를 입력하세요" value={userId} onChange={(e) => setUserId(e.target.value)} style={loginStyles.input} />
                    <input type="password" placeholder="비밀번호를 입력하세요" value={password} onChange={(e) => setPassword(e.target.value)} style={loginStyles.input} />
                    {error && <p style={{ color: 'red', fontSize: '14px', margin: '5px 0' }}>{error}</p>}
                    <button type="submit" style={loginStyles.loginBtn}>입장하기</button>
                    <button type="button" onClick={onSignUpClick} style={loginStyles.signupBtn}>회원가입</button>
                </form>
            </div>
        </div>
    );
}
