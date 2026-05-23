import { StyleSheet } from 'react-native';
import { Colors, Radius } from '../../../../ui/tokens/theme';

export const styles = StyleSheet.create({
  stepTitle: { fontSize: 22, fontWeight: '800', color: Colors.n900, marginBottom: 4 },
  stepSubtitle: { fontSize: 13, color: Colors.n500, marginBottom: 20 },
  photoSection: { alignItems: 'center', paddingVertical: 12, marginBottom: 20, gap: 8 },
  avatarWrap: { position: 'relative' },
  avatarImg: { width: 88, height: 88, borderRadius: 44 },
  avatarFallback: { width: 88, height: 88, borderRadius: 44, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { fontSize: 30, fontWeight: '800', color: Colors.primary },
  cameraOverlay: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.white },
  photoHint: { fontSize: 12, color: Colors.n400 },
  input: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.n300, borderRadius: Radius.r8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: Colors.n900 },
  inputWrap: { flexDirection: 'row', alignItems: 'center' },
  inputFlex: { flex: 1 },
  inputIcon: { marginLeft: 8 },
  divider: { height: 1, backgroundColor: Colors.n200, marginVertical: 16 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: Colors.n700, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  flex1: { flex: 1, marginRight: 8 },
  flex2: { flex: 2, marginRight: 8 },
});
