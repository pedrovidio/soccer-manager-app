export const queryKeys = {
  dashboard:     (athleteId: string) => ['dashboard', athleteId] as const,
  notifications: (athleteId: string) => ['notifications', athleteId] as const,
  invites:       (athleteId: string) => ['invites', athleteId] as const,
  groupMatches:  (groupId: string)   => ['groupMatches', groupId] as const,
};
