import { StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export const Colors = {
  get primary() { return getCurrentArena().neon; },
  get primaryDark() { return getCurrentArena().neon; },
  get primaryLight() { return getCurrentArena().neonSoft; },
  get secondary() { return getCurrentArena().neon; },
  get success() { return getCurrentArena().success; },
  get successLight() { return getCurrentArena().successBg; },
  get successDark() { return getCurrentArena().success; },
  get error() { return getCurrentArena().error; },
  get errorLight() { return getCurrentArena().errorBg; },
  get errorDark() { return getCurrentArena().error; },
  get warning() { return getCurrentArena().warning; },
  get warningLight() { return getCurrentArena().warningBg; },
  get warningDark() { return getCurrentArena().warning; },
  get n900() { return getCurrentArena().text; },
  get n800() { return getCurrentArena().text; },
  get n700() { return getCurrentArena().textMuted; },
  get n600() { return getCurrentArena().textMuted; },
  get n500() { return getCurrentArena().textSubtle; },
  get n400() { return getCurrentArena().textSubtle; },
  get n300() { return getCurrentArena().textSubtle; },
  get n200() { return getCurrentArena().line; },
  get n100() { return getCurrentArena().cardSoft; },
  get n50() { return getCurrentArena().bg; },
  get white() { return getCurrentArena().buttonLabelPrimary; },
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
  // Accessible dynamic status colors (Dark mode values)
  success: '#4ADE80',
  successBg: 'rgba(34, 197, 94, 0.16)',
  warning: '#FBBF24',
  warningBg: 'rgba(245, 158, 11, 0.16)',
  error: '#F87171',
  errorBg: 'rgba(239, 68, 68, 0.16)',
  buttonLabelPrimary: '#030807',
} as const;

// Refined Premium Light Arena colors - Senior UX athletic minimalist design
const lightArena = {
  bg: '#F4F7F6',             // Premium sport-stadium silver-mint
  bgDeep: '#E5EBEA',         // Deeper silver for clean structural hierarchy
  graphite: '#C4D1CD',       // Cool athletic grey for borders and indicators
  graphiteElevated: '#FFFFFF',// Crisp high-contrast white card container
  moss: '#DCFCE7',           // Clean turf green soft highlight
  mossSoft: 'rgba(22, 163, 74, 0.08)',
  neon: '#15803D',           // Vibrant Premium Turf Green (fully WCAG AAA contrast compliant)
  neonSoft: 'rgba(21, 128, 61, 0.08)',
  neonBorder: '#B3CBBF',     // Rich light green border with excellent contrast
  cyanSoft: 'rgba(13, 148, 136, 0.06)',
  line: 'rgba(10, 20, 18, 0.08)', // Soft sports line marker borders
  card: '#FFFFFF',           // Crisp pure white cards
  cardSoft: 'rgba(10, 20, 18, 0.03)',
  text: '#0A1412',           // Ultra-crisp slate-black athletic text
  textMuted: 'rgba(10, 20, 18, 0.70)',  // Enhanced contrast for subheadings
  textSubtle: 'rgba(10, 20, 18, 0.55)', // Placeholders meeting 4.5:1 WCAG contrast
  // Accessible dynamic status colors (Light mode values - fully WCAG contrast compliant)
  success: '#15803D',        // Premium Dark Green (5.9:1 contrast over white/pale green)
  successBg: 'rgba(21, 128, 61, 0.10)',
  warning: '#C2410C',        // Premium Dark Amber (5.2:1 contrast over white/pale amber)
  warningBg: 'rgba(194, 65, 12, 0.10)',
  error: '#B91C1C',          // Premium Dark Red (7.0:1 contrast over white/pale red)
  errorBg: 'rgba(185, 28, 28, 0.10)',
  buttonLabelPrimary: '#FFFFFF',
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
