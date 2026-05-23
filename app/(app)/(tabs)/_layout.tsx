import { Tabs, usePathname } from 'expo-router';
import { BottomNav, NavTab } from '../../../src/ui/composites/BottomNav';

const TAB_BY_PATH: Record<string, NavTab> = {
  '/': 'home',
  '/groups': 'groups',
  '/buscar-jogos': 'marketplace',
  '/marketplace': 'marketplace',
  '/profile': 'profile',
};

export default function TabsLayout() {
  const pathname = usePathname();
  const active = TAB_BY_PATH[pathname] ?? 'home';

  return (
    <Tabs
      tabBar={() => <BottomNav active={active} />}
      screenOptions={{ headerShown: false }}
    />
  );
}
