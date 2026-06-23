import React from 'react';
import { ActivityIndicator, RefreshControl, SafeAreaView, ScrollView, View } from 'react-native';
import { Arena, Colors } from '@ui/tokens/theme';
import { AthleteFinanceErrorState } from './LoadingErrorState';
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

  if (controller.isError) return <AthleteFinanceErrorState onRetry={controller.refetch} />;

  const { data } = controller;

  return (
    <SafeAreaView style={styles.safe}>
      {data && <FinanceHeader athleteName={data.athlete.name} />}

      {controller.isLoading || !data ? (
        <View style={[styles.center, { flex: 1 }]}>
          <ActivityIndicator size="large" color={Arena.neon} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={controller.isFetching} onRefresh={controller.refetch} colors={[Colors.primary]} />}
        >
          <View style={{ opacity: controller.isFetching ? 0.6 : 1 }}>
            <SummaryGrid summary={data.summary} />
          </View>

          <FinanceFilters
            statusFilter={controller.statusFilter}
            typeFilter={controller.typeFilter}
            onStatusChange={controller.setStatusFilter}
            onTypeChange={controller.setTypeFilter}
          />
          <FinanceTabs activeTab={controller.tab} onChange={controller.setTab} />

          <View style={{ opacity: controller.isFetching ? 0.6 : 1, flex: 1 }}>
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
          </View>
        </ScrollView>
      )}

      <PaymentModal
        payment={controller.selectedPayment}
        isReporting={controller.isReportingPayment}
        onReportPayment={controller.reportPayment}
        onClose={() => controller.setSelectedPayment(null)}
        onOpenMatch={controller.openMatch}
      />
    </SafeAreaView>
  );
}
