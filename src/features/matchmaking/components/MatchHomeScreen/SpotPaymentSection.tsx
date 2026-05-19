import React, { memo } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../../common/theme';
import { s } from '../MatchHomeScreen.styles';
import { MatchHomeController } from './types';

type SpotPaymentSectionProps = {
  controller: MatchHomeController;
};

function SpotPaymentSectionComponent({ controller }: SpotPaymentSectionProps) {
  const { data, isAdmin, reportSpotPaymentMutation } = controller;
  if (isAdmin || data?.status !== 'FINISHED' || data.mySpotPayment?.status !== 'PENDING') return null;

  return (
    <View style={s.section}>
      <View style={s.paymentCard}>
        <View style={s.rowContent}>
          <Text style={s.paymentTitle}>Pagamento do avulso</Text>
          <Text style={s.paymentText}>
            {`Valor: R$ ${data.mySpotPayment.amount.toFixed(2).replace('.', ',')}`}
          </Text>
        </View>
        <TouchableOpacity
          style={[s.paymentBtn, reportSpotPaymentMutation.isPending && s.inviteBtnDisabled]}
          onPress={() => reportSpotPaymentMutation.mutate()}
          disabled={reportSpotPaymentMutation.isPending}
          activeOpacity={0.7}
        >
          {reportSpotPaymentMutation.isPending ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <Text style={s.paymentBtnText}>
              {data.mySpotPayment.paymentReportedAt ? 'Reenviar aviso' : 'Informar pagamento'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

export const SpotPaymentSection = memo(SpotPaymentSectionComponent);
