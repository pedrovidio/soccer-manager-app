import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { SegmentedControl } from '@ui/primitives/SegmentedControl';
import { GroupFinanceStatus, GroupFinanceType } from '@features/groups/groupTypes';
import { FinanceTab, StatusFilter, TypeFilter } from './types';
import { styles } from './styles';

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
      <SegmentedControl
        options={[
          { value: 'ALL', label: 'Todos' },
          { value: 'PENDING', label: 'Pendentes' },
          { value: 'PAID', label: 'Pagos' },
          { value: 'CANCELLED', label: 'Cancelados' },
        ]}
        value={statusFilter}
        onChange={onStatusChange}
        style={{ marginBottom: 8 }}
      />
      <SegmentedControl
        options={[
          { value: 'ALL', label: 'Todos tipos' },
          { value: 'SPOT', label: 'Avulsos' },
          { value: 'MONTHLY', label: 'Mensalidades' },
          { value: 'COURT_RENTAL', label: 'Quadra' },
          { value: 'PURCHASE', label: 'Compras' },
        ]}
        value={typeFilter}
        onChange={onTypeChange}
      />
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
  const options = tabs.map((item) => ({
    value: item.value,
    label: item.label,
  }));

  return (
    <SegmentedControl
      options={options}
      value={activeTab}
      onChange={onChange}
      style={{ margin: 16 }}
    />
  );
}

export const FinanceTabs = memo(FinanceTabsComponent);
