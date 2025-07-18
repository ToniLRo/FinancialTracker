export interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: string;
  referenceId?: string;
  accountId?: number;
}

