import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { Accessory, fetchAccessories, createAccessory, updateAccessory, deleteAccessory } from '../../lib/database/accessories';
import { AccessoryEditModal } from './AccessoryManagement/AccessoryEditModal';

interface AccessoryManagementProps {
  session: Session;
}

export function AccessoryManagement({ session }: AccessoryManagementProps) {
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedAccessory, setSelectedAccessory] = useState<Accessory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    category: '',
  });

  const loadAccessories = async () => {
    try {
      const data = await fetchAccessories();
      setAccessories(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load accessories');
    }
  };

  useEffect(() => {
    loadAccessories();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await createAccessory(formData);
      setIsAdding(false);
      setFormData({ name: '', description: '', image_url: '', category: '' });
      await loadAccessories();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add accessory');
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit(accessory: Accessory, data: Partial<Accessory>) {
    setLoading(true);
    try {
      await updateAccessory(accessory.id, data);
      await loadAccessories();
      setSelectedAccessory(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update accessory');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this accessory?')) {
      return;
    }
    
    setLoading(true);
    try {
      await deleteAccessory(id);
      await loadAccessories();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete accessory');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Accessories</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          disabled={loading}
        >
          <Plus className="w-5 h-5 mr-1" />
          Add Accessory
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="ml-3 text-red-700">{error}</p>
          </div>
        </div>
      )}

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Image URL</label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Accessory'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white shadow-sm rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {accessories.map((accessory) => (
              <tr key={accessory.id}>
                <td className="px-6 py-4 whitespace-nowrap">{accessory.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{accessory.category}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setSelectedAccessory(accessory)}
                      className="text-blue-600 hover:text-blue-800"
                      disabled={loading}
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(accessory.id)}
                      className="text-red-600 hover:text-red-800"
                      disabled={loading}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedAccessory && (
        <AccessoryEditModal
          accessory={selectedAccessory}
          onClose={() => setSelectedAccessory(null)}
          onSave={(data) => handleEdit(selectedAccessory, data)}
          loading={loading}
        />
      )}
    </div>
  );
}