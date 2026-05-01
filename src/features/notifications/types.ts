export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  referenceId: string | undefined;
  read: boolean;       // normalizado de isRead pelo athleteApi
  createdAt: string;
  avatarInitials: string; // derivado do title pelo athleteApi
}
