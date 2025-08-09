import { Transaction } from "../Transaction/transaction.model";

export interface Card {
    id: number;
    holder: string;
    number: string;
    type: string;
    balance: number;
    currency: string;
    creation_date: string;
    validThru: string;
    frozen?: boolean;
    transactions?: Transaction[];
  }