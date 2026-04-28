import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // Set axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("token", token);
    } else {
      delete axios.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
    }
  }, [token]);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const response = await axios.get("http://localhost:5001/api/auth/me");
          setUser(response.data.data);
        } catch (error) {
          console.error("Error loading user:", error);
          // If token is invalid, clear it
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        "http://localhost:5001/api/auth/login",
        { email, password },
      );

      const { user, token } = response.data.data;
      setUser(user);
      setToken(token);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (name, email, password, role, phone) => {
    try {
      const response = await axios.post(
        "http://localhost:5001/api/auth/register",
        { name, email, password, role, phone },
      );

      const { user, token } = response.data.data;
      setUser(user);
      setToken(token);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = async () => {
    try {
      // Call backend logout endpoint to blacklist token
      if (token) {
        await axios.post("http://localhost:5001/api/auth/logout");
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Continue with logout even if backend call fails
    } finally {
      // Clear local state
      setUser(null);
      setToken(null);
    }
  };

  const logoutAll = async () => {
    try {
      // Logout from all devices
      if (token) {
        await axios.post("http://localhost:5001/api/auth/logout-all");
      }
    } catch (error) {
      console.error("Logout all error:", error);
    } finally {
      // Clear local state
      setUser(null);
      setToken(null);
    }
  };

  const isAdmin = () => {
    return user?.role === "admin";
  };

  const isStaff = () => {
    return user?.role === "staff";
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    logoutAll,
    isAdmin,
    isStaff,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
