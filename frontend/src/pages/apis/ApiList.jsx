import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { useState } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';

const ApiList = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newApi, setNewApi] = useState({ name: '', baseUrl: '', description: '' });

  const { data: apis, isLoading } = useQuery({
    queryKey: ['apis'],
    queryFn: async () => {
      const { data } = await api.get('/apis');
      return data.data;
    }
  });

  const createApiMutation = useMutation({
    mutationFn: (apiData) => api.post('/apis', apiData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apis'] });
      setIsModalOpen(false);
      setNewApi({ name: '', baseUrl: '', description: '' });
    }
  });

  const deleteApiMutation = useMutation({
    mutationFn: (id) => api.delete(`/apis/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apis'] });
    }
  });

  const handleCreate = (e) => {
    e.preventDefault();
    createApiMutation.mutate(newApi);
  };

  if (isLoading) return <div>Loading APIs...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium text-gray-800">Your APIs</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add API
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base URL</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {apis?.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                  No APIs found. Create one to get started.
                </td>
              </tr>
            ) : (
              apis?.map((api) => (
                <tr key={api._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{api.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{api.baseUrl}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(api.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-4">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this API and all its keys?')) {
                          deleteApiMutation.mutate(api._id);
                        }
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Add New API</h3>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={newApi.name}
                  onChange={(e) => setNewApi({...newApi, name: e.target.value})}
                  placeholder="e.g. Weather Service"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Base URL</label>
                <input
                  type="url"
                  required
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={newApi.baseUrl}
                  onChange={(e) => setNewApi({...newApi, baseUrl: e.target.value})}
                  placeholder="https://api.weather.com"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={newApi.description}
                  onChange={(e) => setNewApi({...newApi, description: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createApiMutation.isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {createApiMutation.isLoading ? 'Creating...' : 'Create API'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiList;
