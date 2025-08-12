import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { InventoryItem } from '../types';
import { inventoryApi } from '../utils/api';

const ItemDetail: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    itemName: '',
    serialNumber: ''
  });
  const [receipts, setReceipts] = useState<Array<{
    id: number; itemId: string; filename: string; originalName: string; mimeType: string; sizeBytes: number; uploadedAt: string;
  }>>([]);
  const [previewUrls, setPreviewUrls] = useState<Record<number, string>>({});

  const apiBase = useMemo(() => (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api', []);
  const uploadsBase = useMemo(() => apiBase.replace(/\/api$/, '') + '/uploads/receipts', [apiBase]);

  useEffect(() => {
    let isCancelled = false;
    const load = async () => {
      if (!itemId) return;
      try {
        setIsLoading(true);
        const [itemData, receiptsData] = await Promise.all([
          inventoryApi.getItemById(itemId),
          inventoryApi.getItemReceipts(itemId),
        ]);
        if (!isCancelled) {
          setItem(itemData);
          setReceipts(receiptsData);
          // Initialize edit form with current item data
          setEditForm({
            itemName: itemData.itemName,
            serialNumber: itemData.serialNumber || ''
          });
        }
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };
    load();
    return () => { isCancelled = true; };
  }, [itemId]);

  // Prepare blob URLs for PDF previews to avoid cross-origin frame restrictions
  useEffect(() => {
    let isCancelled = false;
    const controller = new AbortController();
    const makePreviews = async () => {
      try {
        const entries = await Promise.all(
          receipts.map(async (r) => {
            try {
              const res = await fetch(`${uploadsBase}/${encodeURIComponent(r.filename)}`, { signal: controller.signal });
              if (!res.ok) return [r.id, ''] as const;
              const blob = await res.blob();
              const url = URL.createObjectURL(blob);
              return [r.id, url] as const;
            } catch {
              return [r.id, ''] as const;
            }
          })
        );
        if (!isCancelled) {
          const map: Record<number, string> = {};
          for (const [id, url] of entries) {
            if (url) map[id] = url;
          }
          setPreviewUrls((prev) => {
            // Revoke old URLs not used anymore
            Object.entries(prev).forEach(([key, oldUrl]) => {
              const id = Number(key);
              if (!map[id]) URL.revokeObjectURL(oldUrl);
            });
            return map;
          });
        }
      } catch {
        // ignore
      }
    };
    if (receipts.length > 0) makePreviews();
    return () => {
      isCancelled = true;
      controller.abort();
      // cleanup blob URLs
      Object.values(previewUrls).forEach((u) => {
        try { URL.revokeObjectURL(u); } catch {}
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receipts, uploadsBase]);

  const onDelete = async () => {
    if (!itemId) return;
    if (!confirm('Delete this item? This action cannot be undone.')) return;
    setIsDeleting(true);
    try {
      await inventoryApi.deleteItem(itemId);
      navigate('/inventory');
    } finally {
      setIsDeleting(false);
    }
  };

  const onPhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!itemId) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('photo', file);
    setIsUploadingPhoto(true);
    try {
      const apiBase = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiBase}/items/${encodeURIComponent(itemId)}/photo`, {
        method: 'POST',
        body: form,
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to upload photo: ${errorText}`);
      }
      const data = await res.json();
      setItem(data.data);
    } catch (err) {
      console.error('Photo upload error:', err);
      // eslint-disable-next-line no-alert
      alert((err as any)?.message || 'Failed to upload photo');
    } finally {
      setIsUploadingPhoto(false);
      e.currentTarget.value = '';
    }
  };

  const onSave = async () => {
    if (!itemId || !item) return;
    setIsSaving(true);
    try {
      const updatedItem = await inventoryApi.updateItem(itemId, {
        itemName: editForm.itemName.trim(),
        serialNumber: editForm.serialNumber.trim() || undefined
      });
      setItem(updatedItem);
      setIsEditing(false);
    } catch (err) {
      console.error('Save error:', err);
      // eslint-disable-next-line no-alert
      alert('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const onCancel = () => {
    if (!item) return;
    setEditForm({
      itemName: item.itemName,
      serialNumber: item.serialNumber || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Item Details: {itemId}
        </h1>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button
                onClick={onSave}
                disabled={isSaving || !editForm.itemName.trim()}
                className={`bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 ${(isSaving || !editForm.itemName.trim()) ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={onCancel}
                disabled={isSaving}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Edit Item
            </button>
          )}
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className={`bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 ${isDeleting ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {isDeleting ? 'Deleting...' : 'Delete Item'}
          </button>
          <Link to="/inventory" className="text-blue-600 hover:text-blue-800">Back to Inventory</Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Item Information
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Item ID</dt>
              <dd className="text-lg text-gray-900">{itemId}</dd>
            </div>
            {isLoading ? (
              <div className="text-gray-500">Loading data...</div>
            ) : item ? (
              <>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  {isEditing ? (
                    <dd className="mt-1">
                      <input
                        type="text"
                        value={editForm.itemName}
                        onChange={(e) => setEditForm(prev => ({ ...prev, itemName: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter item name"
                      />
                    </dd>
                  ) : (
                    <dd className="text-lg text-gray-900">{item.itemName}</dd>
                  )}
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Serial Number</dt>
                  {isEditing ? (
                    <dd className="mt-1">
                      <input
                        type="text"
                        value={editForm.serialNumber}
                        onChange={(e) => setEditForm(prev => ({ ...prev, serialNumber: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter serial number (optional)"
                      />
                    </dd>
                  ) : (
                    <dd className="text-lg text-gray-900">{item.serialNumber || '-'}</dd>
                  )}
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${item.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {item.status}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Photo</dt>
                  <dd className="mt-2">
                    <div className="flex items-center gap-4">
                      <div className="w-40 h-28 bg-gray-100 border rounded overflow-hidden flex items-center justify-center">
                        {item.photoFilename ? (
                          <img
                            alt="Item photo"
                            src={`${uploadsBase.replace('/uploads/receipts','')}/uploads/photos/${encodeURIComponent(item.photoFilename)}`}
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <span className="text-xs text-gray-500">No photo</span>
                        )}
                      </div>
                      <label className="inline-flex items-center gap-2 text-sm">
                        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onPhotoSelected} disabled={isUploadingPhoto} />
                        <span className="text-blue-600 hover:text-blue-800 cursor-pointer">{isUploadingPhoto ? 'Uploading...' : 'Upload/Replace'}</span>
                      </label>
                    </div>
                  </dd>
                </div>
              </>
            ) : (
              <div className="text-gray-500">Item not found</div>
            )}
          </dl>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Receipts</h2>
          {isLoading ? (
            <div className="text-gray-500">Loading receipts...</div>
          ) : receipts.length === 0 ? (
            <div className="text-gray-500">No receipts uploaded.</div>
          ) : (
            <div className="space-y-4">
              {receipts.map(r => (
                <div key={r.id} className="border border-gray-200 rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{r.originalName}</div>
                      <div className="text-xs text-gray-500">{(r.sizeBytes / 1024).toFixed(1)} KB • {new Date(r.uploadedAt).toLocaleString()}</div>
                    </div>
                    <div className="flex gap-3">
                      <a className="text-blue-600 hover:text-blue-800" href={`${uploadsBase}/${encodeURIComponent(r.filename)}`} target="_blank" rel="noreferrer">Open</a>
                      <a className="text-blue-600 hover:text-blue-800" href={`${uploadsBase}/${encodeURIComponent(r.filename)}`} download>Download</a>
                    </div>
                  </div>
                  <div className="mt-3">
                    {previewUrls[r.id] ? (
                      <iframe title={`receipt-${r.id}`} src={previewUrls[r.id]} className="w-full h-64 border" />
                    ) : (
                      <div className="text-sm text-gray-500">Preview not available. Use Open/Download.</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemDetail; 