export interface StandardResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    cursor?: string | null;
    page?: number;
    limit?: number;
    total?: number;
  };
  code?: string;
  errors?: any[];
}

export function successResponse<T>(
  message: string,
  data?: T,
  pagination?: StandardResponse['pagination']
): StandardResponse<T> {
  return {
    success: true,
    message,
    data,
    pagination,
  };
}

export function errorResponse(
  message: string,
  code: string = 'INTERNAL_ERROR',
  errors: any[] = []
): StandardResponse {
  return {
    success: false,
    message,
    code,
    errors,
  };
}
