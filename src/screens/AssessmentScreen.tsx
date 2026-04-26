import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { assessmentApi } from '../services/api';
import { FootballLevel, YearsPlaying, WeeklyFrequency, PreferredPosition } from '../types';
import { colors, typography, spacing, radius } from '../theme';
import { Button, Card } from '../components/UI';

const POSITIONS: { label: string; value: PreferredPosition }[] = [
  { label: 'Goleiro',   value: 'Goalkeeper' },
  { label: 'Zagueiro',  value: 'Defender'   },
  { label: 'Lateral',   value: 'Defender'   },
  { label: 'Volante',   value: 'Midfielder' },
  { label: 'Meia',      value: 'Midfielder' },
  { label: 'Atacante',  value: 'Forward'    },
];

const LEVELS: { label: string; value: FootballLevel }[] = [
  { label: 'Profissional', value: 'PROFESSIONAL' },
  { label: 'Amador',       value: 'AMATEUR'      },
  { label: 'Casual',       value: 'CASUAL'       },
];

const YEARS: { label: string; value: YearsPlaying }[] = [
  { label: '< 2 anos',   value: 'LESS_THAN_2'  },
  { label: '2–5 anos',   value: '2_TO_5'       },
  { label: '6–10 anos',  value: '6_TO_10'      },
  { label: '> 10 anos',  value: 'MORE_THAN_10' },
];

const FREQ: { label: string; value: WeeklyFrequency }[] = [
  { label: 'Raramente',  value: 'RARELY'    },
  { label: '1–2x/sem',   value: '1_TO_2'    },
  { label: '3x+/sem',    value: '3_OR_MORE' },
];

const ATTRS: { key: keyof Stats; label: string }[] = [
  { key: 'pace',      label: 'Velocidade'  },
  { key: 'shooting',  label: 'Finalização' },
  { key: 'passing',   label: 'Passe'       },
  { key: 'dribbling', label: 'Drible'      },
  { key: 'defense',   label: 'Marcação'    },
  { key: 'physical',  label: 'Físico'      },
];

interface Stats { pace: number; shooting: number; passing: number; dribbling: number; defense: number; physical: number; }

const STEPS = [0, 20, 40, 60, 80, 100];

export default function AssessmentScreen({ navigation }: any) {
  const { athlete, refreshAthlete } = useAuth();

  const [position, setPosition]               = useState<PreferredPosition>('Midfielder');
  const [level, setLevel]                     = useState<FootballLevel>('AMATEUR');
  const [yearsPlaying, setYearsPlaying]       = useState<YearsPlaying>('2_TO_5');
  const [weeklyFreq, setWeeklyFreq]           = useState<WeeklyFrequency>('1_TO_2');
  const [playedPro, setPlayedPro]             = useState(false);
  const [stats, setStats]                     = useState<Stats>({ pace: 60, shooting: 60, passing: 60, dribbling: 60, defense: 60, physical: 60 });
  const [loading, setLoading]                 = useState(false);

  async function handleSubmit() {
    setLoading(true);
    try {
      await assessmentApi.submit(athlete!.id, {
        playedProfessionally: playedPro,
        highestLevel:         level,
        yearsPlaying,
        weeklyFrequency:      weeklyFreq,
        selfRatedPace:        stats.pace,
        selfRatedShooting:    stats.shooting,
        selfRatedPassing:     stats.passing,
        selfRatedDribbling:   stats.dribbling,
        selfRatedDefense:     stats.defense,
        selfRatedPhysical:    stats.physical,
        preferredPosition:    position,
      });
      await refreshAthlete();
      Alert.alert('Avaliação salva!', 'Seu Overall foi calculado com base nas suas respostas.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

      {/* Posição */}
      <Card style={{ marginBottom: spacing.md }}>
        <Text style={[typography.h3, { color: colors.black, marginBottom: spacing.sm }]}>Posição principal</Text>
        <View style={styles.chipGrid}>
          {POSITIONS.map((p) => (
            <TouchableOpacity
              key={p.label}
              style={[styles.chip, position === p.value && styles.chipActive]}
              onPress={() => setPosition(p.value)}
            >
              <Text style={[typography.caption, { color: position === p.value ? colors.white : colors.black, fontWeight: '600' }]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Nível */}
      <Card style={{ marginBottom: spacing.md }}>
        <Text style={[typography.h3, { color: colors.black, marginBottom: spacing.sm }]}>Nível mais alto que já competiu</Text>
        <View style={styles.rowGroup}>
          {LEVELS.map((l) => (
            <TouchableOpacity key={l.value} style={[styles.toggleBtn, level === l.value && styles.toggleBtnActive]} onPress={() => setLevel(l.value)}>
              <Text style={[typography.caption, { color: level === l.value ? colors.white : colors.black, fontWeight: '600' }]}>{l.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[typography.caption, { color: colors.gray600, marginTop: spacing.md, marginBottom: spacing.xs }]}>Jogou profissionalmente?</Text>
        <View style={styles.rowGroup}>
          {[{ label: 'Sim', value: true }, { label: 'Não', value: false }].map((o) => (
            <TouchableOpacity key={String(o.value)} style={[styles.toggleBtn, playedPro === o.value && styles.toggleBtnActive]} onPress={() => setPlayedPro(o.value)}>
              <Text style={[typography.caption, { color: playedPro === o.value ? colors.white : colors.black, fontWeight: '600' }]}>{o.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Frequência */}
      <Card style={{ marginBottom: spacing.md }}>
        <Text style={[typography.h3, { color: colors.black, marginBottom: spacing.sm }]}>Há quanto tempo joga?</Text>
        <View style={styles.chipGrid}>
          {YEARS.map((y) => (
            <TouchableOpacity key={y.value} style={[styles.chip, yearsPlaying === y.value && styles.chipActive]} onPress={() => setYearsPlaying(y.value)}>
              <Text style={[typography.caption, { color: yearsPlaying === y.value ? colors.white : colors.black, fontWeight: '600' }]}>{y.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[typography.caption, { color: colors.gray600, marginTop: spacing.md, marginBottom: spacing.xs }]}>Frequência semanal</Text>
        <View style={styles.rowGroup}>
          {FREQ.map((f) => (
            <TouchableOpacity key={f.value} style={[styles.toggleBtn, weeklyFreq === f.value && styles.toggleBtnActive]} onPress={() => setWeeklyFreq(f.value)}>
              <Text style={[typography.caption, { color: weeklyFreq === f.value ? colors.white : colors.black, fontWeight: '600' }]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Atributos 0–100 */}
      <Card style={{ marginBottom: spacing.lg }}>
        <Text style={[typography.h3, { color: colors.black, marginBottom: 4 }]}>Seus atributos</Text>
        <Text style={[typography.caption, { color: colors.gray600, marginBottom: spacing.md }]}>Escala de 0 a 100</Text>
        {ATTRS.map((attr) => (
          <View key={attr.key} style={styles.attrRow}>
            <View style={styles.attrHeader}>
              <Text style={[typography.body, { color: colors.gray600 }]}>{attr.label}</Text>
              <Text style={[typography.body, { color: colors.black, fontWeight: '700' }]}>{stats[attr.key]}</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${stats[attr.key]}%` }]} />
            </View>
            <View style={styles.steps}>
              {STEPS.map((v) => (
                <TouchableOpacity key={v} onPress={() => setStats((s) => ({ ...s, [attr.key]: v }))} style={styles.stepBtn}>
                  <View style={[styles.stepDot, stats[attr.key] >= v && styles.stepDotActive]} />
                  <Text style={styles.stepLabel}>{v}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </Card>

      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <Button label="Salvar avaliação" fullWidth onPress={handleSubmit} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.gray200,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  rowGroup: { flexDirection: 'row', gap: spacing.sm },
  toggleBtn: {
    flex: 1, paddingVertical: spacing.sm, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.gray200, alignItems: 'center',
  },
  toggleBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  attrRow: { marginBottom: spacing.md },
  attrHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  track: { height: 8, backgroundColor: colors.gray200, borderRadius: radius.full, overflow: 'hidden', marginBottom: 6 },
  fill: { height: 8, backgroundColor: colors.primary, borderRadius: radius.full },
  steps: { flexDirection: 'row', justifyContent: 'space-between' },
  stepBtn: { alignItems: 'center', gap: 2 },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gray200 },
  stepDotActive: { backgroundColor: colors.primary },
  stepLabel: { fontSize: 10, color: colors.gray600 },
});
