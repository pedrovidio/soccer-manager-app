import React, { memo } from 'react';
import { Image, Linking, Pressable, StyleSheet, View } from 'react-native';
import { Arena, Radius } from '@ui/tokens/theme';

export interface SponsorBannerData {
  imageUrl?: string | null;
  targetUrl?: string | null;
}

interface SponsorBannerProps {
  sponsorData?: SponsorBannerData | null;
}

function SponsorBannerComponent({ sponsorData }: SponsorBannerProps) {
  if (!sponsorData?.imageUrl) {
    return null;
  }

  const banner = (
    <Image
      accessibilityLabel="Banner do patrocinador"
      resizeMode="cover"
      source={{ uri: sponsorData.imageUrl }}
      style={styles.image}
    />
  );

  if (!sponsorData.targetUrl) {
    return <View style={styles.container}>{banner}</View>;
  }

  const targetUrl = sponsorData.targetUrl;

  return (
    <Pressable
      accessibilityLabel="Abrir site do patrocinador"
      accessibilityRole="link"
      onPress={() => {
        void Linking.openURL(targetUrl).catch(() => undefined);
      }}
      style={styles.container}
    >
      {banner}
    </Pressable>
  );
}

export const SponsorBanner = memo(SponsorBannerComponent);

const styles = StyleSheet.create({
  container: {
    backgroundColor: Arena.card,
    borderColor: Arena.line,
    borderRadius: Radius.r12,
    borderWidth: 1,
    height: 76,
    overflow: 'hidden',
    width: '100%',
  },
  image: {
    height: '100%',
    width: '100%',
  },
});
