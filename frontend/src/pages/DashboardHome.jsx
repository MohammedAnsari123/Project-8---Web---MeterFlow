import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const DashboardHome = () => {
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

  if (loadingSummary || loadingDaily) return <div>Loading dashboard...</div>;

  return (
    <div>
      <h2 className="text-xl font-medium text-gray-800 mb-6">Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Requests</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{summary?.totalRequests || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Error Rate</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{summary?.errorRate || '0.00'}%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Avg Latency</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{summary?.avgLatency || 0} ms</p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow border border-gray-100 h-96">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Requests Over Time (30 Days)</h3>
        {dailyUsage && dailyUsage.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyUsage}>
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="requests" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            No traffic data available.
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHome;
