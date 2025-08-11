# Smart City OS - Complete Urban Management Platform

A comprehensive, production-ready smart city management platform featuring AI-powered analytics, blockchain transparency, and real-time IoT monitoring.

## 🌟 Features

### Core Platform
- **Real-time IoT Sensor Monitoring** - 34+ sensors across traffic, energy, air quality, water, and waste management
- **Interactive Dashboard** - Professional UI with live data visualization and predictive insights
- **Alert Management System** - Intelligent notification system with severity-based filtering
- **User Authentication** - JWT + Stack Auth integration with role-based access control
- **Responsive Design** - Mobile-first design with dark/light mode support
- **WebSocket Real-time Updates** - Live data streaming and instant notifications

### Advanced Features
- **Predictive Analytics** - LSTM/ARIMA models for traffic, energy, and environmental forecasting
- **Blockchain Integration** - Solana-based transparent logging for data integrity
- **Professional UI/UX** - Modern design system with Lucide React icons
- **Error Handling** - Comprehensive error boundaries and fallback mechanisms
- **Performance Optimization** - React Query caching and optimized rendering

## 🏗️ Architecture

### Frontend (React 18)
- **Framework**: React 18 with functional components and hooks
- **Routing**: React Router v6 with protected routes
- **State Management**: React Query + Context API
- **Styling**: Custom CSS design system with CSS variables
- **Icons**: Lucide React professional icon library
- **Animations**: Framer Motion for smooth transitions
- **Charts**: Recharts for data visualization

### Backend (Node.js)
- **Framework**: Express.js with comprehensive middleware
- **Database**: PostgreSQL with Sequelize ORM (fallback to in-memory)
- **Real-time**: Socket.IO for WebSocket connections
- **Authentication**: JWT with Stack Auth integration
- **API**: RESTful design with comprehensive error handling

### Analytics Service (Python)
- **Framework**: Flask with CORS support
- **ML Models**: Scikit-learn for LSTM/ARIMA predictions
- **Data Processing**: NumPy and Pandas for time series analysis
- **Deployment**: Gunicorn-ready for production

### Blockchain Service (Solana)
- **Network**: Solana Devnet integration
- **Smart Contracts**: Transparent data logging and verification
- **Features**: Transaction queuing, integrity verification, audit trails

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- Supabase account (free tier available)

### Installation & Setup

1. **Clone and Install**
```bash
git clone <repository-url>
cd smart-city-os

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

# Install analytics dependencies
cd ../analytics && pip install -r requirements.txt
```

2. **Supabase Setup**
```bash
# Create a new Supabase project at https://supabase.com
# Run the SQL schema from database/supabase-schema.sql
# Get your project URL and API keys
```

3. **Environment Configuration**
```bash
# Frontend (.env)
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_THEME=indian

# Backend (.env)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
PORT=3000
```

4. **Start All Services**
```bash
# Terminal 1: Backend API
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm start

# Terminal 3: Analytics Service
cd analytics && python app.py
```

5. **Access the Application**
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000/api
- **Analytics Service**: http://localhost:5000
- **Health Check**: http://localhost:3000/health

📖 **Detailed Setup Guide**: See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for complete migration instructions.

## Project Structure

```
smart-city-os/
├── backend/                 # Express.js API server
├── frontend/               # React dashboard
├── iot-simulation/         # Python IoT data simulation
├── analytics/              # Predictive analytics service
├── blockchain/             # Solana smart contracts
├── docker/                 # Docker configurations
├── k8s/                    # Kubernetes manifests
└── docs/                   # Documentation
```

## Technologies Used

- **Backend**: Node.js, Express.js, PostgreSQL, Socket.IO
- **Frontend**: React, Leaflet, Chart.js, WebSockets
- **IoT Simulation**: Python, REST APIs
- **Analytics**: Python, TensorFlow/PyTorch, LSTM, ARIMA
- **Blockchain**: Solana, Web3.js
- **DevOps**: Docker, Kubernetes, GitHub Actions

## License

MIT License
