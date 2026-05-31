import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { SegmentedControl } from '@ui/primitives/SegmentedControl';
import { AthleteFinanceTab, StatusFilter, TypeFilter } from './types';
import { styles } from './styles';

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
      <SegmentedControl
        options={[
          { value: 'ALL', label: 'Todos' },
          { value: 'PENDING', label: 'Pendentes' },
          { value: 'PAID', label: 'Pagos' },
        ]}
        value={statusFilter}
        onChange={onStatusChange}
        style={{ marginBottom: 8 }}
      />
      <SegmentedControl
        options={[
          { value: 'ALL', label: 'Todos tipos' },
          { value: 'SPOT', label: 'Jogos avulsos' },
          { value: 'MONTHLY', label: 'Mensalista' },
        ]}
        value={typeFilter}
        onChange={onTypeChange}
      />
    </View>
  );
}

export const FinanceFilters = memo(FinanceFiltersComponent);

function FinanceTabsComponent({ activeTab, onChange }: { activeTab: AthleteFinanceTab; onChange: (tab: AthleteFinanceTab) => void }) {
  const options = [
    { value: 'due' as const, label: 'Pagar' },
    { value: 'history' as const, label: 'Histórico' },
    { value: 'reports' as const, label: 'Relatórios' },
  ];

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
