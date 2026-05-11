export interface ProfileHistoryItem {
  id: string;
  date: string;
  location: string;
  status: string;
}

export interface ProfileData {
  id: string;
  name: string;
  email: string;
  overall: number;
  preferredPosition: string;
  financialDebt: number;
  history: ProfileHistoryItem[];
}