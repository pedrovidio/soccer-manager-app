import React from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Switch,
  ScrollView, Image, ActivityIndicator, Alert, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { athleteApi } from '../../services/athleteApi';
import { queryKeys } from '../../../../lib/queryKeys';
import { Colors, Radius, Spacing } from '../../../common/theme';
import { maskCpf, maskPhone } from '../../../common/masks';
import type { useEditProfileForm } from '../../hooks/useEditProfileForm';

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

  const currentPhoto = photoUri ?? dashboard?.photoUrl ?? null;
  const initials = (dashboard?.name ?? '').split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

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
      <View style={s.card}>
        <Field label="Nome completo">
          <TextInput style={s.input} value={name} onChangeText={setName} autoCapitalize="words" />
        </Field>
        <Field label="CPF">
          <TextInput
            style={s.input} value={cpf} keyboardType="numeric"
            onChangeText={(v) => setCpf(maskCpf(v))}
            placeholder="000.000.000-00" placeholderTextColor={Colors.n400}
          />
        </Field>
        <Field label="Sexo">
          <View style={s.chipRow}>
            {([{ value: 'M', label: 'Masculino' }, { value: 'F', label: 'Feminino' }] as const).map((g) => (
              <TouchableOpacity
                key={g.value}
                style={[s.chip, gender === g.value && s.chipActive]}
                onPress={() => setGender(g.value)}
              >
                <Text style={[s.chipText, gender === g.value && s.chipTextActive]}>{g.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Field>
        <Field label="Telefone">
          <TextInput
            style={s.input} value={phone} keyboardType="phone-pad"
            onChangeText={(v) => setPhone(maskPhone(v))}
            placeholder="(00) 00000-0000" placeholderTextColor={Colors.n400}
          />
        </Field>
        <Field label="Idade">
          <TextInput style={s.input} value={age} keyboardType="numeric" onChangeText={(v) => setAge(v.replace(/\D/g, ''))} />
        </Field>
        <Field label="Posição">
          <View style={s.chipRow}>
            {POSITIONS.map((p) => (
              <TouchableOpacity
                key={p.value}
                style={[s.chip, position === p.value && s.chipActive]}
                onPress={() => setPosition(p.value)}
              >
                <Text style={[s.chipText, position === p.value && s.chipTextActive]}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Field>
      </View>

      {/* Goleiro de aluguel */}
      <View style={s.card}>
        <View style={s.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.switchLabel}>Disponível como goleiro de aluguel</Text>
            <Text style={s.switchDesc}>Aparecer para partidas que precisam de goleiro</Text>
          </View>
          <Switch
            value={isGK} onValueChange={setIsGK}
            trackColor={{ false: Colors.n300, true: Colors.primary }}
            thumbColor={Colors.white}
          />
        </View>
      </View>

      {/* PIX */}
      <View style={s.card}>
        <Field label="Chave PIX">
          <TextInput
            style={s.input} value={pixKey} onChangeText={setPixKey}
            placeholder="CPF, e-mail, telefone ou chave aleatória"
            placeholderTextColor={Colors.n400} autoCapitalize="none"
          />
        </Field>
      </View>

      {/* Endereço */}
      <View style={s.card}>
        <Field label="CEP">
          <View style={s.inputWrap}>
            <TextInput
              style={[s.input, s.inputFlex]} value={cep} keyboardType="numeric"
              onChangeText={setCep}
              placeholder="00000-000" placeholderTextColor={Colors.n400}
            />
            {cepLoading && <ActivityIndicator size="small" color={Colors.primary} style={s.inputIcon} />}
          </View>
        </Field>
        <Field label="Rua">
          <TextInput style={s.input} value={street} onChangeText={setStreet} autoCapitalize="words" editable={!cepLoading} />
        </Field>
        <View style={s.row}>
          <View style={s.flex1}>
            <Field label="Número">
              <TextInput style={s.input} value={addrNum} onChangeText={setAddrNum} keyboardType="numeric" />
            </Field>
          </View>
          <View style={s.flex1}>
            <Field label="Complemento">
              <TextInput style={s.input} value={complement} onChangeText={setComplement} />
            </Field>
          </View>
        </View>
        <Field label="Bairro">
          <TextInput style={s.input} value={neighborhood} onChangeText={setNeighborhood} autoCapitalize="words" editable={!cepLoading} />
        </Field>
        <View style={s.row}>
          <View style={s.flex2}>
            <Field label="Cidade">
              <TextInput style={s.input} value={city} onChangeText={setCity} autoCapitalize="words" editable={!cepLoading} />
            </Field>
          </View>
          <View style={s.flex1}>
            <Field label="UF">
              <TextInput style={s.input} value={addrState} onChangeText={(v) => setAddrState(v.toUpperCase())} maxLength={2} autoCapitalize="characters" editable={!cepLoading} />
            </Field>
          </View>
        </View>
      </View>

    </ScrollView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={s.field}>
      <Text style={s.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  scroll:          { padding: Spacing.lg, paddingBottom: 24, gap: 12 },
  photoSection:    { alignItems: 'center', paddingVertical: 8, gap: 8 },
  avatarWrap:      { position: 'relative' },
  avatarImg:       { width: 88, height: 88, borderRadius: 44 },
  avatarFallback:  { width: 88, height: 88, borderRadius: 44, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarInitials:  { fontSize: 30, fontWeight: '800', color: Colors.primary },
  cameraOverlay:   { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.white },
  photoHint:       { fontSize: 12, color: Colors.n400 },
  card:            { backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 0.5, borderColor: Colors.n200, padding: Spacing.lg, gap: 4 },
  field:           { marginBottom: 12 },
  fieldLabel:      { fontSize: 12, fontWeight: '600', color: Colors.n700, marginBottom: 5 },
  input:           { backgroundColor: Colors.n50, borderWidth: 1, borderColor: Colors.n300, borderRadius: Radius.r8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: Colors.n900 },
  inputWrap:       { flexDirection: 'row', alignItems: 'center' },
  inputFlex:       { flex: 1 },
  inputIcon:       { position: 'absolute', right: 10 },
  chipRow:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:            { paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.r8, borderWidth: 1.5, borderColor: Colors.n300, backgroundColor: Colors.white },
  chipActive:      { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  chipText:        { fontSize: 12, fontWeight: '500', color: Colors.n700 },
  chipTextActive:  { color: Colors.primary, fontWeight: '700' },
  switchRow:       { flexDirection: 'row', alignItems: 'center', gap: 12 },
  switchLabel:     { fontSize: 13, fontWeight: '600', color: Colors.n800 },
  switchDesc:      { fontSize: 11, color: Colors.n500, marginTop: 2 },
  row:             { flexDirection: 'row', gap: 10 },
  flex1:           { flex: 1 },
  flex2:           { flex: 2 },
});
