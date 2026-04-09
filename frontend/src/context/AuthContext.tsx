"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id?: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string, role: string, doctorSecretKey?: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for saved token and user on mount
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse saved user", e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      // DEFAULT GUEST MODE (Open Access)
      const isPatientPath = typeof window !== "undefined" && window.location.pathname.includes("/patient");
      const guestRole = isPatientPath ? "patient" : "doctor";
      const guestName = isPatientPath ? "Guest Patient" : "Guest Physician";

      const guestUser = { 
        name: guestName, 
        email: "guest@prescription.ai", 
        role: guestRole 
      };
      
      setUser(guestUser);
      setToken("guest-token");
      
      // Sync to localStorage for components using manual fetch
      localStorage.setItem("token", "guest-token");
      localStorage.setItem("user", JSON.stringify(guestUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, role: string, doctorSecretKey?: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      let accessToken: string;

      if (role === 'doctor') {
        // Doctor login: use /doctor-login endpoint with secret key
        const response = await fetch(`${apiUrl}/doctor-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            doctor_secret_key: doctorSecretKey || '',
          }),
        });
        if (!response.ok) {
          return false;
        }
        const data = await response.json();
        accessToken = data.access_token;
      } else {
        // Patient / other roles: standard /token endpoint
        const response = await fetch(`${apiUrl}/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ username: email, password }),
        });
        if (!response.ok) {
          return false;
        }
        const data = await response.json();
        accessToken = data.access_token;
      }

      localStorage.setItem('token', accessToken);
      setToken(accessToken);

      // Fetch user profile
      const profileRes = await fetch(`${apiUrl}/users/me`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (profileRes.ok) {
        const userData = await profileRes.json();
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        router.push(`/${userData.role}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };


  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
