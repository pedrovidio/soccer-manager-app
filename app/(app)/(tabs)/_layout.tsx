import { Tabs, usePathname } from 'expo-router';
import { BottomNav, NavTab } from '@ui/composites/BottomNav';
import { Arena } from '@ui/tokens/theme';

const TAB_BY_PATH: Record<string, NavTab> = {
  '/': 'home',
  '/groups': 'groups',
  '/marketplace': 'marketplace',
  '/ranking': 'ranking',
  '/financial': 'financial',
  '/profile': 'profile',
};

export default function TabsLayout() {
  const pathname = usePathname();
  const active = TAB_BY_PATH[pathname] ?? 'home';

  return (
    <Tabs
      tabBar={() => <BottomNav active={active} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: Arena.bg } }}
    />
  );
}
