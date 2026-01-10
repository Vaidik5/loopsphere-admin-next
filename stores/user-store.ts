import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { AdminUser } from './types';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import { apiRequest } from '@/lib/api-request';

interface UserState {
  // Users list
  users: AdminUser[];
  selectedUser: AdminUser | null;
  usersLoading: boolean;
  usersError: string | null;

  // Pagination info
  totalUsers: number;
  currentPage: number;
  totalPages: number;

  // Actions - Users list
  fetchUsers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }) => Promise<void>;
  clearUsers: () => void;

  // Actions - Selected user
  setSelectedUser: (user: AdminUser | null) => void;
  fetchUserById: (userId: string) => Promise<void>;
  clearSelectedUser: () => void;

  // Actions - CRUD
  addUser: (userData: FormData) => Promise<{ success: boolean; message?: string }>;
  updateUser: (userId: string, userData: FormData) => Promise<{ success: boolean; message?: string }>;
  deleteUser: (userId: string, reason?: string) => Promise<{ success: boolean; message?: string }>;

  // Actions - Loading/Error
  setUsersLoading: (loading: boolean) => void;
  setUsersError: (error: string | null) => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    (set, get) => ({
      // Initial state
      users: [],
      selectedUser: null,
      usersLoading: false,
      usersError: null,
      totalUsers: 0,
      currentPage: 1,
      totalPages: 0,

      // Fetch users
      fetchUsers: async (params = {}) => {
        set({ usersLoading: true, usersError: null });
        try {
          const queryParams = new URLSearchParams();
          if (params.page) queryParams.set('page', String(params.page));
          if (params.limit) queryParams.set('limit', String(params.limit));
          if (params.search) queryParams.set('search', params.search);
          if (params.sort) queryParams.set('sort', params.sort);
          if (params.order) queryParams.set('order', params.order);

          const response = await apiRequest<any>(
            'GET',
            `${API_ENDPOINTS.GET_ALL_ADMIN_USERS_LIST}?${queryParams.toString()}`
          );

          if (response.status === 204) {
            set({
              users: [],
              totalUsers: 0,
              currentPage: 1,
              totalPages: 0,
              usersLoading: false,
            });
            return;
          }

          const apiData = response.data;
          set({
            users: apiData.data || [],
            totalUsers: apiData.pagination?.totalRecords || 0,
            currentPage: apiData.pagination?.currentPage || 1,
            totalPages: apiData.pagination?.totalPages || 0,
            usersLoading: false,
          });
        } catch (error: any) {
          set({
            usersError: error.message || 'Failed to fetch users',
            usersLoading: false,
          });
        }
      },

      clearUsers: () => {
        set({
          users: [],
          totalUsers: 0,
          currentPage: 1,
          totalPages: 0,
          usersError: null,
        });
      },

      // Selected user actions
      setSelectedUser: (user) => {
        set({ selectedUser: user });
      },

      fetchUserById: async (userId: string) => {
        set({ usersLoading: true, usersError: null });
        try {
          const response = await apiRequest<any>(
            'GET',
            `${API_ENDPOINTS.GET_BY_ID_ADMINS}/${userId}`
          );
          if (response?.data?.success) {
            set({
              selectedUser: response.data.data,
              usersLoading: false,
            });
          } else {
            throw new Error('Failed to fetch user');
          }
        } catch (error: any) {
          set({
            usersError: error.message || 'Failed to fetch user',
            usersLoading: false,
          });
        }
      },

      clearSelectedUser: () => {
        set({ selectedUser: null });
      },

      // CRUD actions
      addUser: async (userData: FormData) => {
        set({ usersLoading: true, usersError: null });
        try {
          const response = await apiRequest<any>(
            'POST',
            API_ENDPOINTS.ADD_ADMIN_USERS,
            userData,
            'multipart/form-data'
          );

          if (response?.data?.success) {
            // Refresh users list
            await get().fetchUsers();
            set({ usersLoading: false });
            return { success: true, message: response.data.message };
          } else {
            throw new Error(response?.data?.message || 'Failed to add user');
          }
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to add user';
          set({ usersError: errorMessage, usersLoading: false });
          return { success: false, message: errorMessage };
        }
      },

      updateUser: async (userId: string, userData: FormData) => {
        set({ usersLoading: true, usersError: null });
        try {
          const response = await apiRequest<any>(
            'POST',
            API_ENDPOINTS.EDIT_ADMIN_USERS,
            userData,
            'multipart/form-data'
          );

          if (response?.data?.success) {
            // Update in list if exists
            set((state) => ({
              users: state.users.map((user) =>
                (user._id || user.id) === userId
                  ? { ...user, ...response.data.data }
                  : user
              ),
              selectedUser:
                state.selectedUser && ((state.selectedUser._id || state.selectedUser.id) === userId)
                  ? { ...state.selectedUser, ...response.data.data }
                  : state.selectedUser,
              usersLoading: false,
            }));

            // Refresh users list
            await get().fetchUsers();
            return { success: true, message: response.data.message };
          } else {
            throw new Error(response?.data?.message || 'Failed to update user');
          }
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to update user';
          set({ usersError: errorMessage, usersLoading: false });
          return { success: false, message: errorMessage };
        }
      },

      deleteUser: async (userId: string, reason = '') => {
        set({ usersLoading: true, usersError: null });
        try {
          const payload = {
            id: userId,
            deleteRemark: reason || 'User no longer active',
          };

          const response = await apiRequest<any>(
            'DELETE',
            API_ENDPOINTS.DELETE_ADMIN_USERS,
            payload
          );

          if (response?.data?.success) {
            // Remove from list
            set((state) => ({
              users: state.users.filter(
                (user) => (user._id || user.id) !== userId
              ),
              selectedUser:
                state.selectedUser && ((state.selectedUser._id || state.selectedUser.id) === userId)
                  ? null
                  : state.selectedUser,
              usersLoading: false,
            }));

            // Refresh users list
            await get().fetchUsers();
            return { success: true, message: response.data.message };
          } else {
            throw new Error(response?.data?.message || 'Failed to delete user');
          }
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to delete user';
          set({ usersError: errorMessage, usersLoading: false });
          return { success: false, message: errorMessage };
        }
      },

      // Utility actions
      setUsersLoading: (loading) => {
        set({ usersLoading: loading });
      },

      setUsersError: (error) => {
        set({ usersError: error });
      },
    }),
    { name: 'UserStore' }
  )
);
