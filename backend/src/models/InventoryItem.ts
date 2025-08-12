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
  photoFilename?: string;
}

export interface InventoryStats {
  totalItems: number;
  availableItems: number;
  checkedOutItems: number;
} 