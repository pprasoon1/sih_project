import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API from '../api/axios.jsx';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AnalyticsPage = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Base charts (server-side aggregates)
        const chartsRes = await API.get('/analytics/charts');
        const charts = chartsRes.data || {};

        // Optional extended analytics (server-side)
        let extended = null;
        try {
          const extendedRes = await API.get('/analytics/extended');
          extended = extendedRes.data || null;
        } catch (e) {
          if (e?.response?.status === 404) {
            console.info('Extended analytics not available on this server (404): continuing with base charts.');
          } else {
            console.warn('Extended analytics failed:', e?.message || e);
          }
        }

        // Fetch raw reports for richer, real-time derived analysis (staff/admin access)
        let derived = {};
        try {
          const reportsRes = await API.get('/admin/reports');
          const reports = Array.isArray(reportsRes.data) ? reportsRes.data : [];

          // Derive: monthly reports (current month), avg response time, active citizens
          const now = new Date();
          const month = now.getMonth();
          const year = now.getFullYear();

          const monthlyReports = reports.filter(r => {
            const d = r.createdAt ? new Date(r.createdAt) : null;
            return d && d.getMonth() === month && d.getFullYear() === year;
          }).length;

          const resolved = reports.filter(r => r.status === 'resolved' && r.resolvedAt);
          const avgResponseTime = resolved.length > 0
            ? (resolved.reduce((acc, r) => acc + (new Date(r.resolvedAt) - new Date(r.createdAt)), 0) / resolved.length) / (1000 * 60 * 60)
            : 0;

          const activeCitizens = new Set(reports.map(r => r.reporterId?._id || r.reporterId)).size;

          // Fallback: compute reportsByCategory if server didn't provide
          let reportsByCategory = charts.reportsByCategory;
          if (!reportsByCategory || !Array.isArray(reportsByCategory)) {
            const map = new Map();
            for (const r of reports) {
              const key = r.category || 'other';
              map.set(key, (map.get(key) || 0) + 1);
            }
            reportsByCategory = Array.from(map.entries()).map(([k, v]) => ({ _id: k, count: v }));
          }

          // Fallback: reportsByStatus mapping if not provided
          let reportsByStatus = charts.reportsByStatus;
          if (!reportsByStatus || !Array.isArray(reportsByStatus)) {
            const statusMap = reports.reduce((acc, r) => {
              acc[r.status] = (acc[r.status] || 0) + 1;
              return acc;
            }, {});
            reportsByStatus = [
              { _id: 'pending', count: (statusMap['new'] || 0) + (statusMap['acknowledged'] || 0) },
              { _id: 'in-progress', count: statusMap['in_progress'] || 0 },
              { _id: 'resolved', count: statusMap['resolved'] || 0 },
              { _id: 'closed', count: 0 },
            ];
          }

          derived = {
            monthlyReports,
            avgResponseTime: Math.round(avgResponseTime * 100) / 100,
            activeCitizens,
            reportsByCategory,
            reportsByStatus,
          };
        } catch (e) {
          console.warn('Derived analytics from /admin/reports failed or not authorized:', e?.message || e);
        }

        // Merge server and derived analytics
        setChartData({ ...charts, ...derived, extended });
      } catch (error) {
        console.error('Failed to fetch analytics data', error);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-10 text-center">Loading analytics...</div>;
  }

  if (error || !chartData) {
    return (
      <div className="p-10 text-center text-red-600">
        {error || 'Analytics data not available'}
      </div>
    );
  }

  // ----- Charts -----
  const categoryChartOptions = {
    responsive: true,
    plugins: {
      title: { display: true, text: 'Reports by Category' },
    },
  };

  const categoryChartData = {
    labels:
      chartData.reportsByCategory?.map(
        (item) => item._id.charAt(0).toUpperCase() + item._id.slice(1).replace('-', ' ')
      ) || [],
    datasets: [
      {
        label: 'Reports',
        data: chartData.reportsByCategory?.map((item) => item.count) || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
      },
    ],
  };

  const statusChartOptions = {
    responsive: true,
    plugins: {
      title: { display: true, text: 'Report Status Distribution' },
    },
  };

  const statusChartData = {
    labels: ['Pending', 'In Progress', 'Resolved', 'Closed'],
    datasets: [
      {
        data: [
          chartData.reportsByStatus?.find((s) => s._id === 'pending')?.count || 0,
          chartData.reportsByStatus?.find((s) => s._id === 'in-progress')?.count || 0,
          chartData.reportsByStatus?.find((s) => s._id === 'resolved')?.count || 0,
          chartData.reportsByStatus?.find((s) => s._id === 'closed')?.count || 0,
        ],
        backgroundColor: [
          'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(107, 114, 128, 0.8)',
        ],
      },
    ],
  };

  const metrics = [
    { title: 'Total Reports', value: chartData.totalReports || 0, color: 'blue' },
    { title: 'Resolved Reports', value: chartData.resolvedReports || 0, color: 'green' },
    { title: 'Avg Resolution Time', value: `${chartData.avgResolutionTime || 0}h`, color: 'purple' },
    { title: 'Monthly Reports', value: chartData.monthlyReports || 0, color: 'amber' },
    { title: 'Active Citizens', value: chartData.activeCitizens || 0, color: 'emerald' },
    {
      title: 'Resolution Rate',
      value: `${Math.round(((chartData.resolvedReports || 0) / (chartData.totalReports || 1)) * 100)}%`,
      color: 'indigo',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Civic Issue Analytics</h1>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((m, i) => (
            <div key={i} className="p-4 bg-white shadow rounded-lg">
              <p className="text-gray-500">{m.title}</p>
              <p className="text-2xl font-bold">{m.value}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="p-4 bg-white shadow rounded-lg h-80">
            <Bar options={categoryChartOptions} data={categoryChartData} />
          </div>
          <div className="p-4 bg-white shadow rounded-lg h-80">
            <Doughnut options={statusChartOptions} data={statusChartData} />
          </div>
        </div>

        {/* Insights */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Top Categories */}
          <div className="p-4 bg-white shadow rounded-lg">
            <h3 className="font-semibold mb-4">Most Reported Issues</h3>
            {chartData.reportsByCategory?.slice(0, 5).map((c, i) => (
              <div key={i} className="flex justify-between mb-2">
                <span>{c._id.replace('-', ' ')}</span>
                <span>{c.count}</span>
              </div>
            ))}
          </div>

          {/* Department Leaderboard (optional) */}
          {chartData.extended?.perDepartment && (
            <div className="p-4 bg-white shadow rounded-lg">
            <h3 className="font-semibold mb-4">Department Leaderboard</h3>
            {chartData.extended?.perDepartment && chartData.extended.perDepartment.slice(0, 8).map((d, i) => (
                <div key={i} className="flex justify-between mb-2">
                  <span>{d.name}</span>
                  <span>{d.count}</span>
                </div>
              ))}
            </div>
          )}

          {/* Hotspots (optional) */}
          {chartData.extended?.heatBins && (
            <div className="p-4 bg-white shadow rounded-lg">
            <h3 className="font-semibold mb-4">Hotspots (Top Cells)</h3>
            {chartData.extended?.heatBins && chartData.extended.heatBins.slice(0, 10).map((b, i) => (
                <div key={i} className="flex justify-between mb-2">
                  <span>
                    {b._id.lat.toFixed(2)}, {b._id.lng.toFixed(2)}
                  </span>
                  <span>{b.count}</span>
                </div>
              ))}
            </div>
          )}

          {/* Extra Stats */}
          <div className="p-4 bg-white shadow rounded-lg space-y-3">
            <div className="flex justify-between">
              <span>Monthly Reports</span>
              <span>{chartData.monthlyReports || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Avg Response Time</span>
              <span>{chartData.avgResponseTime || 0}h</span>
            </div>
            <div className="flex justify-between">
              <span>Active Citizens</span>
              <span>{chartData.activeCitizens || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
