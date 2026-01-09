import axios from 'axios';
import { ApiResponse, AuthModel, UserModel } from '@/types/auth'; // Ensure path
import { API_ENDPOINTS } from './api-endpoints';
import { apiRequest } from './api-request';
import * as authHelper from './auth-helpers';

export const login = async (
  email: string,
  password: string,
  identifier: string = 'device-uuid',
) => {
  const response = await axios.post<AuthModel>(API_ENDPOINTS.ADMIN_LOGIN, {
    email,
    password,
    identifier,
  });
  return response.data;
};

export const register = async (
  email: string,
  password: string,
  password_confirmation: string,
) => {
  const response = await axios.post<AuthModel>(API_ENDPOINTS.ADMIN_REGISTER, {
    email,
    password,
    password_confirmation,
  });
  return response.data;
};

export const getUser = async () => {
  // apiRequest handles token attachment
  const response = await apiRequest<ApiResponse<UserModel>>(
    'GET',
    API_ENDPOINTS.ADMIN_GET_USER,
  );
  return response.data.data;
};

export const requestPasswordResetLink = async (email: string) => {
  await axios.post(API_ENDPOINTS.ADMIN_FORGOT_PASSWORD, {
    email,
  });
};

export const changePassword = async (
  token: string,
  currentPassword: string,
  newPassword: string,
) => {
  const payload = {
    token,
    currentPassword,
    newPassword,
  };
  return await apiRequest('POST', API_ENDPOINTS.ADMIN_RESET_PASSWORD, payload);
};
