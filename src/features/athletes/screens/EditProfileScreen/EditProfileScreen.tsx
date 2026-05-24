import React from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView } from 'react-native';
import { WizardHeader } from '../../../../ui/primitives';
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
        <WizardHeader step={form.step + 1} totalSteps={controller.totalSteps} onBack={controller.handleBack} />
        <ScrollView
          ref={controller.scrollRef}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <EditProfileStep form={form} />
          <SubmitButton
            isPending={form.isPending}
            isLastStep={form.step >= controller.totalSteps - 1}
            onPress={controller.handleNext}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
