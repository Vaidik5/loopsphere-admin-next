import { AuthModel } from '@/types/auth';

const ACCESS_TOKEN_COOKIE = 'loopsphere-admin-access-token';
const REFRESH_TOKEN_COOKIE = 'loopsphere-admin-refresh-token';

// Helper to set a cookie
const setCookie = (name: string, value: string, days?: number) => {
  if (typeof window === 'undefined') return;
  
  // If days is undefined or 0, create a session cookie (expires when browser closes)
  // Otherwise, create a persistent cookie with expiration
  let expires = '';
  if (days && days > 0) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = '; expires=' + date.toUTCString();
  }
  
  document.cookie =
    name +
    '=' +
    (encodeURIComponent(value) || '') +
    expires +
    '; path=/; SameSite=Lax';
};

// Helper to get a cookie
const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0)
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
  }
  return null;
};

// Helper to remove a cookie
const deleteCookie = (name: string) => {
  if (typeof window === 'undefined') return;
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

export const getAuth = (): AuthModel | undefined => {
  try {
    const accessToken = getCookie(ACCESS_TOKEN_COOKIE);
    const refreshToken = getCookie(REFRESH_TOKEN_COOKIE);

    if (accessToken) {
      return {
        data: {
          accessToken,
          refreshToken,
        },
        access_token: accessToken,
        refreshToken: refreshToken || undefined,
        api_token: accessToken,
      };
    }
  } catch (error) {
    console.error('AUTH COOKIE PARSE ERROR', error);
  }
  return undefined;
};

export const setAuth = (auth: AuthModel, rememberMe: boolean = false, loginPayload?: Record<string, any>) => {
  try {
    // Try to find the tokens in various likely locations based on AuthModel or raw API response
    const accessToken =
      auth?.data?.accessToken || auth?.access_token || auth?.api_token;
    const refreshToken = auth?.data?.refreshToken || auth?.refreshToken;

    // If rememberMe is true, set cookies to expire in 30 days
    // If rememberMe is false, create session cookies (no expiration, expire when browser closes)
    const cookieExpirationDays = rememberMe ? 30 : undefined;

    if (accessToken) {
      setCookie(ACCESS_TOKEN_COOKIE, accessToken, cookieExpirationDays);
    }

    if (refreshToken) {
      setCookie(REFRESH_TOKEN_COOKIE, refreshToken, cookieExpirationDays);
    }

    // Store rememberMe preference in localStorage for reference
    if (typeof window !== 'undefined') {
      try {
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberMe');
        }
      } catch (e) {
        console.error('Failed to store rememberMe preference', e);
      }
    }

    // Store the full login payload in sessionStorage so it's available for this browser session
    // This keeps device info and other metadata available without creating persistent storage
    if (typeof window !== 'undefined' && loginPayload) {
      try {
        sessionStorage.setItem('loopsphere-login-payload', JSON.stringify(loginPayload));
      } catch (e) {
        console.error('Failed to store login payload in sessionStorage', e);
      }
    }
  } catch (error) {
    console.error('AUTH COOKIE SAVE ERROR', error);
  }
};

export const removeAuth = () => {
  try {
    deleteCookie(ACCESS_TOKEN_COOKIE);
    deleteCookie(REFRESH_TOKEN_COOKIE);
  } catch (error) {
    console.error('AUTH COOKIE REMOVE ERROR', error);
  }
};
