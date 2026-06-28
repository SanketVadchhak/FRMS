import { useAuthStore } from '@/stores';

export async function requestInterceptor(config: RequestInit): Promise<RequestInit> {
  const token = useAuthStore.getState().accessToken;
  
  const headers = new Headers(config.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  headers.set('Content-Type', 'application/json');

  return {
    ...config,
    headers,
  };
}

export async function responseInterceptor(response: Response): Promise<Response> {
  if (response.status === 401) {
    // Logic for silent token refresh goes here (calling auth.service.ts refresh)
    // For now, if unauthorized, clear auth state
    useAuthStore.getState().clearAuth();
  }
  return response;
}
