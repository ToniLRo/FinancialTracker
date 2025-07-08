import { Transaction } from "../Transaction/transaction.model";

export interface Card {
    id: number;
    holder: string;
    number: string;
    type: string;
    balance: number;
    validThru: string;
    frozen?: boolean;
    transactions?: Transaction[];
  }