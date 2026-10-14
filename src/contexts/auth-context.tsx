'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useRouter } from 'next/navigation';
import { api, User, AuthResponse } from '@/lib/api';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'ATHLETE' | 'ORGANIZER';
  athleteProfile?: {
    cpf: string;
    birthDate: string;
    gender: 'M' | 'F' | 'OUTRO';
    shirtSize: 'PP' | 'P' | 'M' | 'G' | 'GG';
    emergencyContact: string;
    medicalNotes?: string;
    lgpdConsent: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('runmanager_token');
    }
    return null;
  });

  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('runmanager_user');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(() => !token);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get<User>('/users/me');
      setUser(response.data);
      localStorage.setItem('runmanager_user', JSON.stringify(response.data));
    } catch {
      setUser(null);
      setToken(null);
      localStorage.removeItem('runmanager_token');
      localStorage.removeItem('runmanager_user');
    }
  }, []);

  // Efeito para validar e sincronizar os dados do usuário com a API se houver token
  useEffect(() => {
    let isSubscribed = true;

    async function syncSession() {
      if (!token) return;
      try {
        const response = await api.get<User>('/users/me');
        if (isSubscribed) {
          setUser(response.data);
          localStorage.setItem('runmanager_user', JSON.stringify(response.data));
        }
      } catch {
        if (isSubscribed) {
          setUser(null);
          setToken(null);
          localStorage.removeItem('runmanager_token');
          localStorage.removeItem('runmanager_user');
        }
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    }

    void syncSession();

    return () => {
      isSubscribed = false;
    };
  }, [token]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post<AuthResponse>('/auth/login', {
        email,
        password,
      });

      const { accessToken, user: loggedUser } = response.data;

      setToken(accessToken);
      localStorage.setItem('runmanager_token', accessToken);

      // Busca dados completos incluindo athleteProfile
      try {
        const fullUserRes = await api.get<User>('/users/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setUser(fullUserRes.data);
        localStorage.setItem(
          'runmanager_user',
          JSON.stringify(fullUserRes.data),
        );
      } catch {
        setUser(loggedUser);
        localStorage.setItem('runmanager_user', JSON.stringify(loggedUser));
      }

      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      await api.post('/users', data);
      await login(data.email, data.password);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('runmanager_token');
    localStorage.removeItem('runmanager_user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}
