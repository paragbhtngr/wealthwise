import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

// This module exports a function to get a database connection
let db: Database | null = null;

export async function getDb() {
  if (!db) {
    db = await open({
      filename: './data.sqlite',
      driver: sqlite3.Database,
    });
  }
  return db;
}
