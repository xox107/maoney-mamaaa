"use client";

import type { Income, Expense } from "@/lib/types";
import { TransactionCard } from "./transaction-card";
import { Separator } from "@/components/ui/separator";

interface TransactionsViewProps {
  pendingIncomes: Income[];
  confirmedIncomes: Income[];
  expenses: Expense[];
  onToggleIncomeStatus: (id: string) => void;
  onEditTransaction: (transaction: Income | Expense) => void;
  onDeleteTransaction: (id: string, type: 'income' | 'expense') => void;
}

export function TransactionsView({ 
  pendingIncomes, 
  confirmedIncomes, 
  expenses, 
  onToggleIncomeStatus,
  onEditTransaction,
  onDeleteTransaction
}: TransactionsViewProps) {
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4 font-headline">Pending Amount</h2>
        {pendingIncomes.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pendingIncomes.sort((a,b) => b.date.getTime() - a.date.getTime()).map((income) => (
              <TransactionCard 
                key={income.id} 
                transaction={income} 
                onToggleStatus={onToggleIncomeStatus}
                onEdit={onEditTransaction}
                onDelete={onDeleteTransaction}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No pending income.</p>
        )}
      </div>

      <Separator />

      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4 font-headline">Recent Transactions</h2>
        <div className="space-y-4">
            {[...confirmedIncomes, ...expenses].sort((a,b) => b.date.getTime() - a.date.getTime()).map((transaction) => (
                <TransactionCard 
                  key={transaction.id} 
                  transaction={transaction} 
                  onEdit={onEditTransaction}
                  onDelete={onDeleteTransaction}
                />
            ))}
        </div>
        {[...confirmedIncomes, ...expenses].length === 0 && <p className="text-muted-foreground">No transactions yet.</p>}
      </div>
    </div>
  );
}
