import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { InventoryItem, InventoryStats } from '../types';
import { inventoryApi } from '../utils/api';

const Inventory: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await inventoryApi.getAllItems(search || undefined, status || undefined);
      setItems(data.items);
      setStats(data.stats);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Inventory
        </h1>
        <Link to="/add-item" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
          Add Item
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={status || ''}
              onChange={(e) => setStatus(e.target.value || undefined)}
            >
              <option value="">All Status</option>
              <option value="Available">Available</option>
              <option value="Checked Out">Checked Out</option>
            </select>
          </div>
        </div>
        
        <div className="p-4">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No items found. Start by adding your first inventory item.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item.itemId}>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        <div className="flex items-center gap-3">
                          <div className="w-20 h-16 bg-gray-100 border rounded overflow-hidden flex items-center justify-center flex-shrink-0">
                            {item.photoFilename ? (
                              <img
                                src={`${(import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api'}`.replace(/\/api$/, '') + `/uploads/photos/${encodeURIComponent(item.photoFilename)}`}
                                alt="thumb"
                                className="max-w-full max-h-full object-contain"
                              />
                            ) : (
                              <span className="text-xs text-gray-400">No photo</span>
                            )}
                          </div>
                          <span className="font-medium">{item.itemId}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.itemName}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">{item.serialNumber || '-'}</td>
                      <td className="px-4 py-2 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${item.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right text-sm">
                        <Link className="text-blue-600 hover:text-blue-800" to={`/inventory/${item.itemId}`}>View</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inventory; 