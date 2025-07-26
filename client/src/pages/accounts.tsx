import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus, Building2, Wallet, CreditCard, TrendingUp } from "lucide-react";
import Topbar from "@/components/layout/topbar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Account, InsertAccount } from "@shared/schema";

const accountTypeIcons = {
  checking: Wallet,
  savings: Building2,
  credit: CreditCard,
  investment: TrendingUp,
};

const accountTypeLabels = {
  checking: "Checking Account",
  savings: "Savings Account", 
  credit: "Credit Card",
  investment: "Investment Account",
};

export default function Accounts() {
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "checking" as keyof typeof accountTypeLabels,
    balance: "",
    isDefault: false,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const createAccountMutation = useMutation({
    mutationFn: async (data: InsertAccount) => {
      const response = await apiRequest("POST", "/api/accounts", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      toast({
        title: "Success",
        description: "Account created successfully",
      });
      closeModal();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const updateAccountMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertAccount> }) => {
      const response = await apiRequest("PUT", `/api/accounts/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      toast({
        title: "Success",
        description: "Account updated successfully",
      });
      closeModal();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update account",
        variant: "destructive",
      });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/accounts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Success",
        description: "Account deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive",
      });
    },
  });

  // Set default account if none selected
  useEffect(() => {
    if (!selectedAccountId && accounts.length > 0) {
      const defaultAccount = accounts.find(acc => acc.isDefault) || accounts[0];
      setSelectedAccountId(defaultAccount.id);
    }
  }, [selectedAccountId, accounts]);

  const resetForm = () => {
    setFormData({
      name: "",
      type: "checking",
      balance: "",
      isDefault: false,
    });
    setEditingAccount(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (account: Account) => {
    setFormData({
      name: account.name,
      type: account.type as keyof typeof accountTypeLabels,
      balance: account.balance,
      isDefault: account.isDefault,
    });
    setEditingAccount(account);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter an account name",
        variant: "destructive",
      });
      return;
    }

    if (!formData.balance || isNaN(parseFloat(formData.balance))) {
      toast({
        title: "Error",
        description: "Please enter a valid balance",
        variant: "destructive",
      });
      return;
    }

    const accountData: InsertAccount = {
      name: formData.name,
      type: formData.type,
      balance: parseFloat(formData.balance).toFixed(2),
      isDefault: formData.isDefault,
    };

    if (editingAccount) {
      updateAccountMutation.mutate({ id: editingAccount.id, data: accountData });
    } else {
      createAccountMutation.mutate(accountData);
    }
  };

  const handleDeleteAccount = (account: Account) => {
    if (window.confirm(`Are you sure you want to delete "${account.name}"? This will also delete all associated transactions.`)) {
      deleteAccountMutation.mutate(account.id);
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0);
  const positiveAccounts = accounts.filter(acc => parseFloat(acc.balance) >= 0);
  const negativeAccounts = accounts.filter(acc => parseFloat(acc.balance) < 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar title="Accounts" selectedAccountId={selectedAccountId} />
      
      <div className="p-6 space-y-6">
        {/* Summary Card */}
        <Card data-testid="card-accounts-summary">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Total Net Worth</p>
                <p className={`text-3xl font-bold ${totalBalance >= 0 ? 'text-income' : 'text-expense'}`}>
                  ${totalBalance.toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Total Accounts</p>
                <p className="text-3xl font-bold text-gray-900">{accounts.length}</p>
              </div>
              <div className="text-center">
                <Button 
                  onClick={openAddModal}
                  className="bg-primary hover:bg-blue-700"
                  data-testid="button-add-account"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="text-center py-8">Loading accounts...</div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No accounts found</p>
            <p className="text-sm text-gray-400 mb-4">Create your first account to get started</p>
            <Button onClick={openAddModal} className="bg-primary hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Account
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => {
              const Icon = accountTypeIcons[account.type as keyof typeof accountTypeIcons] || Wallet;
              const balance = parseFloat(account.balance);
              const isPositive = balance >= 0;
              
              return (
                <Card 
                  key={account.id} 
                  className="hover:shadow-lg transition-shadow"
                  data-testid={`card-account-${account.id}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isPositive ? 'bg-blue-100' : 'bg-red-100'}`}>
                          <Icon className={`w-5 h-5 ${isPositive ? 'text-primary' : 'text-expense'}`} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{account.name}</CardTitle>
                          <p className="text-sm text-gray-500">
                            {accountTypeLabels[account.type as keyof typeof accountTypeLabels]}
                          </p>
                        </div>
                      </div>
                      {account.isDefault && (
                        <Badge variant="outline" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-medium text-gray-600">Balance</p>
                      <p className={`text-2xl font-bold ${isPositive ? 'text-income' : 'text-expense'}`}>
                        ${Math.abs(balance).toFixed(2)}
                        {!isPositive && ' CR'}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => openEditModal(account)}
                        data-testid={`button-edit-account-${account.id}`}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteAccount(account)}
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                        data-testid={`button-delete-account-${account.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Account Types Breakdown */}
        {accounts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card data-testid="card-assets">
              <CardHeader>
                <CardTitle className="text-lg text-income">Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {positiveAccounts.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No asset accounts</p>
                  ) : (
                    positiveAccounts.map((account) => (
                      <div key={account.id} className="flex items-center justify-between">
                        <span className="text-gray-900">{account.name}</span>
                        <span className="font-semibold text-income">
                          ${parseFloat(account.balance).toFixed(2)}
                        </span>
                      </div>
                    ))
                  )}
                  {positiveAccounts.length > 0 && (
                    <div className="border-t pt-3 flex items-center justify-between font-semibold">
                      <span>Total Assets</span>
                      <span className="text-income">
                        ${positiveAccounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-liabilities">
              <CardHeader>
                <CardTitle className="text-lg text-expense">Liabilities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {negativeAccounts.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No liability accounts</p>
                  ) : (
                    negativeAccounts.map((account) => (
                      <div key={account.id} className="flex items-center justify-between">
                        <span className="text-gray-900">{account.name}</span>
                        <span className="font-semibold text-expense">
                          ${Math.abs(parseFloat(account.balance)).toFixed(2)}
                        </span>
                      </div>
                    ))
                  )}
                  {negativeAccounts.length > 0 && (
                    <div className="border-t pt-3 flex items-center justify-between font-semibold">
                      <span>Total Liabilities</span>
                      <span className="text-expense">
                        ${Math.abs(negativeAccounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0)).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Add/Edit Account Modal */}
      <Dialog open={showAddModal} onOpenChange={closeModal}>
        <DialogContent className="max-w-md" data-testid="modal-account">
          <DialogHeader>
            <DialogTitle>{editingAccount ? "Edit Account" : "Add Account"}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Account Name</Label>
              <Input
                id="name"
                type="text"
                required
                placeholder="Enter account name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                data-testid="input-account-name"
              />
            </div>

            <div>
              <Label htmlFor="type">Account Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as keyof typeof accountTypeLabels }))}
              >
                <SelectTrigger data-testid="select-account-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(accountTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="balance">Initial Balance</Label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  required
                  className="pl-8"
                  placeholder="0.00"
                  value={formData.balance}
                  onChange={(e) => setFormData(prev => ({ ...prev, balance: e.target.value }))}
                  data-testid="input-account-balance"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Use negative values for debt accounts (credit cards, loans)
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                className="rounded border-gray-300 text-primary focus:ring-primary"
                data-testid="checkbox-default-account"
              />
              <Label htmlFor="isDefault" className="text-sm">
                Set as default account
              </Label>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button 
                type="submit" 
                className="flex-1 bg-primary hover:bg-blue-700"
                disabled={createAccountMutation.isPending || updateAccountMutation.isPending}
                data-testid="button-submit-account"
              >
                {(createAccountMutation.isPending || updateAccountMutation.isPending) 
                  ? (editingAccount ? "Updating..." : "Creating...") 
                  : (editingAccount ? "Update Account" : "Create Account")
                }
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={closeModal}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
