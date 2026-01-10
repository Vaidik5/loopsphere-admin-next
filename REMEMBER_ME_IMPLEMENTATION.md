# Remember Me Functionality Implementation

This document describes the "Remember Me" functionality implementation in the Next.js project.

## Overview

The "Remember Me" feature allows users to stay logged in across browser sessions:
- **When checked**: Authentication tokens are stored in persistent cookies (30 days expiration) and email is saved to localStorage
- **When unchecked**: Authentication tokens are stored in session cookies (expire when browser closes) and no email is saved

## Implementation Details

### 1. Cookie Management (`lib/auth-helpers.ts`)

The `setAuth` function now accepts a `rememberMe` parameter:

```typescript
setAuth(auth: AuthModel, rememberMe: boolean = false)
```

**Behavior:**
- **rememberMe = true**: Cookies expire in 30 days (persistent)
- **rememberMe = false**: Session cookies with no expiration (temporary)
- Stores `rememberMe` preference in localStorage

### 2. Login Function (`lib/auth-api.ts`)

The `login` function accepts a `rememberMe` parameter:

```typescript
login(email: string, password: string, identifier: string, rememberMe: boolean)
```

### 3. Auth Provider (`providers/auth-provider.tsx`)

The `login` function now accepts and passes `rememberMe`:

```typescript
login(email: string, password: string, rememberMe: boolean = false)
```

### 4. Zustand Auth Store (`stores/auth-store.ts`)

The auth store includes `rememberMe` state:

```typescript
interface AuthState {
  rememberMe: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  setRememberMe: (rememberMe: boolean) => void;
}
```

### 5. Signin Form (`app/(auth)/signin/page.tsx`)

**Features:**
- Loads saved email from localStorage if `rememberMe` was previously checked
- Pre-checks "Remember me" checkbox if previously enabled
- Saves email to localStorage when `rememberMe` is checked
- Removes saved email when `rememberMe` is unchecked
- **Never saves passwords** - always requires user to enter password
- Passes `rememberMe` value to login function

**Default Values:**
- If `rememberMe` was previously true: loads saved email and checks checkbox
- Otherwise: uses default email `contact@loopbots.com` and unchecked checkbox

## Security Considerations

1. **Passwords are NEVER stored** - Only email addresses are saved for convenience
2. **Session cookies** - When `rememberMe` is unchecked, tokens expire when browser closes
3. **Persistent cookies** - When `rememberMe` is checked, tokens expire after 30 days
4. **Token refresh** - Refresh tokens are also managed based on `rememberMe` preference

## Usage

### In Signin Form

The form automatically handles rememberMe:

```typescript
const form = useForm<SigninSchemaType>({
  defaultValues: getSavedCredentials(), // Loads saved email if rememberMe was true
});

async function onSubmit(values: SigninSchemaType) {
  // Save email if rememberMe is checked
  if (values.rememberMe) {
    localStorage.setItem('savedEmail', values.email);
  } else {
    localStorage.removeItem('savedEmail');
  }

  // Login with rememberMe flag
  await login(values.email, values.password, values.rememberMe);
}
```

### Programmatically

```typescript
import { useAuthStore } from '@/stores';

const { login, rememberMe } = useAuthStore();

// Login with rememberMe
await login('user@example.com', 'password123', true); // true = remember me

// Check rememberMe status
console.log(rememberMe); // true or false
```

## Storage Keys

- **localStorage:**
  - `rememberMe` - Stores "true" or removed (boolean as string)
  - `savedEmail` - Stores user's email (only when rememberMe is true)
  - `auth-storage` - Zustand persisted auth state (includes rememberMe)

- **Cookies:**
  - `loopsphere-admin-access-token` - Access token (expires based on rememberMe)
  - `loopsphere-admin-refresh-token` - Refresh token (expires based on rememberMe)

## Cookie Expiration

- **Remember Me = true**: 30 days
- **Remember Me = false**: Session cookie (expires when browser closes)

## Logout Behavior

On logout:
- All cookies are cleared
- `rememberMe` is removed from localStorage
- `savedEmail` is removed from localStorage (if exists)
- Auth state is reset

## Testing

1. **Test with Remember Me checked:**
   - Login with rememberMe = true
   - Close browser completely
   - Reopen browser
   - Should still be logged in
   - Email should be pre-filled on signin page

2. **Test with Remember Me unchecked:**
   - Login with rememberMe = false
   - Close browser completely
   - Reopen browser
   - Should NOT be logged in (session expired)
   - Email should be pre-filled (default or previously saved)

3. **Test email persistence:**
   - Check "Remember me" and login
   - Email should be saved
   - Uncheck "Remember me" and login
   - Email should still be available (until manually cleared)
