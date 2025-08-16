import React, { useState, useEffect } from 'react';
import CompanyList from './components/CompanyList';
import StockChart from './components/StockChart';
import StockInfo from './components/StockInfo';
import PredictionCard from './components/PredictionCard';
import MarketSummary from './components/MarketSummary';
import Header from './components/Header';
import { Company, StockData, PredictionData, MarketSummaryData } from './types';

function App() {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [predictionData, setPredictionData] = useState<PredictionData | null>(null);
  const [marketSummary, setMarketSummary] = useState<MarketSummaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch market summary on component mount
  useEffect(() => {
    fetchMarketSummary();
  }, []);

  const fetchMarketSummary = async () => {
    try {
      const response = await fetch('/api/market-summary');
      if (response.ok) {
        const data = await response.json();
        setMarketSummary(data);
      }
    } catch (error) {
      console.error('Error fetching market summary:', error);
    }
  };

  const handleCompanySelect = async (company: Company) => {
    setSelectedCompany(company);
    setLoading(true);
    setError(null);
    
    try {
      // Fetch stock data
      const stockResponse = await fetch(`/api/stock/${company.symbol}`);
      if (stockResponse.ok) {
        const stockData = await stockResponse.json();
        setStockData(stockData);
      } else {
        throw new Error('Failed to fetch stock data');
      }

      // Fetch prediction data
      const predictionResponse = await fetch(`/api/prediction/${company.symbol}`);
      if (predictionResponse.ok) {
        const predictionData = await predictionResponse.json();
        setPredictionData(predictionData);
      } else {
        console.warn('Failed to fetch prediction data');
        setPredictionData(null);
      }
    } catch (error) {
      setError('Failed to fetch stock data. Please try again.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        {/* Market Summary */}
        {marketSummary && (
          <div className="mb-6">
            <MarketSummary data={marketSummary} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Company List */}
          <div className="lg:col-span-1">
            <CompanyList 
              onCompanySelect={handleCompanySelect}
              selectedCompany={selectedCompany}
            />
          </div>

          {/* Main Panel - Stock Information and Charts */}
          <div className="lg:col-span-3 space-y-6">
            {error && (
              <div className="card bg-danger-50 border-danger-200">
                <div className="flex items-center space-x-2 text-danger-700">
                  <span className="text-lg">⚠️</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {loading && (
              <div className="card">
                <div className="flex items-center justify-center space-x-3">
                  <div className="spinner"></div>
                  <span className="text-gray-600">Loading stock data...</span>
                </div>
              </div>
            )}

            {selectedCompany && stockData && !loading && (
              <>
                {/* Stock Information Card */}
                <StockInfo stockData={stockData} />
                
                {/* Prediction Card */}
                {predictionData && (
                  <PredictionCard predictionData={predictionData} />
                )}
                
                {/* Stock Chart */}
                <div className="card">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">
                    {selectedCompany.name} ({selectedCompany.symbol}) - Price Chart
                  </h2>
                  <StockChart 
                    symbol={selectedCompany.symbol}
                    stockData={stockData}
                  />
                </div>
              </>
            )}

            {!selectedCompany && !loading && (
              <div className="card text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  Select a Company
                </h3>
                <p className="text-gray-500">
                  Choose a company from the left panel to view its stock information and charts.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
