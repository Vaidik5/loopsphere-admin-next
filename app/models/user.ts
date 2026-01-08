// Simple user types for UI display only
export interface User {
  id: string; // _id
  _id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name: string; // Composite of firstName + lastName
  avatar?: string;
  image?: string | { fileName: string }; // From API
  mobileNumber?: string;
  isdCode?: string;
  role?: string | { id: string; name: string; isProtected?: boolean; [key: string]: any };
  status?: string | { code: 'active' | 'inactive' | 'pending' | 'deleted'; label: string };
  createdAt?: string; // Optional if not present
  lastSignInAt?: string; // Optional if not present
  emailVerifiedAt?: string;
  isTrashed?: boolean;
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
  status: 'active'
};
