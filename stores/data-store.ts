import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Country, ClientOption, BusinessUnitOption, Role } from './types';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import { apiRequest } from '@/lib/api-request';

interface DataState {
  // Countries
  countries: Country[];
  filteredCountries: Country[];
  countriesLoading: boolean;
  countriesError: string | null;

  // Clients
  clients: ClientOption[];
  clientsLoading: boolean;
  clientsError: string | null;

  // Business Units (cached by clientId)
  businessUnitsCache: Record<string, BusinessUnitOption[]>;
  businessUnitsLoading: boolean;
  businessUnitsError: string | null;

  // Admin User (current)
  currentAdmin: any | null;
  currentAdminLoading: boolean;
  currentAdminError: string | null;

  // Actions - Countries
  fetchCountries: () => Promise<void>;
  setFilteredCountries: (countries: Country[]) => void;
  filterCountries: (search: string) => void;

  // Actions - Clients
  fetchClients: () => Promise<void>;
  clearClients: () => void;

  // Actions - Business Units
  fetchBusinessUnits: (clientId: string) => Promise<void>;
  clearBusinessUnits: (clientId?: string) => void;
  getBusinessUnits: (clientId: string) => BusinessUnitOption[];

  // Actions - Admin User
  fetchCurrentAdmin: () => Promise<void>;
  clearCurrentAdmin: () => void;

  //Roles

  roles: Role[];
  rolesLoading: boolean;
  rolesError: string | null;
  fetchRoles: () => Promise<void>;
}

export const useDataStore = create<DataState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        countries: [],
        filteredCountries: [],
        countriesLoading: false,
        countriesError: null,

        clients: [],
        clientsLoading: false,
        clientsError: null,

        businessUnitsCache: {},
        businessUnitsLoading: false,
        businessUnitsError: null,

        currentAdmin: null,
        currentAdminLoading: false,
        currentAdminError: null,

        roles: [],
        rolesLoading: false,
        rolesError: null,

        fetchRoles: async () => {
          set({ rolesLoading: true, rolesError: null });

          try {
            const response = await apiRequest<any>('GET', API_ENDPOINTS.GET_ROLES);
            if (response?.data?.success) {

              const allRoles = response.data.data.map((role: any) => ({
                ...role,
                status: role.status || { code: 'active', label: 'Active' },
              }));
              set({ roles: allRoles, rolesLoading: false });
              console.log('Fetched Roles:', allRoles);
            } else {
              throw new Error('Failed to fetch roles');
            }
          } catch (error: any) {
            set({
              rolesError: error.message || 'Failed to fetch roles',
              rolesLoading: false,
            });
          }
        },


        // Countries actions
        fetchCountries: async () => {
          set({ countriesLoading: true, countriesError: null });
          try {
            const response = await apiRequest<any>('GET', API_ENDPOINTS.GET_ALL_COUNTRY);
            if (response?.data?.success) {
              const allCountries = response.data.data.map((country: any) => ({
                ...country,
                flag: country.flag || '',
              }));
              set({
                countries: allCountries,
                filteredCountries: allCountries,
                countriesLoading: false,
              });
            } else {
              throw new Error('Failed to fetch countries');
            }
          } catch (error: any) {
            set({
              countriesError: error.message || 'Failed to fetch countries',
              countriesLoading: false,
            });
          }
        },

        setFilteredCountries: (countries: Country[]) => {
          set({ filteredCountries: countries });
        },

        filterCountries: (search: string) => {
          const state = get();
          const searchLower = search.toLowerCase();
          const filtered = state.countries.filter(
            (c) =>
              c.name.toLowerCase().includes(searchLower) ||
              c.isdCode.includes(search)
          );
          set({ filteredCountries: filtered });
        },

        // Clients actions
        fetchClients: async () => {
          set({ clientsLoading: true, clientsError: null });
          try {
            const response = await apiRequest<any>('GET', API_ENDPOINTS.PANAROMA_CLIENT_LIST);
          console.log('Fetched Clients Response:', response);
            if (response?.data?.data) {
              const clientList = response.data.data.map((item: any) => ({
                id: item._id || item.id,
                name: `${item.firstName || ''} ${item.lastName || ''}`.trim() || item.companyName || 'Client',
              }));
              set({ clients: clientList, clientsLoading: false });
            } else {
              throw new Error('Failed to fetch clients');
            }
          } catch (error: any) {
            set({
              clientsError: error.message || 'Failed to fetch clients',
              clientsLoading: false,
            });
          }
        },

        clearClients: () => {
          set({ clients: [], clientsError: null });
        },

        // Business Units actions
        fetchBusinessUnits: async (clientId: string) => {
          if (!clientId) {
            set({ businessUnitsCache: {}, businessUnitsError: null });
            return;
          }

          // Check cache first
          // const cached = get().businessUnitsCache[clientId];
          // if (cached && cached.length > 0) {
          //   return;
          // }

          set({ businessUnitsLoading: true, businessUnitsError: null });
          try {
            const response = await apiRequest<any>(
              'GET',
              `${API_ENDPOINTS.GET_BY_CLIENT_BUSINESS}/${clientId}`
            );
            if (response?.data?.data) {
              const buList = response.data.data.map((item: any) => ({
                id: item._id || item.id,
                name: item.name,
              }));
              set((state) => ({
                businessUnitsCache: {
                  ...state.businessUnitsCache,
                  [clientId]: buList,
                },
                businessUnitsLoading: false,
              }));
            } else {
              set((state) => ({
                businessUnitsCache: {
                  ...state.businessUnitsCache,
                  [clientId]: [],
                },
                businessUnitsLoading: false,
              }));
            }
          } catch (error: any) {
            set({
              businessUnitsError: error.message || 'Failed to fetch business units',
              businessUnitsLoading: false,
            });
          }
        },

        getBusinessUnits: (clientId: string) => {
          return get().businessUnitsCache[clientId] || [];
        },

        clearBusinessUnits: (clientId?: string) => {
          if (clientId) {
            set((state) => {
              const newCache = { ...state.businessUnitsCache };
              delete newCache[clientId];
              return { businessUnitsCache: newCache };
            });
          } else {
            set({ businessUnitsCache: {} });
          }
        },

        // Admin User actions
        fetchCurrentAdmin: async () => {
          set({ currentAdminLoading: true, currentAdminError: null });
          try {
            const response = await apiRequest<any>('GET', API_ENDPOINTS.ADMIN_GET_USER);
            set({
              currentAdmin: response.data,
              currentAdminLoading: false,
            });
          } catch (error: any) {
            set({
              currentAdminError: error.message || 'Failed to fetch admin user',
              currentAdminLoading: false,
            });
          }
        },

        clearCurrentAdmin: () => {
          set({ currentAdmin: null, currentAdminError: null });
        },
      }),
      {
        name: 'data-storage',
        partialize: (state) => ({
          countries: state.countries,
          clients: state.clients,
          businessUnitsCache: state.businessUnitsCache,
          currentAdmin: state.currentAdmin,
        }),
      }
    ),
    { name: 'DataStore' }
  )
);
