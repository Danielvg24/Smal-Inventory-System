import { getDatabase } from '../database/connection';
import { InventoryItem, CreateItemRequest, InventoryStats } from '../models/InventoryItem';
import fs from 'fs';
import path from 'path';

export class InventoryRepository {
  private get db() {
    return getDatabase();
  }

  // Get all items with optional filtering
  getAllItems(search?: string, status?: string): InventoryItem[] {
    let query = `
      SELECT 
        id, item_id as itemId, item_name as itemName, serial_number as serialNumber,
        photo_filename as photoFilename,
        status, created_at as createdAt, updated_at as updatedAt,
        checked_out_by as checkedOutBy, checked_out_at as checkedOutAt,
        last_action_by as lastActionBy
      FROM inventory_items
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    if (search) {
      query += ` AND (item_id LIKE ? OR item_name LIKE ? OR serial_number LIKE ?)`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }
    
    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }
    
    query += ` ORDER BY updated_at DESC`;
    
    const stmt = this.db.prepare(query);
    return stmt.all(...params) as InventoryItem[];
  }

  // Get item by ID
  getItemById(itemId: string): InventoryItem | null {
    const stmt = this.db.prepare(`
      SELECT 
        id, item_id as itemId, item_name as itemName, serial_number as serialNumber,
        photo_filename as photoFilename,
        status, created_at as createdAt, updated_at as updatedAt,
        checked_out_by as checkedOutBy, checked_out_at as checkedOutAt,
        last_action_by as lastActionBy
      FROM inventory_items 
      WHERE item_id = ?
    `);
    return stmt.get(itemId) as InventoryItem | null;
  }

  // Create new item
  createItem(item: CreateItemRequest): InventoryItem {
    const stmt = this.db.prepare(`
      INSERT INTO inventory_items (item_id, item_name, serial_number, status)
      VALUES (?, ?, ?, 'Available')
    `);
    
    const result = stmt.run(item.itemId, item.itemName, item.serialNumber || null);
    
    // Log creation in history
    this.addHistoryEntry(item.itemId, 'created', undefined, item.serialNumber);
    
    return this.getItemById(item.itemId)!;
  }

  // Save uploaded receipts metadata
  saveReceipts(itemId: string, files: Array<{ filename: string; originalname: string; mimetype: string; size: number }>): void {
    const insert = this.db.prepare(`
      INSERT INTO inventory_receipts (item_id, filename, original_name, mime_type, size_bytes)
      VALUES (?, ?, ?, ?, ?)
    `);
    const insertMany = this.db.transaction((rows: typeof files) => {
      for (const f of rows) {
        insert.run(itemId, f.filename, f.originalname, f.mimetype, f.size);
      }
    });
    if (files.length > 0) insertMany(files);
  }

  // List receipts for an item
  getReceiptsByItemId(itemId: string): Array<{
    id: number;
    itemId: string;
    filename: string;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    uploadedAt: string;
  }> {
    const stmt = this.db.prepare(`
      SELECT 
        id,
        item_id as itemId,
        filename,
        original_name as originalName,
        mime_type as mimeType,
        size_bytes as sizeBytes,
        uploaded_at as uploadedAt
      FROM inventory_receipts
      WHERE item_id = ?
      ORDER BY uploaded_at DESC, id DESC
    `);
    return stmt.all(itemId) as any;
  }

  // Get a single receipt by id
  getReceiptById(receiptId: number): {
    id: number;
    itemId: string;
    filename: string;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    uploadedAt: string;
  } | null {
    const stmt = this.db.prepare(`
      SELECT 
        id,
        item_id as itemId,
        filename,
        original_name as originalName,
        mime_type as mimeType,
        size_bytes as sizeBytes,
        uploaded_at as uploadedAt
      FROM inventory_receipts
      WHERE id = ?
    `);
    const row = stmt.get(receiptId);
    return (row as any) || null;
  }

  // Check in item
  checkInItem(itemId: string, serialNumber: string, userId?: string): boolean {
    const stmt = this.db.prepare(`
      UPDATE inventory_items 
      SET status = 'Available', 
          checked_out_by = NULL, 
          checked_out_at = NULL,
          last_action_by = ?,
          serial_number = COALESCE(?, serial_number)
      WHERE item_id = ? AND status = 'Checked Out'
    `);
    
    const result = stmt.run(userId || null, serialNumber || null, itemId);
    
    if (result.changes > 0) {
      this.addHistoryEntry(itemId, 'checkin', userId, serialNumber);
      return true;
    }
    
    return false;
  }

  // Check out item
  checkOutItem(itemId: string, serialNumber: string, userId?: string): boolean {
    const stmt = this.db.prepare(`
      UPDATE inventory_items 
      SET status = 'Checked Out', 
          checked_out_by = ?, 
          checked_out_at = CURRENT_TIMESTAMP,
          last_action_by = ?,
          serial_number = COALESCE(?, serial_number)
      WHERE item_id = ? AND status = 'Available'
    `);
    
    const result = stmt.run(userId || null, userId || null, serialNumber || null, itemId);
    
    if (result.changes > 0) {
      this.addHistoryEntry(itemId, 'checkout', userId, serialNumber);
      return true;
    }
    
    return false;
  }

  // Get inventory statistics
  getInventoryStats(): InventoryStats {
    const stmt = this.db.prepare(`
      SELECT 
        COUNT(*) as totalItems,
        SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) as availableItems,
        SUM(CASE WHEN status = 'Checked Out' THEN 1 ELSE 0 END) as checkedOutItems
      FROM inventory_items
    `);
    
    return stmt.get() as InventoryStats;
  }

  // Get item history
  getItemHistory(itemId: string) {
    const stmt = this.db.prepare(`
      SELECT 
        id, item_id as itemId, action, user_id as userId, 
        serial_number as serialNumber, timestamp, notes
      FROM inventory_history 
      WHERE item_id = ? 
      ORDER BY timestamp DESC
    `);
    
    return stmt.all(itemId);
  }

  // Add history entry
  private addHistoryEntry(itemId: string, action: string, userId?: string, serialNumber?: string, notes?: string): void {
    const stmt = this.db.prepare(`
      INSERT INTO inventory_history (item_id, action, user_id, serial_number, notes)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    stmt.run(itemId, action, userId || null, serialNumber || null, notes || null);
  }

  // Delete item (admin function)
  deleteItem(itemId: string): boolean {
    // Remove associated receipts files and DB rows
    try {
      const receipts = this.getReceiptsByItemId(itemId);
      const receiptsDir = path.join('/app', 'uploads', 'receipts');
      receipts.forEach(r => {
        try {
          const filePath = path.join(receiptsDir, r.filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (_) {
          // ignore file deletion errors
        }
      });
    } catch (_) {
      // ignore listing errors
    }

    // Delete child rows first to satisfy FK constraints
    this.db.prepare(`DELETE FROM inventory_receipts WHERE item_id = ?`).run(itemId);
    this.db.prepare(`DELETE FROM inventory_history WHERE item_id = ?`).run(itemId);

    const stmt = this.db.prepare(`DELETE FROM inventory_items WHERE item_id = ?`);
    const result = stmt.run(itemId);
    return result.changes > 0;
  }

  // Update item details
  updateItem(itemId: string, updates: Partial<CreateItemRequest>): boolean {
    const fields: string[] = [];
    const values: any[] = [];
    
    if (updates.itemName) {
      fields.push('item_name = ?');
      values.push(updates.itemName);
    }
    
    if (updates.serialNumber !== undefined) {
      fields.push('serial_number = ?');
      values.push(updates.serialNumber);
    }
    if ((updates as any).photoFilename !== undefined) {
      fields.push('photo_filename = ?');
      values.push((updates as any).photoFilename);
    }
    
    if (fields.length === 0) return false;
    
    values.push(itemId);
    
    const stmt = this.db.prepare(`
      UPDATE inventory_items 
      SET ${fields.join(', ')}
      WHERE item_id = ?
    `);
    
    const result = stmt.run(...values);
    return result.changes > 0;
  }
} 