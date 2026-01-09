import axios, { AxiosRequestConfig, AxiosResponse, Method } from 'axios';
import { AuthModel } from '@/types/auth'; // Ensure this path matches where you put AuthModel
import { API_ENDPOINTS } from './api-endpoints';
import * as authHelper from './auth-helpers';

// Common API request function
export const apiRequest = async <T>(
  method: Method,
  url: string,
  data?: any,
  contentType: 'application/json' | 'multipart/form-data' = 'application/json',
  config: AxiosRequestConfig = {},
): Promise<AxiosResponse<T>> => {
  const tokenInfo = authHelper.getAuth();

  // Logic to extract token - supporting both patterns seen in source
  const accessToken = tokenInfo?.data?.accessToken || tokenInfo?.access_token;

  // We only throw if we absolutely need auth and don't have it?
  // The original code throws immediately. Checks specific endpoints? No, it just throws.
  // Assuming this helper is only for protected routes.

  // Note: For login/register we might call axios directly or handle the "no token" case.
  // But strictly following the source, it checks generic presence.
  // HOWEVER, for login, we don't have a token yet. The source uses axios directly for login.

  const headers: Record<string, any> = {
    ...config.headers,
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  // Only set Content-Type for application/json; for multipart/form-data, let axios handle it
  if (contentType === 'application/json') {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await axios({
      method,
      url,
      data,
      headers,
      ...config,
    });

    return response;
  } catch (error: any) {
    console.error(
      'apiRequest error:',
      error.response || error.message || error,
    );
    if (error.response?.status === 401) {
      try {
        const newAuth = await refreshAccessToken();
        const newAccessToken =
          newAuth?.data?.accessToken || newAuth?.access_token;

        if (newAccessToken) {
          headers.Authorization = `Bearer ${newAccessToken}`;
          if (contentType === 'application/json') {
            headers['Content-Type'] = 'application/json';
          }
          const retryResponse = await axios({
            method,
            url,
            data,
            headers,
            ...config,
          });
          return retryResponse;
        }
      } catch (refreshError) {
        // If refresh fails, we might want to logout
        authHelper.removeAuth();
        throw refreshError;
      }
    }
    throw error;
  }
};

export const refreshAccessToken = async (): Promise<AuthModel> => {
  const token = authHelper.getAuth();
  const refreshToken = token?.data?.refreshToken || token?.refreshToken;

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await axios.post<AuthModel>(
      API_ENDPOINTS.ADMIN_REFRESH_TOKEN,
      {
        refreshToken: refreshToken,
        identifier: 'device-uuid',
      },
    );
    authHelper.setAuth(response.data);
    return response.data;
  } catch (error) {
    console.error('refreshAccessToken error:', error);
    authHelper.removeAuth();
    throw new Error('Failed to refresh token');
  }
};
