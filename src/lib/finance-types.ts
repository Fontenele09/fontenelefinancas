export type TxType = "income" | "expense";

export interface Account {
  id: string;
  name: string;
  type: "checking" | "savings" | "credit" | "cash" | "investment";
  initialBalance: number;
  color: string;
  creditLimit?: number;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: TxType;
  amount: number;
  category: string;
  description: string;
  date: string;
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
  paidMonth?: string;
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

export interface BankPreset {
  id: string;
  name: string;
  color: string;
  type: Account["type"];
  initials: string;
}

export const BANK_PRESETS: BankPreset[] = [
  { id: "nubank",       name: "Nubank",         color: "#820AD1", type: "checking", initials: "Nu" },
  { id: "itau",         name: "Itaú",           color: "#EC7000", type: "checking", initials: "It" },
  { id: "bradesco",     name: "Bradesco",       color: "#CC092F", type: "checking", initials: "Br" },
  { id: "santander",    name: "Santander",      color: "#EC0000", type: "checking", initials: "Sa" },
  { id: "bb",           name: "Banco do Brasil",color: "#FFEF38", type: "checking", initials: "BB" },
  { id: "caixa",        name: "Caixa",          color: "#1A5BAD", type: "checking", initials: "Ca" },
  { id: "inter",        name: "Inter",          color: "#FF7A00", type: "checking", initials: "In" },
  { id: "c6",           name: "C6 Bank",        color: "#1A1A1A", type: "checking", initials: "C6" },
  { id: "picpay",       name: "PicPay",         color: "#21C25E", type: "checking", initials: "Pp" },
  { id: "mercadopago",  name: "Mercado Pago",   color: "#009EE3", type: "checking", initials: "Mp" },
  { id: "next",         name: "Next",           color: "#00FF5F", type: "checking", initials: "Nx" },
  { id: "wallet",       name: "Carteira física",color: "#6B7280", type: "cash",     initials: "Cf" },
];
