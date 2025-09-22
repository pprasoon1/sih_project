import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// Register the components Chart.js needs
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AnalyticsPage = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      try {
        const [charts, extended] = await Promise.all([
          axios.get('https://backend-sih-project-l67a.onrender.com/api/analytics/charts', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('https://backend-sih-project-l67a.onrender.com/api/analytics/extended', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setChartData({ ...charts.data, extended: extended.data });
      } catch (error) {
        console.error("Failed to fetch analytics data", error);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="spinner mx-auto mb-4"></div>
              <p className="text-gray-600">Loading analytics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !chartData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Analytics</h3>
              <p className="text-gray-600 mb-4">{error || 'Analytics data not available'}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="btn btn-primary"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const categoryChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top',
        labels: {
          font: {
            size: 12
          }
        }
      },
      title: { 
        display: true, 
        text: 'Reports by Category', 
        font: { size: 16, weight: 'bold' },
        color: '#374151'
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  const categoryChartData = {
    labels: chartData.reportsByCategory?.map(item => 
      item._id.charAt(0).toUpperCase() + item._id.slice(1).replace('-', ' ')
    ) || [],
    datasets: [{
      label: 'Number of Reports',
      data: chartData.reportsByCategory?.map(item => item.count) || [],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)'
      ],
      borderColor: [
        'rgba(59, 130, 246, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(239, 68, 68, 1)',
        'rgba(139, 92, 246, 1)',
        'rgba(236, 72, 153, 1)'
      ],
      borderWidth: 2,
      borderRadius: 4,
    }],
  };

  const statusChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom',
        labels: {
          font: {
            size: 12
          }
        }
      },
      title: { 
        display: true, 
        text: 'Report Status Distribution', 
        font: { size: 16, weight: 'bold' },
        color: '#374151'
      },
    }
  };

  const statusChartData = {
    labels: ['Pending', 'In Progress', 'Resolved', 'Closed'],
    datasets: [{
      data: [
        chartData.reportsByStatus?.find(s => s._id === 'pending')?.count || 0,
        chartData.reportsByStatus?.find(s => s._id === 'in-progress')?.count || 0,
        chartData.reportsByStatus?.find(s => s._id === 'resolved')?.count || 0,
        chartData.reportsByStatus?.find(s => s._id === 'closed')?.count || 0
      ],
      backgroundColor: [
        'rgba(245, 158, 11, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(107, 114, 128, 0.8)'
      ],
      borderColor: [
        'rgba(245, 158, 11, 1)',
        'rgba(59, 130, 246, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(107, 114, 128, 1)'
      ],
      borderWidth: 2,
    }],
  };

  const metrics = [
    {
      title: 'Total Reports',
      value: chartData.totalReports || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'blue'
    },
    {
      title: 'Resolved Reports',
      value: chartData.resolvedReports || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'green'
    },
    {
      title: 'Avg Resolution Time',
      value: `${chartData.avgResolutionTime || 0}h`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'purple'
    },
    {
      title: 'Resolution Rate',
      value: `${Math.round(((chartData.resolvedReports || 0) / (chartData.totalReports || 1)) * 100)}%`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: 'indigo'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Civic Issue Analytics</h1>
          <p className="text-gray-600">Insights and trends from community reports</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <div key={index} className="card">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  </div>
                  <div className={`w-12 h-12 bg-${metric.color}-100 rounded-full flex items-center justify-center`}>
                    <div className={`text-${metric.color}-600`}>
                      {metric.icon}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Category Chart */}
          <div className="card">
            <div className="card-body">
              <div className="h-80">
                <Bar options={categoryChartOptions} data={categoryChartData} />
              </div>
            </div>
          </div>

          {/* Status Chart */}
          <div className="card">
            <div className="card-body">
              <div className="h-80">
                <Doughnut options={statusChartOptions} data={statusChartData} />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Insights */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Top Categories */}
          <div className="card">
            <div className="card-body">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Reported Issues</h3>
              <div className="space-y-3">
                {chartData.reportsByCategory?.slice(0, 5).map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                      </div>
                      <span className="font-medium text-gray-900 capitalize">
                        {category._id.replace('-', ' ')}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-600">{category.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <div className="card-body">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Leaderboard</h3>
              <div className="space-y-3">
                {chartData.extended?.perDepartment?.slice(0, 8).map((d, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-emerald-700">{idx + 1}</span>
                      </div>
                      <span className="font-medium text-gray-900">{d.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-600">{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Geo Heat (top cells) */}
          <div className="card">
            <div className="card-body">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hotspots (Top Cells)</h3>
              <div className="space-y-2 text-sm">
                {chartData.extended?.heatBins?.slice(0, 10).map((b, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-gray-700">{b._id.lat.toFixed(2)}, {b._id.lng.toFixed(2)}</span>
                    <span className="font-semibold text-gray-900">{b.count}</span>
                  </div>
                ))}
              </div>
                  <span className="text-lg font-bold text-blue-600">{chartData.monthlyReports || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-green-900">Avg Response Time</span>
                  <span className="text-lg font-bold text-green-600">{chartData.avgResponseTime || 0}h</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium text-purple-900">Active Citizens</span>
                  <span className="text-lg font-bold text-purple-600">{chartData.activeCitizens || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;