import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { useState } from 'react';
import { Key as KeyIcon, RefreshCw, XCircle, Plus, Trash2, Edit2 } from 'lucide-react';

const KeyList = () => {
  const queryClient = useQueryClient();
  const [selectedApiId, setSelectedApiId] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [renameModal, setRenameModal] = useState({ isOpen: false, keyId: null, currentName: '' });
  
  const { data: apis } = useQuery({
    queryKey: ['apis'],
    queryFn: async () => {
      const { data } = await api.get('/apis');
      if (data.data.length > 0 && !selectedApiId) {
        setSelectedApiId(data.data[0]._id);
      }
      return data.data;
    }
  });

  const { data: keys, isLoading } = useQuery({
    queryKey: ['keys', selectedApiId],
    queryFn: async () => {
      if (!selectedApiId) return [];
      const { data } = await api.get(`/keys/${selectedApiId}`);
      return data.data;
    },
    enabled: !!selectedApiId
  });

  const generateKeyMutation = useMutation({
    mutationFn: (name) => api.post(`/keys/${selectedApiId}/generate`, { name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['keys', selectedApiId] })
  });

  const revokeKeyMutation = useMutation({
    mutationFn: (keyId) => api.patch(`/keys/${keyId}/revoke`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['keys', selectedApiId] })
  });

  const rotateKeyMutation = useMutation({
    mutationFn: (keyId) => api.patch(`/keys/${keyId}/rotate`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['keys', selectedApiId] })
  });

  const deleteKeyMutation = useMutation({
    mutationFn: (keyId) => api.delete(`/keys/${keyId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['keys', selectedApiId] })
  });

  const renameKeyMutation = useMutation({
    mutationFn: ({ keyId, name }) => api.patch(`/keys/${keyId}/rename`, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keys', selectedApiId] });
      setRenameModal({ isOpen: false, keyId: null, currentName: '' });
    }
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium text-gray-800">API Keys</h2>
        <button
          onClick={() => {
            setNewKeyName('My API Key');
            setIsCreateModalOpen(true);
          }}
          disabled={!selectedApiId || generateKeyMutation.isPending}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Generate New Key
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select API</label>
        <select
          className="w-full md:w-1/3 border border-gray-300 rounded-md p-2 bg-white"
          value={selectedApiId}
          onChange={(e) => setSelectedApiId(e.target.value)}
        >
          {apis?.length === 0 ? (
            <option value="">No APIs available</option>
          ) : (
            apis?.map(api => (
              <option key={api._id} value={api._id}>{api.name}</option>
            ))
          )}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan="5" className="px-6 py-4 text-center">Loading...</td></tr>
            ) : keys?.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                  No keys found for this API. Generate one!
                </td>
              </tr>
            ) : (
              keys?.map((key) => (
                <tr key={key._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {key.name || 'Default Key'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600 flex items-center">
                    <KeyIcon className="w-4 h-4 mr-2 text-gray-400" />
                    {key.key}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      key.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {key.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(key.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-4">
                      <button 
                        onClick={() => setRenameModal({ isOpen: true, keyId: key._id, currentName: key.name || 'Default Key' })}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Rename Key"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {key.status === 'active' && (
                        <>
                          <button 
                            onClick={() => {
                              if (window.confirm('Are you sure you want to rotate this key? The old key will immediately stop working.')) {
                                rotateKeyMutation.mutate(key._id);
                              }
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Rotate Key"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              if (window.confirm('Are you sure you want to revoke this key?')) {
                                revokeKeyMutation.mutate(key._id);
                              }
                            }}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Revoke Key"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => {
                          if (window.confirm('Are you sure you want to permanently delete this key? This action cannot be undone.')) {
                            deleteKeyMutation.mutate(key._id);
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Key"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Key Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium mb-4">Create New API Key</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Key Name</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md p-2"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newKeyName.trim()) {
                    generateKeyMutation.mutate(newKeyName);
                    setIsCreateModalOpen(false);
                  }
                }}
                disabled={!newKeyName.trim() || generateKeyMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {generateKeyMutation.isPending ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Key Modal */}
      {renameModal.isOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium mb-4">Rename API Key</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">New Key Name</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md p-2"
                value={renameModal.currentName}
                onChange={(e) => setRenameModal({...renameModal, currentName: e.target.value})}
                autoFocus
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setRenameModal({ isOpen: false, keyId: null, currentName: '' })}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (renameModal.currentName.trim()) {
                    renameKeyMutation.mutate({ keyId: renameModal.keyId, name: renameModal.currentName });
                  }
                }}
                disabled={!renameModal.currentName.trim() || renameKeyMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {renameKeyMutation.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default KeyList;
