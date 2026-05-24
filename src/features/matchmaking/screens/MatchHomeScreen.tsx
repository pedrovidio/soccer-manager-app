import React from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@ui/tokens/theme';
import { s } from './MatchHomeScreen.styles';
import { useMatchHomeController } from '../hooks/useMatchHomeController';
import { ConfirmationSection } from './MatchHomeScreen/ConfirmationSection';
import { FinishMatchModal } from './MatchHomeScreen/FinishMatchModal';
import { GuestSlotsSection } from './MatchHomeScreen/GuestSlotsSection';
import { MatchActionsSection } from './MatchHomeScreen/MatchActionsSection';
import { MatchHeader } from './MatchHomeScreen/MatchHeader';
import { MatchInfoCard } from './MatchHomeScreen/MatchInfoCard';
import { PendingApplicationsSection } from './MatchHomeScreen/PendingApplicationsSection';
import { PostGameSection } from './MatchHomeScreen/PostGameSection';
import { PresenceSection } from './MatchHomeScreen/PresenceSection';
import { SpotPaymentSection } from './MatchHomeScreen/SpotPaymentSection';
import { TeamsSection } from './MatchHomeScreen/TeamsSection';

export default function MatchHomeScreen() {
  const controller = useMatchHomeController();

  if (controller.isLoading) {
    return (
      <SafeAreaView style={[s.safe, s.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (controller.isError || !controller.data || !controller.summary) {
    return (
      <SafeAreaView style={[s.safe, s.center]}>
        <Ionicons name="alert-circle-outline" size={40} color={Colors.error} />
        <Text style={s.errorText}>Erro ao carregar a partida</Text>
        <TouchableOpacity style={s.retryBtn} onPress={() => controller.refetch()}>
          <Text style={s.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <MatchHeader controller={controller} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        <MatchInfoCard controller={controller} />
        <ConfirmationSection controller={controller} />
        <TeamsSection controller={controller} />
        <MatchActionsSection controller={controller} />
        <PostGameSection controller={controller} />
        <SpotPaymentSection controller={controller} />
        <PendingApplicationsSection controller={controller} />
        <PresenceSection controller={controller} />
        <GuestSlotsSection controller={controller} />
      </ScrollView>
      <FinishMatchModal controller={controller} />
    </SafeAreaView>
  );
}
