import { env } from '@/config/env';
import { requestInterceptor, responseInterceptor } from './interceptors';
import { ApiError } from './error-handler';
import type { ApiErrorResponse } from './api.types';

export class ApiClient {
  private static async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const config = await requestInterceptor(options);
    const url = `${env.VITE_API_BASE_URL}${endpoint}`;

    try {
      let response = await fetch(url, config);
      response = await responseInterceptor(response);

      if (!response.ok) {
        let errorData: ApiErrorResponse | null = null;
        try {
          errorData = await response.json();
        } catch {
          // ignore
        }
        
        throw new ApiError(
          response.status,
          errorData?.error?.code || 'UNKNOWN_ERROR',
          errorData?.error?.message || response.statusText,
          errorData?.error?.details
        );
      }

      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(0, 'NETWORK_ERROR', 'Failed to connect to the server');
    }
  }

  static get<T>(endpoint: string, options?: RequestInit) {
    return this.fetch<T>(endpoint, { ...options, method: 'GET' });
  }

  static post<T>(endpoint: string, data: unknown, options?: RequestInit) {
    return this.fetch<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static put<T>(endpoint: string, data: unknown, options?: RequestInit) {
    return this.fetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static delete<T>(endpoint: string, options?: RequestInit) {
    return this.fetch<T>(endpoint, { ...options, method: 'DELETE' });
  }
}
