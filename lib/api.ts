import { NextRequest } from 'next/server';

/**
 * apiFetch - universal fetch for dev/prod that prefixes API calls with the correct base URL
 *
 * Usage:
 *   apiFetch('/users', { method: 'GET' })
 *   apiFetch('https://external.com/endpoint') // untouched
 */
export async function apiFetch(
  input: string | Request,
  init?: RequestInit,
): Promise<Response> {
  let url = input;

  // If input is a string and is a relative API path, prefix with base URL
  if (typeof input === 'string') {
    if (input.startsWith('/api/')) {
      // Remove leading slash to avoid double slashes
      url =
        process.env.NEXT_PUBLIC_BASE_PATH +
        (input.startsWith('/') ? input : '/' + input);
    }
  }
  // If input is a Request object, you could extend logic here if needed

  return fetch(url as RequestInfo, init);
}

// export const apiRequest = async <T>(
//   method: Method,
//   url: string,
//   data?: any,
//   contentType: 'application/json' | 'multipart/form-data' = 'application/json',
//   config: AxiosRequestConfig = {}
// ): Promise<AxiosResponse<T>> => {

//   const token = authHelper.getAuth();
//   if (!token?.data?.accessToken) {
//     throw new Error('No access token available');
//   }

//   const headers: Record<string, any> = {
//     ...config.headers,
//     Authorization: `Bearer ${token.data.accessToken}`,
//   };

//   // Only set Content-Type for application/json; for multipart/form-data, let axios handle it
//   if (contentType === 'application/json') {
//     headers['Content-Type'] = 'application/json';
//   }

//   try {
//     const response = await axios({
//       method,
//       url,
//       data,
//       headers,
//       ...config,
//     });

//     return response;
//   } catch (error: any) {
//     console.error('apiRequest error:', error.response || error.message || error);
//     if (error.response?.status === 401) {
//       const newAuth = await refreshAccessToken();
//       headers.Authorization = `Bearer ${newAuth.data.accessToken}`;
//       if (contentType === 'application/json') {
//         headers['Content-Type'] = 'application/json';
//       }
//       const retryResponse = await axios({
//         method,
//         url,
//         data,
//         headers,
//         ...config,
//       });
//       return retryResponse;
//     }
//     throw error;
//   }
// };


export function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    //|| request.socket.remoteAddress
    'unknown'
  );
}
