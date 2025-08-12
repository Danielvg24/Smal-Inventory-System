export interface InventoryItem {
  id?: number;
  itemId: string;
  itemName: string;
  serialNumber?: string;
  photoFilename?: string;
  status: 'Available' | 'Checked Out';
  createdAt?: string;
  updatedAt?: string;
  checkedOutBy?: string;
  checkedOutAt?: string;
  lastActionBy?: string;
}

export interface CheckInOutRequest {
  serialNumber: string;
  itemId: string;
  action: 'checkin' | 'checkout';
  userId?: string;
}

export interface CreateItemRequest {
  itemId: string;
  itemName: string;
  serialNumber?: string;
}

export interface InventoryStats {
  totalItems: number;
  availableItems: number;
  checkedOutItems: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  requiresRegistration?: boolean;
  suggestedItemId?: string;
}

export interface HistoryEntry {
  id: number;
  itemId: string;
  action: 'checkin' | 'checkout' | 'created';
  userId?: string;
  serialNumber?: string;
  timestamp: string;
  notes?: string;
} 

export interface Receipt {
  id: number;
  itemId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
}