import { body, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Validation rules for check-in/check-out requests
export const validateCheckInOut = [
  body('itemId')
    .trim()
    .notEmpty()
    .withMessage('Item ID is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Item ID must be between 1 and 50 characters'),
  
  body('serialNumber')
    .trim()
    .notEmpty()
    .withMessage('Serial Number is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Serial Number must be between 1 and 100 characters'),
  
  body('action')
    .isIn(['checkin', 'checkout'])
    .withMessage('Action must be either "checkin" or "checkout"'),
  
  body('userId')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('User ID must be between 1 and 50 characters')
];

// Validation rules for creating new items
export const validateCreateItem = [
  body('itemId')
    .trim()
    .notEmpty()
    .withMessage('Item ID is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Item ID must be between 1 and 50 characters')
    .matches(/^[a-zA-Z0-9-_]+$/)
    .withMessage('Item ID can only contain letters, numbers, hyphens, and underscores'),
  
  body('itemName')
    .trim()
    .notEmpty()
    .withMessage('Item Name is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Item Name must be between 1 and 200 characters'),
  
  body('serialNumber')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Serial Number must be between 1 and 100 characters')
];

// Validation rules for updating items
export const validateUpdateItem = [
  body('itemName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Item Name cannot be empty if provided')
    .isLength({ min: 1, max: 200 })
    .withMessage('Item Name must be between 1 and 200 characters'),
  
  body('serialNumber')
    .optional()
    .trim()
    .isLength({ min: 0, max: 100 })
    .withMessage('Serial Number must be at most 100 characters')
];

// Validation rules for search queries
export const validateSearch = [
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),
  
  query('status')
    .optional()
    .isIn(['Available', 'Checked Out'])
    .withMessage('Status must be either "Available" or "Checked Out"'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Middleware to handle validation errors
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error: any) => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg
    }));
    
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
    return;
  }
  
  next();
}; 