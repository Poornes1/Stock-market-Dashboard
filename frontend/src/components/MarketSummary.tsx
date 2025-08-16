import React from 'react';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { MarketSummaryData } from '../types';

interface MarketSummaryProps {
  data: MarketSummaryData;
}

const MarketSummary: React.FC<MarketSummaryProps> = ({ data }) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  const getMarketStatus = () => {
    const indices = Object.values(data.market_summary);
    const upCount = indices.filter(index => index.status === 'up').length;
    const downCount = indices.filter(index => index.status === 'down').length;
    
    if (upCount > downCount) return 'bullish';
    if (downCount > upCount) return 'bearish';
    return 'mixed';
  };

  const marketStatus = getMarketStatus();
  const statusConfig = {
    bullish: { color: 'success', icon: TrendingUp, text: 'Bull Market' },
    bearish: { color: 'danger', icon: TrendingDown, text: 'Bear Market' },
    mixed: { color: 'warning', icon: BarChart3, text: 'Mixed Market' }
  };

  const config = statusConfig[marketStatus];

  return (
    <div className="card bg-gradient-to-r from-gray-50 to-blue-50 border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 bg-${config.color}-100 rounded-lg`}>
            <config.icon className={`w-6 h-6 text-${config.color}-600`} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Market Summary</h2>
            <p className="text-sm text-gray-600">Major indices performance</p>
          </div>
        </div>
        
        <div className={`badge badge-${config.color}`}>
          {config.text}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(data.market_summary).map(([name, index]) => (
          <div 
            key={index.symbol}
            className={`bg-white rounded-lg p-4 border transition-all duration-200 hover:shadow-md ${
              index.status === 'up' ? 'border-success-200' : 'border-danger-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-800">{name}</h3>
              <span className={`text-xs px-2 py-1 rounded-full ${
                index.status === 'up' 
                  ? 'bg-success-100 text-success-800' 
                  : 'bg-danger-100 text-danger-800'
              }`}>
                {index.symbol}
              </span>
            </div>
            
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatNumber(index.current)}
            </div>
            
            <div className={`flex items-center space-x-2 text-sm font-medium ${
              index.status === 'up' ? 'text-success-600' : 'text-danger-600'
            }`}>
              {index.status === 'up' ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>
                {formatNumber(index.change)} ({formatPercentage(index.change_percent)})
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Market Overview */}
      <div className="mt-6 bg-white rounded-lg p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Market Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-gray-600 mb-1">Overall Trend</div>
            <div className={`font-medium ${
              marketStatus === 'bullish' ? 'text-success-600' : 
              marketStatus === 'bearish' ? 'text-danger-600' : 'text-warning-600'
            }`}>
              {config.text}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-600 mb-1">Indices Up</div>
            <div className="font-medium text-success-600">
              {Object.values(data.market_summary).filter(index => index.status === 'up').length}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-600 mb-1">Indices Down</div>
            <div className="font-medium text-danger-600">
              {Object.values(data.market_summary).filter(index => index.status === 'down').length}
            </div>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        Last updated: {new Date(data.timestamp).toLocaleString()}
      </div>
    </div>
  );
};

export default MarketSummary;
