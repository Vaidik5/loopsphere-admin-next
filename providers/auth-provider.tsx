'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as authApi from '@/lib/auth-api';
import * as authHelper from '@/lib/auth-helpers';
import { UserModel, UserImage } from '@/types/auth'; // Ensure path
import { useRouter } from 'next/router';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: UserImage|null;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  // Keep these for compatibility with existing UI
  data: { user: User | null } | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapUser = (apiUser: UserModel): User => {
  return {
    id: apiUser._id,
    email: apiUser.email,
    name: `${apiUser.firstName || ''} ${apiUser.lastName || ''}`.trim(),
    avatar: apiUser.image || null,
    role: apiUser.role
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  

  useEffect(() => {
    const initAuth = async () => {
      const auth = authHelper.getAuth();
      if (auth) {
        try {
          const apiUser = await authApi.getUser();
          setUser(mapUser(apiUser));
        } catch (error) {
          console.error('Failed to fetch user', error);
          authHelper.removeAuth();
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const auth = await authApi.login(email, password);
      authHelper.setAuth(auth);
      
      const apiUser = await authApi.getUser();
      setUser(mapUser(apiUser));
      
      return true;
    } catch (error) {
      // console.error('Login failed', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authHelper.removeAuth();
    setUser(null);
    window.location.href = '/signin';
  };

  // Compatibility properties for existing UI components
  const data = user ? { user } : null;
  const status = isLoading ? 'loading' : user ? 'authenticated' : 'unauthenticated';

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isLoading,
      data,
      status
    }}>
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

// For compatibility with NextAuth useSession hook
export function useSession() {
  const { data, status } = useAuth();
  return { data, status };
}

// Mock signIn function for compatibility
export async function signIn(provider: string, options?: Record<string, unknown>) {
  // Suppress unused parameter warning
  void options;

  if (provider === 'credentials') {
    // This will be handled by your login form
    return { error: null };
  }

  return { error: 'Provider not supported' };
}

// Mock signOut function for compatibility
export function signOut() {
  // For compatibility, we'll handle logout through the context directly

  authHelper.removeAuth();
  window.location.reload(); 
  
  // Force a reload to update the auth state
}
