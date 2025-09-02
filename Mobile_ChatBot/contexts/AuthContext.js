import { createContext, useContext, useEffect, useState } from "react";

import authService from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    setLoading(true);
    const user = await authService.getUser();
    if (user?.error) {
      setUser(null);
    } else {
      setUser(user);
    }

    setLoading(false);
  };
  const login = async (email, password) => {
    const response = await authService.login(email, password);
    if (response?.error) {
      return response;
    }
    await checkUser();
    return { success: true };
  };
  const register = async (email, password) => {
    const response = await authService.register(email, password);
    if (response?.error) {
      return response;
    }
    return login(email, password);
  };
  const logout = async () => {
    await authService.logout();
    setUser(null);
    await checkUser();
  };
  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
