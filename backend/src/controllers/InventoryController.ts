import { Request, Response } from 'express';
import { InventoryService } from '../services/InventoryService';
import { asyncHandler } from '../middleware/errorHandler';

export class InventoryController {
  private inventoryService: InventoryService;

  constructor() {
    this.inventoryService = new InventoryService();
  }

  // GET /api/items - Get all items with optional search and filtering
  getAllItems = asyncHandler(async (req: Request, res: Response) => {
    const { search, status } = req.query;
    
    const items = this.inventoryService.getAllItems(
      search as string, 
      status as string
    );
    
    const stats = this.inventoryService.getInventoryStats();
    
    res.json({
      success: true,
      data: {
        items,
        stats,
        count: items.length
      }
    });
  });

  // GET /api/items/:itemId - Get specific item by ID
  getItemById = asyncHandler(async (req: Request, res: Response) => {
    const { itemId } = req.params;
    
    const item = this.inventoryService.getItemById(itemId);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: `Item with ID "${itemId}" not found`
      });
    }
    
    res.json({
      success: true,
      data: item
    });
  });

  // POST /api/items - Create new item
  createItem = asyncHandler(async (req: Request, res: Response) => {
    const { itemId, itemName, serialNumber } = req.body;
    
    const result = this.inventoryService.createItem({
      itemId,
      itemName,
      serialNumber
    });
    
    if (result.success) {
      res.status(201).json({
        success: true,
        message: result.message,
        data: result.item
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
        data: result.item
      });
    }
  });

  // PUT /api/items/:itemId - Update item details
  updateItem = asyncHandler(async (req: Request, res: Response) => {
    const { itemId } = req.params;
    const updates = req.body;
    
    const result = this.inventoryService.updateItem(itemId, updates);
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        data: result.item
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  });

  // DELETE /api/items/:itemId - Delete item
  deleteItem = asyncHandler(async (req: Request, res: Response) => {
    const { itemId } = req.params;
    
    const result = this.inventoryService.deleteItem(itemId);
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message
      });
    } else {
      res.status(404).json({
        success: false,
        message: result.message
      });
    }
  });

  // POST /api/checkin-checkout - Process check-in or check-out
  processCheckInOut = asyncHandler(async (req: Request, res: Response) => {
    const { itemId, serialNumber, action, userId } = req.body;
    
    const result = await this.inventoryService.processCheckInOut({
      itemId,
      serialNumber,
      action,
      userId
    });
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        data: result.item
      });
    } else if (result.requiresRegistration) {
      res.status(404).json({
        success: false,
        message: result.message,
        requiresRegistration: true,
        suggestedItemId: itemId
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
        data: result.item
      });
    }
  });

  // GET /api/items/:itemId/history - Get item history
  getItemHistory = asyncHandler(async (req: Request, res: Response) => {
    const { itemId } = req.params;
    
    // First check if item exists
    const item = this.inventoryService.getItemById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: `Item with ID "${itemId}" not found`
      });
    }
    
    const history = this.inventoryService.getItemHistory(itemId);
    
    res.json({
      success: true,
      data: {
        item,
        history
      }
    });
  });

  // GET /api/stats - Get inventory statistics
  getStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = this.inventoryService.getInventoryStats();
    
    res.json({
      success: true,
      data: stats
    });
  });

  // GET /api/export/csv - Export inventory as CSV
  exportCSV = asyncHandler(async (req: Request, res: Response) => {
    const csvData = this.inventoryService.exportInventoryCSV();
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=inventory-export.csv');
    res.send(csvData);
  });
} 