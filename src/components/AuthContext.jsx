import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('rms_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Store JWT token alongside user data
  const login = (userData, token) => {
    sessionStorage.setItem('rms_user', JSON.stringify(userData));
    if (token) sessionStorage.setItem('rms_token', token);
    setUser(userData);
    window.dispatchEvent(new StorageEvent('storage', { key: 'rms_user' }));
  };

  const logout = () => {
    sessionStorage.removeItem('rms_user');
    sessionStorage.removeItem('rms_token');
    sessionStorage.removeItem('rms_active_hotel');
    setUser(null);
    window.dispatchEvent(new StorageEvent('storage', { key: 'rms_user' }));
  };

  const getToken = () => sessionStorage.getItem('rms_token');

  // Fetch fresh user profile from API and sync to session
  const refreshUser = async () => {
    const token = sessionStorage.getItem('rms_token');
    if (!token) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const freshUser = data.user || data;
        sessionStorage.setItem('rms_user', JSON.stringify(freshUser));
        setUser(freshUser);
      }
    } catch {
      // Silently fail — use cached user
    }
  };

  // On mount: if we have a token, refresh user from API
  useEffect(() => {
    const token = sessionStorage.getItem('rms_token');
    if (token && user) {
      refreshUser();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, getToken, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}