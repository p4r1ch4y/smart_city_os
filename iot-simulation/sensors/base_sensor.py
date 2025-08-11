import random
import time
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from abc import ABC, abstractmethod
import numpy as np

class BaseSensor(ABC):
    """Base class for all sensor types"""
    
    def __init__(self, sensor_id: str, name: str, sensor_type: str, location: tuple, metadata: Dict = None):
        self.sensor_id = sensor_id
        self.name = name
        self.sensor_type = sensor_type
        self.location = {
            'latitude': location[0],
            'longitude': location[1],
            'address': location[2] if len(location) > 2 else f"Lat: {location[0]:.4f}, Lng: {location[1]:.4f}"
        }
        self.metadata = metadata or {}
        self.status = 'active'
        self.last_reading = None
        self.baseline_values = {}
        self.noise_factor = random.uniform(0.05, 0.15)  # 5-15% noise
        self.drift_factor = random.uniform(-0.001, 0.001)  # Small drift over time
        self.failure_probability = 0.001  # 0.1% chance of failure per reading
        
        # Initialize baseline values
        self._initialize_baseline()
    
    @abstractmethod
    def _initialize_baseline(self):
        """Initialize baseline values for the sensor"""
        pass
    
    @abstractmethod
    def _generate_base_reading(self) -> Dict[str, Any]:
        """Generate base sensor reading without noise or patterns"""
        pass
    
    def _apply_time_patterns(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Apply time-based patterns to sensor data"""
        now = datetime.now()
        hour = now.hour
        day_of_week = now.weekday()  # 0 = Monday, 6 = Sunday
        
        # Weekend factor
        weekend_factor = 0.8 if day_of_week >= 5 else 1.0
        
        # Time of day factor
        if 6 <= hour <= 9 or 17 <= hour <= 19:  # Rush hours
            time_factor = 1.3
        elif 22 <= hour or hour <= 5:  # Night time
            time_factor = 0.6
        else:
            time_factor = 1.0
        
        # Apply factors to relevant metrics
        return self._apply_factors(data, weekend_factor * time_factor)
    
    def _apply_factors(self, data: Dict[str, Any], factor: float) -> Dict[str, Any]:
        """Apply multiplication factor to numeric values"""
        for key, value in data.items():
            if isinstance(value, (int, float)) and key not in ['temperature', 'ph']:
                data[key] = max(0, value * factor)
        return data
    
    def _add_noise(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Add realistic noise to sensor readings"""
        for key, value in data.items():
            if isinstance(value, (int, float)):
                noise = np.random.normal(0, abs(value) * self.noise_factor)
                data[key] = max(0, value + noise)
        return data
    
    def _apply_drift(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Apply sensor drift over time"""
        for key, value in data.items():
            if isinstance(value, (int, float)):
                drift = value * self.drift_factor * (time.time() % 86400) / 86400  # Daily drift cycle
                data[key] = max(0, value + drift)
        return data
    
    def _simulate_failures(self) -> Optional[str]:
        """Simulate sensor failures and maintenance"""
        if random.random() < self.failure_probability:
            failure_types = ['offline', 'maintenance', 'error']
            failure = random.choice(failure_types)
            self.status = failure
            return failure
        else:
            self.status = 'active'
            return None
    
    def _determine_data_quality(self, data: Dict[str, Any]) -> str:
        """Determine data quality based on various factors"""
        if self.status != 'active':
            return 'invalid'
        
        # Check for extreme values
        extreme_count = 0
        for key, value in data.items():
            if isinstance(value, (int, float)):
                if key in self.baseline_values:
                    baseline = self.baseline_values[key]
                    if abs(value - baseline) > baseline * 2:  # More than 200% deviation
                        extreme_count += 1
        
        if extreme_count > len(data) * 0.5:  # More than 50% extreme values
            return 'poor'
        elif extreme_count > 0:
            return 'fair'
        else:
            return 'good'
    
    def generate_reading(self) -> Dict[str, Any]:
        """Generate a complete sensor reading"""
        # Check for failures first
        failure = self._simulate_failures()
        if failure:
            return {
                'sensorId': self.sensor_id,
                'data': {'status': failure, 'error': f'Sensor {failure}'},
                'quality': 'invalid',
                'timestamp': datetime.now().isoformat()
            }
        
        # Generate base reading
        data = self._generate_base_reading()
        
        # Apply time patterns
        data = self._apply_time_patterns(data)
        
        # Add noise and drift
        data = self._add_noise(data)
        data = self._apply_drift(data)
        
        # Round numeric values appropriately
        for key, value in data.items():
            if isinstance(value, float):
                if key in ['latitude', 'longitude']:
                    data[key] = round(value, 6)
                elif key in ['temperature', 'ph']:
                    data[key] = round(value, 2)
                else:
                    data[key] = round(value, 1)
        
        # Determine data quality
        quality = self._determine_data_quality(data)
        
        # Store last reading
        self.last_reading = data
        
        return {
            'sensorId': self.sensor_id,
            'data': data,
            'quality': quality,
            'timestamp': datetime.now().isoformat()
        }
    
    def get_sensor_info(self) -> Dict[str, Any]:
        """Get sensor information for registration"""
        return {
            'sensorId': self.sensor_id,
            'name': self.name,
            'type': self.sensor_type,
            'location': self.location,
            'metadata': self.metadata
        }
