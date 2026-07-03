import { useAuthStore } from '../modules/auth/store/auth.store';

export class ApiError extends Error {
  public status: number;
  public code: string;
  public details?: any;

  constructor(message: string, status: number, code: string = 'API_ERROR', details?: any) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
    this.name = 'ApiError';
  }
}

const getBaseUrl = () => {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().accessToken;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${getBaseUrl()}${endpoint}`, {
    ...options,
    headers,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid
      useAuthStore.getState().logout();
    }
    
    // Fastify API returns { success: false, message: string, code: string, errors: any }
    const message = data?.message || response.statusText || 'An unexpected error occurred';
    const code = data?.code || 'UNKNOWN_ERROR';
    throw new ApiError(message, response.status, code, data?.errors || data?.details);
  }

  // Fastify API returns { success: true, message: string, data: T }
  return data?.data !== undefined ? data.data : data;
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body: any, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: any, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'DELETE' }),
};
