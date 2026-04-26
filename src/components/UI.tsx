import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, typography, spacing, radius } from '../theme';

// ─── Badge ───────────────────────────────────────────────────────────────────
type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const badgeColors: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: '#DCFCE7', text: colors.green },
  warning: { bg: '#FEF3C7', text: colors.orange },
  danger: { bg: '#FEE2E2', text: colors.red },
  info: { bg: '#DBEAFE', text: colors.primary },
  neutral: { bg: colors.gray200, text: colors.gray600 },
};

export function Badge({ label, variant = 'neutral', style }: { label: string; variant?: BadgeVariant; style?: ViewStyle }) {
  const c = badgeColors[variant];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }, style]}>
      <Text style={[typography.caption, { color: c.text, fontWeight: '600' }]}>{label}</Text>
    </View>
  );
}

// ─── Button ──────────────────────────────────────────────────────────────────
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

export function Button({
  label,
  onPress,
  variant = 'primary',
  style,
  fullWidth = false,
}: {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  style?: ViewStyle;
  fullWidth?: boolean;
}) {
  const btnStyles: Record<ButtonVariant, ViewStyle> = {
    primary: { backgroundColor: colors.primary },
    secondary: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
    danger: { backgroundColor: colors.red },
    ghost: { backgroundColor: 'transparent' },
  };
  const textStyles: Record<ButtonVariant, TextStyle> = {
    primary: { color: colors.white },
    secondary: { color: colors.primary },
    danger: { color: colors.white },
    ghost: { color: colors.primary },
  };
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.btn, btnStyles[variant], fullWidth && { width: '100%' }, style]}
      activeOpacity={0.8}
    >
      <Text style={[styles.btnText, textStyles[variant]]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────
export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

// ─── SectionTitle ────────────────────────────────────────────────────────────
export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={[typography.h3, { color: colors.black }]}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={[typography.caption, { color: colors.primary, fontWeight: '600' }]}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── OverallBadge ─────────────────────────────────────────────────────────────
export function OverallBadge({ value }: { value: number }) {
  const color = value >= 80 ? colors.green : value >= 70 ? colors.orange : colors.red;
  return (
    <View style={[styles.overallBadge, { backgroundColor: color }]}>
      <Text style={styles.overallText}>{value}</Text>
    </View>
  );
}

// ─── StatBar ─────────────────────────────────────────────────────────────────
export function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <View style={{ marginBottom: spacing.sm }}>
      <View style={styles.statRow}>
        <Text style={[typography.body, { color: colors.gray600 }]}>{label}</Text>
        <Text style={[typography.body, { color: colors.black, fontWeight: '600' }]}>{value}</Text>
      </View>
      <View style={styles.statTrack}>
        <View style={[styles.statFill, { width: `${value}%` }]} />
      </View>
    </View>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────
export function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  btn: {
    paddingVertical: 13,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.lg,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  overallBadge: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overallText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statTrack: {
    height: 6,
    backgroundColor: colors.gray200,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  statFill: {
    height: 6,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray200,
    marginVertical: spacing.sm,
  },
});
