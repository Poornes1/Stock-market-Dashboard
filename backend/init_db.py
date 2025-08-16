import sqlite3
import json
from datetime import datetime

def init_database():
    """Initialize the SQLite database with company data"""
    
    # Connect to SQLite database (creates it if it doesn't exist)
    conn = sqlite3.connect('stock_dashboard.db')
    cursor = conn.cursor()
    
    # Create companies table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS companies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            symbol TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            sector TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create stock_data table for caching
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS stock_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            symbol TEXT NOT NULL,
            data_type TEXT NOT NULL,
            data_json TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (symbol) REFERENCES companies (symbol)
        )
    ''')
    
    # Create predictions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            symbol TEXT NOT NULL,
            predicted_price REAL NOT NULL,
            confidence REAL NOT NULL,
            prediction_date DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (symbol) REFERENCES companies (symbol)
        )
    ''')
    
    # Sample company data
    companies = [
        ("AAPL", "Apple Inc.", "Technology"),
        ("MSFT", "Microsoft Corporation", "Technology"),
        ("GOOGL", "Alphabet Inc.", "Technology"),
        ("AMZN", "Amazon.com Inc.", "Consumer Discretionary"),
        ("TSLA", "Tesla Inc.", "Consumer Discretionary"),
        ("META", "Meta Platforms Inc.", "Technology"),
        ("NVDA", "NVIDIA Corporation", "Technology"),
        ("BRK-B", "Berkshire Hathaway Inc.", "Financial Services"),
        ("JNJ", "Johnson & Johnson", "Healthcare"),
        ("V", "Visa Inc.", "Financial Services"),
        ("JPM", "JPMorgan Chase & Co.", "Financial Services"),
        ("PG", "Procter & Gamble Co.", "Consumer Staples"),
        ("UNH", "UnitedHealth Group Inc.", "Healthcare"),
        ("HD", "The Home Depot Inc.", "Consumer Discretionary"),
        ("MA", "Mastercard Inc.", "Financial Services"),
        ("DIS", "The Walt Disney Company", "Communication Services"),
        ("PYPL", "PayPal Holdings Inc.", "Financial Services"),
        ("ADBE", "Adobe Inc.", "Technology"),
        ("CRM", "Salesforce Inc.", "Technology"),
        ("NFLX", "Netflix Inc.", "Communication Services"),
        ("INTC", "Intel Corporation", "Technology"),
        ("PFE", "Pfizer Inc.", "Healthcare"),
        ("KO", "The Coca-Cola Company", "Consumer Staples"),
        ("TMO", "Thermo Fisher Scientific Inc.", "Healthcare"),
        ("ABT", "Abbott Laboratories", "Healthcare"),
        ("PEP", "PepsiCo Inc.", "Consumer Staples"),
        ("COST", "Costco Wholesale Corporation", "Consumer Staples"),
        ("AVGO", "Broadcom Inc.", "Technology"),
        ("TXN", "Texas Instruments Inc.", "Technology"),
        ("QCOM", "QUALCOMM Inc.", "Technology"),
        ("HON", "Honeywell International Inc.", "Industrials"),
        ("LLY", "Eli Lilly and Company", "Healthcare"),
        ("DHR", "Danaher Corporation", "Healthcare"),
        ("VZ", "Verizon Communications Inc.", "Communication Services"),
        ("CMCSA", "Comcast Corporation", "Communication Services"),
        ("NEE", "NextEra Energy Inc.", "Utilities"),
        ("RTX", "Raytheon Technologies Corporation", "Industrials"),
        ("LOW", "Lowe's Companies Inc.", "Consumer Discretionary"),
        ("UPS", "United Parcel Service Inc.", "Industrials"),
        ("SPGI", "S&P Global Inc.", "Financial Services"),
        ("ORCL", "Oracle Corporation", "Technology"),
        ("INTU", "Intuit Inc.", "Technology"),
        ("MS", "Morgan Stanley", "Financial Services"),
        ("GS", "The Goldman Sachs Group Inc.", "Financial Services"),
        ("BLK", "BlackRock Inc.", "Financial Services"),
        ("AMAT", "Applied Materials Inc.", "Technology"),
        ("KLAC", "KLA Corporation", "Technology"),
        ("LRCX", "Lam Research Corporation", "Technology"),
        ("MU", "Micron Technology Inc.", "Technology"),
        ("AMD", "Advanced Micro Devices Inc.", "Technology"),
        ("CSCO", "Cisco Systems Inc.", "Technology"),
        ("IBM", "International Business Machines Corporation", "Technology"),
        ("ADP", "Automatic Data Processing Inc.", "Technology"),
        ("GILD", "Gilead Sciences Inc.", "Healthcare"),
        ("MDT", "Medtronic plc", "Healthcare"),
        ("BMY", "Bristol-Myers Squibb Company", "Healthcare"),
        ("T", "AT&T Inc.", "Communication Services")
    ]
    
    # Insert companies into the database
    try:
        cursor.executemany('''
            INSERT OR REPLACE INTO companies (symbol, name, sector, updated_at)
            VALUES (?, ?, ?, ?)
        ''', [(symbol, name, sector, datetime.now()) for symbol, name, sector in companies])
        
        print(f"✅ Successfully inserted {len(companies)} companies into the database")
        
    except Exception as e:
        print(f"❌ Error inserting companies: {e}")
    
    # Create indexes for better performance
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_companies_symbol ON companies(symbol)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_stock_data_symbol ON stock_data(symbol)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_predictions_symbol ON predictions(symbol)')
    
    # Commit changes and close connection
    conn.commit()
    conn.close()
    
    print("✅ Database initialization completed successfully!")
    print("📊 Database file: stock_dashboard.db")
    print("🏢 Companies table created with sample data")
    print("📈 Stock data caching table created")
    print("🔮 Predictions table created")

if __name__ == "__main__":
    init_database()
