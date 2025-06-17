export interface AppContextType {
  t: (key: string) => string;
  theme: string;
  setTheme: (theme: string) => void;
  language: string;
  setLanguage: (language: string) => void;
}

export interface FamilyMember {
  id: string;
  name: string;
}

export interface AssetLiability {
  id: string;
  name: string;
  value: number;
  ownershipType: 'sole' | 'partial';
  allocations?: {
    memberId: string;
    memberName: string;
    percentage: number;
  }[];
}

export interface Transaction {
  id: string;
  name: string;
  amount: number;
  date: string;
  categoryId: string;
}

export interface Budget {
  id: string;
  name: string;
  amount: number;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
}

export interface LendedCash {
  id: string;
  name: string;
  amount: number;
  date: string;
  returnDate?: string;
  returned: boolean;
}

export interface Translations {
  [key: string]: {
    [key: string]: string;
  };
} 