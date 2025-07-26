import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChartLine, Home, ArrowLeftRight, Tags, PieChart, Building2, Book, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { Account } from "@shared/schema";

interface SidebarProps {
  selectedAccountId: string;
  onAccountChange: (accountId: string) => void;
}

export default function Sidebar({ selectedAccountId, onAccountChange }: SidebarProps) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const navigationItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/transactions", label: "Transactions", icon: ArrowLeftRight },
    { path: "/categories", label: "Categories", icon: Tags },
    { path: "/analytics", label: "Analytics", icon: PieChart },
    { path: "/accounts", label: "Accounts", icon: Building2 },
    { path: "/glossary", label: "Glossary", icon: Book },
  ];

  // Set default account if none selected (using useEffect to avoid render-time state updates)
  useEffect(() => {
    if (!selectedAccountId && accounts.length > 0) {
      const defaultAccount = accounts.find(acc => acc.isDefault) || accounts[0];
      onAccountChange(defaultAccount.id);
    }
  }, [selectedAccountId, accounts, onAccountChange]);

  const SidebarContent = () => (
    <div className="p-6 h-full">
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <ChartLine className="text-white text-xl" />
        </div>
        <h1 className="text-xl font-bold text-gray-900" data-testid="app-title">FinanceFlow</h1>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Current Account</label>
        <Select value={selectedAccountId} onValueChange={onAccountChange} data-testid="account-selector">
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select account..." />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <nav className="space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Link key={item.path} href={item.path}>
              <div 
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors cursor-pointer",
                  isActive 
                    ? "bg-primary text-white" 
                    : "text-gray-700 hover:bg-gray-100"
                )}
                data-testid={`nav-${item.label.toLowerCase()}`}
                onClick={() => setIsMobileOpen(false)}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        data-testid="mobile-menu-toggle"
      >
        {isMobileOpen ? <X /> : <Menu />}
      </Button>

      {/* Desktop sidebar */}
      <aside className="w-64 bg-white shadow-lg border-r border-gray-200 hidden lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50" onClick={() => setIsMobileOpen(false)} />
          <aside className="w-64 bg-white shadow-lg border-r border-gray-200 h-full relative">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
