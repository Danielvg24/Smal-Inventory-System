import React, { useEffect, useMemo, useState } from 'react';
import { inventoryApi } from '../utils/api';
import { InventoryItem } from '../types';

const CheckInOut: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [serialNumber, setSerialNumber] = useState<string>('');
  const [action, setAction] = useState<'checkin' | 'checkout' | ''>('');
  const [userId, setUserId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedItem = useMemo(
    () => items.find((i) => i.itemId === selectedItemId) || null,
    [items, selectedItemId]
  );

  useEffect(() => {
    const load = async () => {
      const data = await inventoryApi.getAllItems();
      setItems(data.items);
    };
    load();
  }, []);

  useEffect(() => {
    // Auto-fill serial number when selecting an item (if available)
    if (selectedItem && selectedItem.serialNumber) {
      setSerialNumber(selectedItem.serialNumber);
    } else {
      setSerialNumber('');
    }
  }, [selectedItem]);

  const onSubmit = async () => {
    if (!selectedItemId || !action) return;
    setIsSubmitting(true);
    try {
      await inventoryApi.processCheckInOut({
        itemId: selectedItemId,
        serialNumber: serialNumber || '',
        action: action as 'checkin' | 'checkout',
        userId: userId || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Check In / Check Out
      </h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select item</option>
              {items.map((it) => (
                <option key={it.itemId} value={it.itemId}>
                  {it.itemId} — {it.itemName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Serial Number
            </label>
            <input
              type="text"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              disabled={!!selectedItem?.serialNumber}
              className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${selectedItem?.serialNumber ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder={selectedItem?.serialNumber ? 'Auto-filled from item' : 'Enter serial number'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action
            </label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value as any)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select action</option>
              <option value="checkin">Check In</option>
              <option value="checkout">Check Out</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Family Member
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter family member name"
            />
          </div>
        </div>
        <div className="mt-6">
          <button
            disabled={!selectedItemId || !action || isSubmitting}
            onClick={onSubmit}
            className={`bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${(!selectedItemId || !action || isSubmitting) ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'Processing...' : 'Process'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckInOut; 