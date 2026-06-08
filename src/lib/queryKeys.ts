export const queryKeys = {
  home:          (athleteId: string) => ['home', athleteId] as const,
  dashboard:     (athleteId: string) => ['dashboard', athleteId] as const,
  notifications: (athleteId: string) => ['notifications', athleteId] as const,
  invites:       (athleteId: string) => ['invites', athleteId] as const,
  marketplace:   (athleteId: string) => ['marketplace', athleteId] as const,
  ranking:       () => ['ranking'] as const,
  rankingMe:     (athleteId: string) => ['ranking', 'me', athleteId] as const,
  featureFlags:  () => ['app-config', 'feature-flags'] as const,
  groupMatches:  (groupId: string)   => ['groupMatches', groupId] as const,
  groupFinanceReport: (groupId: string, athleteId: string, filters: unknown, pageSize: number) =>
    ['group-finance-report', groupId, athleteId, filters, pageSize] as const,
  groupFinanceReports: (groupId: string) => ['group-finance-report', groupId] as const,
  assessment:    (athleteId: string) => ['assessment', athleteId] as const,
  availability:  (athleteId: string) => ['availability', athleteId] as const,
};
