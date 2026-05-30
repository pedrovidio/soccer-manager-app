import React from 'react';
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Arena } from '@ui/tokens/theme';
import { maskCpf, maskPhone } from '@ui/utils/masks';
import { FormField, ChipRow, UFSelect, Input } from '@ui/primitives';
import { GENDERS, POSITIONS } from './options';
import { styles } from './styles';
import { StepCadastroProps } from './types';
import { useStepCadastro } from './useStepCadastro';

export default function StepCadastro(props: StepCadastroProps) {
  const controller = useStepCadastro(props);

  return (
    <View>
      <Text style={styles.stepTitle}>Dados pessoais</Text>
      <Text style={styles.stepSubtitle}>Informacoes basicas e endereco</Text>

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
      <FormField label="CPF">
        <Input
          value={props.cpf}
          keyboardType="numeric"
          onChangeText={(value) => props.setCpf(maskCpf(value))}
          placeholder="000.000.000-00"
        />
      </FormField>
      <FormField label="Sexo">
        <ChipRow options={GENDERS} selectedValue={props.gender} onSelect={props.setGender} />
      </FormField>

      <View style={styles.row}>
        <View style={styles.flex1}>
          <FormField label="Telefone">
            <Input
              value={props.phone}
              keyboardType="phone-pad"
              onChangeText={(value) => props.setPhone(maskPhone(value))}
              placeholder="(00) 00000-0000"
            />
          </FormField>
        </View>
        <View style={styles.flex1}>
          <FormField label="Idade">
            <Input value={props.age} keyboardType="numeric" onChangeText={(value) => props.setAge(value.replace(/\D/g, ''))} />
          </FormField>
        </View>
      </View>

      <FormField label="Posicao">
        <ChipRow options={POSITIONS} selectedValue={props.position} onSelect={props.setPosition} />
      </FormField>

      <FormField label="Chave PIX">
        <Input
          value={props.pixKey ?? ''}
          onChangeText={props.setPixKey}
          placeholder="CPF, e-mail, telefone ou chave aleatoria"
          autoCapitalize="none"
        />
      </FormField>

      <View style={styles.divider} />
      <Text style={styles.sectionLabel}>Endereco</Text>

      <View style={styles.row}>
        <View style={styles.flex1}>
          <FormField label="CEP">
            <View style={styles.inputWrap}>
              <Input
                style={styles.inputFlex}
                value={props.cep}
                keyboardType="numeric"
                onChangeText={props.setCep}
                placeholder="00000-000"
              />
              {props.cepLoading && <ActivityIndicator size="small" color={Arena.neon} style={styles.inputIcon} />}
            </View>
          </FormField>
        </View>
        <View style={styles.flex2}>
          <FormField label="Rua">
            <Input value={props.street} onChangeText={props.setStreet} autoCapitalize="words" editable={!props.cepLoading} />
          </FormField>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.flex1}>
          <FormField label="Numero">
            <Input value={props.addrNum} onChangeText={props.setAddrNum} keyboardType="numeric" />
          </FormField>
        </View>
        <View style={styles.flex2}>
          <FormField label="Complemento">
            <Input value={props.complement} onChangeText={props.setComplement} />
          </FormField>
        </View>
      </View>

      <FormField label="Bairro">
        <Input value={props.neighborhood} onChangeText={props.setNeighborhood} autoCapitalize="words" editable={!props.cepLoading} />
      </FormField>
      <View style={styles.row}>
        <View style={styles.flex2}>
          <FormField label="Cidade">
            <Input value={props.city} onChangeText={props.setCity} autoCapitalize="words" editable={!props.cepLoading} />
          </FormField>
        </View>
      </View>
      <FormField label="UF">
        <UFSelect value={props.addrState} onChange={props.setAddrState} />
      </FormField>
    </View>
  );
}
