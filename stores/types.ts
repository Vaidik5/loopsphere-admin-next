// Common types for Zustand stores

export interface Country {
  _id: string;
  name: string;
  isdCode: string;
  flag?: string;
}

// export interface Pagination{
// currentPage: number;
// totalPages: number;
// totalRecords:number
// }

export interface Client {
  _id: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
}

export interface ClientOption {
  id: string;
  name: string;
}

export interface BusinessUnit {
  _id: string;
  name: string;
}

export interface BusinessUnitOption {
  id: string;
  name: string;
}

export interface AdminUser {
  _id: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  isdCode: string;
  countryId: string;
  role:Role | string;
  isdCodeCountryId?: string;
  status: string | { code: string; label: string };
  clientId?: string;
  businessUnitId?: string;
  image?: any;
}

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface SortingState {
  id: string;
  desc: boolean;
}

export interface TableFilters {
  searchQuery: string;
  [key: string]: any;
}

export interface ImageInputFile {
  dataURL?: string;
  file?: File;
  [key: string]: any;
}

export interface Role {
_id: string;
name: string;
description?: string;
permissions: string;
status:{ code: string; label: string };

}