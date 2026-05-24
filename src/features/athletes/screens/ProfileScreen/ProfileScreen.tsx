import React from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { Colors } from '../../../../ui/tokens/theme';
import { AttributesCard } from './AttributesCard';
import { ProfileActions } from './ProfileActions';
import { ProfileHero } from './ProfileHero';
import { styles } from './styles';
import { useProfileScreen } from './useProfileScreen';

export function ProfileScreen() {
  const controller = useProfileScreen();
  const { profile } = controller;

  if (controller.isLoading && !profile.dashboard) {
    return (
      <View style={[styles.safe, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <ProfileHero
          name={profile.name}
          initials={profile.initials}
          overall={profile.overall}
          overallColor={profile.overallColor}
          photoUrl={profile.photoUrl}
          position={profile.position}
          status={profile.status}
          statusStyle={profile.statusStyle}
          onEdit={controller.goEditProfile}
        />
        <AttributesCard stats={profile.stats} />
        <ProfileActions onGroups={controller.goGroups} onLogout={controller.confirmLogout} />
      </ScrollView>
    </View>
  );
}
