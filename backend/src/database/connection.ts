import Database from 'better-sqlite3';
import { config } from '../config/config';
import path from 'path';
import fs from 'fs';

let db: Database.Database;

export const initializeDatabase = (): Database.Database => {
  try {
    // Ensure database directory exists
    const dbDir = path.dirname(config.dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Create database connection
    db = new Database(config.dbPath);
    
    // Enable WAL mode for better performance
    db.pragma('journal_mode = WAL');
    
    // Create tables if they don't exist
    createTables();
    
    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

const createTables = (): void => {
  const createItemsTable = `
    CREATE TABLE IF NOT EXISTS inventory_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id TEXT UNIQUE NOT NULL,
      item_name TEXT NOT NULL,
      serial_number TEXT,
      status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Checked Out')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      checked_out_by TEXT,
      checked_out_at DATETIME,
      last_action_by TEXT
    )
  `;

  const createHistoryTable = `
    CREATE TABLE IF NOT EXISTS inventory_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id TEXT NOT NULL,
      action TEXT NOT NULL CHECK (action IN ('checkin', 'checkout', 'created')),
      user_id TEXT,
      serial_number TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      notes TEXT,
      FOREIGN KEY (item_id) REFERENCES inventory_items (item_id)
    )
  `;

  const createIndexes = `
    CREATE INDEX IF NOT EXISTS idx_items_item_id ON inventory_items(item_id);
    CREATE INDEX IF NOT EXISTS idx_items_status ON inventory_items(status);
    CREATE INDEX IF NOT EXISTS idx_history_item_id ON inventory_history(item_id);
    CREATE INDEX IF NOT EXISTS idx_history_timestamp ON inventory_history(timestamp);
  `;

  try {
    db.exec(createItemsTable);
    db.exec(createHistoryTable);
    db.exec(createIndexes);
    
    // Create trigger to update updated_at timestamp
    const createTrigger = `
      CREATE TRIGGER IF NOT EXISTS update_inventory_items_updated_at
      AFTER UPDATE ON inventory_items
      FOR EACH ROW
      BEGIN
        UPDATE inventory_items SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END
    `;
    db.exec(createTrigger);
    
    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error creating database tables:', error);
    throw error;
  }
};

export const getDatabase = (): Database.Database => {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
};

export const closeDatabase = (): void => {
  if (db) {
    db.close();
    console.log('Database connection closed');
  }
}; 