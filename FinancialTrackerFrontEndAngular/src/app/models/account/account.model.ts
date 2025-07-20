import { Transaction } from "../Transaction/transaction.model";

export interface Account {
  account_Id?: number;
  holder_name: string;
  account_number: string;
  account_type: string;
  balance: number;
  currency: string;
  creation_date?: string;
  good_thru?: string; // NUEVO: Campo para MM/YY
  userId?: number; // AGREGAR esta propiedad
  transactions?: Transaction[];
}

