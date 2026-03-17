"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, AuthState } from "@/types/auth";
import { authApi } from "@/lib/api";

interface AuthContextType extends AuthState {
  loginWithGoogle: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const userData = await authApi.getMe();
          setState({
            user: {
              id: userData._id || userData.id,
              name: userData.name,
              email: userData.email,
              role: userData.role,
              isSuperadmin: userData.role === "admin",
              department: userData.department,
              avatar: userData.avatar,
            },
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err) {
          console.error("Session restoration failed", err);
          logout();
        }
      } else {
        setState((s) => ({ ...s, isLoading: false }));
      }
    };
    checkAuth();
  }, []);

  const loginWithGoogle = async (token: string) => {
    try {
      setState((s) => ({ ...s, isLoading: true }));
      const { access_token } = await authApi.loginGoogle(token);
      localStorage.setItem("token", access_token);
      
      const userData = await authApi.getMe();
      const user: User = {
        id: userData._id || userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        isSuperadmin: userData.role === "admin",
        department: userData.department,
        avatar: userData.avatar,
      };
      
      localStorage.setItem("auth_user", JSON.stringify(user));
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      setState((s) => ({ ...s, isLoading: false }));
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("auth_user");
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
