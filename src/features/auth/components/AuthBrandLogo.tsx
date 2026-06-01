import React, { memo } from 'react';
import { Image, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { Colors, Radius } from '@ui/tokens/theme';

type AuthBrandLogoProps = {
  compact?: boolean;
  nameColor?: string;
  showName?: boolean;
  style?: ViewStyle;
};

function AuthBrandLogoComponent({ compact = false, nameColor, showName = true, style }: AuthBrandLogoProps) {
  return (
    <View style={[styles.wrap, compact && styles.wrapCompact, style]}>
      <Image
        accessibilityIgnoresInvertColors
        accessibilityLabel="Logo Não Fico Sem Jogar"
        resizeMode="contain"
        source={require('../../../../assets/images/logo.png')}
        style={[styles.image, compact && styles.imageCompact]}
      />
      {showName ? (
        <Text style={[styles.name, compact && styles.nameCompact, nameColor ? { color: nameColor } : null]}>
          NÃO FICO SEM JOGAR
        </Text>
      ) : null}
    </View>
  );
}

export const AuthBrandLogo = memo(AuthBrandLogoComponent);

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 12,
  },
  wrapCompact: {
    alignSelf: 'center',
    flexDirection: 'column',
    gap: 8,
  },
  image: {
    width: 58,
    height: 58,
    borderRadius: Radius.r16,
  },
  imageCompact: {
    width: 70,
    height: 70,
    borderRadius: Radius.r16,
  },
  name: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  nameCompact: {
    color: Colors.n900,
    fontSize: 12,
    letterSpacing: 0.6,
    textAlign: 'center',
  },
});
