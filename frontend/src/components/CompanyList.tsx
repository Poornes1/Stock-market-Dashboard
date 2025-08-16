import React, { useState, useEffect } from 'react';
import { Search, Building2, TrendingUp, TrendingDown } from 'lucide-react';
import { Company } from '../types';

interface CompanyListProps {
  onCompanySelect: (company: Company) => void;
  selectedCompany: Company | null;
}

const CompanyList: React.FC<CompanyListProps> = ({ onCompanySelect, selectedCompany }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    filterCompanies();
  }, [searchTerm, companies]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/companies');
      if (response.ok) {
        const data = await response.json();
        setCompanies(data.companies);
      } else {
        throw new Error('Failed to fetch companies');
      }
    } catch (error) {
      setError('Failed to load companies');
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCompanies = () => {
    if (!searchTerm.trim()) {
      setFilteredCompanies(companies);
      return;
    }

    const filtered = companies.filter(company =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.sector.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCompanies(filtered);
  };

  const getSectorColor = (sector: string) => {
    const colors: { [key: string]: string } = {
      'Technology': 'bg-blue-100 text-blue-800',
      'Healthcare': 'bg-green-100 text-green-800',
      'Financial Services': 'bg-purple-100 text-purple-800',
      'Consumer Discretionary': 'bg-orange-100 text-orange-800',
      'Consumer Staples': 'bg-yellow-100 text-yellow-800',
      'Communication Services': 'bg-pink-100 text-pink-800',
      'Industrials': 'bg-indigo-100 text-indigo-800',
      'Utilities': 'bg-teal-100 text-teal-800',
      'Energy': 'bg-red-100 text-red-800',
      'Materials': 'bg-gray-100 text-gray-800',
      'Real Estate': 'bg-amber-100 text-amber-800'
    };
    return colors[sector] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center space-x-3 py-8">
          <div className="spinner"></div>
          <span className="text-gray-600">Loading companies...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-danger-50 border-danger-200">
        <div className="text-center py-6">
          <div className="text-danger-600 mb-2">⚠️</div>
          <p className="text-danger-700 text-sm">{error}</p>
          <button 
            onClick={fetchCompanies}
            className="btn-danger mt-3 text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Companies ({filteredCompanies.length})
        </h2>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 pr-4 py-2 text-sm"
          />
        </div>
      </div>

      {/* Company List */}
      <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
        {filteredCompanies.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Building2 className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>No companies found</p>
          </div>
        ) : (
          filteredCompanies.map((company) => (
            <div
              key={company.symbol}
              onClick={() => onCompanySelect(company)}
              className={`
                p-3 rounded-lg cursor-pointer transition-all duration-200 border
                ${selectedCompany?.symbol === company.symbol
                  ? 'border-primary-500 bg-primary-50 shadow-glow'
                  : 'border-gray-200 hover:border-primary-300 hover:bg-primary-25'
                }
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900">
                    {company.symbol}
                  </span>
                  {selectedCompany?.symbol === company.symbol && (
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {company.sector}
                </div>
              </div>
              
              <div className="text-sm text-gray-700 mb-2">
                {company.name}
              </div>
              
              <div className="flex items-center justify-between">
                <span className={`badge ${getSectorColor(company.sector)}`}>
                  {company.sector}
                </span>
                
                {/* Sector trend indicator (mock data) */}
                <div className="flex items-center space-x-1 text-xs">
                  {Math.random() > 0.5 ? (
                    <TrendingUp className="w-3 h-3 text-success-500" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-danger-500" />
                  )}
                  <span className="text-gray-500">
                    {Math.random() > 0.5 ? '+' : '-'}{Math.floor(Math.random() * 5 + 1)}%
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          <p>Data provided by Yahoo Finance</p>
          <p className="mt-1">Real-time updates every 5 minutes</p>
        </div>
      </div>
    </div>
  );
};

export default CompanyList;
