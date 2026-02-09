
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency, cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Income, Expense } from "@/lib/types";
import { ArrowDownLeft, ArrowUpRight, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "../ui/button";

interface TransactionCardProps {
  transaction: Income | Expense;
  onToggleStatus?: (id: string) => void;
  onEdit?: (transaction: Income | Expense) => void;
  onDelete?: (id: string, type: 'income' | 'expense') => void;
}

export function TransactionCard({ transaction, onToggleStatus, onEdit, onDelete }: TransactionCardProps) {
  const isIncome = 'isPending' in transaction;
  const isPendingIncome = isIncome && transaction.isPending;
  const transactionType = isIncome ? 'income' : 'expense';
  
  const handleCheckedChange = () => {
    if (isPendingIncome && onToggleStatus) {
      onToggleStatus(transaction.id);
    }
  };

  const handleDelete = () => {
    onDelete?.(transaction.id, transactionType);
  };

  const Icon = isIncome ? ArrowDownLeft : ArrowUpRight;
  const iconColor = isIncome ? 'text-green-600' : 'text-red-600';
  const amountSign = isIncome ? '+' : '-';

  if (isPendingIncome) {
    return (
        <Card className="flex items-start p-4 gap-4 hover:shadow-md transition-shadow relative">
            <div className="flex-none">
              <Checkbox
                id={`pending-${transaction.id}`}
                className="h-6 w-6 shrink-0 mt-1 rounded-full"
                onCheckedChange={handleCheckedChange}
              />
            </div>
            <div className="flex-grow">
                <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-lg text-primary">{transaction.category}</span>
                    <span className="font-bold text-lg text-green-600 pr-8">{formatCurrency(transaction.amount)}</span>
                </div>
                <p className="text-sm text-muted-foreground">{transaction.note}</p>
                <p className="text-xs text-muted-foreground mt-1">{format(transaction.date, "MMM d, yyyy")}</p>
            </div>
            <div className="absolute top-1 right-1">
              <AlertDialog>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">More options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit?.(transaction)}>Edit</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">Delete</DropdownMenuItem>
                    </AlertDialogTrigger>
                  </DropdownMenuContent>
                </DropdownMenu>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete this transaction.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
      </Card>
    );
  }

  return (
    <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-secondary/50">
        <div className={cn("p-2 rounded-full bg-secondary", isIncome ? "bg-green-100 dark:bg-green-900/50" : "bg-red-100 dark:bg-red-900/50")}>
            <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
        <div className="flex-grow">
            <p className="font-semibold">{transaction.category}</p>
            <p className="text-sm text-muted-foreground">{transaction.note}</p>
        </div>
        <div className="text-right">
            <p className={cn("font-bold", isIncome ? "text-green-600" : "text-red-600")}>
                {amountSign}{formatCurrency(transaction.amount)}
            </p>
            <p className="text-xs text-muted-foreground">{format(transaction.date, "MMM d")}</p>
        </div>
        <div className="ml-auto">
          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(transaction)}>Edit</DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">Delete</DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this transaction.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
    </div>
  );
}
