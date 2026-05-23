import React from 'react';
import { RefreshControl, SafeAreaView, ScrollView } from 'react-native';
import { BottomNav } from '../../../../ui/composites/BottomNav/BottomNav';
import { Colors } from '../../../../ui/tokens/theme';
import { AthleteFinanceErrorState, AthleteFinanceLoadingState } from './LoadingErrorState';
import { FinanceFilters, FinanceTabs } from './FilterTabs';
import { FinanceHeader } from './FinanceHeader';
import { PaymentList } from './PaymentList';
import { PaymentModal } from './PaymentModal';
import { ReportsSection } from './ReportsSection';
import { SummaryGrid } from './SummaryGrid';
import { styles } from './styles';
import { useAthleteFinanceScreen } from './useAthleteFinanceScreen';

export function AthleteFinanceScreen() {
  const controller = useAthleteFinanceScreen();

  if (controller.isLoading) return <AthleteFinanceLoadingState />;
  if (controller.isError || !controller.data) return <AthleteFinanceErrorState onRetry={controller.refetch} />;

  const { data } = controller;

  return (
    <SafeAreaView style={styles.safe}>
      <FinanceHeader athleteName={data.athlete.name} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={controller.isLoading} onRefresh={controller.refetch} colors={[Colors.primary]} />}
      >
        <SummaryGrid summary={data.summary} />
        <FinanceFilters
          statusFilter={controller.statusFilter}
          typeFilter={controller.typeFilter}
          onStatusChange={controller.setStatusFilter}
          onTypeChange={controller.setTypeFilter}
        />
        <FinanceTabs activeTab={controller.tab} onChange={controller.setTab} />

        {controller.tab === 'due' && (
          <PaymentList
            title="Valores em aberto"
            empty="Nenhum pagamento pendente"
            payments={data.duePayments}
            onPay={controller.setSelectedPayment}
          />
        )}
        {controller.tab === 'history' && (
          <PaymentList
            title="Historico de pagamentos"
            empty="Nenhum pagamento encontrado"
            payments={data.payments}
            onPay={controller.setSelectedPayment}
          />
        )}
        {controller.tab === 'reports' && <ReportsSection data={data} />}
      </ScrollView>

      <PaymentModal
        payment={controller.selectedPayment}
        isReporting={controller.isReportingPayment}
        onReportPayment={controller.reportPayment}
        onClose={() => controller.setSelectedPayment(null)}
        onOpenMatch={controller.openMatch}
      />
      <BottomNav active="financial" />
    </SafeAreaView>
  );
}
