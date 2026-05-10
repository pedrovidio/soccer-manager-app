import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, Modal, FlatList, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing } from '../../theme';
import { BackButton } from '../BackButton';

export function WizardHeader({
  step,
  totalSteps,
  onBack,
}: {
  step: number;
  totalSteps: number;
  onBack: () => void;
}) {
  return (
    <View style={s.header}>
      <View style={{ marginRight: 12 }}>
        <BackButton onPress={onBack} />
      </View>
      <View style={s.stepInfo}>
        <Text style={s.stepLabel}>
          Passo {step} de {totalSteps}
        </Text>
        <View style={s.progressBar}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <View
              key={String(i)}
              style={[s.progressDot, i < step ? s.progressDotActive : null]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

export function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={s.field}>
      <Text style={s.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

export function ChipRow({
  options,
  selectedValue,
  onSelect,
}: {
  options: { value: string | number; label: string }[];
  selectedValue: string | number;
  onSelect: (value: any) => void;
}) {
  return (
    <View style={s.chipRow}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          style={[s.chip, selectedValue === opt.value ? s.chipActive : null]}
          onPress={() => onSelect(opt.value)}
        >
          <Text style={[s.chipText, selectedValue === opt.value ? s.chipTextActive : null]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export function LevelCard({
  value,
  label,
  desc,
  icon,
  isSelected,
  onSelect,
}: {
  value: string;
  label: string;
  desc: string;
  icon: string;
  isSelected: boolean;
  onSelect: (val: any) => void;
}) {
  return (
    <TouchableOpacity
      style={[s.levelCard, isSelected ? s.levelCardActive : null]}
      onPress={() => onSelect(value)}
    >
      <Text style={s.levelIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[s.levelLabel, isSelected ? s.levelLabelActive : null]}>{label}</Text>
        <Text style={s.levelDesc}>{desc}</Text>
      </View>
      <View style={[s.radio, isSelected ? s.radioActive : null]}>
        {isSelected && <View style={s.radioDot} />}
      </View>
    </TouchableOpacity>
  );
}

export function SwitchRow({
  label,
  desc,
  value,
  onValueChange,
}: {
  label: string;
  desc: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
}) {
  return (
    <View style={s.switchRow}>
      <View style={{ flex: 1 }}>
        <Text style={s.switchLabel}>{label}</Text>
        <Text style={s.switchDesc}>{desc}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: Colors.n300, true: Colors.primary }}
        thumbColor={Colors.white}
      />
    </View>
  );
}

const UF_LIST = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

export function UFSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
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
                onPress={() => {
                  onChange(item);
                  setOpen(false);
                }}
              >
                <Text style={[s.modalItemText, value === item ? s.modalItemTextActive : null]}>
                  {item}
                </Text>
                {value === item && <Text style={{ color: Colors.primary }}>✓</Text>}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </>
  );
}

const TIME_OPTIONS = Array.from({ length: 36 }, (_, i) => {
  const h = Math.floor(i / 2) + 6; // 06:00 até 23:30
  const m = i % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2, '0')}:${m}`;
});

export function TimeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
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
                onPress={() => {
                  onChange(item);
                  setOpen(false);
                }}
              >
                <Text style={[s.modalItemText, value === item ? s.modalItemTextActive : null]}>
                  {item}
                </Text>
                {value === item && <Text style={{ color: Colors.primary }}>✓</Text>}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.n200,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.n100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  backIcon: { fontSize: 18, color: Colors.n900 },
  stepInfo: { flex: 1 },
  stepLabel: { fontSize: 12, color: Colors.n500, marginBottom: 6 },
  progressBar: { flexDirection: 'row', gap: 6 },
  progressDot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: Colors.n200 },
  progressDotActive: { backgroundColor: Colors.primary },

  field: { marginBottom: 12 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: Colors.n700, marginBottom: 5 },

  chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 12 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.r8,
    borderWidth: 1.5,
    borderColor: Colors.n300,
    backgroundColor: Colors.white,
  },
  chipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  chipText: { fontSize: 12, color: Colors.n700, fontWeight: '500' },
  chipTextActive: { color: Colors.primary, fontWeight: '700' },

  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.r12,
    borderWidth: 1.5,
    borderColor: Colors.n200,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  levelCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  levelIcon: { fontSize: 22 },
  levelLabel: { fontSize: 14, fontWeight: '700', color: Colors.n900 },
  levelLabelActive: { color: Colors.primary },
  levelDesc: { fontSize: 11, color: Colors.n500, marginTop: 2 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.n300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: Colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },

  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: Radius.r12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.n200,
    marginBottom: 12,
  },
  switchLabel: { fontSize: 13, fontWeight: '600', color: Colors.n800 },
  switchDesc: { fontSize: 11, color: Colors.n500, marginTop: 2 },

  selectBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.n300,
    borderRadius: Radius.r8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectBtnText: { fontSize: 14, color: Colors.n900 },
  selectArrow: { fontSize: 12, color: Colors.n500 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radius.r16,
    borderTopRightRadius: Radius.r16,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.n200,
  },
  modalTitle: { fontSize: 15, fontWeight: '700', color: Colors.n900 },
  modalClose: { fontSize: 18, color: Colors.n500 },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.n100,
  },
  modalItemActive: { backgroundColor: Colors.primaryLight },
  modalItemText: { fontSize: 14, color: Colors.n900 },
  modalItemTextActive: { color: Colors.primary, fontWeight: '700' },

  timeBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.n300,
    borderRadius: Radius.r8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  timeBtnText: { fontSize: 14, color: Colors.n900, fontWeight: '600' },
});
