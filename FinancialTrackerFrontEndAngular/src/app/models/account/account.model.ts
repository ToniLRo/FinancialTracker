import { Transaction } from "../Transaction/transaction.model";

export interface Account {
  account_Id?: number;
  account_name: string;
  account_type: 'Cash' | 'BankAccount' | 'CreditCard';
  initial_balance: number;
  currency: string;
  creation_date?: string;
  
  // Campos opcionales para UI
  frozen?: boolean;
  transactions?: Transaction[];
}

