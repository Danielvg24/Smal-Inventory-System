import React, { useEffect, useState } from 'react';
import { inventoryApi } from '../utils/api';
import { InventoryStats } from '../types';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<InventoryStats | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const s = await inventoryApi.getStats();
        setStats(s);
      } catch {
        setStats(null);
      }
    })();
  }, []);
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Total Items</h3>
          <p className="text-3xl font-bold text-blue-600">{stats?.totalItems ?? 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Available</h3>
          <p className="text-3xl font-bold text-green-600">{stats?.availableItems ?? 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Checked Out</h3>
          <p className="text-3xl font-bold text-yellow-600">{stats?.checkedOutItems ?? 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Maintenance</h3>
          <p className="text-3xl font-bold text-red-600">0</p>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Welcome to the Inventory Management System
        </h2>
        <p className="text-gray-600">
          Use the navigation menu to manage your inventory items, process check-ins and check-outs, and view detailed reports.
        </p>
      </div>
    </div>
  );
};

export default Dashboard; 