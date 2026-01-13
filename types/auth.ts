export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AuthModel {
  data: any;
  access_token: string;
  refreshToken?: string;
  api_token: string;
}

export interface UserImage {
  fileName: string;
  width: number;
  height: number;
  url?: string;
  aspectRatio: string;
  mimeType?: string;
}

export interface UserModel {
  _id?: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber?: string;
  isdCode?: string;
  image?: UserImage;
  status?: Status;
  isdCodeCountry?: ISDCodeCountry;
  role?: Role;
  client?: Client;
  businessUnit?: BusinessUnit;
}

export interface UpdateModelRequest {
  newIsdCode: string;
  newCountryId: string;
  firstName: string;
  lastName: string;
  email: string;
  countryId: string;
  isdCode: string;
  mobileNumber: string;
  role: string;
  image: any;
  imageData: ImageData;
}

export interface ChangePasswordDetails {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const changePasswordInitValues: ChangePasswordDetails = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export interface ImageData {
  fileName?: string;
  width: number;
  height: number;
  aspectRatio: string;
  mimeType: string;
}

export interface Status {
  code: string;
  label: string;
}

export interface ISDCodeCountry {
  id: string;
  name: string;
}

export interface Role {
  id: string;
  name: string;
}

export interface Client {
  id: string;
  firstName?: string;
  lastName?: string;
}

export interface BusinessUnit {
  id: string;
  name?: string;
}

export interface UpdateModel {
  firstName: string;
  newIsdCode: string;
  newCountryId: string;
  lastName: string;
  email: string;
  countryId: string;
  isdCode: string;
  mobileNumber: string;
  image: any;
  imageData: ImageData;
}
export interface Country {
  _id: string;
  alpha2: string;
  name: string;
  isdCode: string;
  flag: string;
}
