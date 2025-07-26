import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Topbar from "@/components/layout/topbar";
import ExpenseBreakdownChart from "@/components/charts/expense-breakdown-chart";
import MonthlyTrendsChart from "@/components/charts/monthly-trends-chart";
import type { Account, Transaction, Category } from "@shared/schema";
import { isThisMonth, subMonths, isAfter, startOfMonth, endOfMonth, isSameMonth } from "date-fns";

export default function Analytics() {
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [timeRange, setTimeRange] = useState("thisMonth");

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
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

  // Filter transactions by time range and account
  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    const matchesAccount = !selectedAccountId || transaction.accountId === selectedAccountId;
    
    let matchesTimeRange = true;
    if (timeRange === "thisMonth") {
      matchesTimeRange = isThisMonth(transactionDate);
    } else if (timeRange === "lastMonth") {
      const lastMonth = subMonths(new Date(), 1);
      matchesTimeRange = isSameMonth(transactionDate, lastMonth);
    } else if (timeRange === "last3Months") {
      const threeMonthsAgo = subMonths(new Date(), 3);
      matchesTimeRange = isAfter(transactionDate, threeMonthsAgo);
    }
    
    return matchesAccount && matchesTimeRange;
  });

  // Calculate summary statistics
  const totalIncome = filteredTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
  const totalExpenses = filteredTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
  const netIncome = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((netIncome / totalIncome) * 100) : 0;

  // Top spending categories
  const expensesByCategory = filteredTransactions
    .filter(t => t.type === "expense")
    .reduce((acc, transaction) => {
      const categoryId = transaction.categoryId;
      const category = categories.find(c => c.id === categoryId);
      const amount = parseFloat(transaction.amount);
      
      if (category) {
        if (acc[categoryId]) {
          acc[categoryId].amount += amount;
          acc[categoryId].count += 1;
        } else {
          acc[categoryId] = {
            ...category,
            amount,
            count: 1,
          };
        }
      }
      
      return acc;
    }, {} as Record<string, any>);

  const topSpendingCategories = Object.values(expensesByCategory)
    .sort((a: any, b: any) => b.amount - a.amount)
    .slice(0, 5);

  // Frequent transactions
  const transactionsByDescription = filteredTransactions.reduce((acc, transaction) => {
    const desc = transaction.description.toLowerCase();
    if (acc[desc]) {
      acc[desc].count += 1;
      acc[desc].totalAmount += parseFloat(transaction.amount);
    } else {
      acc[desc] = {
        description: transaction.description,
        count: 1,
        totalAmount: parseFloat(transaction.amount),
        type: transaction.type,
      };
    }
    return acc;
  }, {} as Record<string, any>);

  const frequentTransactions = Object.values(transactionsByDescription)
    .filter((item: any) => item.count > 1)
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 5);

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case "thisMonth": return "This Month";
      case "lastMonth": return "Last Month";
      case "last3Months": return "Last 3 Months";
      case "last6Months": return "Last 6 Months";
      default: return "All Time";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar title="Analytics" selectedAccountId={selectedAccountId} />
      
      <div className="p-6 space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h3 className="text-lg font-semibold text-gray-900">Financial Analytics</h3>
          <div className="flex space-x-4">
            <Select value={selectedAccountId || "all"} onValueChange={(value) => setSelectedAccountId(value === "all" ? "" : value)}>
              <SelectTrigger className="w-48" data-testid="select-account-filter">
                <SelectValue placeholder="All Accounts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40" data-testid="select-time-range">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="thisMonth">This Month</SelectItem>
                <SelectItem value="lastMonth">Last Month</SelectItem>
                <SelectItem value="last3Months">Last 3 Months</SelectItem>
                <SelectItem value="last6Months">Last 6 Months</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading analytics...</div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card data-testid="card-period-income">
                <CardContent className="p-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Income ({getTimeRangeLabel()})</p>
                    <p className="text-2xl font-bold text-income">${totalIncome.toFixed(2)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-period-expenses">
                <CardContent className="p-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Expenses ({getTimeRangeLabel()})</p>
                    <p className="text-2xl font-bold text-expense">${totalExpenses.toFixed(2)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-period-net">
                <CardContent className="p-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Net Income ({getTimeRangeLabel()})</p>
                    <p className={`text-2xl font-bold ${netIncome >= 0 ? 'text-income' : 'text-expense'}`}>
                      ${netIncome.toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-savings-rate">
                <CardContent className="p-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Savings Rate</p>
                    <p className={`text-2xl font-bold ${savingsRate >= 0 ? 'text-income' : 'text-expense'}`}>
                      {savingsRate.toFixed(1)}%
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Expense Breakdown Chart */}
              <Card data-testid="card-expense-chart">
                <CardHeader>
                  <CardTitle>Expense Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ExpenseBreakdownChart 
                    transactions={filteredTransactions}
                    categories={categories}
                  />
                </CardContent>
              </Card>

              {/* Top Spending Categories */}
              <Card data-testid="card-top-categories">
                <CardHeader>
                  <CardTitle>Top Spending Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topSpendingCategories.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No expense data available</p>
                    ) : (
                      topSpendingCategories.map((category: any, index) => (
                        <div key={category.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-8 h-8 text-white rounded-lg text-sm font-bold" style={{ backgroundColor: category.color }}>
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{category.name}</p>
                              <p className="text-sm text-gray-500">{category.count} transactions</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-expense">${category.amount.toFixed(2)}</p>
                            <p className="text-sm text-gray-500">
                              {totalExpenses > 0 ? ((category.amount / totalExpenses) * 100).toFixed(1) : 0}%
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Trends */}
            <Card data-testid="card-trends-chart">
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <MonthlyTrendsChart 
                  transactions={selectedAccountId ? transactions.filter(t => t.accountId === selectedAccountId) : transactions}
                  monthsToShow={timeRange === "last6Months" ? 6 : 12}
                />
              </CardContent>
            </Card>

            {/* Frequent Transactions */}
            {frequentTransactions.length > 0 && (
              <Card data-testid="card-frequent-transactions">
                <CardHeader>
                  <CardTitle>Frequent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {frequentTransactions.map((item: any, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{item.description}</p>
                          <p className="text-sm text-gray-500">{item.count} times</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${item.type === 'income' ? 'text-income' : 'text-expense'}`}>
                            ${item.totalAmount.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">
                            ${(item.totalAmount / item.count).toFixed(2)} avg
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
