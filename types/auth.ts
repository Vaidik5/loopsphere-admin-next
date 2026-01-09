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
  aspectRatio: string;
  mimeType: string;
}

export interface UserModel {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  image?: UserImage;
  // Add other user fields as necessary based on the API response
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
  imageData:ImageData;
}


export interface ChangePasswordDetails {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const changePasswordInitValues: ChangePasswordDetails = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export interface ImageData {
  fileName?: string;
  width: number;
  height: number;
  aspectRatio: string;
  mimeType: string;
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
  image: any,
   imageData:ImageData
}
export interface Country {
  _id: string;
  alpha2: string;
  name: string;
  isdCode: string;
  flag: string; 
}
