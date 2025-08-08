import os
from dotenv import load_dotenv
from typing import Dict, List, Tuple

load_dotenv()

class Config:
    # API Configuration
    API_ENDPOINT = os.getenv('IOT_API_ENDPOINT', 'http://localhost:3000/api/sensors')
    UPDATE_INTERVAL = int(os.getenv('IOT_UPDATE_INTERVAL', 5000)) / 1000  # Convert to seconds
    SENSORS_COUNT = int(os.getenv('IOT_SENSORS_COUNT', 50))
    
    # City boundaries (example: New York City area)
    CITY_BOUNDS = {
        'north': 40.9176,
        'south': 40.4774,
        'east': -73.7004,
        'west': -74.2591
    }
    
    # Sensor type configurations
    SENSOR_TYPES = {
        'traffic': {
            'count': 15,
            'data_fields': ['vehicle_count', 'average_speed', 'congestion_level'],
            'update_frequency': 30  # seconds
        },
        'waste': {
            'count': 10,
            'data_fields': ['fill_level', 'temperature', 'last_collection'],
            'update_frequency': 300  # 5 minutes
        },
        'air_quality': {
            'count': 8,
            'data_fields': ['pm25', 'pm10', 'co2', 'no2', 'o3'],
            'update_frequency': 60  # 1 minute
        },
        'noise': {
            'count': 6,
            'data_fields': ['decibel_level', 'frequency_analysis'],
            'update_frequency': 45  # seconds
        },
        'water_quality': {
            'count': 5,
            'data_fields': ['ph', 'turbidity', 'dissolved_oxygen', 'temperature'],
            'update_frequency': 120  # 2 minutes
        },
        'energy': {
            'count': 4,
            'data_fields': ['consumption', 'voltage', 'current', 'power_factor'],
            'update_frequency': 15  # seconds
        },
        'parking': {
            'count': 2,
            'data_fields': ['occupied_spots', 'total_spots', 'occupancy_rate'],
            'update_frequency': 60  # 1 minute
        }
    }
    
    # Time-based patterns for realistic data simulation
    TRAFFIC_PATTERNS = {
        'rush_hour_morning': (7, 9),
        'rush_hour_evening': (17, 19),
        'weekend_factor': 0.6,
        'night_factor': 0.3
    }
    
    WASTE_PATTERNS = {
        'collection_days': [1, 3, 5],  # Monday, Wednesday, Friday
        'fill_rate_per_hour': 2.5,
        'weekend_factor': 1.3
    }
    
    AIR_QUALITY_PATTERNS = {
        'rush_hour_pollution': 1.4,
        'weekend_factor': 0.8,
        'weather_impact': True
    }
    
    # Data quality simulation
    DATA_QUALITY_RATES = {
        'good': 0.85,
        'fair': 0.10,
        'poor': 0.04,
        'invalid': 0.01
    }
    
    # Sensor failure simulation
    FAILURE_RATES = {
        'offline_probability': 0.02,
        'maintenance_probability': 0.01,
        'error_probability': 0.005
    }

# Predefined sensor locations (major intersections, parks, etc.)
SENSOR_LOCATIONS = [
    # Manhattan
    (40.7589, -73.9851, "Times Square"),
    (40.7505, -73.9934, "Herald Square"),
    (40.7614, -73.9776, "Central Park South"),
    (40.7829, -73.9654, "Central Park North"),
    (40.7282, -74.0776, "World Trade Center"),
    (40.7061, -74.0087, "Brooklyn Bridge"),
    
    # Brooklyn
    (40.6892, -73.9442, "Fort Greene Park"),
    (40.6782, -73.9442, "Prospect Park"),
    (40.7282, -73.9942, "Williamsburg Bridge"),
    
    # Queens
    (40.7282, -73.7949, "Flushing Meadows"),
    (40.7505, -73.8370, "LaGuardia Airport Area"),
    
    # Bronx
    (40.8448, -73.8648, "Yankee Stadium"),
    (40.8176, -73.8782, "Bronx Zoo"),
    
    # Staten Island
    (40.5795, -74.1502, "Staten Island Ferry Terminal")
]

def get_sensor_config(sensor_type: str) -> Dict:
    """Get configuration for a specific sensor type"""
    return SENSOR_TYPES.get(sensor_type, {})

def get_random_location() -> Tuple[float, float, str]:
    """Get a random location within city bounds"""
    import random
    
    if random.random() < 0.7:  # 70% chance to use predefined locations
        return random.choice(SENSOR_LOCATIONS)
    else:
        # Generate random location within bounds
        lat = random.uniform(Config.CITY_BOUNDS['south'], Config.CITY_BOUNDS['north'])
        lng = random.uniform(Config.CITY_BOUNDS['west'], Config.CITY_BOUNDS['east'])
        return lat, lng, f"Random Location ({lat:.4f}, {lng:.4f})"
