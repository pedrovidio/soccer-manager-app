import React from 'react';
import { RefreshControl, SafeAreaView, ScrollView } from 'react-native';
import { Colors } from '../../../common/theme';
import { GroupTopMenu } from '../GroupTopMenu';
import { ExpenseModal } from './ExpenseModal';
import { FinanceActions } from './FinanceActions';
import { FinanceErrorState, FinanceLoadingState } from './LoadingErrorState';
import { FinanceFilters, FinanceTabs } from './FilterTabs';
import { FinanceHeader } from './FinanceHeader';
import { MatchRevenueList } from './MatchRevenueList';
import { OverviewSection } from './OverviewSection';
import { PaymentList } from './PaymentList';
import { SummaryGrid } from './SummaryGrid';
import { styles } from './styles';
import { useGroupFinanceScreen } from './useGroupFinanceScreen';

export function GroupFinanceScreen() {
  const controller = useGroupFinanceScreen();

  if (controller.isLoading) return <FinanceLoadingState />;

  if (controller.isError || !controller.data) {
    const isForbidden = (controller.error as any)?.response?.status === 403;
    return (
      <FinanceErrorState
        isForbidden={isForbidden}
        onPress={() => (isForbidden ? controller.router.back() : controller.refetch())}
      />
    );
  }

  const { data } = controller;

  return (
    <SafeAreaView style={styles.safe}>
      <FinanceHeader groupName={data.group.name} />
      <GroupTopMenu groupId={controller.groupId!} active="finance" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={controller.isLoading} onRefresh={controller.refetch} colors={[Colors.primary]} />}
      >
        <SummaryGrid summary={data.summary} />
        <FinanceActions onOpenExpense={controller.setExpenseKind} />
        <FinanceFilters
          statusFilter={controller.statusFilter}
          typeFilter={controller.typeFilter}
          onStatusChange={controller.setStatusFilter}
          onTypeChange={controller.setTypeFilter}
        />
        <FinanceTabs activeTab={controller.tab} onChange={controller.setTab} />

        {controller.tab === 'review' && (
          <PaymentList
            title="Pagamentos para conferir"
            empty="Nenhum pagamento informado aguardando conferencia"
            payments={controller.reportedPayments}
            onConfirm={controller.confirmPayment}
            confirmingId={controller.confirmingId}
          />
        )}

        {controller.tab === 'overview' && (
          <OverviewSection
            byType={data.byType}
            overdueCount={controller.overduePayments.length}
            reportedCount={controller.reportedPayments.length}
            totalExpenses={data.summary.totalExpenses}
            expectedTotal={data.summary.expectedTotal}
          />
        )}

        {controller.tab === 'matches' && <MatchRevenueList matches={data.byMatch} />}

        {controller.tab === 'defaulters' && (
          <PaymentList
            title="Inadimplentes e pendencias"
            empty="Nenhum pagamento pendente"
            payments={data.defaulters}
            onConfirm={controller.confirmPayment}
            confirmingId={controller.confirmingId}
          />
        )}

        {controller.tab === 'expenses' && (
          <PaymentList
            title="Saidas de caixa"
            empty="Nenhuma despesa registrada"
            payments={data.expenses}
            onConfirm={controller.confirmPayment}
            confirmingId={controller.confirmingId}
          />
        )}

        {controller.tab === 'payments' && (
          <PaymentList
            title="Todos os lancamentos"
            empty="Nenhum lancamento encontrado"
            payments={data.payments}
            onConfirm={controller.confirmPayment}
            confirmingId={controller.confirmingId}
          />
        )}
      </ScrollView>

      <ExpenseModal
        kind={controller.expenseKind}
        amount={controller.expenseAmount}
        description={controller.expenseDescription}
        isSaving={controller.isRegisteringExpense}
        onAmountChange={controller.setExpenseAmount}
        onDescriptionChange={controller.setExpenseDescription}
        onClose={controller.closeExpenseModal}
        onSave={controller.registerExpense}
      />
    </SafeAreaView>
  );
}
