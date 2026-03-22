"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, AuthState } from "@/types/auth";
import { authApi, setAuthToken } from "@/lib/api";
import { useSession, signIn, signOut } from "next-auth/react";

interface AuthContextType extends AuthState {
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const refreshUser = async () => {
    if (status !== "authenticated" || !session) return;
    
    try {
      const userData = await authApi.getMe();
      const user: User = {
        id: userData._id || userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        isSuperadmin: userData.role === "admin",
        department: userData.department,
        avatar: userData.avatar,
        picture: userData.picture,
        llmCredits: userData.llm_credits,
        preferredModel: userData.preferred_model,
        notificationsEnabled: userData.notifications_enabled,
        year: userData.year,
      };
      
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      console.error("Manual auth refresh failed", err);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    
    // Sync the local API token with the NextAuth session
    if ((session as any)?.accessToken) {
      setAuthToken((session as any).accessToken as string);
    } else if (status === "unauthenticated") {
      setAuthToken(null);
    }

    const syncAuth = async () => {
      if (status === "loading") return;

      if (status === "authenticated" && session) {
        // Prevent redundant fetching if user data already matches session email
        if (state.user?.email === session.user?.email && !state.isLoading && state.isAuthenticated) {
          return;
        }

        try {
          // If we need extra data from our backend, we call getMe()
          const userData = await authApi.getMe(controller.signal);
          const user: User = {
            id: userData._id || userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            isSuperadmin: userData.role === "admin",
            department: userData.department,
            avatar: userData.avatar,
            picture: userData.picture,
            llmCredits: userData.llm_credits,
            preferredModel: userData.preferred_model,
            notificationsEnabled: userData.notifications_enabled,
            year: userData.year,
          };
          
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err: any) {
          if (err.name === 'CanceledError' || err.name === 'AbortError') {
            return; // Ignore intentional cancellations
          }
          console.error("Backend auth sync failed", err);
          setState((s) => ({ ...s, isLoading: false }));
        }
      } else if (status === "unauthenticated") {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    syncAuth();

    return () => {
      controller.abort();
    };
  }, [session, status]);

  const loginWithGoogle = async () => {
    await signIn("google");
  };

  const logout = () => {
    signOut();
  };

  return (
    <AuthContext.Provider value={{ ...state, loginWithGoogle, logout, refreshUser }}>
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
