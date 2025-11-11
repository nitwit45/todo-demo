"use client";

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { User, getCurrentUser, logout as authLogout, getAccessToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Module-level flag to track if we're in a login flow
let isLoggingIn = false;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const initializedRef = useRef(false);
  const loadingStartedRef = useRef(false);

  useEffect(() => {
    // Check if user is logged in on mount (only once)
    // Skip if we're currently in a login flow or already started loading
    if (initializedRef.current || loadingStartedRef.current || isLoggingIn) {
      return;
    }
    
    const loadUser = async () => {
      loadingStartedRef.current = true;
      initializedRef.current = true;
      
      // Only try to load user if we have a token
      const token = getAccessToken();
      if (!token) {
        setLoading(false);
        return;
      }

      // If we already have a user, don't fetch again
      if (user) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        // Only update user if we don't already have one (e.g., from login)
        setUser(prevUser => prevUser || currentUser);
      } catch (error) {
        console.error("Failed to load user:", error);
        // Only clear user if we don't already have one
        setUser(prevUser => prevUser || null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = (userData: User) => {
    isLoggingIn = true; // Set flag to prevent getCurrentUser from being called
    loadingStartedRef.current = true; // Prevent loadUser from running
    initializedRef.current = true; // Mark as initialized to prevent useEffect from running
    
    // Use functional update to ensure state is set immediately
    setUser(() => userData);
    setLoading(() => false);
    
    // Reset the flag after navigation completes
    setTimeout(() => {
      isLoggingIn = false;
    }, 2000);
  };

  const logout = () => {
    authLogout();
    setUser(null);
    setLoading(true);
    initializedRef.current = false; // Reset so we can check auth on next mount
    loadingStartedRef.current = false; // Reset loading flag
    isLoggingIn = false; // Clear login flag
    router.push("/login");
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

