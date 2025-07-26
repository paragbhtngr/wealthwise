import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Transactions from "@/pages/transactions";
import Categories from "@/pages/categories";
import Analytics from "@/pages/analytics";
import Accounts from "@/pages/accounts";
import Glossary from "@/pages/glossary";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/layout/sidebar";
import { useState } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/transactions" component={Transactions} />
      <Route path="/categories" component={Categories} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/accounts" component={Accounts} />
      <Route path="/glossary" component={Glossary} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex bg-gray-50">
          <Sidebar 
            selectedAccountId={selectedAccountId}
            onAccountChange={setSelectedAccountId}
          />
          <main className="flex-1">
            <Router />
          </main>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
