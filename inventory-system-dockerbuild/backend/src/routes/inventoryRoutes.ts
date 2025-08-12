import { Router } from 'express';
import { InventoryController } from '../controllers/InventoryController';
import {
  validateCheckInOut,
  validateCreateItem,
  validateUpdateItem,
  validateSearch,
  handleValidationErrors
} from '../middleware/validation';

const router = Router();
const inventoryController = new InventoryController();

// GET /api/items - Get all items with optional search and filtering
router.get(
  '/items',
  validateSearch,
  handleValidationErrors,
  inventoryController.getAllItems
);

// GET /api/items/:itemId - Get specific item by ID
router.get('/items/:itemId', inventoryController.getItemById);

// POST /api/items - Create new item
router.post(
  '/items',
  validateCreateItem,
  handleValidationErrors,
  inventoryController.createItem
);

// PUT /api/items/:itemId - Update item details
router.put(
  '/items/:itemId',
  validateUpdateItem,
  handleValidationErrors,
  inventoryController.updateItem
);

// DELETE /api/items/:itemId - Delete item
router.delete('/items/:itemId', inventoryController.deleteItem);

// POST /api/checkin-checkout - Process check-in or check-out
router.post(
  '/checkin-checkout',
  validateCheckInOut,
  handleValidationErrors,
  inventoryController.processCheckInOut
);

// GET /api/items/:itemId/history - Get item history
router.get('/items/:itemId/history', inventoryController.getItemHistory);

// GET /api/stats - Get inventory statistics
router.get('/stats', inventoryController.getStats);

// GET /api/export/csv - Export inventory as CSV
router.get('/export/csv', inventoryController.exportCSV);

export default router; 