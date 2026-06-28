import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { THEME_CONFIG } from '@/config/theme';

type Theme = 'dark' | 'light' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: THEME_CONFIG.defaultTheme,
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: THEME_CONFIG.storageKey,
    }
  )
);
