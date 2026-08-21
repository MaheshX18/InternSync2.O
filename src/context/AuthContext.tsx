import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, AuthData, UserRole, UpdateProfilePayload } from '../types';
import {
  getUserProfileApi,
  loginApi,
  registerApi,
  logoutApi,
  refreshTokenApi,
  updateUserProfileApi,
} from '../api/client';

interface AuthContextType {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<AuthData>;
  register: (payload: Record<string, any>) => Promise<AuthData>;
  logout: () => Promise<void>;
  updateUser: (payload: UpdateProfilePayload) => Promise<UserProfile>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(() => localStorage.getItem('internsync_access_token'));
  const [refreshToken, setRefreshToken] = useState<string | null>(() => localStorage.getItem('internsync_refresh_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const saveAuthSession = (data: AuthData) => {
    localStorage.setItem('internsync_access_token', data.accessToken);
    localStorage.setItem('internsync_refresh_token', data.refreshToken);
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
  };

  const clearAuthSession = () => {
    localStorage.removeItem('internsync_access_token');
    localStorage.removeItem('internsync_refresh_token');
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  const fetchUserProfile = async (): Promise<void> => {
    try {
      const res = await getUserProfileApi();
      if (res.success && res.data) {
        setUser(res.data);
      }
    } catch (err) {
      console.warn('Failed to load user profile with current token:', err);
      // Attempt token refresh if refresh token available
      const storedRefreshToken = localStorage.getItem('internsync_refresh_token');
      if (storedRefreshToken) {
        try {
          const refreshRes = await refreshTokenApi(storedRefreshToken);
          if (refreshRes.success && refreshRes.data) {
            saveAuthSession(refreshRes.data);
            const userRes = await getUserProfileApi();
            if (userRes.success && userRes.data) {
              setUser(userRes.data);
              return;
            }
          }
        } catch (refreshErr) {
          console.error('Session expired or refresh token invalid:', refreshErr);
        }
      }
      clearAuthSession();
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      if (accessToken) {
        await fetchUserProfile();
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, pass: string): Promise<AuthData> => {
    setIsLoading(true);
    try {
      const response = await loginApi({ email, password: pass });
      if (response.success && response.data) {
        saveAuthSession(response.data);
        const profileRes = await getUserProfileApi();
        if (profileRes.success && profileRes.data) {
          setUser(profileRes.data);
        }
        return response.data;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: Record<string, any>): Promise<AuthData> => {
    setIsLoading(true);
    try {
      const response = await registerApi(payload);
      if (response.success && response.data) {
        saveAuthSession(response.data);
        const profileRes = await getUserProfileApi();
        if (profileRes.success && profileRes.data) {
          setUser(profileRes.data);
        }
        return response.data;
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      if (refreshToken) {
        await logoutApi(refreshToken);
      }
    } catch (e) {
      console.warn('Logout API error:', e);
    } finally {
      clearAuthSession();
      setIsLoading(false);
    }
  };

  const updateUser = async (payload: UpdateProfilePayload): Promise<UserProfile> => {
    const res = await updateUserProfileApi(payload);
    if (res.success && res.data) {
      setUser(res.data);
      return res.data;
    }
    throw new Error(res.message || 'Failed to update profile');
  };

  const refreshUserProfile = async (): Promise<void> => {
    await fetchUserProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        isAuthenticated: !!user && !!accessToken,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
