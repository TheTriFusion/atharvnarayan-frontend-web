import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authAPI, removeToken } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    // Only check auth once on mount
    if (hasCheckedAuth.current) return;

    const checkAuth = async () => {
      try {
        // Only check if token exists
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await authAPI.getCurrentUser();
        if (response.success && response.user) {
          setUser(response.user);
        } else {
          removeToken();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        removeToken();
      } finally {
        setLoading(false);
        hasCheckedAuth.current = true;
      }
    };

    checkAuth();
  }, []);

  const login = async (phoneNumber, password) => {
    try {
      const response = await authAPI.login(phoneNumber, password);
      if (response.success && response.user) {
        setUser(response.user);
        return { success: true, user: response.user };
      }
      return { success: false, message: response.message || 'Login failed' };
    } catch (error) {
      return { success: false, message: error.message || 'Login failed' };
    }
  };

  const loginSuperAdmin = async (phoneNumber, password) => {
    try {
      const response = await authAPI.loginSuperAdmin(phoneNumber, password);
      if (response.success && response.user) {
        setUser(response.user);
        return { success: true, user: response.user };
      }
      return { success: false, message: response.message || 'Login failed' };
    } catch (error) {
      return { success: false, message: error.message || 'Login failed' };
    }
  };

  const logout = () => {
    setUser(null);
    hasCheckedAuth.current = false;
    authAPI.logout();
  };

  const value = {
    user,
    login,
    loginSuperAdmin,
    logout,
    loading,
    isAuthenticated: !!user,
    // Role checks
    isSuperAdmin: user?.role === 'superadmin',
    isCattleFeedOwner: user?.role === 'cattleFeedOwner',
    isMilkTruckOwner: user?.role === 'milkTruckOwner',
    isCattleFeedTruckOwner: user?.role === 'cattleFeedTruckOwner',
    isCattleFeedTruckDriver: user?.role === 'cattleFeedTruckDriver',
    isSeller: user?.role === 'cattleFeedSeller',
    isDriver: user?.role === 'milkTruckDriver',
    // Legacy aliases for backward compatibility
    isAdmin: user?.role === 'cattleFeedOwner' || user?.role === 'admin',
    isOwner: user?.role === 'milkTruckOwner' || user?.role === 'owner',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
