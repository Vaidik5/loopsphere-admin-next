import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserImage, UserModel } from '@/types/auth';
import * as authApi from '@/lib/auth-api';
import * as authHelper from '@/lib/auth-helpers';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string | UserImage | null;
  role?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  rememberMe: boolean;
  // Actions
  login: (payload: Record<string, any>, rememberMe?: boolean) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  fetchUser: () => Promise<void>;
  initAuth: () => Promise<void>;
  setRememberMe: (rememberMe: boolean) => void;
}

const mapUser = (apiUser: UserModel): User => {
  return {
    id: apiUser.id || apiUser._id || '',
    email: apiUser.email,
    name: `${apiUser.firstName || ''} ${apiUser.lastName || ''}`.trim(),
    avatar:
      (apiUser.image && (apiUser.image.url || apiUser.image.fileName)) || null,
    role:
      typeof apiUser.role === 'string'
        ? apiUser.role
        : apiUser.role?.name || undefined,
  };
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      rememberMe: false,

      login: async (payload: Record<string, any>, rememberMe: boolean = false) => {
        set({ isLoading: true, rememberMe });
        try {
          const auth = await authApi.login(payload, rememberMe);
          authHelper.setAuth(auth, rememberMe, payload);

          const apiUser = await authApi.getUser();
          const user = mapUser(apiUser);
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            rememberMe,
          });
          return true;
        } catch (error) {
          console.error('Login failed', error);
          set({ isLoading: false, isAuthenticated: false, rememberMe: false });
          return false;
        }
      },

      setRememberMe: (rememberMe: boolean) => {
        set({ rememberMe });
      },

      logout: () => {
        authHelper.removeAuth();
        // Clear rememberMe from localStorage on logout
        if (typeof window !== 'undefined') {
          localStorage.removeItem('rememberMe');
        }
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          rememberMe: false,
        });
      },

      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      fetchUser: async () => {
        try {
          const apiUser = await authApi.getUser();
          const user = mapUser(apiUser);
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.error('Failed to fetch user', error);
          authHelper.removeAuth();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      initAuth: async () => {
        const auth = authHelper.getAuth();
        if (auth) {
          await get().fetchUser();
        } else {
          set({ isLoading: false, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        rememberMe: state.rememberMe,
      }),
    }
  )
);
