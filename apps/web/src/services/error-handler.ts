export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    // We can tie this to a toast notification store here later
    console.error(`[API Error ${error.code}]: ${error.message}`);
    return error;
  }
  
  if (error instanceof Error) {
    console.error(`[Unexpected Error]: ${error.message}`);
    return error;
  }
  
  return new Error('An unknown error occurred');
}
