import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Settings } from '@/config/types';
import { APP_SETTINGS } from '@/config/settings.config';

interface SettingsState {
  settings: Settings;

  // Theme
  theme: 'light' | 'dark' | 'system';
  themeMode: 'light' | 'dark';

  // Actions - Settings
  getOption: <T = any>(path: string) => T;
  setOption: <T = any>(path: string, value: T) => void;
  storeOption: <T = any>(path: string, value: T) => void;
  resetSettings: () => void;

  // Actions - Theme
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setThemeMode: (mode: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

function getFromPath(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
}

function setToPath(obj: any, path: string, value: any): Settings {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  const lastObj = keys.reduce((acc, key) => (acc[key] ??= {}), obj);
  lastObj[lastKey] = value;
  return { ...obj };
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: structuredClone(APP_SETTINGS),
      theme: 'system',
      themeMode: 'light',

      getOption: <T,>(path: string): T => {
        return getFromPath(get().settings, path) as T;
      },

      setOption: <T,>(path: string, value: T) => {
        set((state) => ({
          settings: setToPath({ ...state.settings }, path, value),
        }));
      },

      storeOption: <T,>(path: string, value: T) => {
        if (typeof window === 'undefined') return;

        set((state) => {
          const newSettings = setToPath({ ...state.settings }, path, value);
          try {
            localStorage.setItem(
              `app_settings_${path}`,
              JSON.stringify(value)
            );
          } catch (err) {
            console.error('LocalStorage write error:', err);
          }
          return { settings: newSettings };
        });
      },

      resetSettings: () => {
        set({ settings: structuredClone(APP_SETTINGS) });
        // Clear all stored settings from localStorage
        if (typeof window !== 'undefined') {
          Object.keys(localStorage)
            .filter((key) => key.startsWith('app_settings_'))
            .forEach((key) => localStorage.removeItem(key));
        }
      },

      setTheme: (theme) => {
        set({ theme });
        if (theme !== 'system') {
          set({ themeMode: theme });
        } else {
          // Detect system preference
          if (typeof window !== 'undefined') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            set({ themeMode: prefersDark ? 'dark' : 'light' });
          }
        }
      },

      setThemeMode: (mode) => {
        set({ themeMode: mode });
      },

      toggleTheme: () => {
        const currentMode = get().themeMode;
        const newMode = currentMode === 'light' ? 'dark' : 'light';
        set({ themeMode: newMode, theme: newMode });
      },
    }),
    {
      name: 'settings-storage',
      partialize: (state) => ({
        settings: state.settings,
        theme: state.theme,
        themeMode: state.themeMode,
      }),
    }
  )
);
