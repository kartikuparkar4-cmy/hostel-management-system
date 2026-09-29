import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { api, clearStoredAuth, getStoredToken, getStoredUser, setStoredAuth } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string, role: Role) => Promise<void>;
  register: (name: string, email: string, password: string, role: Role, adminCode?: string) => Promise<void>;
  logout: () => void;
  quickLogin: (email: string, password: string, role: Role) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Validate current token with backend on mount
    const checkAuth = async () => {
      const stored = getStoredToken();
      if (!stored) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const { user: fetchedUser } = await api.getMe();
        const normalizedUser: User = {
          ...fetchedUser,
          id: fetchedUser.id || (fetchedUser as any)._id,
        };
        setUser(normalizedUser);
        if (stored) {
          setStoredAuth(stored, normalizedUser);
        }
      } catch {
        clearStoredAuth();
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth expired event
    const handleAuthExpired = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => {
      window.removeEventListener('auth:expired', handleAuthExpired);
    };
  }, []);

  const login = async (email: string, password: string, role: Role) => {
    const res = await api.login({ email, password, role });
    setStoredAuth(res.token, res.user);
    setToken(res.token);
    setUser(res.user);
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: Role,
    adminCode?: string
  ) => {
    const res = await api.register({ name, email, password, role, adminCode });
    setStoredAuth(res.token, res.user);
    setToken(res.token);
    setUser(res.user);
  };

  const quickLogin = async (email: string, password: string, role: Role) => {
    return login(email, password, role);
  };

  const logout = () => {
    clearStoredAuth();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        quickLogin,
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
