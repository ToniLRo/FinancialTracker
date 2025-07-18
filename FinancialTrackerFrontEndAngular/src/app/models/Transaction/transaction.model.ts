export interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: string;
  referenceId?: string;
  registerDate?: string; // NUEVO: Añadir registerDate
  accountId?: number;
}

