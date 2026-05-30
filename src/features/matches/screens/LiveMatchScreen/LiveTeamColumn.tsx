import React, { memo } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { getFullImageUrl } from '@lib/imageUrl';
import { Avatar } from '@ui/composites/Avatar';
import { getInitials } from '@ui/utils/avatar';
import type { LiveMatchPlayer, LiveMatchTeam } from '../../types';
import { styles } from './styles';

type LivePlayerCardProps = {
  player: LiveMatchPlayer;
  enabled: boolean;
  disabled: boolean;
  teamType: LiveMatchTeam;
  onAddGoal: (athleteId: string, team: LiveMatchTeam) => void;
};

const LivePlayerCard = memo(function LivePlayerCard({
  player,
  enabled,
  disabled,
  teamType,
  onAddGoal,
}: LivePlayerCardProps) {
  const photoUrl = getFullImageUrl(player.photoUrl);
  const content = (
    <>
      {photoUrl ? (
        <Image
          accessibilityLabel={`Foto de ${player.name}`}
          source={{ uri: photoUrl }}
          style={styles.playerAvatar}
        />
      ) : (
        <Avatar
          color={teamType === 'HOME' ? 'amber' : 'blue'}
          initials={getInitials(player.name)}
          size="sm"
        />
      )}
      <Text numberOfLines={2} style={styles.playerName}>{player.name}</Text>
    </>
  );

  if (!enabled) {
    return <View style={styles.playerCard}>{content}</View>;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.72}
      disabled={disabled}
      onPress={() => onAddGoal(player.id, teamType)}
      style={[styles.playerCard, styles.playerCardInteractive, disabled ? styles.playerCardDisabled : null]}
    >
      {content}
    </TouchableOpacity>
  );
});

type TeamColumnProps = {
  players: LiveMatchPlayer[];
  teamName: string;
  teamType: LiveMatchTeam;
  canRegisterGoal: boolean;
  isSubmitting: boolean;
  onAddGoal: (athleteId: string, team: LiveMatchTeam) => void;
};

export const LiveTeamColumn = memo(function LiveTeamColumn({
  players,
  teamName,
  teamType,
  canRegisterGoal,
  isSubmitting,
  onAddGoal,
}: TeamColumnProps) {
  return (
    <View style={styles.teamColumn}>
      <View style={[styles.teamHeading, teamType === 'HOME' ? styles.homeHeading : styles.awayHeading]}>
        <Text
          style={[styles.teamHeadingText, teamType === 'AWAY' ? styles.awayHeadingText : null]}
          numberOfLines={1}
        >
          {teamName}
        </Text>
      </View>
      {players.length === 0 ? (
        <View style={styles.emptyLineup}>
          <Text style={styles.emptyLineupText}>Sem jogadores</Text>
        </View>
      ) : (
        players.map((player) => (
          <LivePlayerCard
            key={player.id}
            player={player}
            enabled={canRegisterGoal}
            disabled={isSubmitting}
            teamType={teamType}
            onAddGoal={onAddGoal}
          />
        ))
      )}
    </View>
  );
});
