import { 
  type Account, 
  type InsertAccount,
  type Category,
  type InsertCategory,
  type Transaction,
  type InsertTransaction,
  type GlossaryTerm,
  type InsertGlossaryTerm
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Accounts
  getAccounts(): Promise<Account[]>;
  getAccount(id: string): Promise<Account | undefined>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccount(id: string, account: Partial<InsertAccount>): Promise<Account | undefined>;
  deleteAccount(id: string): Promise<boolean>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;

  // Transactions
  getTransactions(): Promise<Transaction[]>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: string): Promise<boolean>;

  // Glossary
  getGlossaryTerms(): Promise<GlossaryTerm[]>;
  getGlossaryTerm(id: string): Promise<GlossaryTerm | undefined>;
  createGlossaryTerm(term: InsertGlossaryTerm): Promise<GlossaryTerm>;
  updateGlossaryTerm(id: string, term: Partial<InsertGlossaryTerm>): Promise<GlossaryTerm | undefined>;
  deleteGlossaryTerm(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private accounts: Map<string, Account>;
  private categories: Map<string, Category>;
  private transactions: Map<string, Transaction>;
  private glossaryTerms: Map<string, GlossaryTerm>;

  constructor() {
    this.accounts = new Map();
    this.categories = new Map();
    this.transactions = new Map();
    this.glossaryTerms = new Map();
    
    // Initialize with default data
    this.initializeDefaults();
  }

  private initializeDefaults() {
    // Default accounts
    const defaultAccounts: InsertAccount[] = [
      { name: "Checking Account", type: "checking", balance: "2450.32", isDefault: true },
      { name: "Savings Account", type: "savings", balance: "8500.00", isDefault: false },
      { name: "Credit Card", type: "credit", balance: "-1200.50", isDefault: false },
      { name: "Investment Account", type: "investment", balance: "15750.00", isDefault: false },
    ];

    defaultAccounts.forEach(account => {
      this.createAccount(account);
    });

    // Default categories
    const defaultCategories: InsertCategory[] = [
      { name: "Food & Dining", type: "expense", color: "#3B82F6", icon: "utensils", isDefault: true },
      { name: "Transportation", type: "expense", color: "#10B981", icon: "car", isDefault: true },
      { name: "Entertainment", type: "expense", color: "#8B5CF6", icon: "film", isDefault: true },
      { name: "Shopping", type: "expense", color: "#F59E0B", icon: "shopping-bag", isDefault: true },
      { name: "Utilities", type: "expense", color: "#EF4444", icon: "zap", isDefault: true },
      { name: "Healthcare", type: "expense", color: "#06B6D4", icon: "heart", isDefault: true },
      { name: "Salary", type: "income", color: "#10B981", icon: "dollar-sign", isDefault: true },
      { name: "Freelance", type: "income", color: "#8B5CF6", icon: "briefcase", isDefault: true },
      { name: "Investment", type: "income", color: "#F59E0B", icon: "trending-up", isDefault: true },
    ];

    defaultCategories.forEach(category => {
      this.createCategory(category);
    });

    // Default glossary terms
    const defaultGlossaryTerms: InsertGlossaryTerm[] = [
      {
        term: "Annual Percentage Rate (APR)",
        definition: "The annual rate charged for borrowing or earned through an investment, including fees and other costs associated with the transaction."
      },
      {
        term: "Emergency Fund",
        definition: "A savings account specifically designated for unexpected expenses or financial emergencies, typically containing 3-6 months of living expenses."
      },
      {
        term: "Net Worth",
        definition: "The total value of all assets minus the total value of all liabilities. It represents your overall financial position."
      },
      {
        term: "Budget",
        definition: "A plan for how to spend your money, tracking income and expenses over a specific period to help achieve financial goals."
      },
      {
        term: "Cash Flow",
        definition: "The amount of money moving in and out of your accounts over a specific period, showing your financial liquidity."
      },
      {
        term: "Compound Interest",
        definition: "Interest calculated on the initial principal and accumulated interest from previous periods, leading to exponential growth over time."
      },
      {
        term: "Credit Score",
        definition: "A numerical representation of your creditworthiness, typically ranging from 300-850, used by lenders to assess lending risk."
      },
      {
        term: "Debt-to-Income Ratio",
        definition: "The percentage of your monthly gross income that goes toward paying debts, used to measure your ability to manage monthly payments."
      },
      {
        term: "Diversification",
        definition: "An investment strategy that spreads risk by allocating investments across various financial instruments, industries, and categories."
      },
      {
        term: "Liquidity",
        definition: "How quickly and easily an asset can be converted into cash without significantly affecting its market price."
      }
    ];

    defaultGlossaryTerms.forEach(term => {
      this.createGlossaryTerm(term);
    });
  }

  // Account methods
  async getAccounts(): Promise<Account[]> {
    return Array.from(this.accounts.values());
  }

  async getAccount(id: string): Promise<Account | undefined> {
    return this.accounts.get(id);
  }

  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const id = randomUUID();
    const account: Account = { ...insertAccount, id };
    this.accounts.set(id, account);
    return account;
  }

  async updateAccount(id: string, updateAccount: Partial<InsertAccount>): Promise<Account | undefined> {
    const account = this.accounts.get(id);
    if (!account) return undefined;
    
    const updatedAccount: Account = { ...account, ...updateAccount };
    this.accounts.set(id, updatedAccount);
    return updatedAccount;
  }

  async deleteAccount(id: string): Promise<boolean> {
    return this.accounts.delete(id);
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: string, updateCategory: Partial<InsertCategory>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    
    const updatedCategory: Category = { ...category, ...updateCategory };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: string): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Transaction methods
  async getTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = { 
      ...insertTransaction, 
      id, 
      createdAt: new Date()
    };
    this.transactions.set(id, transaction);
    
    // Update account balance
    const account = this.accounts.get(insertTransaction.accountId);
    if (account) {
      const currentBalance = parseFloat(account.balance);
      const transactionAmount = parseFloat(insertTransaction.amount);
      const newBalance = insertTransaction.type === 'income' 
        ? currentBalance + transactionAmount 
        : currentBalance - transactionAmount;
      
      await this.updateAccount(insertTransaction.accountId, { balance: newBalance.toString() });
    }
    
    return transaction;
  }

  async updateTransaction(id: string, updateTransaction: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;
    
    // Revert old transaction amount from account
    const account = this.accounts.get(transaction.accountId);
    if (account) {
      const currentBalance = parseFloat(account.balance);
      const oldAmount = parseFloat(transaction.amount);
      const revertedBalance = transaction.type === 'income' 
        ? currentBalance - oldAmount 
        : currentBalance + oldAmount;
      
      await this.updateAccount(transaction.accountId, { balance: revertedBalance.toString() });
    }
    
    const updatedTransaction: Transaction = { ...transaction, ...updateTransaction };
    this.transactions.set(id, updatedTransaction);
    
    // Apply new transaction amount to account
    const targetAccountId = updateTransaction.accountId || transaction.accountId;
    const targetAccount = this.accounts.get(targetAccountId);
    if (targetAccount) {
      const currentBalance = parseFloat(targetAccount.balance);
      const newAmount = parseFloat(updateTransaction.amount || transaction.amount);
      const newType = updateTransaction.type || transaction.type;
      const newBalance = newType === 'income' 
        ? currentBalance + newAmount 
        : currentBalance - newAmount;
      
      await this.updateAccount(targetAccountId, { balance: newBalance.toString() });
    }
    
    return updatedTransaction;
  }

  async deleteTransaction(id: string): Promise<boolean> {
    const transaction = this.transactions.get(id);
    if (!transaction) return false;
    
    // Revert transaction amount from account
    const account = this.accounts.get(transaction.accountId);
    if (account) {
      const currentBalance = parseFloat(account.balance);
      const transactionAmount = parseFloat(transaction.amount);
      const newBalance = transaction.type === 'income' 
        ? currentBalance - transactionAmount 
        : currentBalance + transactionAmount;
      
      await this.updateAccount(transaction.accountId, { balance: newBalance.toString() });
    }
    
    return this.transactions.delete(id);
  }

  // Glossary methods
  async getGlossaryTerms(): Promise<GlossaryTerm[]> {
    return Array.from(this.glossaryTerms.values()).sort((a, b) => 
      a.term.localeCompare(b.term)
    );
  }

  async getGlossaryTerm(id: string): Promise<GlossaryTerm | undefined> {
    return this.glossaryTerms.get(id);
  }

  async createGlossaryTerm(insertTerm: InsertGlossaryTerm): Promise<GlossaryTerm> {
    const id = randomUUID();
    const term: GlossaryTerm = { ...insertTerm, id };
    this.glossaryTerms.set(id, term);
    return term;
  }

  async updateGlossaryTerm(id: string, updateTerm: Partial<InsertGlossaryTerm>): Promise<GlossaryTerm | undefined> {
    const term = this.glossaryTerms.get(id);
    if (!term) return undefined;
    
    const updatedTerm: GlossaryTerm = { ...term, ...updateTerm };
    this.glossaryTerms.set(id, updatedTerm);
    return updatedTerm;
  }

  async deleteGlossaryTerm(id: string): Promise<boolean> {
    return this.glossaryTerms.delete(id);
  }
}

export const storage = new MemStorage();
