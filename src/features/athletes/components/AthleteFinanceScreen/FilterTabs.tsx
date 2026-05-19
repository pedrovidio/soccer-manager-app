import React, { memo } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { AthleteFinanceTab, StatusFilter, TypeFilter } from './types';
import { styles } from './styles';

function Chip<T extends string>({ label, value, activeValue, onPress }: { label: string; value: T; activeValue: T; onPress: (value: T) => void }) {
  const active = value === activeValue;
  return (
    <TouchableOpacity style={[styles.chip, active && styles.chipActive]} onPress={() => onPress(value)} activeOpacity={0.7}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function FinanceFiltersComponent({
  statusFilter, typeFilter, onStatusChange, onTypeChange,
}: {
  statusFilter: StatusFilter;
  typeFilter: TypeFilter;
  onStatusChange: (value: StatusFilter) => void;
  onTypeChange: (value: TypeFilter) => void;
}) {
  return (
    <View style={styles.filterBlock}>
      <Text style={styles.filterTitle}>Filtros</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip label="Todos" value="ALL" activeValue={statusFilter} onPress={onStatusChange} />
        <Chip label="Pendentes" value="PENDING" activeValue={statusFilter} onPress={onStatusChange as (value: string) => void} />
        <Chip label="Pagos" value="PAID" activeValue={statusFilter} onPress={onStatusChange as (value: string) => void} />
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip label="Todos tipos" value="ALL" activeValue={typeFilter} onPress={onTypeChange} />
        <Chip label="Jogos avulsos" value="SPOT" activeValue={typeFilter} onPress={onTypeChange as (value: string) => void} />
        <Chip label="Mensalista" value="MONTHLY" activeValue={typeFilter} onPress={onTypeChange as (value: string) => void} />
      </ScrollView>
    </View>
  );
}

export const FinanceFilters = memo(FinanceFiltersComponent);

function FinanceTabsComponent({ activeTab, onChange }: { activeTab: AthleteFinanceTab; onChange: (tab: AthleteFinanceTab) => void }) {
  return (
    <View style={styles.tabs}>
      <TabButton label="Pagar" active={activeTab === 'due'} onPress={() => onChange('due')} />
      <TabButton label="Historico" active={activeTab === 'history'} onPress={() => onChange('history')} />
      <TabButton label="Relatorios" active={activeTab === 'reports'} onPress={() => onChange('reports')} />
    </View>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.tabBtn, active && styles.tabBtnActive]} onPress={onPress} activeOpacity={0.7}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

export const FinanceTabs = memo(FinanceTabsComponent);
