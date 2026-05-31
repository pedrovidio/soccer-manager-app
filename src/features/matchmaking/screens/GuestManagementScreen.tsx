import React from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@ui/tokens/theme';
import { BackButton } from '@ui/composites/BackButton';
import { s } from './MatchHomeScreen.styles';
import { useMatchHomeController } from '../hooks/useMatchHomeController';
import { GuestSlotsSection } from './MatchHomeScreen/GuestSlotsSection';

export default function GuestManagementScreen() {
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
        <Text style={s.errorText}>Erro ao carregar os dados</Text>
        <TouchableOpacity style={s.retryBtn} onPress={() => controller.refetch()}>
          <Text style={s.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const { data, summary } = controller;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <BackButton />
        <View style={s.rowContent}>
          <Text style={s.headerTitle} numberOfLines={1}>Convite de Avulsos</Text>
          <Text style={s.headerSub}>{data.location} - {summary.date}</Text>
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        <GuestSlotsSection controller={controller} />
      </ScrollView>
    </SafeAreaView>
  );
}
