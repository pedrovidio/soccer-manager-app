import { useLocalSearchParams } from 'expo-router';
import { LiveMatchScreen } from '@features/matches/screens/LiveMatchScreen';

export default function Page() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <LiveMatchScreen matchId={id} />;
}
