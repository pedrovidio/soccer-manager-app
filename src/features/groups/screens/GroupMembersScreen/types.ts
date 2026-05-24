import { GroupMember } from '../../groupTypes';

export type MembersTab = 'members' | 'spot';

export type ConfirmState = {
  title: string;
  msg: string;
  fn: () => Promise<unknown>;
  errMsg: string;
  destructive?: boolean;
};

export type MemberListItem =
  | { kind: 'label'; id: string; label: string }
  | { kind: 'member'; id: string; member: GroupMember };
