import React from 'react';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, Info } from 'lucide-react';
import { PredictionData } from '../types';

interface PredictionCardProps {
  predictionData: PredictionData;
}

const PredictionCard: React.FC<PredictionCardProps> = ({ predictionData }) => {
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

  const isPositive = predictionData.predicted_change >= 0;
  const confidenceColor = predictionData.confidence >= 0.7 ? 'success' : 
                         predictionData.confidence >= 0.5 ? 'warning' : 'danger';

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'Very High';
    if (confidence >= 0.7) return 'High';
    if (confidence >= 0.6) return 'Moderate';
    if (confidence >= 0.5) return 'Low';
    return 'Very Low';
  };

  return (
    <div className="card bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Brain className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">AI Price Prediction</h2>
            <p className="text-sm text-gray-600">Next trading day forecast</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`badge badge-${confidenceColor}`}>
            {getConfidenceLabel(predictionData.confidence)} Confidence
          </div>
        </div>
      </div>

      {/* Prediction Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Current Price */}
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Current Price</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(predictionData.current_price)}
          </div>
        </div>

        {/* Predicted Price */}
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Predicted Price</div>
          <div className={`text-2xl font-bold ${
            isPositive ? 'text-success-600' : 'text-danger-600'
          }`}>
            {formatCurrency(predictionData.predicted_price)}
          </div>
          <div className={`text-sm font-medium ${
            isPositive ? 'text-success-600' : 'text-danger-600'
          }`}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4 inline mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 inline mr-1" />
            )}
            {formatPercentage(predictionData.predicted_change_percent)}
          </div>
        </div>

        {/* Expected Change */}
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Expected Change</div>
          <div className={`text-xl font-semibold ${
            isPositive ? 'text-success-600' : 'text-danger-600'
          }`}>
            {formatCurrency(predictionData.predicted_change)}
          </div>
          <div className="text-xs text-gray-500">
            {predictionData.prediction_date}
          </div>
        </div>
      </div>

      {/* Model Information */}
      <div className="bg-white rounded-lg p-4 mb-4 border border-purple-100">
        <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
          <Info className="w-4 h-4 mr-2 text-purple-600" />
          Model Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-600">Algorithm:</span>
            <span className="ml-2 font-medium">{predictionData.model_info.algorithm}</span>
          </div>
          <div>
            <span className="text-gray-600">Training Data:</span>
            <span className="ml-2 font-medium">{predictionData.model_info.training_data_points}</span>
          </div>
          <div>
            <span className="text-gray-600">Features Used:</span>
            <span className="ml-2 font-medium">{predictionData.model_info.features_used.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Last Updated:</span>
            <span className="ml-2 font-medium">
              {new Date(predictionData.model_info.last_updated).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-800">
            <strong>Disclaimer:</strong> {predictionData.disclaimer}
          </div>
        </div>
      </div>

      {/* Confidence Meter */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Prediction Confidence</span>
          <span className="font-medium">{Math.round(predictionData.confidence * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              confidenceColor === 'success' ? 'bg-success-500' :
              confidenceColor === 'warning' ? 'bg-warning-500' : 'bg-danger-500'
            }`}
            style={{ width: `${predictionData.confidence * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default PredictionCard;
