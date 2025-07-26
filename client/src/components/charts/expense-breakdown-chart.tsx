import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { Transaction, Category } from "@shared/schema";

interface ExpenseBreakdownChartProps {
  transactions: Transaction[];
  categories: Category[];
}

export default function ExpenseBreakdownChart({ transactions, categories }: ExpenseBreakdownChartProps) {
  // Filter to expense transactions only
  const expenseTransactions = transactions.filter(t => t.type === "expense");
  
  // Group by category and calculate totals
  const categoryTotals = expenseTransactions.reduce((acc, transaction) => {
    const categoryId = transaction.categoryId;
    const amount = parseFloat(transaction.amount);
    
    if (acc[categoryId]) {
      acc[categoryId] += amount;
    } else {
      acc[categoryId] = amount;
    }
    
    return acc;
  }, {} as Record<string, number>);

  // Create chart data
  const chartData = Object.entries(categoryTotals).map(([categoryId, total]) => {
    const category = categories.find(c => c.id === categoryId);
    return {
      name: category?.name || "Unknown",
      value: total,
      color: category?.color || "#6B7280",
    };
  }).sort((a, b) => b.value - a.value);

  const totalExpenses = chartData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / totalExpenses) * 100).toFixed(1);
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{data.payload.name}</p>
          <p className="text-sm text-gray-600">
            ${data.value.toFixed(2)} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-gray-600">No expense data available</p>
          <p className="text-sm text-gray-500">Add some expense transactions to see the breakdown</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={120}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry: any) => (
              <span style={{ color: entry.color }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
