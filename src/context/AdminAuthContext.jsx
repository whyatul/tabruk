import { createContext, useEffect, useMemo, useState } from 'react';
import { backendApi } from '../api/backend';

export const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    let mounted = true;

    const validateExistingSession = async () => {
      const token = backendApi.getStoredAdminToken();

      if (!token) {
        if (mounted) {
          setIsAuthenticated(false);
          setIsCheckingAuth(false);
        }
        return;
      }

      try {
        await backendApi.adminSession();
        if (mounted) {
          setIsAuthenticated(true);
        }
      } catch {
        backendApi.clearStoredAdminToken();
        if (mounted) {
          setIsAuthenticated(false);
        }
      } finally {
        if (mounted) {
          setIsCheckingAuth(false);
        }
      }
    };

    validateExistingSession();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (credentials) => {
    await backendApi.adminLogin(credentials);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await backendApi.adminLogout();
    setIsAuthenticated(false);
  };

  const value = useMemo(
    () => ({ isAuthenticated, isCheckingAuth, login, logout }),
    [isAuthenticated, isCheckingAuth],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}
