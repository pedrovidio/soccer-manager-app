import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../theme';
import { Badge, Button, Card } from '../components/UI';

const groups = [
  { id: '1', name: 'Resenha FC', type: 'Campo · São Paulo, SP', members: 24, role: 'admin', image: null },
  { id: '2', name: 'Galera do Society', type: 'Society · Guarulhos, SP', members: 18, role: 'admin', image: null },
  { id: '3', name: 'Fut Resenha', type: 'Futsal · São Paulo, SP', members: 12, role: 'member', image: null },
  { id: '4', name: 'Amigos do Futebol', type: 'Campo · Osasco, SP', members: 20, role: 'member', image: null },
];

export default function GroupsScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {groups.map((g) => (
          <TouchableOpacity key={g.id} activeOpacity={0.8}>
            <Card style={styles.groupCard}>
              <View style={styles.groupImage}>
                <Ionicons name="shield" size={28} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[typography.h3, { color: colors.black }]}>{g.name}</Text>
                <Text style={[typography.caption, { color: colors.gray600 }]}>{g.type}</Text>
                <Text style={[typography.caption, { color: colors.gray600 }]}>{g.members} membros</Text>
                <View style={{ marginTop: 4 }}>
                  {g.role === 'admin' ? (
                    <View style={styles.roleRow}>
                      <Ionicons name="star" size={12} color={colors.orange} />
                      <Text style={[typography.caption, { color: colors.orange, marginLeft: 4, fontWeight: '600' }]}>Administrador</Text>
                    </View>
                  ) : (
                    <View style={styles.roleRow}>
                      <Ionicons name="person" size={12} color={colors.gray600} />
                      <Text style={[typography.caption, { color: colors.gray600, marginLeft: 4 }]}>Membro</Text>
                    </View>
                  )}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.gray600} />
            </Card>
          </TouchableOpacity>
        ))}

        <Button label="+ Criar grupo" fullWidth style={{ marginTop: spacing.sm }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  groupImage: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleRow: { flexDirection: 'row', alignItems: 'center' },
});
