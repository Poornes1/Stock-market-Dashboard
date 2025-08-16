import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { HistoricalData, ChartData } from '../types';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface StockChartProps {
  symbol: string;
  stockData: any; // Using any for now since we don't have the exact type
}

const StockChart: React.FC<StockChartProps> = ({ symbol, stockData }) => {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('1y');
  const [showTechnicalIndicators, setShowTechnicalIndicators] = useState(true);

  useEffect(() => {
    fetchHistoricalData();
  }, [symbol, period]);

  const fetchHistoricalData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/history/${symbol}?period=${period}&interval=1d`);
      if (response.ok) {
        const data: HistoricalData = await response.json();
        processChartData(data);
      } else {
        throw new Error('Failed to fetch historical data');
      }
    } catch (error) {
      setError('Failed to load chart data');
      console.error('Error fetching historical data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (data: HistoricalData) => {
    if (!data.data || data.data.length === 0) {
      setError('No chart data available');
      return;
    }

    const labels = data.data.map(item => item.Date);
    const prices = data.data.map(item => item.Close);
    const volumes = data.data.map(item => item.Volume);

    const chartData: ChartData = {
      labels,
      datasets: [
        {
          label: 'Stock Price',
          data: prices,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.1,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#3b82f6',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 2,
        }
      ]
    };

    // Add technical indicators if available and enabled
    if (showTechnicalIndicators) {
      const ma5Data = data.data.map(item => item.MA5).filter(val => val !== undefined);
      const ma20Data = data.data.map(item => item.MA20).filter(val => val !== undefined);
      const ma50Data = data.data.map(item => item.MA50).filter(val => val !== undefined);

      if (ma5Data.length > 0) {
        chartData.datasets.push({
          label: 'MA5',
          data: ma5Data,
          borderColor: '#10b981',
          backgroundColor: 'transparent',
          fill: false,
          tension: 0.1,
          pointRadius: 0,
          borderWidth: 1,
        });
      }

      if (ma20Data.length > 0) {
        chartData.datasets.push({
          label: 'MA20',
          data: ma20Data,
          borderColor: '#f59e0b',
          backgroundColor: 'transparent',
          fill: false,
          tension: 0.1,
          pointRadius: 0,
          borderWidth: 1,
        });
      }

      if (ma50Data.length > 0) {
        chartData.datasets.push({
          label: 'MA50',
          data: ma50Data,
          borderColor: '#8b5cf6',
          backgroundColor: 'transparent',
          fill: false,
          tension: 0.1,
          pointRadius: 0,
          borderWidth: 1,
        });
      }
    }

    setChartData(chartData);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#3b82f6',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date',
          color: '#6b7280',
          font: {
            size: 12,
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: '#6b7280',
          maxTicksLimit: 8,
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Price (USD)',
          color: '#6b7280',
          font: {
            size: 12,
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: '#6b7280',
          callback: function(value: any) {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(value);
          },
        },
      },
    },
    elements: {
      point: {
        hoverRadius: 6,
        hoverBorderWidth: 2,
      },
    },
  };

  if (loading) {
    return (
      <div className="chart-container flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="spinner"></div>
          <span className="text-gray-600">Loading chart data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-container flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-red-700">{error}</p>
          <button 
            onClick={fetchHistoricalData}
            className="btn-danger mt-3"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Chart Controls */}
      <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Time Period:</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="input py-1 px-3 text-sm w-auto"
          >
            <option value="5d">5 Days</option>
            <option value="1mo">1 Month</option>
            <option value="3mo">3 Months</option>
            <option value="6mo">6 Months</option>
            <option value="1y">1 Year</option>
            <option value="2y">2 Years</option>
            <option value="5y">5 Years</option>
          </select>
        </div>

        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showTechnicalIndicators}
              onChange={(e) => setShowTechnicalIndicators(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Show Technical Indicators</span>
          </label>
        </div>
      </div>

      {/* Chart */}
      <div className="chart-container">
        {chartData ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No chart data available</p>
          </div>
        )}
      </div>

      {/* Chart Info */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>Interactive chart with {period} historical data • Hover over points for details</p>
        {showTechnicalIndicators && (
          <p className="mt-1">
            MA5 (Green) • MA20 (Orange) • MA50 (Purple)
          </p>
        )}
      </div>
    </div>
  );
};

export default StockChart;
