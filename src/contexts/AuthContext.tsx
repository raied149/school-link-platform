
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "../integrations/supabase/client";

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
  login: (role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Predefined user IDs from the database
const PREDEFINED_USERS = {
  admin: {
    id: "00000000-0000-4000-a000-000000000000",
    firstName: "Admin",
    lastName: "User"
  },
  teacher: {
    id: "00000000-0000-4000-a000-000000000000", // Will be fetched from DB
    firstName: "Linda",
    lastName: "Taylor"
  },
  student: {
    id: "00000000-0000-4000-a000-000000000000", // Will be fetched from DB
    firstName: "Arkham",
    lastName: "Mohamed"
  },
  parent: {
    id: "00000000-0000-4000-a000-000000000000",
    firstName: "Parent",
    lastName: "User"
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const login = async (role: UserRole) => {
    try {
      let userId = PREDEFINED_USERS[role].id;
      let firstName = PREDEFINED_USERS[role].firstName;
      let lastName = PREDEFINED_USERS[role].lastName;
      
      // For teacher and student roles, fetch the actual user from the database
      if (role === 'teacher' || role === 'student') {
        // Fetch user by name
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .eq('role', role)
          .or(`first_name.ilike.${role === 'teacher' ? 'Linda' : 'Arkham'},last_name.ilike.${role === 'teacher' ? 'Taylor' : 'Mohamed'}`)
          .single();
        
        if (error) {
          console.error("Error fetching user profile:", error);
        }
        
        if (data) {
          userId = data.id;
          firstName = data.first_name;
          lastName = data.last_name;
        }
      }

      const newUser: User = {
        id: userId,
        firstName: firstName,
        lastName: lastName,
        role: role
      };
      
      setUser(newUser);
      navigate('/dashboard');
    } catch (error) {
      console.error("Error during login:", error);
    }
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
