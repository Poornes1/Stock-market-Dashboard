import React from 'react';
import { TrendingUp, BarChart3, Brain, Zap } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient">
                Stock Market Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Real-time data • AI Predictions • Technical Analysis
              </p>
            </div>
          </div>

          {/* Feature Icons */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-gray-600">
              <BarChart3 className="w-5 h-5" />
              <span className="text-sm font-medium">Live Charts</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Brain className="w-5 h-5" />
              <span className="text-sm font-medium">AI Predictions</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Zap className="w-5 h-5" />
              <span className="text-sm font-medium">Real-time Data</span>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="p-2 rounded-lg hover:bg-gray-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
