import React, { memo, useCallback } from 'react';
import { SectionList } from 'react-native';
import { AthleteSearchResult, GroupInviteItem } from '@features/groups/groupTypes';
import { EmptySearchResult } from './EmptySearchResult';
import { PendingRow } from './PendingRow';
import { SearchResultRow } from './SearchResultRow';
import { SectionHeader } from './SectionHeader';
import { InviteSection, InviteState, ResendState } from './types';
import { styles } from './styles';

type Props = {
  sections: InviteSection[];
  inviteMap: Record<string, InviteState>;
  resendMap: Record<string, ResendState>;
  searching: boolean;
  onInvite: (athlete: AthleteSearchResult) => void;
  onResend: (invite: GroupInviteItem) => void;
};

function InviteSectionsComponent({ sections, inviteMap, resendMap, searching, onInvite, onResend }: Props) {
  const keyExtractor = useCallback((item: AthleteSearchResult | GroupInviteItem | { __empty: true }, index: number) => {
    if ('inviteId' in item) return item.inviteId || item.athleteId;
    if ('id' in item) return item.id;
    return `empty-${index}`;
  }, []);

  return (
    <SectionList
      keyboardShouldPersistTaps="handled"
      stickySectionHeadersEnabled={false}
      sections={sections}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={null}
      renderSectionHeader={({ section }) => <SectionHeader title={section.title} />}
      renderItem={({ item, section }) => {
        if (section.type === 'results') {
          if ('__empty' in item) return searching ? null : <EmptySearchResult />;
          return (
            <SearchResultRow
              athlete={item as AthleteSearchResult}
              inviteState={inviteMap[(item as AthleteSearchResult).id] ?? 'idle'}
              onInvite={onInvite}
            />
          );
        }

        const invite = item as GroupInviteItem;
        return (
          <PendingRow
            invite={invite}
            resendState={resendMap[invite.athleteId] ?? 'idle'}
            onResend={onResend}
          />
        );
      }}
      initialNumToRender={12}
      maxToRenderPerBatch={12}
      windowSize={8}
      removeClippedSubviews
    />
  );
}

export const InviteSections = memo(InviteSectionsComponent);
