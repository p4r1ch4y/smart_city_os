import random
from datetime import datetime
from typing import Dict, Any
from .base_sensor import BaseSensor

class TrafficSensor(BaseSensor):
    """Traffic monitoring sensor"""
    
    def _initialize_baseline(self):
        """Initialize baseline traffic values"""
        # Base values depend on location type
        location_type = self._determine_location_type()
        
        if location_type == 'highway':
            self.baseline_values = {
                'vehicle_count': random.randint(80, 150),
                'average_speed': random.randint(45, 65),
                'congestion_level': random.randint(20, 40)
            }
        elif location_type == 'arterial':
            self.baseline_values = {
                'vehicle_count': random.randint(40, 80),
                'average_speed': random.randint(25, 45),
                'congestion_level': random.randint(15, 35)
            }
        else:  # local street
            self.baseline_values = {
                'vehicle_count': random.randint(10, 40),
                'average_speed': random.randint(15, 35),
                'congestion_level': random.randint(5, 25)
            }
        
        # Add metadata
        self.metadata.update({
            'location_type': location_type,
            'lanes': random.randint(2, 6),
            'speed_limit': self.baseline_values['average_speed'] + random.randint(5, 15)
        })
    
    def _determine_location_type(self) -> str:
        """Determine location type based on sensor name/location"""
        name_lower = self.name.lower()
        if any(word in name_lower for word in ['highway', 'freeway', 'interstate']):
            return 'highway'
        elif any(word in name_lower for word in ['avenue', 'boulevard', 'parkway']):
            return 'arterial'
        else:
            return 'local'
    
    def _generate_base_reading(self) -> Dict[str, Any]:
        """Generate base traffic reading"""
        # Get baseline values with some variation
        vehicle_count = self.baseline_values['vehicle_count'] + random.randint(-20, 20)
        average_speed = self.baseline_values['average_speed'] + random.randint(-10, 10)
        
        # Ensure minimum values
        vehicle_count = max(0, vehicle_count)
        average_speed = max(5, average_speed)
        
        # Calculate congestion based on vehicle count and speed
        max_capacity = self.baseline_values['vehicle_count'] * 1.5
        speed_factor = max(0, (self.metadata['speed_limit'] - average_speed) / self.metadata['speed_limit'])
        density_factor = vehicle_count / max_capacity
        
        congestion_level = min(100, (density_factor * 60) + (speed_factor * 40))
        
        # Add rush hour patterns
        now = datetime.now()
        hour = now.hour
        
        if 7 <= hour <= 9 or 17 <= hour <= 19:  # Rush hours
            vehicle_count *= random.uniform(1.3, 1.8)
            average_speed *= random.uniform(0.6, 0.8)
            congestion_level *= random.uniform(1.4, 2.0)
        elif 22 <= hour or hour <= 5:  # Night time
            vehicle_count *= random.uniform(0.2, 0.4)
            average_speed *= random.uniform(1.1, 1.3)
            congestion_level *= random.uniform(0.1, 0.3)
        
        # Weekend adjustments
        if now.weekday() >= 5:  # Weekend
            vehicle_count *= random.uniform(0.7, 0.9)
            congestion_level *= random.uniform(0.6, 0.8)
        
        return {
            'vehicle_count': int(max(0, vehicle_count)),
            'average_speed': round(max(5, average_speed), 1),
            'congestion_level': round(min(100, max(0, congestion_level)), 1),
            'lane_occupancy': round(random.uniform(10, 80), 1),
            'heavy_vehicle_percentage': round(random.uniform(5, 25), 1)
        }

class ParkingSensor(BaseSensor):
    """Parking space monitoring sensor"""
    
    def _initialize_baseline(self):
        """Initialize baseline parking values"""
        self.total_spots = random.randint(50, 200)
        self.baseline_occupancy_rate = random.uniform(0.4, 0.8)
        
        self.baseline_values = {
            'total_spots': self.total_spots,
            'occupied_spots': int(self.total_spots * self.baseline_occupancy_rate),
            'occupancy_rate': self.baseline_occupancy_rate * 100
        }
        
        self.metadata.update({
            'parking_type': random.choice(['street', 'garage', 'lot']),
            'pricing_tier': random.choice(['free', 'low', 'medium', 'high']),
            'time_limit': random.choice([60, 120, 180, 240, 480])  # minutes
        })
    
    def _generate_base_reading(self) -> Dict[str, Any]:
        """Generate base parking reading"""
        now = datetime.now()
        hour = now.hour
        day_of_week = now.weekday()
        
        # Base occupancy varies by time and day
        if day_of_week < 5:  # Weekday
            if 9 <= hour <= 17:  # Business hours
                target_occupancy = random.uniform(0.7, 0.95)
            elif 18 <= hour <= 22:  # Evening
                target_occupancy = random.uniform(0.5, 0.8)
            else:  # Night/early morning
                target_occupancy = random.uniform(0.2, 0.5)
        else:  # Weekend
            if 10 <= hour <= 20:  # Active hours
                target_occupancy = random.uniform(0.6, 0.9)
            else:
                target_occupancy = random.uniform(0.3, 0.6)
        
        # Add some randomness
        target_occupancy += random.uniform(-0.1, 0.1)
        target_occupancy = max(0, min(1, target_occupancy))
        
        occupied_spots = int(self.total_spots * target_occupancy)
        available_spots = self.total_spots - occupied_spots
        occupancy_rate = (occupied_spots / self.total_spots) * 100
        
        return {
            'total_spots': self.total_spots,
            'occupied_spots': occupied_spots,
            'available_spots': available_spots,
            'occupancy_rate': round(occupancy_rate, 1),
            'turnover_rate': round(random.uniform(0.1, 0.8), 2),
            'average_duration': random.randint(30, 240)  # minutes
        }
