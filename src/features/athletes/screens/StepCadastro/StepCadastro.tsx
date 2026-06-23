import React from 'react';
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Arena } from '@ui/tokens/theme';
import { maskDate } from '@ui/utils/masks';
import { FormField, ChipRow, Input } from '@ui/primitives';
import { GENDERS, POSITIONS } from './options';
import { styles } from './styles';
import { StepCadastroProps } from './types';
import { useStepCadastro } from './useStepCadastro';

export default function StepCadastro(props: StepCadastroProps) {
  const controller = useStepCadastro(props);

  return (
    <View>
      <Text style={styles.stepTitle}>Dados pessoais</Text>
      <Text style={styles.stepSubtitle}>Informações básicas do seu perfil</Text>

      <View style={styles.photoSection}>
        <TouchableOpacity style={styles.avatarWrap} onPress={controller.pickPhoto} activeOpacity={0.8}>
          {controller.currentPhoto
            ? <Image source={{ uri: controller.currentPhoto }} style={styles.avatarImg} />
            : <View style={styles.avatarFallback}><Text style={styles.avatarInitials}>{controller.initials}</Text></View>}
          <View style={styles.cameraOverlay}>
            {controller.isUploadingPhoto
              ? <ActivityIndicator size="small" color={Arena.bgDeep} />
              : <Ionicons name="camera" size={18} color={Arena.bgDeep} />}
          </View>
        </TouchableOpacity>
        <Text style={styles.photoHint}>Toque para alterar a foto</Text>
      </View>

      <FormField label="Nome completo">
        <Input value={props.name} onChangeText={props.setName} autoCapitalize="words" />
      </FormField>

      <FormField label="Sexo">
        <ChipRow options={GENDERS} selectedValue={props.gender} onSelect={props.setGender} />
      </FormField>

      <FormField label="Data de nascimento">
        <Input
          value={props.birthDate}
          keyboardType="numeric"
          onChangeText={(value) => props.setBirthDate(maskDate(value))}
          placeholder="DD/MM/AAAA"
          maxLength={10}
        />
      </FormField>

      <FormField label="Posição">
        <ChipRow options={POSITIONS} selectedValue={props.position} onSelect={props.setPosition} />
      </FormField>

      <FormField label="Chave PIX">
        <Input
          value={props.pixKey ?? ''}
          onChangeText={props.setPixKey}
          placeholder="CPF, e-mail, telefone ou chave aleatória"
          autoCapitalize="none"
        />
      </FormField>
    </View>
  );
}
