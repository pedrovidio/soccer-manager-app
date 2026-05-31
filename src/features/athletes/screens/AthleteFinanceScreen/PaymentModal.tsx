import React, { memo } from 'react';
import { ActivityIndicator, Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Arena, Colors } from '@ui/tokens/theme';
import { AthleteFinancePayment } from '@features/athletes/athleteTypes';
import { formatCurrency, formatDate } from '@features/athletes/utils/athleteFinanceFormatters';
import { styles } from './styles';

type Props = {
  payment: AthleteFinancePayment | null;
  isReporting: boolean;
  onClose: () => void;
  onOpenMatch: (payment: AthleteFinancePayment) => void;
  onReportPayment: (payment: AthleteFinancePayment) => void;
};

function PaymentModalComponent({ payment, isReporting, onClose, onOpenMatch, onReportPayment }: Props) {
  if (!payment) return null;

  const pix = payment.group?.pixKey ?? payment.group?.adminPixKey ?? 'Pix nao cadastrado';
  const canReportPayment = payment.status === 'PENDING' && !payment.paymentReportedAt;

  return (
    <Modal transparent animationType="slide" visible onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalSheet} onPress={(event) => event.stopPropagation()}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Dados para pagamento</Text>
          <InfoLine label="Valor" value={formatCurrency(payment.amount)} />
          <InfoLine label="Grupo" value={payment.group?.name ?? 'Sem grupo'} />
          <InfoLine label="Jogo" value={payment.match ? `${payment.match.location} - ${formatDate(payment.match.date)}` : 'Mensalidade'} />
          <InfoLine label="Administrador" value={payment.group?.adminName ?? 'Administrador do grupo'} />
          <InfoLine label="Pix" value={pix} strong />

          {payment.status === 'PAID' && (
            <View style={styles.paidBadgeFull}>
              <Text style={styles.paidBadgeText}>Pago</Text>
            </View>
          )}
          {payment.status === 'PENDING' && payment.paymentReportedAt && (
            <View style={styles.reportedBadgeFull}>
              <Text style={styles.reportedBadgeText}>Pagamento informado, aguardando confirmacao</Text>
            </View>
          )}
          {canReportPayment && (
            <TouchableOpacity
              style={[styles.primaryBtnFull, isReporting && styles.primaryBtnFullDisabled]}
              onPress={() => onReportPayment(payment)}
              disabled={isReporting}
              activeOpacity={0.7}
            >
              {isReporting ? (
                <ActivityIndicator color={Arena.buttonLabelPrimary} size="small" />
              ) : (
                <>
                  <Ionicons name="receipt-outline" size={18} color={Arena.buttonLabelPrimary} />
                  <Text style={styles.primaryBtnText}>Informar pagamento</Text>
                </>
              )}
            </TouchableOpacity>
          )}
          {payment.match?.id && (
            <TouchableOpacity
              style={[styles.secondaryBtnFull, { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }]}
              onPress={() => onOpenMatch(payment)}
              activeOpacity={0.7}
            >
              <Ionicons name="football-outline" size={18} color={Arena.text} />
              <Text style={styles.secondaryBtnText}>Abrir jogo</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.secondaryBtnFull} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.secondaryBtnText}>Fechar</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function InfoLine({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.infoLine}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, strong && styles.infoValueStrong]} selectable>{value}</Text>
    </View>
  );
}

export const PaymentModal = memo(PaymentModalComponent);
