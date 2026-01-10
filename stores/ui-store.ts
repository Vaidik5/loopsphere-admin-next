import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  // Sidebar state
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;

  // Dialog/Modal states
  userAddDialogOpen: boolean;
  userEditDialogOpen: boolean;
  userDeleteDialogOpen: boolean;
  categoryAddDialogOpen: boolean;
  categoryEditDialogOpen: boolean;

  // Toast/Notification state
  toasts: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>;

  // Loading states
  globalLoading: boolean;
  loadingMessage: string | null;

  // Actions - Sidebar
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;

  // Actions - Dialogs
  setUserAddDialogOpen: (open: boolean) => void;
  setUserEditDialogOpen: (open: boolean) => void;
  setUserDeleteDialogOpen: (open: boolean) => void;
  setCategoryAddDialogOpen: (open: boolean) => void;
  setCategoryEditDialogOpen: (open: boolean) => void;

  // Actions - Toast
  addToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  // Actions - Loading
  setGlobalLoading: (loading: boolean, message?: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial state
      sidebarOpen: true,
      sidebarCollapsed: false,
      mobileMenuOpen: false,

      userAddDialogOpen: false,
      userEditDialogOpen: false,
      userDeleteDialogOpen: false,
      categoryAddDialogOpen: false,
      categoryEditDialogOpen: false,

      toasts: [],
      globalLoading: false,
      loadingMessage: null,

      // Sidebar actions
      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open });
      },

      setSidebarCollapsed: (collapsed: boolean) => {
        set({ sidebarCollapsed: collapsed });
      },

      toggleMobileMenu: () => {
        set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen }));
      },

      setMobileMenuOpen: (open: boolean) => {
        set({ mobileMenuOpen: open });
      },

      // Dialog actions
      setUserAddDialogOpen: (open: boolean) => {
        set({ userAddDialogOpen: open });
      },

      setUserEditDialogOpen: (open: boolean) => {
        set({ userEditDialogOpen: open });
      },

      setUserDeleteDialogOpen: (open: boolean) => {
        set({ userDeleteDialogOpen: open });
      },

      setCategoryAddDialogOpen: (open: boolean) => {
        set({ categoryAddDialogOpen: open });
      },

      setCategoryEditDialogOpen: (open: boolean) => {
        set({ categoryEditDialogOpen: open });
      },

      // Toast actions
      addToast: (message: string, type = 'info') => {
        const id = Math.random().toString(36).substring(7);
        set((state) => ({
          toasts: [...state.toasts, { id, message, type }],
        }));

        // Auto remove after 5 seconds
        setTimeout(() => {
          get().removeToast(id);
        }, 5000);
      },

      removeToast: (id: string) => {
        set((state) => ({
          toasts: state.toasts.filter((toast) => toast.id !== id),
        }));
      },

      clearToasts: () => {
        set({ toasts: [] });
      },

      // Loading actions
      setGlobalLoading: (loading: boolean, message?: string) => {
        set({ globalLoading: loading, loadingMessage: message || null });
      },
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
