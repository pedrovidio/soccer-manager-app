import React from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { BackButton } from '@ui/composites/BackButton';
import { EditProfileStep } from './EditProfileStep';
import { styles } from './styles';
import { SubmitButton } from './SubmitButton';
import { useEditProfileScreen } from './useEditProfileScreen';

export function EditProfileScreen() {
  const controller = useEditProfileScreen();
  const { form } = controller;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <BackButton onPress={controller.handleBack} />
          <Text style={styles.headerTitle}>Editar Perfil</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, form.step === 0 && styles.activeTab]}
            onPress={() => form.setStep(0)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, form.step === 0 && styles.activeTabText]}>Pessoais</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, form.step === 1 && styles.activeTab]}
            onPress={() => form.setStep(1)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, form.step === 1 && styles.activeTabText]}>Perfil / Nível</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, form.step === 2 && styles.activeTab]}
            onPress={() => form.setStep(2)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, form.step === 2 && styles.activeTabText]}>Disponibilidade</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={controller.scrollRef}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <EditProfileStep form={form} />
          <SubmitButton
            isPending={form.isPending}
            isLastStep={true}
            onPress={controller.handleNext}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
