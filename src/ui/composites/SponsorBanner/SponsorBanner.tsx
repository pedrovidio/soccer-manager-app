import React, { memo } from 'react';
import { Image, Linking, Pressable, StyleSheet, View, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { useFeatureAccess } from '@features/app-config/hooks/useFeatureAccess';
import { usePremium } from '../../../hooks/usePremium';
import { Arena, Radius } from '@ui/tokens/theme';

export interface SponsorBannerData {
  imageUrl?: string | null;
  targetUrl?: string | null;
}

interface SponsorBannerProps {
  sponsorData?: SponsorBannerData | null;
}

const adUnitId = __DEV__
  ? TestIds.BANNER
  : (Platform.OS === 'ios'
      ? (process.env.EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID_IOS || TestIds.BANNER)
      : (process.env.EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID_ANDROID || TestIds.BANNER));

function SponsorBannerComponent({ sponsorData }: SponsorBannerProps) {
  const adFreeAccess = useFeatureAccess('AD_FREE');
  const { isPremium } = usePremium();
  const canShowAds = !adFreeAccess.isLoading && adFreeAccess.isFeatureActive && !isPremium;

  if (!canShowAds) {
    return null;
  }

  // Se existir imagem de patrocínio direto, exibe-a
  if (sponsorData?.imageUrl) {
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

  // Fallback: Exibir Google AdMob Banner
  return (
    <View style={styles.admobContainer} testID="admob-banner-container">
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true, // LGPD/GDPR compliance
        }}
        onAdFailedToLoad={(error) => {
          console.warn('Falha ao carregar AdMob:', error);
        }}
      />
    </View>
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
  admobContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 50,
  },
});
