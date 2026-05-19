import React, { memo } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { GroupFinanceStatus, GroupFinanceType } from '../../groupTypes';
import { FinanceTab, StatusFilter, TypeFilter } from './types';
import { styles } from './styles';

type ChipProps<T extends string> = {
  label: string;
  value: T;
  activeValue: T;
  onPress: (value: T) => void;
};

function FilterChip<T extends string>({ label, value, activeValue, onPress }: ChipProps<T>) {
  const active = value === activeValue;
  return (
    <TouchableOpacity style={[styles.chip, active && styles.chipActive]} onPress={() => onPress(value)} activeOpacity={0.7}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

type FilterProps = {
  statusFilter: StatusFilter;
  typeFilter: TypeFilter;
  onStatusChange: (value: StatusFilter) => void;
  onTypeChange: (value: TypeFilter) => void;
};

function FinanceFiltersComponent({ statusFilter, typeFilter, onStatusChange, onTypeChange }: FilterProps) {
  return (
    <View style={styles.filterBlock}>
      <Text style={styles.filterTitle}>Filtros</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <FilterChip label="Todos" value="ALL" activeValue={statusFilter} onPress={onStatusChange} />
        <FilterChip label="Pendentes" value="PENDING" activeValue={statusFilter} onPress={onStatusChange as (value: string) => void} />
        <FilterChip label="Pagos" value="PAID" activeValue={statusFilter} onPress={onStatusChange as (value: string) => void} />
        <FilterChip label="Cancelados" value="CANCELLED" activeValue={statusFilter} onPress={onStatusChange as (value: string) => void} />
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <FilterChip label="Todos tipos" value="ALL" activeValue={typeFilter} onPress={onTypeChange} />
        <FilterChip label="Avulsos" value="SPOT" activeValue={typeFilter} onPress={onTypeChange as (value: string) => void} />
        <FilterChip label="Mensalidades" value="MONTHLY" activeValue={typeFilter} onPress={onTypeChange as (value: string) => void} />
        <FilterChip label="Quadra" value="COURT_RENTAL" activeValue={typeFilter} onPress={onTypeChange as (value: string) => void} />
        <FilterChip label="Compras" value="PURCHASE" activeValue={typeFilter} onPress={onTypeChange as (value: string) => void} />
      </ScrollView>
    </View>
  );
}

export const FinanceFilters = memo(FinanceFiltersComponent);

type TabsProps = {
  activeTab: FinanceTab;
  onChange: (tab: FinanceTab) => void;
};

const tabs: Array<{ label: string; value: FinanceTab }> = [
  { label: 'Conferir', value: 'review' },
  { label: 'Resumo', value: 'overview' },
  { label: 'Jogos', value: 'matches' },
  { label: 'Inadimpl.', value: 'defaulters' },
  { label: 'Saidas', value: 'expenses' },
  { label: 'Tudo', value: 'payments' },
];

function FinanceTabsComponent({ activeTab, onChange }: TabsProps) {
  return (
    <View style={styles.tabs}>
      {tabs.map((item) => {
        const active = item.value === activeTab;
        return (
          <TouchableOpacity key={item.value} style={[styles.tabBtn, active && styles.tabBtnActive]} onPress={() => onChange(item.value)} activeOpacity={0.7}>
            <Text style={[styles.tabText, active && styles.tabTextActive]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export const FinanceTabs = memo(FinanceTabsComponent);
