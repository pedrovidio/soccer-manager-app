import React, { memo } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '@ui/tokens/theme';
import { styles } from './styles';

type LoginFormProps = {
  email: string;
  password: string;
  loading: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
  onRegisterPress: () => void;
};

function LoginFormComponent({
  email,
  password,
  loading,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onRegisterPress,
}: LoginFormProps) {
  return (
    <View style={styles.form}>
      <Text style={styles.label}>E-mail</Text>
      <TextInput
        style={styles.input}
        placeholder="seu@email.com"
        placeholderTextColor={Colors.n400}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={onEmailChange}
      />

      <Text style={styles.label}>Senha</Text>
      <TextInput
        style={styles.input}
        placeholder="******"
        placeholderTextColor={Colors.n400}
        secureTextEntry
        value={password}
        onChangeText={onPasswordChange}
      />

      <TouchableOpacity
        style={[styles.btn, loading ? styles.btnDisabled : null]}
        onPress={onSubmit}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.btnText}>Entrar</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={onRegisterPress} style={styles.registerLink}>
        <Text style={styles.registerLinkText}>
          Não tem conta? <Text style={styles.registerLinkHighlight}>Criar conta</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export const LoginForm = memo(LoginFormComponent);
