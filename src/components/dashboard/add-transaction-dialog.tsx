"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { incomeCategories, expenseCategories } from "@/lib/types";
import type { IncomeCategory, ExpenseCategory, Income, Expense } from "@/lib/types";

const incomeSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  category: z.string().min(1, "Category is required"),
  note: z.string().optional(),
  isPending: z.boolean().default(false),
  date: z.date(),
});

const expenseSchema = z.object({
  date: z.date(),
  amount: z.coerce.number().positive("Amount must be positive"),
  category: z.string().min(1, "Category is required"),
  note: z.string().optional(),
});

export type IncomeFormValues = z.infer<typeof incomeSchema>;
export type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface AddTransactionDialogProps {
  children: React.ReactNode;
  onAddIncome: (data: IncomeFormValues) => void;
  onAddExpense: (data: ExpenseFormValues) => void;
  onEditIncome: (id: string, data: IncomeFormValues) => void;
  onEditExpense: (id: string, data: ExpenseFormValues) => void;
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
  transactionToEdit: Income | Expense | null;
}

export function AddTransactionDialog({ 
  children, 
  onAddIncome, 
  onAddExpense,
  onEditIncome,
  onEditExpense,
  isDialogOpen, 
  setIsDialogOpen,
  transactionToEdit
}: AddTransactionDialogProps) {
  
  const [activeTab, setActiveTab] = useState("expense");

  const isEditing = !!transactionToEdit;
  const isEditingIncome = isEditing && 'isPending' in transactionToEdit;

  const incomeForm = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeSchema),
    defaultValues: { amount: 0, note: "", isPending: false, date: new Date() },
  });

  const expenseForm = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { date: new Date(), amount: 0, note: "" },
  });

  useEffect(() => {
    if (transactionToEdit) {
      if ('isPending' in transactionToEdit) { // It's an Income
        setActiveTab('income');
        incomeForm.reset({
          amount: transactionToEdit.amount,
          category: transactionToEdit.category,
          note: transactionToEdit.note,
          isPending: transactionToEdit.isPending,
          date: transactionToEdit.date,
        });
      } else { // It's an Expense
        setActiveTab('expense');
        expenseForm.reset({
          amount: transactionToEdit.amount,
          category: transactionToEdit.category,
          note: transactionToEdit.note,
          date: transactionToEdit.date,
        });
      }
    } else {
      incomeForm.reset({ amount: 0, note: "", isPending: false, date: new Date() });
      expenseForm.reset({ date: new Date(), amount: 0, note: "" });
    }
  }, [transactionToEdit, incomeForm, expenseForm]);


  function handleIncomeSubmit(values: IncomeFormValues) {
    if (isEditing && transactionToEdit) {
      onEditIncome(transactionToEdit.id, values);
    } else {
      onAddIncome(values);
    }
    incomeForm.reset();
    setIsDialogOpen(false);
  }

  function handleExpenseSubmit(values: ExpenseFormValues) {
     if (isEditing && transactionToEdit) {
      onEditExpense(transactionToEdit.id, values);
    } else {
      onAddExpense(values);
    }
    expenseForm.reset();
    setIsDialogOpen(false);
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      incomeForm.reset();
      expenseForm.reset();
    }
    setIsDialogOpen(open);
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Transaction" : "Add New Transaction"}</DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="expense" disabled={isEditing && isEditingIncome}>Expense</TabsTrigger>
            <TabsTrigger value="income" disabled={isEditing && !isEditingIncome}>Income</TabsTrigger>
          </TabsList>
          
          <TabsContent value="expense">
            <Form {...expenseForm}>
              <form onSubmit={expenseForm.handleSubmit(handleExpenseSubmit)} className="space-y-4 pt-4">
                <FormField control={expenseForm.control} name="amount" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={expenseForm.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                        <SelectContent>
                            {expenseCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={expenseForm.control} name="date" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={expenseForm.control} name="note" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note (Optional)</FormLabel>
                    <FormControl><Textarea placeholder="Add a note..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full">{isEditing ? 'Save Changes' : 'Add Expense'}</Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="income">
            <Form {...incomeForm}>
              <form onSubmit={incomeForm.handleSubmit(handleIncomeSubmit)} className="space-y-4 pt-4">
                <FormField control={incomeForm.control} name="amount" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                 <FormField control={incomeForm.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                        <SelectContent>
                            {incomeCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                 <FormField control={incomeForm.control} name="date" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={incomeForm.control} name="note" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note (Optional)</FormLabel>
                    <FormControl><Textarea placeholder="Add a note..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={incomeForm.control} name="isPending" render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Pending Payment</FormLabel>
                    </div>
                  </FormItem>
                )} />
                <Button type="submit" className="w-full">{isEditing ? 'Save Changes' : 'Add Income'}</Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
