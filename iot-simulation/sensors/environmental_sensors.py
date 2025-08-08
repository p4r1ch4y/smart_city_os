import random
import math
from datetime import datetime
from typing import Dict, Any
from .base_sensor import BaseSensor

class AirQualitySensor(BaseSensor):
    """Air quality monitoring sensor"""
    
    def _initialize_baseline(self):
        """Initialize baseline air quality values"""
        # Base values vary by location type
        location_factor = random.uniform(0.8, 1.2)
        
        self.baseline_values = {
            'pm25': 15 * location_factor,  # μg/m³
            'pm10': 25 * location_factor,  # μg/m³
            'co2': 400 * location_factor,  # ppm
            'no2': 20 * location_factor,   # ppb
            'o3': 50 * location_factor,    # ppb
            'co': 1.0 * location_factor,   # ppm
            'so2': 5 * location_factor     # ppb
        }
        
        self.metadata.update({
            'measurement_height': random.uniform(2.5, 4.0),  # meters
            'calibration_date': datetime.now().strftime('%Y-%m-%d'),
            'sensor_model': random.choice(['AQ-Pro-2000', 'EnviroSense-X1', 'AirWatch-Elite'])
        })
    
    def _generate_base_reading(self) -> Dict[str, Any]:
        """Generate base air quality reading"""
        now = datetime.now()
        hour = now.hour
        
        # Traffic pollution patterns
        traffic_factor = 1.0
        if 7 <= hour <= 9 or 17 <= hour <= 19:  # Rush hours
            traffic_factor = random.uniform(1.3, 1.8)
        elif 22 <= hour or hour <= 5:  # Night
            traffic_factor = random.uniform(0.6, 0.8)
        
        # Weather simulation (simplified)
        wind_factor = random.uniform(0.7, 1.3)  # Wind disperses pollutants
        temperature_factor = 1 + (random.uniform(15, 35) - 25) * 0.02  # Temperature inversion effects
        
        combined_factor = traffic_factor * wind_factor * temperature_factor
        
        return {
            'pm25': round(max(0, self.baseline_values['pm25'] * combined_factor + random.uniform(-5, 5)), 1),
            'pm10': round(max(0, self.baseline_values['pm10'] * combined_factor + random.uniform(-8, 8)), 1),
            'co2': round(max(300, self.baseline_values['co2'] * combined_factor + random.uniform(-50, 100)), 0),
            'no2': round(max(0, self.baseline_values['no2'] * combined_factor + random.uniform(-5, 10)), 1),
            'o3': round(max(0, self.baseline_values['o3'] * (2 - combined_factor) + random.uniform(-10, 10)), 1),  # Inverse relationship
            'co': round(max(0, self.baseline_values['co'] * combined_factor + random.uniform(-0.3, 0.5)), 2),
            'so2': round(max(0, self.baseline_values['so2'] * combined_factor + random.uniform(-2, 3)), 1),
            'aqi': self._calculate_aqi(),
            'temperature': round(random.uniform(15, 35), 1),
            'humidity': round(random.uniform(30, 80), 1)
        }
    
    def _calculate_aqi(self) -> int:
        """Calculate Air Quality Index (simplified)"""
        if not self.last_reading:
            return random.randint(50, 150)
        
        # Simplified AQI calculation based on PM2.5
        pm25 = self.last_reading.get('pm25', 15)
        
        if pm25 <= 12:
            return int(50 * pm25 / 12)
        elif pm25 <= 35.4:
            return int(50 + (50 * (pm25 - 12) / (35.4 - 12)))
        elif pm25 <= 55.4:
            return int(100 + (50 * (pm25 - 35.4) / (55.4 - 35.4)))
        else:
            return min(300, int(150 + (100 * (pm25 - 55.4) / 100)))

class NoiseSensor(BaseSensor):
    """Noise level monitoring sensor"""
    
    def _initialize_baseline(self):
        """Initialize baseline noise values"""
        # Base noise level depends on location
        location_type = self._determine_location_type()
        
        if location_type == 'highway':
            base_level = random.uniform(70, 85)
        elif location_type == 'urban':
            base_level = random.uniform(55, 70)
        elif location_type == 'residential':
            base_level = random.uniform(45, 60)
        else:  # park/quiet
            base_level = random.uniform(35, 50)
        
        self.baseline_values = {
            'decibel_level': base_level,
            'location_type': location_type
        }
        
        self.metadata.update({
            'location_type': location_type,
            'measurement_standard': 'A-weighted',
            'sampling_rate': '1Hz',
            'frequency_range': '20Hz-20kHz'
        })
    
    def _determine_location_type(self) -> str:
        """Determine location type for noise baseline"""
        name_lower = self.name.lower()
        if any(word in name_lower for word in ['highway', 'freeway', 'airport']):
            return 'highway'
        elif any(word in name_lower for word in ['downtown', 'commercial', 'business']):
            return 'urban'
        elif any(word in name_lower for word in ['park', 'garden', 'quiet']):
            return 'park'
        else:
            return 'residential'
    
    def _generate_base_reading(self) -> Dict[str, Any]:
        """Generate base noise reading"""
        now = datetime.now()
        hour = now.hour
        day_of_week = now.weekday()
        
        # Time-based patterns
        if 7 <= hour <= 9 or 17 <= hour <= 19:  # Rush hours
            time_factor = random.uniform(1.2, 1.5)
        elif 22 <= hour or hour <= 6:  # Night
            time_factor = random.uniform(0.6, 0.8)
        else:
            time_factor = random.uniform(0.9, 1.1)
        
        # Weekend factor
        if day_of_week >= 5:
            weekend_factor = random.uniform(0.8, 0.9)
        else:
            weekend_factor = 1.0
        
        base_level = self.baseline_values['decibel_level']
        current_level = base_level * time_factor * weekend_factor
        
        # Add random events (sirens, construction, etc.)
        if random.random() < 0.05:  # 5% chance of loud event
            current_level += random.uniform(10, 25)
        
        return {
            'decibel_level': round(max(30, min(120, current_level)), 1),
            'peak_level': round(current_level + random.uniform(5, 15), 1),
            'minimum_level': round(current_level - random.uniform(5, 10), 1),
            'frequency_analysis': {
                'low_freq': round(random.uniform(0.2, 0.4), 2),    # 20-200 Hz
                'mid_freq': round(random.uniform(0.3, 0.5), 2),    # 200-2000 Hz
                'high_freq': round(random.uniform(0.1, 0.3), 2)    # 2000+ Hz
            }
        }

class WaterQualitySensor(BaseSensor):
    """Water quality monitoring sensor"""
    
    def _initialize_baseline(self):
        """Initialize baseline water quality values"""
        self.baseline_values = {
            'ph': random.uniform(6.8, 7.8),
            'turbidity': random.uniform(0.5, 3.0),  # NTU
            'dissolved_oxygen': random.uniform(7.0, 12.0),  # mg/L
            'temperature': random.uniform(15, 25),  # °C
            'conductivity': random.uniform(200, 800),  # μS/cm
            'chlorine': random.uniform(0.2, 1.0)  # mg/L
        }
        
        self.metadata.update({
            'water_source': random.choice(['river', 'lake', 'reservoir', 'treatment_plant']),
            'depth': random.uniform(0.5, 3.0),  # meters
            'flow_rate': random.uniform(0.1, 2.0)  # m/s
        })
    
    def _generate_base_reading(self) -> Dict[str, Any]:
        """Generate base water quality reading"""
        # Seasonal variations
        now = datetime.now()
        month = now.month
        
        # Temperature varies by season
        if 3 <= month <= 5:  # Spring
            temp_factor = random.uniform(0.8, 1.0)
        elif 6 <= month <= 8:  # Summer
            temp_factor = random.uniform(1.1, 1.3)
        elif 9 <= month <= 11:  # Fall
            temp_factor = random.uniform(0.9, 1.1)
        else:  # Winter
            temp_factor = random.uniform(0.6, 0.8)
        
        temperature = self.baseline_values['temperature'] * temp_factor
        
        # pH can vary with temperature and biological activity
        ph_variation = random.uniform(-0.3, 0.3)
        ph = max(6.0, min(8.5, self.baseline_values['ph'] + ph_variation))
        
        # Dissolved oxygen inversely related to temperature
        do_factor = 1.2 - (temperature - 15) * 0.02
        dissolved_oxygen = max(4.0, self.baseline_values['dissolved_oxygen'] * do_factor)
        
        return {
            'ph': round(ph, 2),
            'turbidity': round(max(0, self.baseline_values['turbidity'] + random.uniform(-1, 2)), 2),
            'dissolved_oxygen': round(dissolved_oxygen, 2),
            'temperature': round(temperature, 1),
            'conductivity': round(self.baseline_values['conductivity'] + random.uniform(-100, 100), 0),
            'chlorine': round(max(0, self.baseline_values['chlorine'] + random.uniform(-0.3, 0.2)), 2),
            'ammonia': round(random.uniform(0, 0.5), 3),
            'nitrates': round(random.uniform(0, 10), 2)
        }
