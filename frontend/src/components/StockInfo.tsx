import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Users, Calendar } from 'lucide-react';
import { StockData } from '../types';

interface StockInfoProps {
  stockData: StockData;
}

const StockInfo: React.FC<StockInfoProps> = ({ stockData }) => {
  const formatNumber = (num: number) => {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toLocaleString();
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  const isPositive = stockData.change >= 0;

  return (
    <div className="card">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        {/* Company Info */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {stockData.name} ({stockData.symbol})
          </h1>
          <p className="text-gray-600">{stockData.sector} • {stockData.industry}</p>
        </div>

        {/* Price and Change */}
        <div className="mt-4 lg:mt-0 text-right">
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {formatCurrency(stockData.current_price)}
          </div>
          <div className={`flex items-center justify-end space-x-2 text-lg font-semibold ${
            isPositive ? 'text-success-600' : 'text-danger-600'
          }`}>
            {isPositive ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <TrendingDown className="w-5 h-5" />
            )}
            <span>
              {formatCurrency(stockData.change)} ({formatPercentage(stockData.change_percent)})
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Previous Close: {formatCurrency(stockData.previous_close)}
          </p>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Market Cap */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="w-5 h-5 text-primary-600" />
            <span className="text-sm font-medium text-gray-600">Market Cap</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {formatNumber(stockData.market_cap)}
          </div>
        </div>

        {/* P/E Ratio */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="w-5 h-5 text-primary-600" />
            <span className="text-sm font-medium text-gray-600">P/E Ratio</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {stockData.pe_ratio ? stockData.pe_ratio.toFixed(2) : 'N/A'}
          </div>
        </div>

        {/* Volume */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-5 h-5 text-primary-600" />
            <span className="text-sm font-medium text-gray-600">Volume</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {formatNumber(stockData.volume)}
          </div>
          <div className="text-xs text-gray-500">
            Avg: {formatNumber(stockData.avg_volume)}
          </div>
        </div>

        {/* Dividend Yield */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="w-5 h-5 text-primary-600" />
            <span className="text-sm font-medium text-gray-600">Dividend Yield</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {stockData.dividend_yield ? `${(stockData.dividend_yield * 100).toFixed(2)}%` : 'N/A'}
          </div>
        </div>
      </div>

      {/* 52-Week Range */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-4 border border-primary-100">
        <h3 className="text-sm font-semibold text-primary-800 mb-3">52-Week Range</h3>
        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className="text-xs text-gray-600 mb-1">52-Week Low</div>
            <div className="text-lg font-semibold text-danger-600">
              {formatCurrency(stockData.week_52_low)}
            </div>
          </div>
          
          {/* Range Bar */}
          <div className="flex-1 mx-4">
            <div className="relative h-2 bg-gray-200 rounded-full">
              <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-danger-500 to-success-500 rounded-full"
                   style={{
                     left: `${((stockData.current_price - stockData.week_52_low) / (stockData.week_52_high - stockData.week_52_low)) * 100}%`,
                     width: '4px'
                   }}>
              </div>
            </div>
            <div className="text-xs text-gray-500 text-center mt-1">
              Current: {formatCurrency(stockData.current_price)}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xs text-gray-600 mb-1">52-Week High</div>
            <div className="text-lg font-semibold text-success-600">
              {formatCurrency(stockData.week_52_high)}
            </div>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        Last updated: {new Date(stockData.timestamp).toLocaleString()}
      </div>
    </div>
  );
};

export default StockInfo;
