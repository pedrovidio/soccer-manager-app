import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { AuthBrandLogo } from '@features/auth/components/AuthBrandLogo';
import { LoginForm } from './LoginForm';
import { styles } from './styles';
import { useLoginScreen } from './useLoginScreen';

export default function LoginScreen() {
  const loginScreen = useLoginScreen();
  const introStyle = useEntranceAnimation(0);
  const formStyle = useEntranceAnimation(160);
  const dustAStyle = useFloatingDust(0);
  const dustBStyle = useFloatingDust(900);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.background} pointerEvents="none">
        <View style={styles.fieldGlowTop} />
        <View style={styles.fieldGlowBottom} />
        <View style={styles.pitchLineVertical} />
        <View style={styles.pitchLineHorizontal} />
        <View style={styles.pitchCircle} />
        <Animated.View style={[styles.dust, styles.dustA, dustAStyle]} />
        <Animated.View style={[styles.dust, styles.dustB, dustBStyle]} />
      </View>

      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.hero, introStyle]}>
            <View style={styles.brandRow}>
              <AuthBrandLogo showName={false} />
              <Text style={styles.brandName}>NÃO FICO SEM JOGAR</Text>
            </View>

            <View style={styles.copyBlock}>
              <Text style={styles.headline}>
                O grupo do WhatsApp falhou? <Text style={styles.headlineAccent}>Aqui tem jogo.</Text>
              </Text>
              <Text style={styles.subtitle}>
                A tranquilidade de quem sabe que o quórum tá garantido e a quadra tá reservada.
              </Text>
            </View>
          </Animated.View>

          <Animated.View style={formStyle}>
            <LoginForm
              email={loginScreen.email}
              password={loginScreen.password}
              loading={loginScreen.loading}
              onEmailChange={loginScreen.setEmail}
              onPasswordChange={loginScreen.setPassword}
              onSubmit={loginScreen.handleLogin}
              onForgotPasswordPress={loginScreen.goToForgotPassword}
              onRegisterPress={loginScreen.goToRegister}
            />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function useEntranceAnimation(delay: number) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(22)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 640,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 640,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, opacity, translateY]);

  return { opacity, transform: [{ translateY }] };
}

function useFloatingDust(delay: number) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(progress, {
          toValue: 1,
          duration: 4200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 4200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [delay, progress]);

  return {
    opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0.22, 0.62] }),
    transform: [
      { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, -18] }) },
      { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [0, 12] }) },
      { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] }) },
    ],
  };
}
