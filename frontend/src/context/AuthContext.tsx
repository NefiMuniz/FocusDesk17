import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

interface User {
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch {
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (token: string) => {
    localStorage.setItem("token", token);
    await fetchUser();
  };

  const logout = async () => {
    const token = localStorage.getItem("token");
    try {
      await api.post("/auth/logout", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login";
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};