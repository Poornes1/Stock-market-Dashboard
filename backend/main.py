from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Optional
import uvicorn
import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
# from sklearn.ensemble import RandomForestRegressor
# from sklearn.preprocessing import StandardScaler
import sqlite3
import json
import asyncio
from contextlib import asynccontextmanager

# Global variables for ML model
ml_model = None
scaler = None
is_model_trained = False

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global ml_model, scaler, is_model_trained
    # ml_model = RandomForestRegressor(n_estimators=100, random_state=42)
    # scaler = StandardScaler()
    print("🚀 Stock Market Dashboard Backend Started!")
    yield
    # Shutdown
    print("👋 Shutting down Stock Market Dashboard Backend")

app = FastAPI(
    title="Stock Market Dashboard API",
    description="A comprehensive API for stock market data and AI predictions",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sample company data with major stocks
COMPANIES = [
    {"symbol": "AAPL", "name": "Apple Inc.", "sector": "Technology"},
    {"symbol": "MSFT", "name": "Microsoft Corporation", "sector": "Technology"},
    {"symbol": "GOOGL", "name": "Alphabet Inc.", "sector": "Technology"},
    {"symbol": "AMZN", "name": "Amazon.com Inc.", "sector": "Consumer Discretionary"},
    {"symbol": "TSLA", "name": "Tesla Inc.", "sector": "Consumer Discretionary"},
    {"symbol": "META", "name": "Meta Platforms Inc.", "sector": "Technology"},
    {"symbol": "NVDA", "name": "NVIDIA Corporation", "sector": "Technology"},
    {"symbol": "BRK-B", "name": "Berkshire Hathaway Inc.", "sector": "Financial Services"},
    {"symbol": "JNJ", "name": "Johnson & Johnson", "sector": "Healthcare"},
    {"symbol": "V", "name": "Visa Inc.", "sector": "Financial Services"},
    {"symbol": "JPM", "name": "JPMorgan Chase & Co.", "sector": "Financial Services"},
    {"symbol": "PG", "name": "Procter & Gamble Co.", "sector": "Consumer Staples"},
    {"symbol": "UNH", "name": "UnitedHealth Group Inc.", "sector": "Healthcare"},
    {"symbol": "HD", "name": "The Home Depot Inc.", "sector": "Consumer Discretionary"},
    {"symbol": "MA", "name": "Mastercard Inc.", "sector": "Financial Services"},
    {"symbol": "DIS", "name": "The Walt Disney Company", "sector": "Communication Services"},
    {"symbol": "PYPL", "name": "PayPal Holdings Inc.", "sector": "Financial Services"},
    {"symbol": "ADBE", "name": "Adobe Inc.", "sector": "Technology"},
    {"symbol": "CRM", "name": "Salesforce Inc.", "sector": "Technology"},
    {"symbol": "NFLX", "name": "Netflix Inc.", "sector": "Communication Services"},
    {"symbol": "INTC", "name": "Intel Corporation", "sector": "Technology"},
    {"symbol": "PFE", "name": "Pfizer Inc.", "sector": "Healthcare"},
    {"symbol": "KO", "name": "The Coca-Cola Company", "sector": "Consumer Staples"},
    {"symbol": "TMO", "name": "Thermo Fisher Scientific Inc.", "sector": "Healthcare"},
    {"symbol": "ABT", "name": "Abbott Laboratories", "sector": "Healthcare"},
    {"symbol": "PEP", "name": "PepsiCo Inc.", "sector": "Consumer Staples"},
    {"symbol": "COST", "name": "Costco Wholesale Corporation", "sector": "Consumer Staples"},
    {"symbol": "AVGO", "name": "Broadcom Inc.", "sector": "Technology"},
    {"symbol": "TXN", "name": "Texas Instruments Inc.", "sector": "Technology"},
    {"symbol": "QCOM", "name": "QUALCOMM Inc.", "sector": "Technology"},
    {"symbol": "HON", "name": "Honeywell International Inc.", "sector": "Industrials"},
    {"symbol": "LLY", "name": "Eli Lilly and Company", "sector": "Healthcare"},
    {"symbol": "DHR", "name": "Danaher Corporation", "sector": "Healthcare"},
    {"symbol": "VZ", "name": "Verizon Communications Inc.", "sector": "Communication Services"},
    {"symbol": "CMCSA", "name": "Comcast Corporation", "sector": "Communication Services"},
    {"symbol": "NEE", "name": "NextEra Energy Inc.", "sector": "Utilities"},
    {"symbol": "RTX", "name": "Raytheon Technologies Corporation", "sector": "Industrials"},
    {"symbol": "LOW", "name": "Lowe's Companies Inc.", "sector": "Consumer Discretionary"},
    {"symbol": "UPS", "name": "United Parcel Service Inc.", "sector": "Industrials"},
    {"symbol": "SPGI", "name": "S&P Global Inc.", "sector": "Financial Services"},
    {"symbol": "ORCL", "name": "Oracle Corporation", "sector": "Technology"},
    {"symbol": "INTU", "name": "Intuit Inc.", "sector": "Technology"},
    {"symbol": "MS", "name": "Morgan Stanley", "sector": "Financial Services"},
    {"symbol": "GS", "name": "The Goldman Sachs Group Inc.", "sector": "Financial Services"},
    {"symbol": "BLK", "name": "BlackRock Inc.", "sector": "Financial Services"},
    {"symbol": "AMAT", "name": "Applied Materials Inc.", "sector": "Technology"},
    {"symbol": "KLAC", "name": "KLA Corporation", "sector": "Technology"},
    {"symbol": "LRCX", "name": "Lam Research Corporation", "sector": "Technology"},
    {"symbol": "MU", "name": "Micron Technology Inc.", "sector": "Technology"},
    {"symbol": "AMD", "name": "Advanced Micro Devices Inc.", "sector": "Technology"},
    {"symbol": "CSCO", "name": "Cisco Systems Inc.", "sector": "Technology"},
    {"symbol": "IBM", "name": "International Business Machines Corporation", "sector": "Technology"},
    {"symbol": "QCOM", "name": "QUALCOMM Inc.", "sector": "Technology"},
    {"symbol": "TXN", "name": "Texas Instruments Inc.", "sector": "Technology"},
    {"symbol": "AVGO", "name": "Broadcom Inc.", "sector": "Technology"},
    {"symbol": "ADP", "name": "Automatic Data Processing Inc.", "sector": "Technology"},
    {"symbol": "GILD", "name": "Gilead Sciences Inc.", "sector": "Healthcare"},
    {"symbol": "MDT", "name": "Medtronic plc", "sector": "Healthcare"},
    {"symbol": "BMY", "name": "Bristol-Myers Squibb Company", "sector": "Healthcare"},
    {"symbol": "T", "name": "AT&T Inc.", "sector": "Communication Services"}
]

def calculate_technical_indicators(df):
    """Calculate technical indicators for the stock data"""
    if df.empty:
        return df
    
    # Moving averages
    df['MA5'] = df['Close'].rolling(window=5).mean()
    df['MA20'] = df['Close'].rolling(window=20).mean()
    df['MA50'] = df['Close'].rolling(window=50).mean()
    
    # RSI
    delta = df['Close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    df['RSI'] = 100 - (100 / (1 + rs))
    
    # Bollinger Bands
    df['BB_Upper'] = df['MA20'] + (df['Close'].rolling(window=20).std() * 2)
    df['BB_Lower'] = df['MA20'] - (df['Close'].rolling(window=20).std() * 2)
    
    # MACD
    exp1 = df['Close'].ewm(span=12, adjust=False).mean()
    exp2 = df['Close'].ewm(span=26, adjust=False).mean()
    df['MACD'] = exp1 - exp2
    df['Signal'] = df['MACD'].ewm(span=9, adjust=False).mean()
    
    # Volume indicators
    df['Volume_MA'] = df['Volume'].rolling(window=20).mean()
    df['Volume_Ratio'] = df['Volume'] / df['Volume_MA']
    
    return df

def train_ml_model(symbol: str):
    """Train ML model for price prediction"""
    global ml_model, scaler, is_model_trained
    
    try:
        # Get historical data for training
        stock = yf.Ticker(symbol)
        hist = stock.history(period="2y")
        
        if hist.empty or len(hist) < 100:
            return False
        
        # Calculate technical indicators
        hist = calculate_technical_indicators(hist)
        hist = hist.dropna()
        
        if len(hist) < 50:
            return False
        
        # Prepare features
        features = ['Open', 'High', 'Low', 'Close', 'Volume', 'MA5', 'MA20', 'MA50', 'RSI', 'MACD']
        X = hist[features].values[:-1]  # Use current day to predict next day
        y = hist['Close'].values[1:]    # Next day's closing price
        
        if len(X) < 30:
            return False
        
        # Scale features
        X_scaled = scaler.fit_transform(X)
        
        # Train model
        ml_model.fit(X_scaled, y)
        is_model_trained = True
        
        return True
        
    except Exception as e:
        print(f"Error training model for {symbol}: {e}")
        return False

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Stock Market Dashboard API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": [
            "/api/companies",
            "/api/stock/{symbol}",
            "/api/prediction/{symbol}",
            "/api/history/{symbol}",
            "/docs"
        ]
    }

@app.get("/api/companies")
async def get_companies():
    """Get list of all available companies"""
    return {
        "companies": COMPANIES,
        "total": len(COMPANIES),
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/stock/{symbol}")
async def get_stock_data(symbol: str):
    """Get current stock data for a specific symbol"""
    try:
        symbol = symbol.upper()
        stock = yf.Ticker(symbol)
        
        # Get current info
        info = stock.info
        
        # Get recent data
        hist = stock.history(period="5d")
        
        if hist.empty:
            raise HTTPException(status_code=404, detail=f"No data found for symbol {symbol}")
        
        # Calculate current metrics
        current_price = hist['Close'].iloc[-1]
        previous_close = hist['Close'].iloc[-2] if len(hist) > 1 else current_price
        change = current_price - previous_close
        change_percent = (change / previous_close) * 100 if previous_close != 0 else 0
        
        # Get 52-week high/low
        year_hist = stock.history(period="1y")
        week_52_high = year_hist['High'].max() if not year_hist.empty else current_price
        week_52_low = year_hist['Low'].min() if not year_hist.empty else current_price
        
        # Calculate volume metrics
        avg_volume = year_hist['Volume'].mean() if not year_hist.empty else 0
        current_volume = hist['Volume'].iloc[-1]
        
        stock_data = {
            "symbol": symbol,
            "name": info.get('longName', symbol),
            "current_price": round(current_price, 2),
            "previous_close": round(previous_close, 2),
            "change": round(change, 2),
            "change_percent": round(change_percent, 2),
            "volume": int(current_volume),
            "avg_volume": int(avg_volume),
            "market_cap": info.get('marketCap', 0),
            "pe_ratio": info.get('trailingPE', 0),
            "dividend_yield": info.get('dividendYield', 0),
            "week_52_high": round(week_52_high, 2),
            "week_52_low": round(week_52_low, 2),
            "sector": info.get('sector', 'Unknown'),
            "industry": info.get('industry', 'Unknown'),
            "timestamp": datetime.now().isoformat()
        }
        
        return stock_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stock data: {str(e)}")

@app.get("/api/history/{symbol}")
async def get_stock_history(symbol: str, period: str = "1y", interval: str = "1d"):
    """Get historical stock data with technical indicators"""
    try:
        symbol = symbol.upper()
        stock = yf.Ticker(symbol)
        
        # Validate period and interval
        valid_periods = ["1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "10y", "ytd", "max"]
        valid_intervals = ["1m", "2m", "5m", "15m", "30m", "60m", "90m", "1h", "1d", "5d", "1wk", "1mo", "3mo"]
        
        if period not in valid_periods:
            period = "1y"
        if interval not in valid_intervals:
            interval = "1d"
        
        # Get historical data
        hist = stock.history(period=period, interval=interval)
        
        if hist.empty:
            raise HTTPException(status_code=404, detail=f"No historical data found for symbol {symbol}")
        
        # Calculate technical indicators
        hist = calculate_technical_indicators(hist)
        
        # Convert to JSON-serializable format
        hist_json = hist.reset_index()
        hist_json['Date'] = hist_json['Date'].dt.strftime('%Y-%m-%d')
        
        # Round numeric values
        numeric_columns = ['Open', 'High', 'Low', 'Close', 'Volume', 'MA5', 'MA20', 'MA50', 'RSI', 'MACD', 'Signal', 'BB_Upper', 'BB_Lower']
        for col in numeric_columns:
            if col in hist_json.columns:
                hist_json[col] = hist_json[col].round(4)
        
        return {
            "symbol": symbol,
            "period": period,
            "interval": interval,
            "data": hist_json.to_dict('records'),
            "summary": {
                "total_points": len(hist_json),
                "start_date": hist_json['Date'].iloc[0] if len(hist_json) > 0 else None,
                "end_date": hist_json['Date'].iloc[-1] if len(hist_json) > 0 else None,
                "highest_price": float(hist_json['High'].max()) if len(hist_json) > 0 else 0,
                "lowest_price": float(hist_json['Low'].min()) if len(hist_json) > 0 else 0,
                "avg_volume": float(hist_json['Volume'].mean()) if len(hist_json) > 0 else 0
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching historical data: {str(e)}")

@app.get("/api/prediction/{symbol}")
async def get_stock_prediction(symbol: str):
    """Get AI-powered price prediction for a stock"""
    try:
        symbol = symbol.upper()
        
        # Train model if not already trained
        if not is_model_trained:
            success = train_ml_model(symbol)
            if not success:
                raise HTTPException(status_code=500, detail="Unable to train prediction model")
        
        # Get recent data for prediction
        stock = yf.Ticker(symbol)
        recent_data = stock.history(period="5d")
        
        if recent_data.empty or len(recent_data) < 2:
            raise HTTPException(status_code=404, detail=f"Insufficient data for prediction for {symbol}")
        
        # Calculate technical indicators
        recent_data = calculate_technical_indicators(recent_data)
        recent_data = recent_data.dropna()
        
        if len(recent_data) < 1:
            raise HTTPException(status_code=500, detail="Unable to calculate technical indicators")
        
        # Prepare features for prediction
        features = ['Open', 'High', 'Low', 'Close', 'Volume', 'MA5', 'MA20', 'MA50', 'RSI', 'MACD']
        latest_features = recent_data[features].iloc[-1].values.reshape(1, -1)
        
        # Scale features
        latest_features_scaled = scaler.transform(latest_features)
        
        # Make prediction
        predicted_price = ml_model.predict(latest_features_scaled)[0]
        current_price = recent_data['Close'].iloc[-1]
        
        # Calculate confidence (simple approach based on model performance)
        confidence = 0.75  # This would be calculated based on model validation
        
        # Calculate prediction range
        price_change = predicted_price - current_price
        price_change_percent = (price_change / current_price) * 100
        
        prediction = {
            "symbol": symbol,
            "current_price": round(current_price, 2),
            "predicted_price": round(predicted_price, 2),
            "predicted_change": round(price_change, 2),
            "predicted_change_percent": round(price_change_percent, 2),
            "confidence": round(confidence, 2),
            "prediction_date": (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d'),
            "model_info": {
                "algorithm": "Random Forest",
                "features_used": features,
                "training_data_points": "2 years of historical data",
                "last_updated": datetime.now().isoformat()
            },
            "disclaimer": "This prediction is for educational purposes only and should not be used for investment decisions.",
            "timestamp": datetime.now().isoformat()
        }
        
        return prediction
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating prediction: {str(e)}")

@app.get("/api/market-summary")
async def get_market_summary():
    """Get market summary for major indices"""
    try:
        indices = {
            "^GSPC": "S&P 500",
            "^DJI": "Dow Jones",
            "^IXIC": "NASDAQ",
            "^RUT": "Russell 2000"
        }
        
        summary = {}
        for symbol, name in indices.items():
            try:
                index = yf.Ticker(symbol)
                hist = index.history(period="2d")
                
                if not hist.empty and len(hist) >= 2:
                    current = hist['Close'].iloc[-1]
                    previous = hist['Close'].iloc[-2]
                    change = current - previous
                    change_percent = (change / previous) * 100
                    
                    summary[name] = {
                        "symbol": symbol,
                        "current": round(current, 2),
                        "change": round(change, 2),
                        "change_percent": round(change_percent, 2),
                        "status": "up" if change >= 0 else "down"
                    }
            except:
                continue
        
        return {
            "market_summary": summary,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching market summary: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
