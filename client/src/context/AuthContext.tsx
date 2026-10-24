import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { api, setToken, clearToken, getStoredUser, setStoredUser } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (body: { name: string; email: string; phone: string; password: string }) => Promise<User>;
  logout: () => void;
  switchDemoRole: (role: UserRole) => Promise<void>;
  isAdmin: boolean;
  isWorker: boolean;
  isCustomer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function verifyUser() {
      const stored = getStoredUser();
      if (stored) {
        try {
          const res = await api.auth.me();
          setUser(res.user);
          setStoredUser(res.user);
        } catch (err) {
          console.warn('Session verification failed, clearing stale auth.');
          clearToken();
          setUser(null);
        }
      }
      setLoading(false);
    }
    verifyUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await api.auth.login({ email, password });
    setToken(res.token);
    setUser(res.user);
    setStoredUser(res.user);
    return res.user;
  };

  const register = async (body: { name: string; email: string; phone: string; password: string }): Promise<User> => {
    const res = await api.auth.register(body);
    setToken(res.token);
    setUser(res.user);
    setStoredUser(res.user);
    return res.user;
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  // Quick staff account switcher to easily test Admin and Worker roles
  const switchDemoRole = async (role: UserRole) => {
    setLoading(true);
    try {
      if (role === 'ADMIN') {
        await login('admin@rjbodybuilding.local', 'Admin@12345');
      } else if (role === 'WORKER') {
        await login('murugan.body@rjbodybuilding.local', 'Worker@12345');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        switchDemoRole,
        isAdmin: user?.role === 'ADMIN',
        isWorker: user?.role === 'WORKER',
        isCustomer: user?.role === 'CUSTOMER',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
