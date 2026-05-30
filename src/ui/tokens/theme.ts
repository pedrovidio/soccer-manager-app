import { StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export const Colors = {
  primary: '#2F68FF',
  primaryDark: '#1C4FCC',
  primaryLight: '#E8EFFE',
  secondary: '#1C3FAA',
  success: '#22C55E',
  successLight: '#DCFCE7',
  successDark: '#15803D',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  errorDark: '#B91C1C',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  warningDark: '#B45309',
  n900: '#111827',
  n800: '#1F2937',
  n700: '#374151',
  n600: '#4B5563',
  n500: '#6B7280',
  n400: '#9CA3AF',
  n300: '#D1D5DB',
  n200: '#E5E7EB',
  n100: '#F3F4F6',
  n50: '#F9FAFB',
  white: '#FFFFFF',
} as const;

// Original dark colors (existing Arena)
const darkArena = {
  bg: '#06100F',
  bgDeep: '#030807',
  graphite: '#0C1518',
  graphiteElevated: '#121A1B',
  moss: '#23351F',
  mossSoft: 'rgba(54, 88, 45, 0.36)',
  neon: '#D7FF45',
  neonSoft: 'rgba(215, 255, 69, 0.14)',
  neonBorder: 'rgba(215, 255, 69, 0.26)',
  cyanSoft: 'rgba(37, 85, 98, 0.34)',
  line: 'rgba(255, 255, 255, 0.10)',
  card: 'rgba(18, 26, 27, 0.94)',
  cardSoft: 'rgba(255, 255, 255, 0.07)',
  text: '#F8FAFC',
  textMuted: 'rgba(248, 250, 252, 0.68)',
  textSubtle: 'rgba(248, 250, 252, 0.48)',
} as const;

// Refined Premium Light Arena colors - Senior UX athletic minimalist design
const lightArena = {
  bg: '#F3F6F5',             // Premium sport-stadium silver-mint
  bgDeep: '#E8ECEB',         // Deeper silver for clean structural hierarchy
  graphite: '#D2DCDA',       // Cool athletic grey for borders and indicators
  graphiteElevated: '#FFFFFF',// Crisp high-contrast white card container
  moss: '#DCFCE7',           // Clean turf green soft highlight
  mossSoft: 'rgba(22, 163, 74, 0.08)',
  neon: '#16A34A',           // Vibrant athletic turf green (fully contrast compliant)
  neonSoft: 'rgba(22, 163, 74, 0.06)',
  neonBorder: 'rgba(22, 163, 74, 0.16)',
  cyanSoft: 'rgba(13, 148, 136, 0.06)',
  line: 'rgba(10, 17, 16, 0.08)', // Soft sports line marker borders
  card: '#FFFFFF',           // Crisp pure white cards
  cardSoft: 'rgba(10, 17, 16, 0.03)',
  text: '#091211',           // Ultra-crisp slate-black athletic text
  textMuted: 'rgba(9, 18, 17, 0.65)',
  textSubtle: 'rgba(9, 18, 17, 0.45)',
} as const;

export interface ThemeStore {
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: 'dark',
  setTheme: (theme) => {
    set({ theme });
    AsyncStorage.setItem('app_theme', theme).catch(() => {});
  },
}));

// Hydrate selected theme from storage
AsyncStorage.getItem('app_theme')
  .then((savedTheme) => {
    if (savedTheme === 'light' || savedTheme === 'dark') {
      useThemeStore.setState({ theme: savedTheme as 'light' | 'dark' });
    }
  })
  .catch(() => {});

export function getCurrentArena() {
  const theme = useThemeStore.getState().theme;
  return theme === 'light' ? lightArena : darkArena;
}

// Map each dark theme color value back to its key in darkArena for dynamic theme switching in StyleSheet.create
const colorToKeyMap: { [color: string]: keyof typeof darkArena } = {};
for (const key in darkArena) {
  if (Object.prototype.hasOwnProperty.call(darkArena, key)) {
    const val = darkArena[key as keyof typeof darkArena];
    colorToKeyMap[val] = key as keyof typeof darkArena;
    colorToKeyMap[val.toLowerCase()] = key as keyof typeof darkArena;
    colorToKeyMap[val.toUpperCase()] = key as keyof typeof darkArena;
  }
}

// Overwrite StyleSheet.create to return plain objects with dynamic getters, mapping dark color values to active theme colors in real time
StyleSheet.create = function <T extends StyleSheet.NamedStyles<T>>(styles: T): T {
  const result: any = {};
  for (const key in styles) {
    if (Object.prototype.hasOwnProperty.call(styles, key)) {
      const originalStyleObj = styles[key];
      Object.defineProperty(result, key, {
        configurable: true,
        enumerable: true,
        get() {
          const resolved: any = {};
          for (const styleProp in originalStyleObj) {
            if (Object.prototype.hasOwnProperty.call(originalStyleObj, styleProp)) {
              const val = originalStyleObj[styleProp];
              if (typeof val === 'string') {
                const themeKey = colorToKeyMap[val];
                if (themeKey) {
                  resolved[styleProp] = getCurrentArena()[themeKey];
                } else {
                  resolved[styleProp] = val;
                }
              } else {
                resolved[styleProp] = val;
              }
            }
          }
          return resolved;
        }
      });
    }
  }
  return result;
} as any;

// Export Arena as a dynamic live proxy that resolves theme colors at render time
export const Arena = new Proxy({} as typeof darkArena, {
  get(target, prop) {
    const key = prop as keyof typeof darkArena;
    return getCurrentArena()[key];
  },
});

export const Radius = { r4: 4, r8: 8, r12: 12, r16: 16, r24: 24, r999: 999 } as const;
export const Spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 } as const;
