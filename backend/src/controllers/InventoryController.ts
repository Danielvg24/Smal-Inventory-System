import { Request, Response } from 'express';
import type * as Express from 'express';
import { InventoryService } from '../services/InventoryService';
import { asyncHandler } from '../middleware/errorHandler';
import { maybeUploadPhoto } from '../middleware/uploads';
// upload handled at the route level

export class InventoryController {
  private inventoryService: InventoryService;

  constructor() {
    this.inventoryService = new InventoryService();
  }

  // GET /api/items - Get all items with optional search and filtering
  getAllItems = asyncHandler(async (req: Request, res: Response) => {
    const { search, status } = req.query;
    
    const items = this.inventoryService.getAllItems(
      search as string | undefined, 
      status as string | undefined
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
    
    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: 'Item ID is required'
      });
    }
    
    const item = this.inventoryService.getItemById(itemId);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: `Item with ID "${itemId}" not found`
      });
    }
    
    return res.json({
      success: true,
      data: item
    });
  });

  // POST /api/items - Create new item with optional PDF receipts
  createItem = asyncHandler(async (req: Request, res: Response) => {
    const { itemId, itemName, serialNumber } = req.body as any;
    const files: any = (req as any).files;
    
    // Extract receipts
    const receiptFiles = files?.receipts || [];
    const sanitizedFiles = receiptFiles.map((f: any) => ({
      filename: f.filename,
      originalname: f.originalname,
      mimetype: f.mimetype,
      size: f.size,
    }));

    const result = this.inventoryService.createItem({
      itemId,
      itemName,
      serialNumber
    }, sanitizedFiles);
    
    if (result.success) {
      // If a photo was uploaded in the same multipart request, process and attach
      const photoFile = files?.photo?.[0];
      if (photoFile && photoFile.processedFilename) {
        (this as any).inventoryService['inventoryRepo'].updateItem(itemId, { photoFilename: photoFile.processedFilename } as any);
        const updatedItem = this.inventoryService.getItemById(itemId)!;
        return res.status(201).json({ success: true, message: result.message, data: updatedItem });
      }
      return res.status(201).json({ success: true, message: result.message, data: result.item });
    } else {
      return res.status(400).json({
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
    
    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: 'Item ID is required'
      });
    }
    
    const result = this.inventoryService.updateItem(itemId, updates);
    
    if (result.success) {
      return res.json({
        success: true,
        message: result.message,
        data: result.item
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
  });

  // POST /api/items/:itemId/photo - Upload or replace item photo
  uploadItemPhoto = asyncHandler(async (req: Request, res: Response) => {
    const { itemId } = req.params as any;
    if (!itemId) {
      return res.status(400).json({ success: false, message: 'Item ID is required' });
    }
    const item = this.inventoryService.getItemById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: `Item with ID "${itemId}" not found` });
    }
    const file: any = (req as any).file;
    if (!file || !file.processedFilename) {
      return res.status(400).json({ success: false, message: 'No photo uploaded or processing failed' });
    }
    // Update the item with the new photo filename
    const result = this.inventoryService.updateItem(itemId, { photoFilename: file.processedFilename } as any);
    if (result.success) {
      const updated = this.inventoryService.getItemById(itemId)!;
      return res.json({ success: true, message: 'Photo updated successfully', data: updated });
    } else {
      return res.status(500).json({ success: false, message: 'Failed to update photo in database' });
    }
  });

  // DELETE /api/items/:itemId - Delete item
  deleteItem = asyncHandler(async (req: Request, res: Response) => {
    const { itemId } = req.params;
    
    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: 'Item ID is required'
      });
    }
    
    const result = this.inventoryService.deleteItem(itemId);
    
    if (result.success) {
      return res.json({
        success: true,
        message: result.message
      });
    } else {
      return res.status(404).json({
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
    
    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: 'Item ID is required'
      });
    }
    
    // First check if item exists
    const item = this.inventoryService.getItemById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: `Item with ID "${itemId}" not found`
      });
    }
    
    const history = this.inventoryService.getItemHistory(itemId);
    
    return res.json({
      success: true,
      data: {
        item,
        history
      }
    });
  });

  // GET /api/items/:itemId/receipts - List item receipts metadata
  getItemReceipts = asyncHandler(async (req: Request, res: Response) => {
    const { itemId } = req.params;
    
    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: 'Item ID is required'
      });
    }
    const result = this.inventoryService.getItemReceipts(itemId);
    if (!result.exists) {
      return res.status(404).json({ success: false, message: `Item with ID "${itemId}" not found` });
    }
    return res.json({ success: true, data: result.receipts });
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