
> Updated Quick Start (React frontend + serverless API)
>
> - Frontend: `cd frontend && cp .env.example .env.local && npm install && npm start`
> - API locally (optional): at repo root run `vercel dev`, then set `REACT_APP_API_URL=http://localhost:3000/api` in `frontend/.env.local`
> - Or point `REACT_APP_API_URL` to your deployed API base: `https://<your-app>.vercel.app/api`
>
> The legacy content below refers to a previous multi-service layout and can be ignored.


# Smart City OS - Quick Start Guide

This guide will help you get the Smart City OS up and running quickly.

## ⚡️ Economic Model Update

**Sensor Data Aggregation:**
Sensor readings are now aggregated off-chain and only compiled summaries are pushed to the blockchain at intervals. This reduces transaction costs and improves scalability. Raw sensor data is used for analytics and dashboard visualization, while the blockchain stores contract metadata and periodic summaries.

## Prerequisites

- Node.js 16+ and npm
- Python 3.9+
- PostgreSQL 12+
- Docker and Docker Compose (optional)

## Quick Setup (Local Development)

### 1. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Python dependencies for IoT simulation
cd iot-simulation
pip install -r requirements.txt
cd ..
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb smart_city_os

# Or using psql
psql -c "CREATE DATABASE smart_city_os;"
```

### 3. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your database credentials
# At minimum, update:
# - DB_PASSWORD
# - JWT_SECRET
```

### 4. Start the Backend

```bash
# Start the backend server
npm run dev
```

The backend will be available at `http://localhost:3000`

### 5. Test the Setup

```bash
# Run the setup test script
node test-setup.js
```

### 6. Start IoT Simulation

```bash
# In a new terminal
npm run iot-sim
```

## Docker Setup (Recommended for Production)

### 1. Start All Services

```bash
# Start all services with Docker Compose
docker-compose up -d
```

### 2. Check Service Status

```bash
# Check if all services are running
docker-compose ps

# View logs
docker-compose logs -f
```

### 3. Test the Setup

```bash
# Wait for services to be ready, then test
sleep 30
node test-setup.js
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - User logout

### Sensors
- `GET /api/sensors` - List all sensors
- `POST /api/sensors` - Create new sensor
- `GET /api/sensors/:id` - Get sensor details
- `POST /api/sensors/data` - Submit sensor data

### Alerts
- `GET /api/alerts` - List alerts
- `GET /api/alerts/stats` - Alert statistics
- `POST /api/alerts/:id/acknowledge` - Acknowledge alert
- `POST /api/alerts/:id/resolve` - Resolve alert

## Default User Roles

- **admin**: Full system access
- **traffic_officer**: Traffic sensor management
- **sanitation_officer**: Waste sensor management
- **environmental_officer**: Environmental sensor management
- **citizen**: Read-only access to public data

## IoT Simulation

The IoT simulation generates realistic data for:

- **Traffic Sensors**: Vehicle count, speed, congestion
- **Waste Sensors**: Fill level, temperature, collection status
- **Air Quality Sensors**: PM2.5, PM10, CO2, NOx, AQI
- **Noise Sensors**: Decibel levels, frequency analysis
- **Water Quality Sensors**: pH, turbidity, dissolved oxygen
- **Energy Sensors**: Consumption, voltage, current
- **Parking Sensors**: Occupancy rates, availability

### Simulation Commands

```bash
# Run simulation for 30 minutes
python iot-simulation/main.py --duration 30

# Run with custom interval (10 seconds)
python iot-simulation/main.py --interval 10

# Run with specific number of sensors
python iot-simulation/main.py --sensors 25
```

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Reset database
dropdb smart_city_os
createdb smart_city_os
```

### Port Conflicts

If you encounter port conflicts, update the ports in:
- `.env` file (PORT variable)
- `docker-compose.yml` (ports section)

### IoT Simulation Not Connecting

1. Ensure backend is running and accessible
2. Check the `IOT_API_ENDPOINT` in `.env`
3. Verify network connectivity

```bash
# Test backend connectivity
curl http://localhost:3000/health
```

### Docker Issues

```bash
# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# View detailed logs
docker-compose logs backend
docker-compose logs iot-simulation
```

## Next Steps

1. **Frontend Development**: Set up React dashboard (Module 5)
2. **Analytics Service**: Implement predictive models (Module 4)
3. **Blockchain Integration**: Add Solana smart contracts (Module 6)
4. **Deployment**: Configure Kubernetes manifests (Module 7)

## Development Workflow

1. Make changes to your code
2. Test with `node test-setup.js`
3. Run IoT simulation to generate test data
4. Monitor logs for any issues
5. Use the API endpoints to verify functionality

## Support

- Check the logs: `docker-compose logs -f`
- Run health checks: `curl http://localhost:3000/health`
- Test API endpoints with the provided test script
- Review the README.md for detailed architecture information
