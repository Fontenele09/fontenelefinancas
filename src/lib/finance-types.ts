export type TxType = "income" | "expense";

export interface Account {
  id: string;
  name: string;
  type: "checking" | "savings" | "credit" | "cash" | "investment";
  initialBalance: number;
  color: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: TxType;
  amount: number;
  category: string;
  description: string;
  date: string; // ISO
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  saved: number;
  deadline?: string;
}

export interface RecurringBill {
  id: string;
  name: string;
  amount: number;
  dueDay: number;
  category?: string;
  paidMonth?: string; // "YYYY-MM" — vazio = não pago este mês
  autoPay?: boolean;
}

export interface FinanceState {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  recurringBills: RecurringBill[];
}

export const EXPENSE_CATEGORIES = [
  "Moradia", "Alimentação", "Transporte", "Saúde", "Educação",
  "Lazer", "Compras", "Contas", "Assinaturas", "Outros",
];

export const INCOME_CATEGORIES = [
  "Salário", "Freelance", "Investimentos", "Vendas", "Presentes", "Outros",
];

export const ACCOUNT_TYPE_LABEL: Record<Account["type"], string> = {
  checking: "Conta Corrente",
  savings: "Poupança",
  credit: "Cartão de Crédito",
  cash: "Dinheiro",
  investment: "Investimentos",
};
