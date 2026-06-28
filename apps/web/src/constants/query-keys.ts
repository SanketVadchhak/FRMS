export const QUERY_KEYS = {
  AUTH: {
    ME: ['auth', 'me'],
  },
  EMPLOYEES: {
    LIST: ['employees', 'list'],
    DETAIL: (id: string) => ['employees', 'detail', id],
  },
  USERS: {
    LIST: ['users', 'list'],
    DETAIL: (id: string) => ['users', 'detail', id],
  },
  // Add more as needed
} as const;
