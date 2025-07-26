import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { Transaction } from "@shared/schema";
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from "date-fns";

interface MonthlyTrendsChartProps {
  transactions: Transaction[];
  monthsToShow?: number;
}

export default function MonthlyTrendsChart({ transactions, monthsToShow = 6 }: MonthlyTrendsChartProps) {
  const endDate = new Date();
  const startDate = subMonths(endDate, monthsToShow - 1);
  
  const months = eachMonthOfInterval({ start: startDate, end: endDate });

  const chartData = months.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    const monthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= monthStart && transactionDate <= monthEnd;
    });

    const income = monthTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const expenses = monthTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    return {
      month: format(month, "MMM yyyy"),
      income,
      expenses,
      net: income - expenses,
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: ${entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="income" 
            stroke="hsl(var(--income))" 
            strokeWidth={2}
            name="Income"
          />
          <Line 
            type="monotone" 
            dataKey="expenses" 
            stroke="hsl(var(--expense))" 
            strokeWidth={2}
            name="Expenses"
          />
          <Line 
            type="monotone" 
            dataKey="net" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            name="Net Income"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
