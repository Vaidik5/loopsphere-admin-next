# Zustand State Management

This project uses Zustand for state management across the entire application. All state variables are managed through centralized stores.

## Store Structure

### 1. Auth Store (`auth-store.ts`)
Manages authentication state:
- User information
- Login/logout functionality
- Authentication status
- Persists auth state to localStorage

**Usage:**
```typescript
import { useAuthStore } from '@/stores';

const { user, isAuthenticated, login, logout, fetchUser } = useAuthStore();
```

### 2. Data Store (`data-store.ts`)
Manages API data caching:
- Countries list
- Clients list
- Business units (cached by client ID)
- Current admin user
- Filtered countries for search

**Usage:**
```typescript
import { useDataStore } from '@/stores';

const {
  countries,
  filteredCountries,
  clients,
  fetchCountries,
  fetchClients,
  fetchBusinessUnits,
  getBusinessUnits,
  filterCountries,
} = useDataStore();
```

### 3. Form Store (`form-store.ts`)
Manages form state for user add/edit:
- Form field values
- Image files
- Country search
- Select dropdown state
- Original values (for edit mode)

**Usage:**
```typescript
import { useUserFormStore } from '@/stores';

const {
  countrySearch,
  selectIsdOpen,
  imageFiles,
  setCountrySearch,
  setSelectIsdOpen,
  setImageFiles,
  setField,
  reset,
} = useUserFormStore();
```

### 4. UI Store (`ui-store.ts`)
Manages UI state:
- Sidebar open/collapsed
- Mobile menu state
- Dialog/modal open states
- Toast notifications
- Global loading state

**Usage:**
```typescript
import { useUIStore } from '@/stores';

const {
  sidebarOpen,
  toggleSidebar,
  setUserAddDialogOpen,
  addToast,
  setGlobalLoading,
} = useUIStore();
```

### 5. Table Store (`table-store.ts`)
Manages table state:
- Pagination
- Sorting
- Filtering/search
- Column visibility and order
- Row selection

**Usage:**
```typescript
import { useTableStore } from '@/stores';

const {
  pagination,
  sorting,
  filters,
  setPagination,
  setSorting,
  setSearchQuery,
} = useTableStore();
```

### 6. User Store (`user-store.ts`)
Manages user CRUD operations:
- Users list
- Selected user
- Add/Update/Delete operations
- Loading and error states

**Usage:**
```typescript
import { useUserStore } from '@/stores';

const {
  users,
  selectedUser,
  usersLoading,
  fetchUsers,
  addUser,
  updateUser,
  deleteUser,
} = useUserStore();
```

### 7. Settings Store (`settings-store.ts`)
Manages app settings:
- Theme (light/dark/system)
- App configuration settings
- Persistent settings via localStorage

**Usage:**
```typescript
import { useSettingsStore } from '@/stores';

const {
  theme,
  themeMode,
  settings,
  setTheme,
  toggleTheme,
  getOption,
  setOption,
} = useSettingsStore();
```

## Migration Guide

### Before (using useState/useEffect):
```typescript
const [countries, setCountries] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  fetchCountries().then(setCountries);
}, []);
```

### After (using Zustand):
```typescript
const { countries, countriesLoading, fetchCountries } = useDataStore();

useEffect(() => {
  if (countries.length === 0) {
    fetchCountries();
  }
}, []);
```

### Component State Migration

**Before:**
```typescript
const [searchQuery, setSearchQuery] = useState('');
const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
```

**After:**
```typescript
const { filters, setSearchQuery, pagination, setPagination } = useTableStore();
// Access: filters.searchQuery instead of searchQuery
```

## Best Practices

1. **Always use stores for shared state** - If state is used in multiple components, use a store
2. **Use local state only for truly local state** - UI-only state that doesn't need persistence
3. **Keep stores focused** - Each store should manage a specific domain
4. **Use selectors for performance** - If accessing large stores, use selectors:
   ```typescript
   const countries = useDataStore((state) => state.countries);
   ```
5. **Reset state on unmount** - Use cleanup functions or reset actions when appropriate

## Store Persistence

Stores with `persist` middleware automatically save to localStorage:
- `auth-storage` - Authentication state
- `data-storage` - Cached API data
- `table-storage` - Table state
- `ui-storage` - UI preferences
- `settings-storage` - App settings

## Development Tools

Stores use Zustand DevTools for debugging. Install Redux DevTools browser extension to inspect store state and actions.
