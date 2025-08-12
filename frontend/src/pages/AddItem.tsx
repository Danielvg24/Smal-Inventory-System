import React, { useState } from 'react';
import { inventoryApi } from '../utils/api';

const AddItem: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Add New Item
      </h1>
      
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <form className="space-y-6" onSubmit={async (e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const data = new FormData(form);
          try {
            // Send multipart form-data directly to API
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/items`, {
              method: 'POST',
              body: data,
            });
            if (!res.ok) {
              const err = await res.json().catch(() => ({}));
              throw new Error(err?.message || 'Failed to create item');
            }
            form.reset();
            alert('Item created successfully');
          } catch (err: any) {
            alert(err.message || 'Failed to create item');
          }
        }}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item ID *
            </label>
            <input name="itemId"
              type="text"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter unique item ID"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Name *
            </label>
            <input name="itemName"
              type="text"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter item name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Serial Number
            </label>
            <input name="serialNumber"
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter serial number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo (JPEG/PNG/WEBP)
            </label>
            <input name="photo" type="file" accept="image/jpeg,image/png,image/webp" className="block w-full text-sm text-gray-700" />
            <p className="text-xs text-gray-500 mt-1">Photo will be resized for optimal display.</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Receipts (PDF, multiple)</label>
            <input name="receipts" type="file" accept="application/pdf" multiple className="block w-full text-sm text-gray-700" />
          </div>
          
          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add Item
            </button>
            <button
              type="button"
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItem; 