import React from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Image, ActivityIndicator, Alert, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { athleteApi } from '../../services/athleteApi';
import { queryKeys } from '../../../../lib/queryKeys';
import { Colors, Radius, Spacing } from '../../../common/theme';
import { maskCpf, maskPhone } from '../../../common/masks';
import type { useEditProfileForm } from '../../hooks/useEditProfileForm';
import { FormField, ChipRow, SwitchRow, UFSelect } from '../../../common/components/form/FormElements';
import { getFullImageUrl } from '../../../../lib/imageUrl';

type Props = Pick<
  ReturnType<typeof useEditProfileForm>,
  | 'name' | 'setName' | 'cpf' | 'setCpf' | 'gender' | 'setGender'
  | 'phone' | 'setPhone' | 'age' | 'setAge'
  | 'position' | 'setPosition' | 'isGK' | 'setIsGK' | 'pixKey' | 'setPixKey'
  | 'photoUri' | 'setPhotoUri'
  | 'cep' | 'setCep' | 'cepLoading' | 'street' | 'setStreet' | 'addrNum' | 'setAddrNum'
  | 'complement' | 'setComplement' | 'neighborhood' | 'setNeighborhood'
  | 'city' | 'setCity' | 'addrState' | 'setAddrState'
  | 'athleteId' | 'dashboard'
>;

const POSITIONS = [
  { value: 'Goalkeeper', label: 'Goleiro' },
  { value: 'Defender',   label: 'Zagueiro' },
  { value: 'Midfielder', label: 'Meia' },
  { value: 'Forward',    label: 'Atacante' },
];

const GENDERS = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Feminino' },
];

export default function StepCadastro(props: Props) {
  const {
    name, setName, cpf, setCpf, gender, setGender,
    phone, setPhone, age, setAge,
    position, setPosition, isGK, setIsGK, pixKey, setPixKey,
    photoUri, setPhotoUri,
    cep, setCep, cepLoading, street, setStreet, addrNum, setAddrNum,
    complement, setComplement, neighborhood, setNeighborhood,
    city, setCity, addrState, setAddrState,
    athleteId, dashboard,
  } = props;

  const qc = useQueryClient();

  const photoMutation = useMutation({
    mutationFn: (uri: string) => athleteApi.uploadPhoto(athleteId, uri),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.dashboard(athleteId) }),
    onError: () => Alert.alert('Erro', 'Não foi possível enviar a foto.'),
  });

  async function pickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Permita o acesso à galeria para trocar a foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setPhotoUri(uri);
      photoMutation.mutate(uri);
    }
  }

  const currentPhoto = photoUri ?? getFullImageUrl(dashboard?.photoUrl) ?? null;
  const initials = (dashboard?.name ?? '').split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();

  return (
    <View>
      <Text style={s.stepTitle}>Dados pessoais</Text>
      <Text style={s.stepSubtitle}>Informações básicas e endereço</Text>

      {/* Foto */}
      <View style={s.photoSection}>
        <TouchableOpacity style={s.avatarWrap} onPress={pickPhoto} activeOpacity={0.8}>
          {currentPhoto
            ? <Image source={{ uri: currentPhoto }} style={s.avatarImg} />
            : <View style={s.avatarFallback}><Text style={s.avatarInitials}>{initials}</Text></View>
          }
          <View style={s.cameraOverlay}>
            {photoMutation.isPending
              ? <ActivityIndicator size="small" color={Colors.white} />
              : <Ionicons name="camera" size={18} color={Colors.white} />
            }
          </View>
        </TouchableOpacity>
        <Text style={s.photoHint}>Toque para alterar a foto</Text>
      </View>

      {/* Dados pessoais */}
      <FormField label="Nome completo">
        <TextInput style={s.input} value={name} onChangeText={setName} autoCapitalize="words" />
      </FormField>
      <FormField label="CPF">
        <TextInput
          style={s.input} value={cpf} keyboardType="numeric"
          onChangeText={(v) => setCpf(maskCpf(v))}
          placeholder="000.000.000-00" placeholderTextColor={Colors.n400}
        />
      </FormField>
      <FormField label="Sexo">
        <ChipRow
          options={GENDERS}
          selectedValue={gender}
          onSelect={setGender}
        />
      </FormField>

      <View style={s.row}>
        <View style={s.flex1}>
          <FormField label="Telefone">
            <TextInput
              style={s.input} value={phone} keyboardType="phone-pad"
              onChangeText={(v) => setPhone(maskPhone(v))}
              placeholder="(00) 00000-0000" placeholderTextColor={Colors.n400}
            />
          </FormField>
        </View>
        <View style={s.flex1}>
          <FormField label="Idade">
            <TextInput style={s.input} value={age} keyboardType="numeric" onChangeText={(v) => setAge(v.replace(/\D/g, ''))} />
          </FormField>
        </View>
      </View>

      <FormField label="Posição">
        <ChipRow
          options={POSITIONS}
          selectedValue={position}
          onSelect={setPosition}
        />
      </FormField>

      {/* PIX */}
      <FormField label="Chave PIX">
        <TextInput
          style={s.input} value={pixKey} onChangeText={setPixKey}
          placeholder="CPF, e-mail, telefone ou chave aleatória"
          placeholderTextColor={Colors.n400} autoCapitalize="none"
        />
      </FormField>

      {/* Endereço */}
      <View style={s.divider} />
      <Text style={s.sectionLabel}>Endereço</Text>

      <View style={s.row}>
        <View style={s.flex1}>
          <FormField label="CEP">
            <View style={s.inputWrap}>
              <TextInput
                style={[s.input, s.inputFlex]} value={cep} keyboardType="numeric"
                onChangeText={setCep}
                placeholder="00000-000" placeholderTextColor={Colors.n400}
              />
              {cepLoading && <ActivityIndicator size="small" color={Colors.primary} style={s.inputIcon} />}
            </View>
          </FormField>
        </View>
        <View style={s.flex2}>
          <FormField label="Rua">
            <TextInput style={s.input} value={street} onChangeText={setStreet} autoCapitalize="words" editable={!cepLoading} />
          </FormField>
        </View>
      </View>

      <View style={s.row}>
        <View style={s.flex1}>
          <FormField label="Número">
            <TextInput style={s.input} value={addrNum} onChangeText={setAddrNum} keyboardType="numeric" />
          </FormField>
        </View>
        <View style={s.flex2}>
          <FormField label="Complemento">
            <TextInput style={s.input} value={complement} onChangeText={setComplement} />
          </FormField>
        </View>
      </View>

      <FormField label="Bairro">
        <TextInput style={s.input} value={neighborhood} onChangeText={setNeighborhood} autoCapitalize="words" editable={!cepLoading} />
      </FormField>

      <View style={s.row}>
        <View style={s.flex2}>
          <FormField label="Cidade">
            <TextInput style={s.input} value={city} onChangeText={setCity} autoCapitalize="words" editable={!cepLoading} />
          </FormField>
        </View>
      </View>

      <FormField label="UF">
        <UFSelect value={addrState} onChange={setAddrState} />
      </FormField>

      <SwitchRow
        label="Disponível como goleiro de aluguel?"
        desc="Você poderá ser contratado para partidas"
        value={isGK}
        onValueChange={setIsGK}
      />
    </View>
  );
}

const s = StyleSheet.create({
  stepTitle:       { fontSize: 22, fontWeight: '800', color: Colors.n900, marginBottom: 4 },
  stepSubtitle:    { fontSize: 13, color: Colors.n500, marginBottom: 20 },
  photoSection:    { alignItems: 'center', paddingVertical: 12, marginBottom: 20, gap: 8 },
  avatarWrap:      { position: 'relative' },
  avatarImg:       { width: 88, height: 88, borderRadius: 44 },
  avatarFallback:  { width: 88, height: 88, borderRadius: 44, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarInitials:  { fontSize: 30, fontWeight: '800', color: Colors.primary },
  cameraOverlay:   { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.white },
  photoHint:       { fontSize: 12, color: Colors.n400 },
  input:           { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.n300, borderRadius: Radius.r8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: Colors.n900 },
  inputWrap:       { flexDirection: 'row', alignItems: 'center' },
  inputFlex:       { flex: 1 },
  inputIcon:       { marginLeft: 8 },
  divider:         { height: 1, backgroundColor: Colors.n200, marginVertical: 16 },
  sectionLabel:    { fontSize: 13, fontWeight: '700', color: Colors.n700, marginBottom: 10 },
  row:             { flexDirection: 'row', alignItems: 'flex-start' },
  flex1:           { flex: 1, marginRight: 8 },
  flex2:           { flex: 2, marginRight: 8 },
});
