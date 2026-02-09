
"use client";

import { PlusCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddTransactionDialog, type IncomeFormValues, type ExpenseFormValues } from "./add-transaction-dialog";
import type { Income, Expense } from "@/lib/types";
import { useAuth } from "@/firebase";
import { useRouter } from "next/navigation";
import { MonkeyLogo } from "../icons/monkey-logo";

interface AppHeaderProps {
  onAddIncome: (data: IncomeFormValues) => void;
  onAddExpense: (data: ExpenseFormValues) => void;
  onEditIncome: (id: string, data: IncomeFormValues) => void;
  onEditExpense: (id: string, data: ExpenseFormValues) => void;
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
  transactionToEdit: Income | Expense | null;
}

export function AppHeader({ 
  onAddIncome, 
  onAddExpense, 
  onEditIncome,
  onEditExpense,
  isDialogOpen, 
  setIsDialogOpen,
  transactionToEdit,
}: AppHeaderProps) {
  const auth = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <MonkeyLogo className="h-8 w-8" />
        <h1 className="text-2xl font-bold tracking-tight font-headline text-[#E1B530]">MONEY MAAMA</h1>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <AddTransactionDialog 
            onAddIncome={onAddIncome} 
            onAddExpense={onAddExpense}
            onEditIncome={onEditIncome}
            onEditExpense={onEditExpense}
            isDialogOpen={isDialogOpen}
            setIsDialogOpen={setIsDialogOpen}
            transactionToEdit={transactionToEdit}
        >
          <Button onClick={() => setIsDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </AddTransactionDialog>
        <Button variant="ghost" size="icon" onClick={handleSignOut}>
          <LogOut className="h-5 w-5" />
          <span className="sr-only">Sign Out</span>
        </Button>
      </div>
    </header>
  );
}
