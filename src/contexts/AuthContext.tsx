
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define user roles
export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Mock user data - would be replaced with actual authentication
const mockUsers: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@school.com', role: 'admin' },
  { id: '2', name: 'Teacher User', email: 'teacher@school.com', role: 'teacher' },
  { id: '3', name: 'Student User', email: 'student@school.com', role: 'student' },
  { id: '4', name: 'Parent User', email: 'parent@school.com', role: 'parent' },
];

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Mock login function
  const login = async (email: string, password: string) => {
    // In a real app, this would make an API request
    const foundUser = mockUsers.find(u => u.email === email);
    
    if (foundUser) {
      setUser(foundUser);
      return Promise.resolve();
    }
    
    return Promise.reject(new Error('Invalid email or password'));
  };

  // Logout function
  const logout = () => {
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
