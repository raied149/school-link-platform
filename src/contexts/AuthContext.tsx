
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Development UUID - matches our RLS policies
const DEV_USER_UUID = "00000000-0000-4000-a000-000000000000";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const login = (role: UserRole) => {
    // Use the development UUID that matches Supabase RLS policies
    const newUser: User = {
      id: DEV_USER_UUID,
      firstName: 'Simulated',
      lastName: role.charAt(0).toUpperCase() + role.slice(1),
      role: role
    };
    setUser(newUser);
    navigate('/dashboard');
  };

  const logout = () => {
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
