import React, { memo } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Arena } from '@ui/tokens/theme';
import { s } from '../MatchHomeScreen.styles';
import { MatchHomeController } from './types';

type SpotPaymentSectionProps = {
  controller: MatchHomeController;
};

function SpotPaymentSectionComponent({ controller }: SpotPaymentSectionProps) {
  const { data, isAdmin, reportSpotPaymentMutation } = controller;
  if (isAdmin || data?.status !== 'FINISHED' || !data.mySpotPayment) return null;
  const isPaid = data.mySpotPayment.status === 'PAID';
  const isReported = data.mySpotPayment.status === 'PENDING' && !!data.mySpotPayment.paymentReportedAt;

  return (
    <View style={s.section}>
      <View style={s.paymentCard}>
        <View style={s.rowContent}>
          <Text style={s.paymentTitle}>Pagamento do avulso</Text>
          <Text style={s.paymentText}>
            {`Valor: R$ ${data.mySpotPayment.amount.toFixed(2).replace('.', ',')}`}
          </Text>
        </View>
        {isPaid || isReported ? (
          <View style={[s.paymentBadge, isReported && s.paymentReportedBadge]}>
            <Text style={[s.paymentBadgeText, isReported && s.paymentReportedBadgeText]}>
              {isPaid ? 'Pago' : 'Informado'}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[s.paymentBtn, reportSpotPaymentMutation.isPending && s.inviteBtnDisabled]}
            onPress={() => reportSpotPaymentMutation.mutate()}
            disabled={reportSpotPaymentMutation.isPending}
            activeOpacity={0.7}
          >
            {reportSpotPaymentMutation.isPending ? (
              <ActivityIndicator color={Arena.buttonLabelPrimary} size="small" />
            ) : (
              <Text style={s.paymentBtnText}>Informar pagamento</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export const SpotPaymentSection = memo(SpotPaymentSectionComponent);
