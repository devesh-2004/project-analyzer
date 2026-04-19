"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";

interface User {
  name: string;
  email: string;
  picture: string;
  accessToken?: string;
  githubToken?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loginWithGoogle: () => void;
  loginWithGithub: () => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for existing session
    const storedUser = localStorage.getItem("project_insight_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Check for user data in URL (from GitHub OAuth callback)
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const userParam = params.get("user");
      if (userParam) {
        try {
          const userData = JSON.parse(userParam);
          setUser(userData);
          localStorage.setItem("project_insight_user", JSON.stringify(userData));

          // Clean up URL
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        } catch (error) {
          console.error("Failed to parse user data from URL", error);
        }
      }
    }

    setIsLoading(false);
  }, []);

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfoResponse = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          }
        );
        const userInfo = await userInfoResponse.json();
        const newUser: User = {
          name: userInfo.name,
          email: userInfo.email,
          picture: userInfo.picture,
          accessToken: tokenResponse.access_token,
        };
        setUser(newUser);
        localStorage.setItem("project_insight_user", JSON.stringify(newUser));
        window.location.href = "/dashboard";
      } catch (error) {
        console.error("Failed to fetch user info", error);
      }
    },
    onError: () => console.error("Google Login Failed"),
  });

  const loginWithGithub = () => {
    window.location.href = "/api/auth/github/login";
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("project_insight_user");
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loginWithGoogle,
        loginWithGithub,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
