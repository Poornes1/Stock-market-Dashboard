#!/bin/bash

# Stock Market Dashboard Setup Script
# This script will set up the entire application environment

set -e

echo "🚀 Stock Market Dashboard Setup"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed. Please install Python 3.8+ first."
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 16+ first."
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    # Check Docker (optional)
    if ! command -v docker &> /dev/null; then
        print_warning "Docker is not installed. Docker deployment will not be available."
    fi
    
    print_success "System requirements check passed!"
}

# Setup Python backend
setup_backend() {
    print_status "Setting up Python backend..."
    
    cd backend
    
    # Create virtual environment
    if [ ! -d "venv" ]; then
        print_status "Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Upgrade pip
    pip install --upgrade pip
    
    # Install dependencies
    print_status "Installing Python dependencies..."
    pip install -r requirements.txt
    
    # Initialize database
    print_status "Initializing database..."
    python init_db.py
    
    cd ..
    print_success "Backend setup completed!"
}

# Setup React frontend
setup_frontend() {
    print_status "Setting up React frontend..."
    
    cd frontend
    
    # Install dependencies
    print_status "Installing Node.js dependencies..."
    npm install
    
    cd ..
    print_success "Frontend setup completed!"
}

# Create environment file
create_env_file() {
    print_status "Creating environment configuration..."
    
    cat > .env << EOF
# Stock Market Dashboard Environment Variables
NODE_ENV=development
REACT_APP_API_URL=http://localhost:8000
PYTHONPATH=./backend
PYTHONUNBUFFERED=1

# Database Configuration
DATABASE_URL=sqlite:///./backend/stock_dashboard.db

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=http://localhost:3000,http://localhost:8000

# Stock Data Configuration
YAHOO_FINANCE_CACHE_TTL=300
MAX_REQUESTS_PER_MINUTE=60

# ML Model Configuration
MODEL_UPDATE_INTERVAL=3600
PREDICTION_CONFIDENCE_THRESHOLD=0.5
EOF
    
    print_success "Environment file created!"
}

# Create startup scripts
create_startup_scripts() {
    print_status "Creating startup scripts..."
    
    # Backend startup script
    cat > start_backend.sh << 'EOF'
#!/bin/bash
cd backend
source venv/bin/activate
echo "🚀 Starting Stock Market Dashboard Backend..."
echo "📊 API will be available at: http://localhost:8000"
echo "📚 API documentation at: http://localhost:8000/docs"
echo ""
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
EOF
    
    # Frontend startup script
    cat > start_frontend.sh << 'EOF'
#!/bin/bash
cd frontend
echo "🚀 Starting Stock Market Dashboard Frontend..."
echo "🌐 Application will be available at: http://localhost:3000"
echo ""
npm start
EOF
    
    # Full application startup script
    cat > start_app.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Stock Market Dashboard..."
echo "================================"

# Start backend in background
echo "📊 Starting backend server..."
cd backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Start frontend
echo "🌐 Starting frontend application..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ Application started successfully!"
echo "📊 Backend API: http://localhost:8000"
echo "🌐 Frontend App: http://localhost:3000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
trap "echo ''; echo '🛑 Stopping services...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
EOF
    
    # Make scripts executable
    chmod +x start_backend.sh start_frontend.sh start_app.sh
    
    print_success "Startup scripts created!"
}

# Display setup completion
show_completion() {
    echo ""
    echo "🎉 Setup completed successfully!"
    echo "================================"
    echo ""
    echo "📁 Project structure:"
    echo "├── backend/          # FastAPI backend"
    echo "├── frontend/         # React frontend"
    echo "├── .env              # Environment configuration"
    echo "├── start_backend.sh  # Backend startup script"
    echo "├── start_frontend.sh # Frontend startup script"
    echo "└── start_app.sh     # Full application startup"
    echo ""
    echo "🚀 Quick Start Options:"
    echo "1. Start everything: ./start_app.sh"
    echo "2. Start backend only: ./start_backend.sh"
    echo "3. Start frontend only: ./start_frontend.sh"
    echo ""
    echo "📊 Backend API: http://localhost:8000"
    echo "🌐 Frontend App: http://localhost:3000"
    echo "📚 API Documentation: http://localhost:8000/docs"
    echo ""
    echo "🔧 Development Commands:"
    echo "• Backend: cd backend && source venv/bin/activate && uvicorn main:app --reload"
    echo "• Frontend: cd frontend && npm start"
    echo ""
    echo "🐳 Docker Deployment:"
    echo "• Build: docker build -t stock-dashboard ."
    echo "• Run: docker run -p 8000:8000 stock-dashboard"
    echo ""
    echo "Happy coding! 📈"
}

# Main setup function
main() {
    print_status "Starting Stock Market Dashboard setup..."
    
    # Check requirements
    check_requirements
    
    # Setup backend
    setup_backend
    
    # Setup frontend
    setup_frontend
    
    # Create environment file
    create_env_file
    
    # Create startup scripts
    create_startup_scripts
    
    # Show completion
    show_completion
}

# Run setup
main "$@"
