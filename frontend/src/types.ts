export interface Company {
  symbol: string;
  name: string;
  sector: string;
}

export interface StockData {
  symbol: string;
  name: string;
  current_price: number;
  previous_close: number;
  change: number;
  change_percent: number;
  volume: number;
  avg_volume: number;
  market_cap: number;
  pe_ratio: number;
  dividend_yield: number;
  week_52_high: number;
  week_52_low: number;
  sector: string;
  industry: string;
  timestamp: string;
}

export interface PredictionData {
  symbol: string;
  current_price: number;
  predicted_price: number;
  predicted_change: number;
  predicted_change_percent: number;
  confidence: number;
  prediction_date: string;
  model_info: {
    algorithm: string;
    features_used: string[];
    training_data_points: string;
    last_updated: string;
  };
  disclaimer: string;
  timestamp: string;
}

export interface MarketSummaryData {
  market_summary: {
    [key: string]: {
      symbol: string;
      current: number;
      change: number;
      change_percent: number;
      status: 'up' | 'down';
    };
  };
  timestamp: string;
}

export interface HistoricalData {
  symbol: string;
  period: string;
  interval: string;
  data: Array<{
    Date: string;
    Open: number;
    High: number;
    Low: number;
    Close: number;
    Volume: number;
    MA5?: number;
    MA20?: number;
    MA50?: number;
    RSI?: number;
    MACD?: number;
    Signal?: number;
    BB_Upper?: number;
    BB_Lower?: number;
  }>;
  summary: {
    total_points: number;
    start_date: string | null;
    end_date: string | null;
    highest_price: number;
    lowest_price: number;
    avg_volume: number;
  };
  timestamp: string;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: (number | undefined)[];
    borderColor: string;
    backgroundColor: string;
    fill?: boolean;
    tension?: number;
    pointRadius?: number;
    pointHoverRadius?: number;
    pointHoverBackgroundColor?: string;
    pointHoverBorderColor?: string;
    pointHoverBorderWidth?: number;
    borderWidth?: number;
  }>;
}
