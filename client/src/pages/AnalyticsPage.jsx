import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import './AnalyticsPage.css';

// Register the components Chart.js needs
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AnalyticsPage = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('/api/analytics/charts', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChartData(res.data);
      } catch (error) {
        console.error("Failed to fetch chart data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChartData();
  }, []);

  if (loading) {
    return <div className="analytics-container"><h2>Loading Analytics...</h2></div>;
  }
  
  if (!chartData) {
    return <div className="analytics-container"><h2>Could not load analytics data.</h2></div>;
  }

  const categoryChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Reports Submitted by Category', font: { size: 18 } },
    },
  };

  const categoryChartData = {
    labels: chartData.reportsByCategory.map(item => item._id.charAt(0).toUpperCase() + item._id.slice(1)),
    datasets: [{
      label: 'Number of Reports',
      data: chartData.reportsByCategory.map(item => item.count),
      backgroundColor: 'rgba(53, 162, 235, 0.6)',
      borderColor: 'rgba(53, 162, 235, 1)',
      borderWidth: 1,
    }],
  };

  return (
    <div className="analytics-container">
      <h1 className="analytics-title">Civic Issue Analytics</h1>
      <div className="analytics-grid">
        <div className="analytics-metric-card">
          <h2>Average Resolution Time</h2>
          <p className="metric-value">{chartData.avgResolutionTime} <span>hours</span></p>
        </div>
        <div className="analytics-chart-container">
          <Bar options={categoryChartOptions} data={categoryChartData} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;