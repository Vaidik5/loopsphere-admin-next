// Simple user types for UI display only
export interface User {
  id: string; // _id
  _id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name: string; // Composite of firstName + lastName
  // UI-friendly avatar (string URL or relative path)
  avatar?: string;

  // Raw image object returned by API (or legacy string)
  image?:
    | string
    | {
        fileName?: string;
        width?: number;
        height?: number;
        aspectRatio?: string;
        url?: string; // absolute URL served by backend
        mimeType?: string;
      };

  mobileNumber?: string;
  isdCode?: string;
  emailVerified?: boolean;
  mobileVerified?: boolean;

  // Role may be a string or an object with id/name
  role?:
    | string
    | { id: string; name: string; isProtected?: boolean; [key: string]: any };

  // Status may be a simple string or an object with code/label
  status?:
    | string
    | { code: string; label: string };

  // Optional linked objects from API
  client?: { id: string; firstName?: string; lastName?: string };
  businessUnit?: { id: string; name?: string };
  isdCodeCountry?: { id: string; name?: string };

  createdAt?: string; // Optional if not present
  lastSignInAt?: string; // Optional if not present
  emailVerifiedAt?: string;
  isTrashed?: boolean;

  // Last access information (ISO string or null)
  lastAccessTime?: string | null;
  lastAccessIP?: string | null;

  // Backward-compatible ID fields
  countryId?: string;
  clientId?: string;
  businessUnitId?: string;
  roleId?: string; // Sometimes role is an ID string in a separate field
}

export type UserStatus = User['status'];

// Mock data for development
export const MOCK_USER: User = {
  id: '1',
  email: 'demo@kt.com',
  name: 'Demo User',
  avatar: '/media/avatars/300-2.png',
  role: 'admin',
  status: 'active',
};
