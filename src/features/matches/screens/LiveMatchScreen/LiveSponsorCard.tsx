import React, { memo } from 'react';
import { Image, Text, View } from 'react-native';
import type { LiveMatchSponsor } from '../../types';
import { styles } from './styles';

type Props = {
  sponsor: LiveMatchSponsor;
};

function LiveSponsorCardComponent({ sponsor }: Props) {
  return (
    <View style={styles.sponsorCard}>
      <Text style={styles.sponsorCaption}>Patrocinador da partida</Text>
      <View style={styles.sponsorContent}>
        {sponsor.logoUri ? (
          <Image
            accessibilityLabel={`Logo de ${sponsor.name}`}
            resizeMode="contain"
            source={{ uri: sponsor.logoUri }}
            style={styles.sponsorLogo}
          />
        ) : (
          <View style={styles.sponsorLogo} />
        )}
        <Text style={styles.sponsorName}>{sponsor.name}</Text>
      </View>
    </View>
  );
}

export const LiveSponsorCard = memo(LiveSponsorCardComponent);
