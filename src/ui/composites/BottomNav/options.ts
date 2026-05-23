import { Ionicons } from '@expo/vector-icons';

export type NavTab = 'home' | 'groups' | 'marketplace' | 'financial' | 'profile';

export const NAV_ROUTES: Record<NavTab, string> = {
  home: '/',
  groups: '/groups',
  marketplace: '/marketplace',
  financial: '/athlete-finance',
  profile: '/profile',
};

export type NavItem = {
  key: NavTab;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
};

export const NAV_ITEMS: NavItem[] = [
  { key: 'home', label: 'Inicio', icon: 'home-outline', iconActive: 'home' },
  { key: 'groups', label: 'Grupos', icon: 'people-outline', iconActive: 'people' },
  { key: 'marketplace', label: 'Buscar jogos', icon: 'football-outline', iconActive: 'football' },
  { key: 'financial', label: 'Financeiro', icon: 'wallet-outline', iconActive: 'wallet' },
  { key: 'profile', label: 'Perfil', icon: 'person-outline', iconActive: 'person' },
];
