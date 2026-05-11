import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Modal, FlatList, Switch, Alert,
} from 'react-native';
import { Colors, Radius, Spacing } from '../../common/theme';
import { maskCpf, maskPhone, maskCep, digitsOnly } from '../../common/masks';

/**
 * Componentes reutilizáveis para formulários de registro e edição de perfil
 */

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={s.field}>
      <Text style={s.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

export function UFSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const UF_LIST = [
    'AC','AL','AP','AM','BA','CE','DF','ES','GO',
    'MA','MT','MS','MG','PA','PB','PR','PE','PI',
    'RJ','RN','RS','RO','RR','SC','SP','SE','TO',
  ];

  return (
    <>
      <TouchableOpacity style={s.selectBtn} onPress={() => setOpen(true)}>
        <Text style={[s.selectBtnText, !value ? { color: Colors.n400 } : null]}>
          {value || 'Selecione o estado'}
        </Text>
        <Text style={s.selectArrow}>▾</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide">
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setOpen(false)} />
        <View style={s.modalSheet}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Selecione o estado</Text>
            <TouchableOpacity onPress={() => setOpen(false)}>
              <Text style={s.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={UF_LIST}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[s.modalItem, value === item ? s.modalItemActive : null]}
                onPress={() => { onChange(item); setOpen(false); }}
              >
                <Text style={[s.modalItemText, value === item ? s.modalItemTextActive : null]}>{item}</Text>
                {value === item && <Text style={{ color: Colors.primary }}>✓</Text>}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </>
  );
}

export function TimeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const TIME_OPTIONS = Array.from({ length: 36 }, (_, i) => {
    const h = Math.floor(i / 2) + 6;
    const m = i % 2 === 0 ? '00' : '30';
    return `${String(h).padStart(2, '0')}:${m}`;
  });

  return (
    <>
      <TouchableOpacity style={s.timeBtn} onPress={() => setOpen(true)}>
        <Text style={s.timeBtnText}>{value || '00:00'}</Text>
        <Text style={s.selectArrow}>▾</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide">
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setOpen(false)} />
        <View style={s.modalSheet}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Selecione o horário</Text>
            <TouchableOpacity onPress={() => setOpen(false)}>
              <Text style={s.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={TIME_OPTIONS}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[s.modalItem, value === item ? s.modalItemActive : null]}
                onPress={() => { onChange(item); setOpen(false); }}
              >
                <Text style={[s.modalItemText, value === item ? s.modalItemTextActive : null]}>{item}</Text>
                {value === item && <Text style={{ color: Colors.primary }}>✓</Text>}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </>
  );
}

export function CEPField({ 
  value, 
  onChange, 
  onCepResolved,
  loading = false,
}: { 
  value: string; 
  onChange: (v: string) => void;
  onCepResolved?: (data: any) => void;
  loading?: boolean;
}) {
  async function handleCepChange(v: string) {
    const digits = v.replace(/\D/g, '').slice(0, 8);
    const masked = digits.replace(/(\d{5})(\d{1,3})/, '$1-$2');
    onChange(masked);
    
    if (digits.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
        const data = await res.json();
        if (!data.erro && onCepResolved) {
          onCepResolved(data);
        } else if (data.erro) {
          Alert.alert('CEP não encontrado');
        }
      } catch {
        Alert.alert('Erro', 'Não foi possível buscar o CEP.');
      }
    }
  }

  return (
    <TouchableOpacity disabled style={s.input}>
      <TextInput
        style={{ flex: 1 }}
        placeholder="00000-000"
        placeholderTextColor={Colors.n400}
        keyboardType="numeric"
        value={value}
        onChangeText={handleCepChange}
        editable={!loading}
      />
      {loading && <Text style={{ color: Colors.primary }}>⟳</Text>}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  field:           { marginBottom: 12 },
  fieldLabel:      { fontSize: 12, fontWeight: '600', color: Colors.n700, marginBottom: 5 },
  input:           { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.n300, borderRadius: Radius.r8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: Colors.n900 },
  selectBtn:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.n300, borderRadius: Radius.r8, paddingHorizontal: 12, paddingVertical: 10 },
  selectBtnText:   { fontSize: 14, color: Colors.n900 },
  selectArrow:     { fontSize: 12, color: Colors.n500 },
  timeBtn:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.n300, borderRadius: Radius.r8, paddingHorizontal: 12, paddingVertical: 10 },
  timeBtnText:     { fontSize: 14, color: Colors.n900, fontWeight: '600' },
  modalOverlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet:      { backgroundColor: Colors.white, borderTopLeftRadius: Radius.r16, borderTopRightRadius: Radius.r16, maxHeight: '60%' },
  modalHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.n200 },
  modalTitle:      { fontSize: 15, fontWeight: '700', color: Colors.n900 },
  modalClose:      { fontSize: 18, color: Colors.n500 },
  modalItem:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.n100 },
  modalItemActive: { backgroundColor: Colors.primaryLight },
  modalItemText:   { fontSize: 14, color: Colors.n900 },
  modalItemTextActive: { color: Colors.primary, fontWeight: '700' },
});
