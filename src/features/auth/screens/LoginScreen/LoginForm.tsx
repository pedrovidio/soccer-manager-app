import React, { memo } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Arena, Colors } from '@ui/tokens/theme';
import { styles } from './styles';

type LoginFormProps = {
  email: string;
  password: string;
  loading: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
  onForgotPasswordPress: () => void;
  onRegisterPress: () => void;
};

function LoginFormComponent({
  email,
  password,
  loading,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onForgotPasswordPress,
  onRegisterPress,
}: LoginFormProps) {
  return (
    <View style={styles.form}>
      <LabeledInput
        label="E-mail ou Telefone"
        icon="football-outline"
        placeholder="seuemail@janfse.com"
        keyboardType="email-address"
        autoCapitalize="none"
        textContentType="username"
        value={email}
        onChangeText={onEmailChange}
      />

      <LabeledInput
        label="Sua Senha"
        icon="lock-closed-outline"
        placeholder="••••••••"
        secureTextEntry
        textContentType="password"
        value={password}
        onChangeText={onPasswordChange}
        trailingAction={(
          <TouchableOpacity activeOpacity={0.75} onPress={onForgotPasswordPress}>
            <Text style={styles.forgotLink}>Esqueceu a senha?</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        accessibilityRole="button"
        activeOpacity={0.84}
        style={[styles.primaryButton, loading ? styles.btnDisabled : null]}
        onPress={onSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#07110D" />
        ) : (
          <Text style={styles.primaryButtonText}>ENTRAR EM CAMPO</Text>
        )}
      </TouchableOpacity>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>Ou entre direto com</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.socialRow}>
        <SocialButton icon="logo-google" label="Google" />
        <SocialButton icon="logo-apple" label="Apple" />
      </View>

      <TouchableOpacity activeOpacity={0.8} onPress={onRegisterPress} style={styles.registerLink}>
        <Text style={styles.registerLinkText}>
          Novo na área? <Text style={styles.registerLinkHighlight}>Cadastre-se e jogue hoje</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

type LabeledInputProps = React.ComponentProps<typeof TextInput> & {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  trailingAction?: React.ReactNode;
};

function LabeledInput({ label, icon, trailingAction, style, ...props }: LabeledInputProps) {
  return (
    <View style={styles.fieldGroup}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {trailingAction}
      </View>
      <View style={styles.inputShell}>
        <Ionicons name={icon} size={18} color={Colors.n400} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor="rgba(229, 231, 235, 0.42)"
          {...props}
        />
      </View>
    </View>
  );
}

function SocialButton({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <TouchableOpacity activeOpacity={0.78} style={styles.socialButton}>
      <Ionicons name={icon} size={18} color={Arena.text} />
      <Text style={styles.socialText}>{label}</Text>
    </TouchableOpacity>
  );
}

export const LoginForm = memo(LoginFormComponent);
