import React from 'react';
import { ActivityIndicator, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@ui/tokens/theme';
import { maskCpf, maskPhone } from '@ui/utils/masks';
import { FormField, ChipRow, UFSelect } from '@ui/primitives';
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
              ? <ActivityIndicator size="small" color={Colors.white} />
              : <Ionicons name="camera" size={18} color={Colors.white} />}
          </View>
        </TouchableOpacity>
        <Text style={styles.photoHint}>Toque para alterar a foto</Text>
      </View>

      <FormField label="Nome completo">
        <TextInput style={styles.input} value={props.name} onChangeText={props.setName} autoCapitalize="words" />
      </FormField>
      <FormField label="CPF">
        <TextInput
          style={styles.input}
          value={props.cpf}
          keyboardType="numeric"
          onChangeText={(value) => props.setCpf(maskCpf(value))}
          placeholder="000.000.000-00"
          placeholderTextColor={Colors.n400}
        />
      </FormField>
      <FormField label="Sexo">
        <ChipRow options={GENDERS} selectedValue={props.gender} onSelect={props.setGender} />
      </FormField>

      <View style={styles.row}>
        <View style={styles.flex1}>
          <FormField label="Telefone">
            <TextInput
              style={styles.input}
              value={props.phone}
              keyboardType="phone-pad"
              onChangeText={(value) => props.setPhone(maskPhone(value))}
              placeholder="(00) 00000-0000"
              placeholderTextColor={Colors.n400}
            />
          </FormField>
        </View>
        <View style={styles.flex1}>
          <FormField label="Idade">
            <TextInput style={styles.input} value={props.age} keyboardType="numeric" onChangeText={(value) => props.setAge(value.replace(/\D/g, ''))} />
          </FormField>
        </View>
      </View>

      <FormField label="Posicao">
        <ChipRow options={POSITIONS} selectedValue={props.position} onSelect={props.setPosition} />
      </FormField>

      <FormField label="Chave PIX">
        <TextInput
          style={styles.input}
          value={props.pixKey ?? ''}
          onChangeText={props.setPixKey}
          placeholder="CPF, e-mail, telefone ou chave aleatoria"
          placeholderTextColor={Colors.n400}
          autoCapitalize="none"
        />
      </FormField>

      <View style={styles.divider} />
      <Text style={styles.sectionLabel}>Endereco</Text>

      <View style={styles.row}>
        <View style={styles.flex1}>
          <FormField label="CEP">
            <View style={styles.inputWrap}>
              <TextInput
                style={[styles.input, styles.inputFlex]}
                value={props.cep}
                keyboardType="numeric"
                onChangeText={props.setCep}
                placeholder="00000-000"
                placeholderTextColor={Colors.n400}
              />
              {props.cepLoading && <ActivityIndicator size="small" color={Colors.primary} style={styles.inputIcon} />}
            </View>
          </FormField>
        </View>
        <View style={styles.flex2}>
          <FormField label="Rua">
            <TextInput style={styles.input} value={props.street} onChangeText={props.setStreet} autoCapitalize="words" editable={!props.cepLoading} />
          </FormField>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.flex1}>
          <FormField label="Numero">
            <TextInput style={styles.input} value={props.addrNum} onChangeText={props.setAddrNum} keyboardType="numeric" />
          </FormField>
        </View>
        <View style={styles.flex2}>
          <FormField label="Complemento">
            <TextInput style={styles.input} value={props.complement} onChangeText={props.setComplement} />
          </FormField>
        </View>
      </View>

      <FormField label="Bairro">
        <TextInput style={styles.input} value={props.neighborhood} onChangeText={props.setNeighborhood} autoCapitalize="words" editable={!props.cepLoading} />
      </FormField>
      <View style={styles.row}>
        <View style={styles.flex2}>
          <FormField label="Cidade">
            <TextInput style={styles.input} value={props.city} onChangeText={props.setCity} autoCapitalize="words" editable={!props.cepLoading} />
          </FormField>
        </View>
      </View>
      <FormField label="UF">
        <UFSelect value={props.addrState} onChange={props.setAddrState} />
      </FormField>
    </View>
  );
}
