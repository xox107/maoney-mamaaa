import { Timestamp } from "firebase/firestore";

export const incomeCategories = ["Salary", "Freelance", "Gifts", "Investment"] as const;
export const expenseCategories = ["Groceries", "Rent", "Utilities", "Entertainment", "Transport", "Health"] as const;

export type IncomeCategory = typeof incomeCategories[number] | 'Other';
export type ExpenseCategory = typeof expenseCategories[number] | 'Other';

export interface Transaction {
    id: string;
    amount: number;
    date: Date | Timestamp;
    note: string;
}

export interface Income extends Transaction {
    category: IncomeCategory;
    isPending: boolean;
}

export interface Expense extends Transaction {
    category: ExpenseCategory;
}
