"use client"

import { useMemo } from 'react';
import type { Income, Expense } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Bar, BarChart, Pie, PieChart, ResponsiveContainer, Cell } from "recharts"
import { format } from 'date-fns';

interface AnalysisViewProps {
    incomes: Income[];
    expenses: Expense[];
}

const COLORS = ["#283593", "#EF6C00", "#4CAF50", "#F44336", "#9C27B0", "#03A9F4"];


export function AnalysisView({ incomes, expenses }: AnalysisViewProps) {

    const monthlySummaryData = useMemo(() => {
        const data: { [key: string]: { month: string; income: number; expenses: number } } = {};
        
        [...incomes, ...expenses].forEach(t => {
            const monthKey = format(t.date, 'yyyy-MM');
            const monthLabel = format(t.date, 'MMM yyyy');
            if (!data[monthKey]) {
                data[monthKey] = { month: monthLabel, income: 0, expenses: 0 };
            }
            if ('isPending' in t) { // is Income
                data[monthKey].income += t.amount;
            } else {
                data[monthKey].expenses += t.amount;
            }
        });
        
        return Object.values(data).sort((a,b) => a.month.localeCompare(b.month));
    }, [incomes, expenses]);

    const categoryData = useMemo(() => {
        const incomeByCategory: { [key: string]: number } = {};
        incomes.forEach(i => {
            incomeByCategory[i.category] = (incomeByCategory[i.category] || 0) + i.amount;
        });

        const expenseByCategory: { [key: string]: number } = {};
        expenses.forEach(e => {
            expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + e.amount;
        });

        return {
            income: Object.entries(incomeByCategory).map(([name, value]) => ({ name, value })),
            expense: Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }))
        };
    }, [incomes, expenses]);

    const chartConfig = {
        income: { label: 'Income', color: 'hsl(var(--chart-1))' },
        expenses: { label: 'Expenses', color: 'hsl(var(--chart-2))' },
    }

    return (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Monthly Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    {monthlySummaryData.length > 0 ? (
                    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                        <BarChart accessibilityLayer data={monthlySummaryData}>
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <ChartLegend />
                            <Bar dataKey="income" fill="var(--color-income)" radius={4} />
                            <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                    ) : <p className="text-muted-foreground">Not enough data for monthly summary.</p>}
                </CardContent>
            </Card>
            
            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Income by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                         {categoryData.income.length > 0 ? (
                            <ChartContainer config={{}} className="mx-auto aspect-square max-h-[250px]">
                                <PieChart>
                                <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                                <Pie data={categoryData.income} dataKey="value" nameKey="name" innerRadius={60}>
                                    {categoryData.income.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                </PieChart>
                            </ChartContainer>
                         ) : <p className="text-muted-foreground">No income data available.</p>}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Expenses by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {categoryData.expense.length > 0 ? (
                        <ChartContainer config={{}} className="mx-auto aspect-square max-h-[250px]">
                                <PieChart>
                                <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                                <Pie data={categoryData.expense} dataKey="value" nameKey="name" innerRadius={60}>
                                     {categoryData.expense.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                </PieChart>
                            </ChartContainer>
                        ) : <p className="text-muted-foreground">No expense data available.</p>}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
