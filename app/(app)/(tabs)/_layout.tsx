import { Redirect, Tabs, usePathname } from 'expo-router';
import { useFeatureAccess } from '@features/app-config/hooks/useFeatureAccess';
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
  const marketplaceAccess = useFeatureAccess('MATCH_SEARCH');
  const rankingAccess = useFeatureAccess('RANKING_ACCESS');

  if (!marketplaceAccess.isLoading && active === 'marketplace' && !marketplaceAccess.hasAccess) {
    return <Redirect href="/" />;
  }

  if (!rankingAccess.isLoading && active === 'ranking' && !rankingAccess.hasAccess) {
    return <Redirect href="/" />;
  }

  return (
    <Tabs
      tabBar={() => <BottomNav active={active} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: Arena.bg } }}
    />
  );
}
