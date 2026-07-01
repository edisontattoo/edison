


import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { getAppSettings } from '../services/dataService';

const ADMIN_AUTH_KEY = 'app_admin_auth';

interface AdminContextType {
  isAuthenticated: boolean;
  login: (user: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // sessionStorage is used for better security - it clears when the tab is closed.
    try {
      const item = window.sessionStorage.getItem(ADMIN_AUTH_KEY);
      return item ? JSON.parse(item) : false;
    } catch (error) {
      console.error("Error reading auth state from sessionStorage", error);
      return false;
    }
  });

  useEffect(() => {
    try {
      window.sessionStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(isAuthenticated));
    } catch (error) {
      console.error("Error saving auth state to sessionStorage", error);
    }
  }, [isAuthenticated]);

  const login = async (user: string, pass: string): Promise<boolean> => {
    try {
        const settings = await getAppSettings();
        if (user === settings.credentials.user && pass === settings.credentials.pass) {
          setIsAuthenticated(true);
          return true;
        }
        return false;
    } catch(e) {
        console.error("Failed to get app settings for login", e);
        return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AdminContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};