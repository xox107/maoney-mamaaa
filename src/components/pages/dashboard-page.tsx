"use client";

import { useState, useMemo } from "react";
import type { Income, Expense } from "@/lib/types";
import { AppHeader } from "@/components/dashboard/app-header";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { TransactionsView } from "@/components/dashboard/transactions-view";
import { AnalysisView } from "@/components/dashboard/analysis-view";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import type { IncomeFormValues, ExpenseFormValues } from "../dashboard/add-transaction-dialog";


export function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const incomesRef = useMemoFirebase(() => user ? collection(firestore, `users/${user.uid}/incomes`) : null, [firestore, user]);
  const expensesRef = useMemoFirebase(() => user ? collection(firestore, `users/${user.uid}/expenses`) : null, [firestore, user]);

  const { data: incomesData, isLoading: incomesLoading } = useCollection<Income>(incomesRef);
  const { data: expensesData, isLoading: expensesLoading } = useCollection<Expense>(expensesRef);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Income | Expense | null>(null);

  // Convert Firestore Timestamps to Dates
  const incomes = useMemo(() => {
    return (incomesData || []).map(inc => ({...inc, date: (inc.date as any).toDate()}))
  }, [incomesData]);

  const expenses = useMemo(() => {
    return (expensesData || []).map(exp => ({...exp, date: (exp.date as any).toDate()}))
  }, [expensesData]);


  const { pendingIncomes, confirmedIncomes, totalConfirmedIncome, totalExpenses, balance, totalPendingIncome } = useMemo(() => {
    const pending = incomes.filter((i) => i.isPending);
    const confirmed = incomes.filter((i) => !i.isPending);
    const totalPending = pending.reduce((sum, i) => sum + i.amount, 0);
    const totalConfirmed = confirmed.reduce((sum, i) => sum + i.amount, 0);
    const totalExp = expenses.reduce((sum, e) => sum + e.amount, 0);
    const bal = totalConfirmed - totalExp;
    return {
      pendingIncomes: pending,
      confirmedIncomes: confirmed,
      totalPendingIncome: totalPending,
      totalConfirmedIncome: totalConfirmed,
      totalExpenses: totalExp,
      balance: bal,
    };
  }, [incomes, expenses]);
  
  const handleAddIncome = (data: IncomeFormValues) => {
    if (!user || !incomesRef) return;
    const newIncome = {
      ...data,
      userAccountId: user.uid,
    };
    addDocumentNonBlocking(incomesRef, newIncome);
  };

  const handleAddExpense = (data: ExpenseFormValues) => {
    if (!user || !expensesRef) return;
    const newExpense = {
      ...data,
      userAccountId: user.uid,
    };
    addDocumentNonBlocking(expensesRef, newExpense);
  };

  const handleEditIncome = (id: string, data: IncomeFormValues) => {
    if (!user) return;
    const incomeRef = doc(firestore, `users/${user.uid}/incomes/${id}`);
    updateDocumentNonBlocking(incomeRef, data);
  };

  const handleEditExpense = (id: string, data: ExpenseFormValues) => {
    if (!user) return;
    const expenseRef = doc(firestore, `users/${user.uid}/expenses/${id}`);
    updateDocumentNonBlocking(expenseRef, data);
  };

  const handleToggleIncomeStatus = (incomeId: string) => {
    if (!user) return;
    const incomeRef = doc(firestore, `users/${user.uid}/incomes/${incomeId}`);
    const income = incomes.find(i => i.id === incomeId);
    if(income){
      updateDocumentNonBlocking(incomeRef, { isPending: !income.isPending });
    }
  };
  
  const handleEditTransaction = (transaction: Income | Expense) => {
    setTransactionToEdit(transaction);
    setIsDialogOpen(true);
  }

  const handleDeleteTransaction = (id: string, type: 'income' | 'expense') => {
    if (!user) return;
    const collectionName = type === 'income' ? 'incomes' : 'expenses';
    const docRef = doc(firestore, `users/${user.uid}/${collectionName}/${id}`);
    deleteDocumentNonBlocking(docRef);
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setTransactionToEdit(null);
    }
  }

  if (incomesLoading || expensesLoading) {
    return <div>Loading dashboard...</div>
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader 
        onAddIncome={handleAddIncome}
        onAddExpense={handleAddExpense}
        onEditIncome={handleEditIncome}
        onEditExpense={handleEditExpense}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={handleDialogClose}
        transactionToEdit={transactionToEdit}
      />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <SummaryCards
          totalIncome={totalConfirmedIncome}
          totalExpenses={totalExpenses}
          balance={balance}
          pendingBalance={totalPendingIncome}
        />
        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>
          <TabsContent value="transactions">
            <Card>
              <CardContent className="p-4 md:p-6">
                 <TransactionsView
                    pendingIncomes={pendingIncomes}
                    confirmedIncomes={confirmedIncomes}
                    expenses={expenses}
                    onToggleIncomeStatus={handleToggleIncomeStatus}
                    onEditTransaction={handleEditTransaction}
                    onDeleteTransaction={handleDeleteTransaction}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="analysis">
             <AnalysisView incomes={confirmedIncomes} expenses={expenses} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
