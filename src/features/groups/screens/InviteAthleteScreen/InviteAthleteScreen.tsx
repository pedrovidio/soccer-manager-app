import React from 'react';
import { SafeAreaView } from 'react-native';
import { InviteHeader } from './InviteHeader';
import { InviteSections } from './InviteSections';
import { SearchBar } from './SearchBar';
import { styles } from './styles';
import { useInviteAthleteScreen } from './useInviteAthleteScreen';

export function InviteAthleteScreen() {
  const controller = useInviteAthleteScreen();

  return (
    <SafeAreaView style={styles.safe}>
      <InviteHeader groupName={controller.groupName} />
      <SearchBar query={controller.query} searching={controller.searching} onSearch={controller.handleSearch} />
      <InviteSections
        sections={controller.sections}
        inviteMap={controller.inviteMap}
        resendMap={controller.resendMap}
        searching={controller.searching}
        onInvite={controller.handleInvite}
        onResend={controller.handleResend}
      />
    </SafeAreaView>
  );
}
