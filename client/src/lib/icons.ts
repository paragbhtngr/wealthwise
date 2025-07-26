import * as LucideIcons from "lucide-react";

export const iconMap = {
  "utensils": LucideIcons.Utensils,
  "car": LucideIcons.Car,
  "film": LucideIcons.Film,
  "shopping-bag": LucideIcons.ShoppingBag,
  "zap": LucideIcons.Zap,
  "heart": LucideIcons.Heart,
  "dollar-sign": LucideIcons.DollarSign,
  "briefcase": LucideIcons.Briefcase,
  "trending-up": LucideIcons.TrendingUp,
  "home": LucideIcons.Home,
  "chart-line": LucideIcons.ChartLine,
  "wallet": LucideIcons.Wallet,
  "arrow-up": LucideIcons.ArrowUp,
  "arrow-down": LucideIcons.ArrowDown,
  "chart-pie": LucideIcons.PieChart,
  "gas-pump": LucideIcons.Fuel,
  "university": LucideIcons.Building2,
  "book": LucideIcons.Book,
  "tags": LucideIcons.Tags,
  "exchange-alt": LucideIcons.ArrowLeftRight,
  "plus": LucideIcons.Plus,
  "edit": LucideIcons.Edit,
  "trash": LucideIcons.Trash2,
  "search": LucideIcons.Search,
  "user": LucideIcons.User,
  "bars": LucideIcons.Menu,
  "times": LucideIcons.X,
};

export type IconName = keyof typeof iconMap;

export function getIcon(iconName: IconName) {
  return iconMap[iconName] || LucideIcons.Circle;
}
