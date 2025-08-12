import { InventoryRepository } from '../repositories/InventoryRepository';
import { InventoryItem, CheckInOutRequest, CreateItemRequest, InventoryStats } from '../models/InventoryItem';

export class InventoryService {
  private inventoryRepo: InventoryRepository;

  constructor() {
    this.inventoryRepo = new InventoryRepository();
  }

  // Get all items with optional search and filtering
  getAllItems(search?: string, status?: string): InventoryItem[] {
    return this.inventoryRepo.getAllItems(search, status);
  }

  // Get specific item by ID
  getItemById(itemId: string): InventoryItem | null {
    if (!itemId || itemId.trim() === '') {
      throw new Error('Item ID is required');
    }
    return this.inventoryRepo.getItemById(itemId.trim());
  }

  // Process check-in or check-out request
  async processCheckInOut(request: CheckInOutRequest): Promise<{
    success: boolean;
    message: string;
    item?: InventoryItem;
    requiresRegistration?: boolean;
  }> {
    const { itemId, serialNumber, action, userId } = request;

    // Validate input
    if (!itemId || !serialNumber || !action) {
      throw new Error('Item ID, Serial Number, and Action are required');
    }

    const trimmedItemId = itemId.trim();
    const trimmedSerialNumber = serialNumber.trim();

    // Check if item exists
    const existingItem = this.inventoryRepo.getItemById(trimmedItemId);
    
    if (!existingItem) {
      return {
        success: false,
        message: `Item ID "${trimmedItemId}" not found. Would you like to register this item?`,
        requiresRegistration: true
      };
    }

    // Process the action
    if (action === 'checkout') {
      return this.checkOutItem(existingItem, trimmedSerialNumber, userId);
    } else if (action === 'checkin') {
      return this.checkInItem(existingItem, trimmedSerialNumber, userId);
    } else {
      throw new Error('Invalid action. Must be "checkin" or "checkout"');
    }
  }

  // Check out an item
  private checkOutItem(item: InventoryItem, serialNumber: string, userId?: string): {
    success: boolean;
    message: string;
    item: InventoryItem;
  } {
    if (item.status === 'Checked Out') {
      return {
        success: false,
        message: `Item "${item.itemId}" is already checked out${item.checkedOutBy ? ` by ${item.checkedOutBy}` : ''}`,
        item
      };
    }

    const success = this.inventoryRepo.checkOutItem(item.itemId, serialNumber, userId);
    
    if (success) {
      const updatedItem = this.inventoryRepo.getItemById(item.itemId)!;
      return {
        success: true,
        message: `Item "${item.itemId}" successfully checked out`,
        item: updatedItem
      };
    } else {
      return {
        success: false,
        message: `Failed to check out item "${item.itemId}"`,
        item
      };
    }
  }

  // Check in an item
  private checkInItem(item: InventoryItem, serialNumber: string, userId?: string): {
    success: boolean;
    message: string;
    item: InventoryItem;
  } {
    if (item.status === 'Available') {
      return {
        success: false,
        message: `Item "${item.itemId}" is already available`,
        item
      };
    }

    const success = this.inventoryRepo.checkInItem(item.itemId, serialNumber, userId);
    
    if (success) {
      const updatedItem = this.inventoryRepo.getItemById(item.itemId)!;
      return {
        success: true,
        message: `Item "${item.itemId}" successfully checked in`,
        item: updatedItem
      };
    } else {
      return {
        success: false,
        message: `Failed to check in item "${item.itemId}"`,
        item
      };
    }
  }

  // Create a new item
  createItem(request: CreateItemRequest): {
    success: boolean;
    message: string;
    item?: InventoryItem;
  } {
    const { itemId, itemName, serialNumber } = request;

    // Validate input
    if (!itemId || !itemName) {
      throw new Error('Item ID and Item Name are required');
    }

    const trimmedItemId = itemId.trim();
    const trimmedItemName = itemName.trim();

    if (trimmedItemId === '' || trimmedItemName === '') {
      throw new Error('Item ID and Item Name cannot be empty');
    }

    // Check if item already exists
    const existingItem = this.inventoryRepo.getItemById(trimmedItemId);
    if (existingItem) {
      return {
        success: false,
        message: `Item with ID "${trimmedItemId}" already exists`,
        item: existingItem
      };
    }

    try {
      const newItem = this.inventoryRepo.createItem({
        itemId: trimmedItemId,
        itemName: trimmedItemName,
        serialNumber: serialNumber?.trim() || undefined
      });

      return {
        success: true,
        message: `Item "${trimmedItemId}" created successfully`,
        item: newItem
      };
    } catch (error) {
      throw new Error(`Failed to create item: ${error}`);
    }
  }

  // Get inventory statistics
  getInventoryStats(): InventoryStats {
    return this.inventoryRepo.getInventoryStats();
  }

  // Get item history
  getItemHistory(itemId: string) {
    if (!itemId || itemId.trim() === '') {
      throw new Error('Item ID is required');
    }
    return this.inventoryRepo.getItemHistory(itemId.trim());
  }

  // Update item details
  updateItem(itemId: string, updates: Partial<CreateItemRequest>): {
    success: boolean;
    message: string;
    item?: InventoryItem;
  } {
    if (!itemId || itemId.trim() === '') {
      throw new Error('Item ID is required');
    }

    const trimmedItemId = itemId.trim();
    const existingItem = this.inventoryRepo.getItemById(trimmedItemId);
    
    if (!existingItem) {
      return {
        success: false,
        message: `Item "${trimmedItemId}" not found`
      };
    }

    // Validate updates
    const cleanUpdates: Partial<CreateItemRequest> = {};
    
    if (updates.itemName !== undefined) {
      const trimmedName = updates.itemName.trim();
      if (trimmedName === '') {
        throw new Error('Item name cannot be empty');
      }
      cleanUpdates.itemName = trimmedName;
    }
    
    if (updates.serialNumber !== undefined) {
      cleanUpdates.serialNumber = updates.serialNumber.trim() || undefined;
    }

    const success = this.inventoryRepo.updateItem(trimmedItemId, cleanUpdates);
    
    if (success) {
      const updatedItem = this.inventoryRepo.getItemById(trimmedItemId)!;
      return {
        success: true,
        message: `Item "${trimmedItemId}" updated successfully`,
        item: updatedItem
      };
    } else {
      return {
        success: false,
        message: `Failed to update item "${trimmedItemId}"`
      };
    }
  }

  // Delete item
  deleteItem(itemId: string): {
    success: boolean;
    message: string;
  } {
    if (!itemId || itemId.trim() === '') {
      throw new Error('Item ID is required');
    }

    const trimmedItemId = itemId.trim();
    const existingItem = this.inventoryRepo.getItemById(trimmedItemId);
    
    if (!existingItem) {
      return {
        success: false,
        message: `Item "${trimmedItemId}" not found`
      };
    }

    const success = this.inventoryRepo.deleteItem(trimmedItemId);
    
    if (success) {
      return {
        success: true,
        message: `Item "${trimmedItemId}" deleted successfully`
      };
    } else {
      return {
        success: false,
        message: `Failed to delete item "${trimmedItemId}"`
      };
    }
  }

  // Export inventory to CSV format
  exportInventoryCSV(): string {
    const items = this.inventoryRepo.getAllItems();
    
    const headers = [
      'Item ID',
      'Item Name', 
      'Serial Number',
      'Status',
      'Created At',
      'Updated At',
      'Checked Out By',
      'Checked Out At'
    ];
    
    const csvRows = [headers.join(',')];
    
    items.forEach(item => {
      const row = [
        `"${item.itemId}"`,
        `"${item.itemName}"`,
        `"${item.serialNumber || ''}"`,
        `"${item.status}"`,
        `"${item.createdAt || ''}"`,
        `"${item.updatedAt || ''}"`,
        `"${item.checkedOutBy || ''}"`,
        `"${item.checkedOutAt || ''}"`
      ];
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  }
} 