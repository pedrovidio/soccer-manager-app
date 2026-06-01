import React from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, View } from 'react-native';
import { AuthBrandLogo } from '@features/auth/components/AuthBrandLogo';
import { WizardHeader } from '@ui/primitives';
import { RegisterAttributesStep } from './RegisterAttributesStep';
import { RegisterAvailabilityStep } from './RegisterAvailabilityStep';
import { RegisterPersonalStep } from './RegisterPersonalStep';
import { RegisterProfileStep } from './RegisterProfileStep';
import { RegisterSubmitButton } from './RegisterSubmitButton';
import { styles } from './styles';
import { useRegisterScreen } from './useRegisterScreen';

export default function RegisterScreen() {
  const register = useRegisterScreen();

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <WizardHeader step={register.step} totalSteps={register.totalSteps} onBack={register.goBack} />

        <ScrollView
          ref={register.scrollRef}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.brandIntro}>
            <AuthBrandLogo compact nameColor="#FFFFFF" />
          </View>

          {register.step === 1 && (
            <RegisterPersonalStep
              form={register.form}
              setField={register.setField}
              onCepComplete={register.resolveCep}
            />
          )}
          {register.step === 2 && <RegisterProfileStep form={register.form} setField={register.setField} />}
          {register.step === 3 && <RegisterAttributesStep form={register.form} setField={register.setField} />}
          {register.step === 4 && <RegisterAvailabilityStep form={register.form} setField={register.setField} />}

          <RegisterSubmitButton
            isLastStep={register.step === register.totalSteps}
            loading={register.loading}
            onPress={register.handlePrimaryAction}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
