import { useCallback, useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GROUP_TOP_MENU_ITEMS } from './menuItems';
import { GroupTopMenuItem, GroupTopMenuTab } from './types';

type Params = {
  active: GroupTopMenuTab;
  groupId: string;
  showFinance: boolean;
};

export function useGroupTopMenu({ active, groupId, showFinance }: Params) {
  const router = useRouter();
  const { prevTab } = useLocalSearchParams<{ prevTab?: string }>();

  const items = useMemo(
    () => showFinance ? GROUP_TOP_MENU_ITEMS : GROUP_TOP_MENU_ITEMS.filter((item) => item.key !== 'finance'),
    [showFinance],
  );

  const navigate = useCallback((item: GroupTopMenuItem) => {
    if (active === item.key) return;
    router.replace({ pathname: item.pathname as any, params: { groupId, prevTab: active } });
  }, [active, groupId, router]);

  return { items, navigate, prevTab };
}
