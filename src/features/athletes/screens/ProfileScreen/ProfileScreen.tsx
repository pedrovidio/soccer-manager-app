import React, { useEffect } from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Arena } from '@ui/tokens/theme';
import { AttributesCard } from './AttributesCard';
import { ProfileActions } from './ProfileActions';
import { ProfileHero } from './ProfileHero';
import { styles } from './styles';
import { useProfileScreen } from './useProfileScreen';

export function ProfileScreen() {
  const controller = useProfileScreen();
  const { profile } = controller;

  if (controller.isLoading && !profile.dashboard) {
    return (
      <View style={[styles.safe, styles.center]}>
        <ActivityIndicator size="large" color={Arena.neon} />
      </View>
    );
  }

  return (
    <View style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <ProfileHero
          name={profile.name}
          initials={profile.initials}
          overall={profile.overall}
          overallColor={profile.overallColor}
          photoUrl={profile.photoUrl}
          plan={profile.plan}
          position={profile.position}
          status={profile.status}
          statusStyle={profile.statusStyle}
          onEdit={controller.goEditProfile}
        />
        <RankingBadge
          rankGlobal={controller.rankingSummary.rankGlobal}
          points={controller.rankingSummary.points}
          goals={controller.rankingSummary.goals}
          isLoading={controller.isRankingLoading}
        />
        <PromotionCard
          canPromote={controller.promotionInfo.canPromote}
          isCurrentlyFeatured={controller.promotionInfo.isCurrentlyFeatured}
          isPromoting={controller.promotionInfo.isPromoting}
          daysUntilNextPromotion={controller.promotionInfo.daysUntilNextPromotion}
          onPromote={controller.promoteProfile}
        />
        <AttributesCard stats={profile.stats} />
        <ProfileActions
          onGroups={controller.goGroups}
          onLogout={controller.confirmLogout}
          onDeleteAccount={controller.openDeleteAccountModal}
        />
      </ScrollView>
      <DeleteAccountModal
        confirmationText={controller.deleteAccountState.confirmationText}
        typedConfirmation={controller.deleteAccountState.typedConfirmation}
        isVisible={controller.deleteAccountState.isModalVisible}
        canConfirm={controller.deleteAccountState.canConfirm}
        isDeleting={controller.deleteAccountState.isDeleting}
        onChangeConfirmation={controller.setDeleteConfirmation}
        onCancel={controller.closeDeleteAccountModal}
        onConfirm={controller.deleteAccount}
      />
      <Modal visible={controller.promotionInfo.showSimulatedAd} transparent animationType="fade">
        <View style={styles.adBackdrop}>
          <Ionicons name="tv-outline" size={48} color={Arena.neon} style={{ marginBottom: 10 }} />
          <Text style={styles.adTitle}>Assistindo anúncio premiado...</Text>
          <View style={styles.adCountdownCircle}>
            <Text style={styles.adCountdownText}>{controller.promotionInfo.adCountdown}</Text>
          </View>
          <Text style={styles.adHint}>Seu perfil será destacado após o término do vídeo.</Text>
        </View>
      </Modal>
    </View>
  );
}

function DeleteAccountModal({
  confirmationText,
  typedConfirmation,
  isVisible,
  canConfirm,
  isDeleting,
  onChangeConfirmation,
  onCancel,
  onConfirm,
}: {
  confirmationText: string;
  typedConfirmation: string;
  isVisible: boolean;
  canConfirm: boolean;
  isDeleting: boolean;
  onChangeConfirmation: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalIcon}>
            <Ionicons name="warning-outline" size={24} color={Arena.buttonLabelPrimary} />
          </View>
          <Text style={styles.modalTitle}>Excluir minha conta</Text>
          <Text style={styles.modalDescription}>
            Esta acao e irreversivel. Seus dados pessoais serao apagados e seu historico esportivo ficara anonimizado.
          </Text>
          <Text style={styles.modalHint}>Digite {confirmationText} para confirmar.</Text>
          <TextInput
            value={typedConfirmation}
            onChangeText={onChangeConfirmation}
            autoCapitalize="characters"
            editable={!isDeleting}
            placeholder={confirmationText}
            placeholderTextColor={Arena.textSubtle}
            style={styles.modalInput}
          />
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={onCancel}
              disabled={isDeleting}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalDeleteButton, !canConfirm && styles.modalButtonDisabled]}
              onPress={onConfirm}
              disabled={!canConfirm || isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color={Arena.buttonLabelPrimary} />
              ) : (
                <Text style={styles.modalDeleteText}>Excluir</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function RankingBadge({
  rankGlobal,
  points,
  goals,
  isLoading,
}: {
  rankGlobal: number;
  points: number;
  goals: number;
  isLoading: boolean;
}) {
  const rankLabel = rankGlobal > 0 ? `Top #${rankGlobal}` : 'Sem ranking';

  return (
    <View style={styles.rankingCard}>
      <View style={styles.rankingIcon}>
        <Ionicons name="trophy" size={22} color={Arena.buttonLabelPrimary} />
      </View>
      <View style={styles.rankingInfo}>
        <Text style={styles.rankingTitle}>{isLoading ? 'Atualizando...' : rankLabel}</Text>
        <Text style={styles.rankingMeta}>
          {points} Pontos | {goals} Gols
        </Text>
      </View>
      <View style={styles.rankingGlow}>
        <Ionicons name="stats-chart" size={18} color={Arena.neon} />
      </View>
    </View>
  );
}

function PromotionCard({
  canPromote,
  isCurrentlyFeatured,
  isPromoting,
  daysUntilNextPromotion,
  onPromote,
}: {
  canPromote: boolean;
  isCurrentlyFeatured: boolean;
  isPromoting: boolean;
  daysUntilNextPromotion: number;
  onPromote: () => void;
}) {
  useEffect(() => {
    console.log('[PromotionCard] Render - canPromote:', canPromote, '| isCurrentlyFeatured:', isCurrentlyFeatured, '| isPromoting:', isPromoting, '| daysUntilNext:', daysUntilNextPromotion);
  });

  return (
    <View style={styles.promotionCard}>
      <View style={styles.promotionHeader}>
        <Ionicons name="rocket-outline" size={20} color={Arena.neon} />
        <Text style={styles.promotionTitle}>Destaque Semanal</Text>
      </View>
      <Text style={styles.promotionDescription}>
        Atletas em destaque aparecem primeiro nos convites dos grupos e ganham prioridade nas filas de espera de vagas.
      </Text>

      {isCurrentlyFeatured ? (
        <View style={styles.promotionStatusBadge}>
          <Ionicons name="sparkles" size={14} color={Arena.neon} style={{ marginRight: 4 }} />
          <Text style={styles.promotionStatusText}>Destaque Ativo (Premium por 24h!)</Text>
        </View>
      ) : canPromote ? (
        <TouchableOpacity
          style={[styles.promotionBtn, isPromoting && styles.promotionBtnDisabled]}
          onPress={() => {
            console.log('[PromotionCard] Botão pressionado! Chamando onPromote...');
            onPromote();
          }}
          disabled={isPromoting}
          activeOpacity={0.8}
        >
          <Ionicons name="play-circle-outline" size={18} color={Arena.buttonLabelPrimary} style={{ marginRight: 4 }} />
          <Text style={styles.promotionBtnText}>
            {isPromoting ? 'Carregando vídeo...' : 'Destacar meu perfil hoje'}
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.promotionLockedBadge}
          onPress={() => console.log('[PromotionCard] Badge BLOQUEADO pressionado — canPromote=false, daysUntilNext:', daysUntilNextPromotion)}
          activeOpacity={0.7}
        >
          <Ionicons name="lock-closed" size={14} color={Arena.textSubtle} style={{ marginRight: 4 }} />
          <Text style={styles.promotionLockedText}>
            Próximo destaque em {daysUntilNextPromotion} {daysUntilNextPromotion === 1 ? 'dia' : 'dias'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
