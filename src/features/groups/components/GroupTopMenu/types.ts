export type GroupTopMenuTab = 'summary' | 'members' | 'matches' | 'finance';

export type GroupTopMenuItem = {
  key: GroupTopMenuTab;
  label: string;
  pathname: string;
};
