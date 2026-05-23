import { Colors } from '../../../../ui/tokens/theme';

export function getOverallColor(value: number) {
  if (value >= 75) return Colors.success;
  if (value >= 55) return Colors.warning;
  return Colors.error;
}
