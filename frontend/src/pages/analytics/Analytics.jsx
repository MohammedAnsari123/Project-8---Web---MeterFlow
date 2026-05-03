import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Clock, AlertTriangle, List, BarChart as BarChart2 } from 'lucide-react';

const Analytics = () => {
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['usage-summary'],
    queryFn: async () => {
      const { data } = await api.get('/usage/summary');
      return data.data;
    }
  });

  const { data: dailyUsage, isLoading: loadingDaily } = useQuery({
    queryKey: ['usage-daily'],
    queryFn: async () => {
      const { data } = await api.get('/usage/daily');
      return data.data;
    }
  });

  const { data: logs, isLoading: loadingLogs } = useQuery({
    queryKey: ['usage-logs'],
    queryFn: async () => {
      const { data } = await api.get('/usage/logs');
      return data.data;
    }
  });

  if (loadingSummary || loadingDaily || loadingLogs) {
    return <div className="flex items-center justify-center h-full text-gray-500">Loading analytics...</div>;
  }

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return 'text-green-600 bg-green-50';
    if (status >= 400 && status < 500) return 'text-yellow-600 bg-yellow-50';
    if (status >= 500) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analytics Engine</h2>
        <p className="text-gray-500 mt-1">Real-time performance and traffic monitoring across all your APIs.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Traffic</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{summary?.totalRequests || 0}</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-full">
            <Activity className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Avg Latency</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{summary?.avgLatency || 0} ms</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-full">
            <Clock className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Error Rate</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{summary?.errorRate || '0.00'}%</p>
          </div>
          <div className="bg-red-50 p-3 rounded-full">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Traffic Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[400px]">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <BarChart2 className="w-5 h-5 mr-2 text-gray-500" />
          Traffic Over Time (30 Days)
        </h3>
        {dailyUsage && dailyUsage.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyUsage} margin={{ top: 5, right: 20, bottom: 25, left: 0 }}>
              <XAxis dataKey="_id" tick={{ fill: '#6B7280', fontSize: 12 }} tickMargin={10} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} tickMargin={10} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ fill: '#F3F4F6' }}
              />
              <Bar dataKey="requests" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 pb-10">
            No traffic data available.
          </div>
        )}
      </div>

      {/* Recent Request Logs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <List className="w-5 h-5 mr-2 text-gray-500" />
            Recent API Requests
          </h3>
          <span className="text-sm text-gray-500">Showing last 50 requests</span>
        </div>

        {logs && logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endpoint</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Latency</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-md ${log.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                        log.method === 'POST' ? 'bg-green-100 text-green-800' :
                          log.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                        {log.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <span className="text-gray-400">{log.apiId?.name}</span> {log.endpoint}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusColor(log.statusCode)}`}>
                        {log.statusCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.latency} ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center text-gray-500">
            No API requests recorded yet. Start making requests to see them here!
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
