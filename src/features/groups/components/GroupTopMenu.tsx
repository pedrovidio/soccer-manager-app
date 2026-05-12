import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Radius, Spacing } from '../../common/theme';

type GroupTopMenuTab = 'summary' | 'members' | 'matches' | 'finance';

interface GroupTopMenuProps {
  groupId: string;
  active: GroupTopMenuTab;
  showFinance?: boolean;
}

const ITEMS: { key: GroupTopMenuTab; label: string; pathname: string }[] = [
  { key: 'summary', label: 'Resumo', pathname: '/group-home' },
  { key: 'members', label: 'Membros', pathname: '/group-members' },
  { key: 'matches', label: 'Jogos', pathname: '/group-matches' },
  { key: 'finance', label: 'Financeiro', pathname: '/group-finance' },
];

export function GroupTopMenu({ groupId, active, showFinance = true }: GroupTopMenuProps) {
  const router = useRouter();
  const items = showFinance ? ITEMS : ITEMS.filter((item) => item.key !== 'finance');

  return (
    <View style={s.wrap}>
      {items.map((item) => (
        <TouchableOpacity
          key={item.key}
          style={[s.item, active === item.key && s.itemActive]}
          onPress={() => {
            if (active === item.key) return;
            router.push({ pathname: item.pathname as any, params: { groupId } });
          }}
          activeOpacity={0.7}
        >
          <Text style={[s.text, active === item.key && s.textActive]}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.n100,
    borderRadius: Radius.r12,
    padding: 4,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.r8,
    paddingVertical: 9,
    minHeight: 34,
  },
  itemActive: { backgroundColor: Colors.white },
  text: { fontSize: 11, fontWeight: '700', color: Colors.n500 },
  textActive: { color: Colors.primary },
});
