-- Smart City Management Platform: Optimized SQL Schema & Sample Data

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables and types if they exist (for clean setup)
DROP TABLE IF EXISTS alert_acknowledgments CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS sensor_readings CASCADE;
DROP TABLE IF EXISTS sensors CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS sensor_type CASCADE;
DROP TYPE IF EXISTS sensor_status CASCADE;
DROP TYPE IF EXISTS alert_severity CASCADE;
DROP TYPE IF EXISTS alert_status CASCADE;

-- ENUM types
CREATE TYPE user_role AS ENUM ('admin', 'traffic_officer', 'sanitation_officer', 'environmental_officer', 'citizen');
CREATE TYPE sensor_type AS ENUM ('traffic', 'waste', 'air_quality', 'noise', 'water', 'energy', 'parking');
CREATE TYPE sensor_status AS ENUM ('active', 'inactive', 'maintenance', 'error');
CREATE TYPE alert_severity AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE alert_status AS ENUM ('active', 'acknowledged', 'resolved', 'dismissed');

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'citizen',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions (for JWT refresh tokens)
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    refresh_token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sensors
CREATE TABLE sensors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type sensor_type NOT NULL,
    location VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL DEFAULT 'Kolkata',
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    status sensor_status DEFAULT 'active',
    installation_date DATE DEFAULT CURRENT_DATE,
    last_maintenance DATE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sensor readings
CREATE TABLE sensor_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sensor_id UUID REFERENCES sensors(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data JSONB NOT NULL,
    quality_score DECIMAL(3, 2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alerts
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sensor_id UUID REFERENCES sensors(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity alert_severity NOT NULL,
    status alert_status DEFAULT 'active',
    threshold_value DECIMAL(10, 2),
    actual_value DECIMAL(10, 2),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Alert acknowledgments
CREATE TABLE alert_acknowledgments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id UUID REFERENCES alerts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_sensors_type ON sensors(type);
CREATE INDEX idx_sensors_city ON sensors(city);
CREATE INDEX idx_sensors_status ON sensors(status);
CREATE INDEX idx_sensor_readings_sensor_id ON sensor_readings(sensor_id);
CREATE INDEX idx_sensor_readings_timestamp ON sensor_readings(timestamp DESC);
CREATE INDEX idx_alerts_sensor_id ON alerts(sensor_id);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Update triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sensors_updated_at BEFORE UPDATE ON sensors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample users
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
('admin@smartcity.gov', '$2b$10$hash', 'System', 'Administrator', 'admin'),
('traffic@smartcity.gov', '$2b$10$hash', 'Traffic', 'Controller', 'traffic_officer'),
('environment@smartcity.gov', '$2b$10$hash', 'Environmental', 'Officer', 'environmental_officer'),
('sanitation@smartcity.gov', '$2b$10$hash', 'Sanitation', 'Manager', 'sanitation_officer'),
('citizen@example.com', '$2b$10$hash', 'John', 'Doe', 'citizen');

-- Sample sensors (Indian Cities)
INSERT INTO sensors (name, type, location, city, latitude, longitude, status, installation_date, metadata) VALUES
-- Kolkata sensors
('Esplanade Traffic Monitor', 'traffic', 'Esplanade Crossing', 'Kolkata', 22.5641, 88.3489, 'active', '2023-01-15', '{"lanes": 4, "peak_hours": "8-10,18-20"}'),
('Salt Lake Air Quality', 'air_quality', 'Salt Lake Sector V', 'Kolkata', 22.5726, 88.4324, 'active', '2023-02-10', '{"parameters": ["PM2.5", "PM10", "NO2"]}'),
('New Market Waste Bin', 'waste', 'New Market Area', 'Kolkata', 22.5558, 88.3515, 'active', '2023-01-25', '{"capacity": "500L", "collection_frequency": "daily"}'),
('Howrah Bridge Energy', 'energy', 'Howrah Bridge', 'Kolkata', 22.5851, 88.3467, 'active', '2023-03-05', '{"type": "street_lighting", "power_rating": "50kW"}'),
('Maidan Water Quality', 'water', 'Maidan Area', 'Kolkata', 22.5448, 88.3426, 'active', '2023-02-20', '{"source": "municipal", "parameters": ["pH", "TDS", "chlorine"]}'),

-- Mumbai sensors
('Marine Drive Traffic', 'traffic', 'Marine Drive', 'Mumbai', 19.0176, 72.8562, 'active', '2023-01-20', '{"lanes": 6, "type": "coastal_road"}'),
('Bandra Air Monitor', 'air_quality', 'Bandra West', 'Mumbai', 19.0596, 72.8295, 'active', '2023-02-15', '{"parameters": ["PM2.5", "PM10", "SO2"]}'),
('CST Energy Monitor', 'energy', 'Chhatrapati Shivaji Terminus', 'Mumbai', 18.9398, 72.8355, 'active', '2023-03-01', '{"type": "railway_station", "power_rating": "200kW"}'),

-- Delhi sensors
('India Gate Traffic', 'traffic', 'India Gate Circle', 'Delhi', 28.6129, 77.2295, 'active', '2023-01-10', '{"lanes": 8, "monument_area": true}'),
('CP Air Quality', 'air_quality', 'Connaught Place', 'Delhi', 28.6315, 77.2167, 'active', '2023-02-05', '{"parameters": ["PM2.5", "PM10", "NO2", "O3"]}'),
('Red Fort Waste', 'waste', 'Red Fort Area', 'Delhi', 28.6562, 77.2410, 'active', '2023-01-30', '{"capacity": "750L", "heritage_area": true}'),

-- Bangalore sensors
('MG Road Traffic', 'traffic', 'MG Road Junction', 'Bangalore', 12.9716, 77.5946, 'active', '2023-01-25', '{"lanes": 4, "commercial_area": true}'),
('Cubbon Park Air', 'air_quality', 'Cubbon Park', 'Bangalore', 12.9698, 77.5936, 'active', '2023-02-12', '{"parameters": ["PM2.5", "PM10"], "green_zone": true}'),
('Electronic City Energy', 'energy', 'Electronic City', 'Bangalore', 12.8456, 77.6603, 'active', '2023-03-08', '{"type": "IT_park", "power_rating": "500kW"}'),

-- Chennai sensors
('Marina Beach Traffic', 'traffic', 'Marina Beach Road', 'Chennai', 13.0475, 80.2824, 'active', '2023-01-18', '{"lanes": 4, "coastal_road": true}'),
('T Nagar Air Monitor', 'air_quality', 'T Nagar', 'Chennai', 13.0418, 80.2341, 'active', '2023-02-08', '{"parameters": ["PM2.5", "PM10"], "commercial_zone": true}'),

-- Additional sensors for demo
('Kharagpur IIT Traffic', 'traffic', 'IIT Kharagpur Main Gate', 'Kharagpur', 22.3149, 87.3105, 'active', '2023-03-01', '{"lanes": 2, "educational_zone": true}'),
('Kharagpur Market Waste', 'waste', 'Kharagpur Market', 'Kharagpur', 22.3392, 87.3250, 'active', '2023-03-10', '{"capacity": "300L"}');

-- Sample readings
INSERT INTO sensor_readings (sensor_id, timestamp, data) 
SELECT id, NOW() - INTERVAL '5 minutes', '{"vehicle_count": 45, "average_speed": 35}'::jsonb FROM sensors WHERE type='traffic';
INSERT INTO sensor_readings (sensor_id, timestamp, data) 
SELECT id, NOW() - INTERVAL '5 minutes', '{"pm25": 85, "pm10": 120, "aqi": 95}'::jsonb FROM sensors WHERE type='air_quality';
INSERT INTO sensor_readings (sensor_id, timestamp, data) 
SELECT id, NOW() - INTERVAL '5 minutes', '{"fill_level": 75, "temperature": 28}'::jsonb FROM sensors WHERE type='waste';

-- Sample alerts
INSERT INTO alerts (sensor_id, title, description, severity, status, threshold_value, actual_value, metadata)
SELECT id, 'High Traffic', 'Congestion detected', 'high'::alert_severity, 'active'::alert_status, 80, 92, '{"auto_generated": true}'::jsonb FROM sensors WHERE type='traffic' LIMIT 1;
INSERT INTO alerts (sensor_id, title, description, severity, status, threshold_value, actual_value, metadata)
SELECT id, 'Poor Air Quality', 'AQI exceeds safe levels', 'critical'::alert_severity, 'active'::alert_status, 100, 125, '{"auto_generated": true}'::jsonb FROM sensors WHERE type='air_quality' LIMIT 1;

-- Views for dashboard
CREATE VIEW sensor_latest_readings AS
SELECT DISTINCT ON (s.id)
    s.id,
    s.name,
    s.type,
    s.location,
    s.city,
    s.latitude,
    s.longitude,
    s.status,
    sr.timestamp as last_reading_time,
    sr.data as latest_data
FROM sensors s
LEFT JOIN sensor_readings sr ON s.id = sr.sensor_id
ORDER BY s.id, sr.timestamp DESC;

CREATE VIEW active_alerts AS
SELECT 
    a.*,
    s.name as sensor_name,
    s.type as sensor_type,
    s.location as sensor_location,
    s.city as sensor_city
FROM alerts a
JOIN sensors s ON a.sensor_id = s.id
WHERE a.status IN ('active', 'acknowledged')
ORDER BY a.created_at DESC;

CREATE VIEW dashboard_stats AS
SELECT 
    COUNT(*) FILTER (WHERE status = 'active') as active_sensors,
    COUNT(*) FILTER (WHERE status = 'inactive') as inactive_sensors,
    COUNT(*) FILTER (WHERE status = 'maintenance') as maintenance_sensors,
    COUNT(DISTINCT city) as cities_covered,
    COUNT(DISTINCT type) as sensor_types
FROM sensors;

-- End of schema