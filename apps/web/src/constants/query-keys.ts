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
  SETTINGS: {
    COMPANY: ['settings', 'company'],
  },
  MACHINES: ['machines', 'list'],
  DESIGNS: ['designs', 'list'],
  PRODUCTION: {
    LIST: ['production', 'list'],
    DETAIL: (id: string) => ['production', 'detail', id],
  },
  ATTENDANCE: ['attendance', 'list'],
} as const;
