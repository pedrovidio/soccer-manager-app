import { StyleSheet } from 'react-native';
import { Arena } from '@ui/tokens/theme';

export const styles = StyleSheet.create({
  stepTitle: { fontSize: 22, fontWeight: '800', color: Arena.text, marginBottom: 4 },
  stepSubtitle: { fontSize: 13, color: Arena.textMuted, marginBottom: 20 },
  photoSection: { alignItems: 'center', paddingVertical: 12, marginBottom: 20, gap: 8 },
  avatarWrap: { position: 'relative' },
  avatarImg: { width: 88, height: 88, borderRadius: 44 },
  avatarFallback: { width: 88, height: 88, borderRadius: 44, backgroundColor: Arena.mossSoft, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: Arena.neonBorder },
  avatarInitials: { fontSize: 30, fontWeight: '800', color: Arena.neon },
  cameraOverlay: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: Arena.neon, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Arena.bgDeep },
  photoHint: { fontSize: 12, color: Arena.textSubtle },
});
