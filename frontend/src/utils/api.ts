import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  InventoryItem, 
  CheckInOutRequest, 
  CreateItemRequest, 
  InventoryStats, 
  ApiResponse,
  HistoryEntry 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config: any) => {
    // Add any auth headers here if needed
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: any) => {
    return response;
  },
  (error: any) => {
    // Handle global errors
    if (error.response) {
      const { status, data } = error.response;
      
      // Don't show toast for expected 404s (like item not found for registration)
      if (status === 404 && data.requiresRegistration) {
        return Promise.reject(error);
      }
      
      // Show error toast for other errors
      const message = data?.message || `Request failed with status ${status}`;
      toast.error(message);
    } else if (error.request) {
      toast.error('Network error: Unable to connect to server');
    } else {
      toast.error('An unexpected error occurred');
    }
    
    return Promise.reject(error);
  }
);

export const inventoryApi = {
  // Get all items
  async getAllItems(search?: string, status?: string): Promise<{
    items: InventoryItem[];
    stats: InventoryStats;
    count: number;
  }> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    
    const response = await api.get<ApiResponse>(`/items?${params.toString()}`);
    return response.data.data;
  },

  // Get item by ID
  async getItemById(itemId: string): Promise<InventoryItem> {
    const response = await api.get<ApiResponse>(`/items/${itemId}`);
    return response.data.data;
  },

  // Create new item
  async createItem(item: CreateItemRequest): Promise<InventoryItem> {
    const response = await api.post<ApiResponse>('/items', item);
    if (response.data.success) {
      toast.success(response.data.message || 'Item created successfully');
    }
    return response.data.data;
  },

  // Update item
  async updateItem(itemId: string, updates: Partial<CreateItemRequest>): Promise<InventoryItem> {
    const response = await api.put<ApiResponse>(`/items/${itemId}`, updates);
    if (response.data.success) {
      toast.success(response.data.message || 'Item updated successfully');
    }
    return response.data.data;
  },

  // Delete item
  async deleteItem(itemId: string): Promise<void> {
    const response = await api.delete<ApiResponse>(`/items/${itemId}`);
    if (response.data.success) {
      toast.success(response.data.message || 'Item deleted successfully');
    }
  },

  // Process check-in/check-out
  async processCheckInOut(request: CheckInOutRequest): Promise<{
    success: boolean;
    message: string;
    item?: InventoryItem;
    requiresRegistration?: boolean;
    suggestedItemId?: string;
  }> {
    try {
      const response = await api.post<ApiResponse>('/checkin-checkout', request);
      if (response.data.success) {
        toast.success(response.data.message || 'Operation completed successfully');
      }
      return {
        success: response.data.success,
        message: response.data.message || '',
        item: response.data.data,
      };
    } catch (error: any) {
      if (error.response?.status === 404 && error.response.data.requiresRegistration) {
        return {
          success: false,
          message: error.response.data.message,
          requiresRegistration: true,
          suggestedItemId: error.response.data.suggestedItemId,
        };
      }
      throw error;
    }
  },

  // Get item history
  async getItemHistory(itemId: string): Promise<{
    item: InventoryItem;
    history: HistoryEntry[];
  }> {
    const response = await api.get<ApiResponse>(`/items/${itemId}/history`);
    return response.data.data;
  },

  // Get inventory statistics
  async getStats(): Promise<InventoryStats> {
    const response = await api.get<ApiResponse>('/stats');
    return response.data.data;
  },

  // Export CSV
  async exportCSV(): Promise<Blob> {
    const response = await api.get('/export/csv', {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default api; 