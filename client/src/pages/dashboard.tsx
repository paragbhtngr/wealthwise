import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Wallet, ArrowUp, ArrowDown, ChartLine } from "lucide-react";
import Topbar from "@/components/layout/topbar";
import ExpenseBreakdownChart from "@/components/charts/expense-breakdown-chart";
import MonthlyTrendsChart from "@/components/charts/monthly-trends-chart";
import type { Account, Transaction, Category } from "@shared/schema";
import { getIcon } from "@/lib/icons";
import { format, isThisMonth, startOfMonth, endOfMonth } from "date-fns";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [timeRange, setTimeRange] = useState("thisMonth");

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Set default account if none selected
  useEffect(() => {
    if (!selectedAccountId && accounts.length > 0) {
      const defaultAccount = accounts.find(acc => acc.isDefault) || accounts[0];
      setSelectedAccountId(defaultAccount.id);
    }
  }, [selectedAccountId, accounts]);

  const currentAccount = accounts.find(acc => acc.id === selectedAccountId);

  // Filter transactions by time range
  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    
    if (timeRange === "thisMonth") {
      return isThisMonth(transactionDate);
    }
    
    // Add more time range filters as needed
    return true;
  });

  // Calculate summary statistics
  const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0);
  
  const monthlyIncome = filteredTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
  const monthlyExpenses = filteredTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
  const netIncome = monthlyIncome - monthlyExpenses;

  // Get recent transactions (last 5)
  const recentTransactions = transactions.slice(0, 5);

  // Get expense breakdown for selected account or all accounts
  const accountTransactions = selectedAccountId 
    ? transactions.filter(t => t.accountId === selectedAccountId)
    : transactions;

  const expenseCategories = accountTransactions
    .filter(t => t.type === "expense")
    .reduce((acc, transaction) => {
      const categoryId = transaction.categoryId;
      const category = categories.find(c => c.id === categoryId);
      const amount = parseFloat(transaction.amount);
      
      if (category) {
        if (acc[categoryId]) {
          acc[categoryId].amount += amount;
        } else {
          acc[categoryId] = {
            ...category,
            amount,
            percentage: 0,
          };
        }
      }
      
      return acc;
    }, {} as Record<string, any>);

  const totalExpenseAmount = Object.values(expenseCategories).reduce(
    (sum: number, cat: any) => sum + cat.amount, 0
  );

  // Calculate percentages
  Object.values(expenseCategories).forEach((cat: any) => {
    cat.percentage = totalExpenseAmount > 0 ? (cat.amount / totalExpenseAmount) * 100 : 0;
  });

  const topExpenseCategories = Object.values(expenseCategories)
    .sort((a: any, b: any) => b.amount - a.amount)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar title="Dashboard" selectedAccountId={selectedAccountId} />
      
      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card data-testid="card-total-balance">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Balance</p>
                  <p className="text-2xl font-bold text-gray-900">${totalBalance.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Wallet className="text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-monthly-income">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Income</p>
                  <p className="text-2xl font-bold text-income">${monthlyIncome.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <ArrowUp className="text-income" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-monthly-expenses">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Expenses</p>
                  <p className="text-2xl font-bold text-expense">${monthlyExpenses.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <ArrowDown className="text-expense" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-net-income">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Net Income</p>
                  <p className={`text-2xl font-bold ${netIncome >= 0 ? 'text-income' : 'text-expense'}`}>
                    ${netIncome.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <ChartLine className="text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Expense Breakdown */}
          <Card className="lg:col-span-2" data-testid="card-expense-breakdown">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Expense Breakdown</CardTitle>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-auto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="thisMonth">This Month</SelectItem>
                    <SelectItem value="lastMonth">Last Month</SelectItem>
                    <SelectItem value="last3Months">Last 3 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ExpenseBreakdownChart 
                transactions={accountTransactions.filter(t => {
                  const transactionDate = new Date(t.date);
                  if (timeRange === "thisMonth") {
                    return isThisMonth(transactionDate);
                  }
                  return true;
                })}
                categories={categories}
              />
              
              <div className="mt-6 space-y-3">
                {topExpenseCategories.map((category: any) => {
                  const Icon = getIcon(category.icon);
                  return (
                    <div key={category.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: category.color }}
                        >
                          <Icon className="w-3 h-3 text-white" />
                        </div>
                        <span className="font-medium text-gray-900">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-gray-900">${category.amount.toFixed(2)}</span>
                        <span className="text-sm text-gray-500 ml-2">{category.percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card data-testid="card-recent-activity">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Activity</CardTitle>
                <Button variant="link" className="text-primary">View All</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No transactions yet</p>
                ) : (
                  recentTransactions.map((transaction) => {
                    const category = categories.find(c => c.id === transaction.categoryId);
                    const account = accounts.find(a => a.id === transaction.accountId);
                    const Icon = category ? getIcon(category.icon as any) : getIcon("dollar-sign");
                    
                    return (
                      <div 
                        key={transaction.id} 
                        className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                        data-testid={`transaction-${transaction.id}`}
                      >
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: category?.color || "#6B7280" }}
                        >
                          <Icon className="text-white text-sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{transaction.description}</p>
                          <p className="text-sm text-gray-500">{category?.name || "Unknown"}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${transaction.type === 'income' ? 'text-income' : 'text-expense'}`}>
                            {transaction.type === 'income' ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">{format(new Date(transaction.date), 'MMM d')}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Trends */}
        <Card data-testid="card-monthly-trends">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Monthly Trends</CardTitle>
              <div className="flex space-x-2">
                <Button variant="default" size="sm">6M</Button>
                <Button variant="outline" size="sm">1Y</Button>
                <Button variant="outline" size="sm">All</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <MonthlyTrendsChart transactions={transactions} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
