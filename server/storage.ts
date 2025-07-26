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
import { getDb } from "./db";

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

export class SqliteStorage implements IStorage {
  async getAccounts(): Promise<Account[]> {
    const db = await getDb();
    return db.all<Account[]>("SELECT * FROM accounts");
  }

  async getAccount(id: string): Promise<Account | undefined> {
    const db = await getDb();
    return db.get<Account>("SELECT * FROM accounts WHERE id = ?", id);
  }

  async createAccount(account: InsertAccount): Promise<Account> {
    const db = await getDb();
    const id = randomUUID();
    await db.run(
      "INSERT INTO accounts (id, name, type, balance, isDefault) VALUES (?, ?, ?, ?, ?)",
      id, account.name, account.type, account.balance, account.isDefault ? 1 : 0
    );
    return { ...account, id };
  }

  async updateAccount(id: string, account: Partial<InsertAccount>): Promise<Account | undefined> {
    const db = await getDb();
    const existing = await this.getAccount(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...account };
    await db.run(
      "UPDATE accounts SET name = ?, type = ?, balance = ?, isDefault = ? WHERE id = ?",
      updated.name, updated.type, updated.balance, updated.isDefault ? 1 : 0, id
    );
    return updated;
  }

  async deleteAccount(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.run("DELETE FROM accounts WHERE id = ?", id);
    return result.changes > 0;
  }

  async getCategories(): Promise<Category[]> {
    const db = await getDb();
    return db.all<Category[]>("SELECT * FROM categories");
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const db = await getDb();
    return db.get<Category>("SELECT * FROM categories WHERE id = ?", id);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const db = await getDb();
    const id = randomUUID();
    await db.run(
      "INSERT INTO categories (id, name, type, color, icon, isDefault) VALUES (?, ?, ?, ?, ?, ?)",
      id, category.name, category.type, category.color, category.icon, category.isDefault ? 1 : 0
    );
    return { ...category, id };
  }

  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const db = await getDb();
    const existing = await this.getCategory(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...category };
    await db.run(
      "UPDATE categories SET name = ?, type = ?, color = ?, icon = ?, isDefault = ? WHERE id = ?",
      updated.name, updated.type, updated.color, updated.icon, updated.isDefault ? 1 : 0, id
    );
    return updated;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.run("DELETE FROM categories WHERE id = ?", id);
    return result.changes > 0;
  }

  async getTransactions(): Promise<Transaction[]> {
    const db = await getDb();
    return db.all<Transaction[]>("SELECT * FROM transactions ORDER BY date DESC");
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    const db = await getDb();
    return db.get<Transaction>("SELECT * FROM transactions WHERE id = ?", id);
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const db = await getDb();
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    await db.run(
      "INSERT INTO transactions (id, accountId, categoryId, type, amount, date, createdAt, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      id, transaction.accountId, transaction.categoryId, transaction.type, transaction.amount, transaction.date, createdAt, transaction.description || null
    );
    // Update account balance
    const account = await this.getAccount(transaction.accountId);
    if (account) {
      const currentBalance = parseFloat(account.balance);
      const transactionAmount = parseFloat(transaction.amount);
      const newBalance = transaction.type === 'income'
        ? currentBalance + transactionAmount
        : currentBalance - transactionAmount;
      await this.updateAccount(transaction.accountId, { balance: newBalance.toString() });
    }
    return { ...transaction, id, createdAt } as Transaction;
  }

  async updateTransaction(id: string, update: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const db = await getDb();
    const existing = await this.getTransaction(id);
    if (!existing) return undefined;
    // Revert old transaction amount from account
    const account = await this.getAccount(existing.accountId);
    if (account) {
      const currentBalance = parseFloat(account.balance);
      const oldAmount = parseFloat(existing.amount);
      const revertedBalance = existing.type === 'income'
        ? currentBalance - oldAmount
        : currentBalance + oldAmount;
      await this.updateAccount(existing.accountId, { balance: revertedBalance.toString() });
    }
    const updated = { ...existing, ...update };
    await db.run(
      "UPDATE transactions SET accountId = ?, categoryId = ?, type = ?, amount = ?, date = ?, description = ? WHERE id = ?",
      updated.accountId, updated.categoryId, updated.type, updated.amount, updated.date, updated.description || null, id
    );
    // Apply new transaction amount to account
    const targetAccountId = update.accountId || existing.accountId;
    const targetAccount = await this.getAccount(targetAccountId);
    if (targetAccount) {
      const currentBalance = parseFloat(targetAccount.balance);
      const newAmount = parseFloat(update.amount || existing.amount);
      const newType = update.type || existing.type;
      const newBalance = newType === 'income'
        ? currentBalance + newAmount
        : currentBalance - newAmount;
      await this.updateAccount(targetAccountId, { balance: newBalance.toString() });
    }
    return updated as Transaction;
  }

  async deleteTransaction(id: string): Promise<boolean> {
    const db = await getDb();
    const transaction = await this.getTransaction(id);
    if (!transaction) return false;
    // Revert transaction amount from account
    const account = await this.getAccount(transaction.accountId);
    if (account) {
      const currentBalance = parseFloat(account.balance);
      const transactionAmount = parseFloat(transaction.amount);
      const newBalance = transaction.type === 'income'
        ? currentBalance - transactionAmount
        : currentBalance + transactionAmount;
      await this.updateAccount(transaction.accountId, { balance: newBalance.toString() });
    }
    const result = await db.run("DELETE FROM transactions WHERE id = ?", id);
    return result.changes > 0;
  }

  async getGlossaryTerms(): Promise<GlossaryTerm[]> {
    const db = await getDb();
    return db.all<GlossaryTerm[]>("SELECT * FROM glossary ORDER BY term ASC");
  }

  async getGlossaryTerm(id: string): Promise<GlossaryTerm | undefined> {
    const db = await getDb();
    return db.get<GlossaryTerm>("SELECT * FROM glossary WHERE id = ?", id);
  }

  async createGlossaryTerm(term: InsertGlossaryTerm): Promise<GlossaryTerm> {
    const db = await getDb();
    const id = randomUUID();
    await db.run(
      "INSERT INTO glossary (id, term, definition) VALUES (?, ?, ?)",
      id, term.term, term.definition
    );
    return { ...term, id };
  }

  async updateGlossaryTerm(id: string, update: Partial<InsertGlossaryTerm>): Promise<GlossaryTerm | undefined> {
    const db = await getDb();
    const existing = await this.getGlossaryTerm(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...update };
    await db.run(
      "UPDATE glossary SET term = ?, definition = ? WHERE id = ?",
      updated.term, updated.definition, id
    );
    return updated;
  }

  async deleteGlossaryTerm(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.run("DELETE FROM glossary WHERE id = ?", id);
    return result.changes > 0;
  }
}

export const storage = new SqliteStorage();
