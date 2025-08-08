import random
from datetime import datetime, timedelta
from typing import Dict, Any
from .base_sensor import BaseSensor

class WasteSensor(BaseSensor):
    """Waste bin monitoring sensor"""
    
    def _initialize_baseline(self):
        """Initialize baseline waste values"""
        self.bin_capacity = random.randint(100, 500)  # liters
        self.fill_rate = random.uniform(2, 8)  # liters per hour
        self.last_collection = datetime.now() - timedelta(hours=random.randint(0, 72))
        
        # Calculate current fill level based on time since last collection
        hours_since_collection = (datetime.now() - self.last_collection).total_seconds() / 3600
        current_fill = min(self.bin_capacity, hours_since_collection * self.fill_rate)
        
        self.baseline_values = {
            'capacity': self.bin_capacity,
            'fill_level': current_fill,
            'fill_percentage': (current_fill / self.bin_capacity) * 100
        }
        
        self.metadata.update({
            'bin_type': random.choice(['general', 'recycling', 'organic', 'hazardous']),
            'collection_schedule': random.choice(['daily', 'every_2_days', 'weekly']),
            'location_type': random.choice(['street', 'park', 'commercial', 'residential'])
        })
    
    def _generate_base_reading(self) -> Dict[str, Any]:
        """Generate base waste reading"""
        now = datetime.now()
        hour = now.hour
        day_of_week = now.weekday()
        
        # Time-based fill rate variations
        if 8 <= hour <= 18:  # Daytime - higher activity
            fill_rate_factor = random.uniform(1.2, 1.8)
        elif 18 <= hour <= 22:  # Evening - moderate activity
            fill_rate_factor = random.uniform(0.8, 1.2)
        else:  # Night - low activity
            fill_rate_factor = random.uniform(0.3, 0.6)
        
        # Weekend patterns
        if day_of_week >= 5:  # Weekend
            if self.metadata['location_type'] in ['park', 'commercial']:
                fill_rate_factor *= random.uniform(1.3, 1.6)
            else:
                fill_rate_factor *= random.uniform(0.7, 0.9)
        
        # Simulate collection events
        collection_probability = self._calculate_collection_probability()
        if random.random() < collection_probability:
            self.last_collection = now
            self.baseline_values['fill_level'] = random.uniform(0, 10)  # Small residual
        else:
            # Increase fill level
            time_delta = 1  # Assume 1 hour since last reading
            fill_increase = self.fill_rate * fill_rate_factor * time_delta
            self.baseline_values['fill_level'] = min(
                self.bin_capacity, 
                self.baseline_values['fill_level'] + fill_increase
            )
        
        fill_percentage = (self.baseline_values['fill_level'] / self.bin_capacity) * 100
        
        # Temperature varies with fill level and weather
        ambient_temp = random.uniform(15, 35)
        temp_increase = (fill_percentage / 100) * random.uniform(2, 8)
        temperature = ambient_temp + temp_increase
        
        return {
            'fill_level': round(self.baseline_values['fill_level'], 1),
            'fill_percentage': round(fill_percentage, 1),
            'capacity': self.bin_capacity,
            'temperature': round(temperature, 1),
            'weight': round(self.baseline_values['fill_level'] * random.uniform(0.3, 0.8), 1),  # kg
            'last_collection': self.last_collection.isoformat(),
            'collection_needed': fill_percentage > 80
        }
    
    def _calculate_collection_probability(self) -> float:
        """Calculate probability of collection based on schedule and fill level"""
        fill_percentage = (self.baseline_values['fill_level'] / self.bin_capacity) * 100
        
        # Higher probability if bin is full
        if fill_percentage > 90:
            return 0.8
        elif fill_percentage > 75:
            return 0.3
        
        # Schedule-based collection
        hours_since_collection = (datetime.now() - self.last_collection).total_seconds() / 3600
        
        if self.metadata['collection_schedule'] == 'daily' and hours_since_collection > 20:
            return 0.6
        elif self.metadata['collection_schedule'] == 'every_2_days' and hours_since_collection > 44:
            return 0.7
        elif self.metadata['collection_schedule'] == 'weekly' and hours_since_collection > 164:
            return 0.8
        
        return 0.05  # Random collection

class EnergySensor(BaseSensor):
    """Energy consumption monitoring sensor"""
    
    def _initialize_baseline(self):
        """Initialize baseline energy values"""
        # Base consumption varies by building type
        building_type = random.choice(['residential', 'commercial', 'industrial', 'municipal'])
        
        if building_type == 'residential':
            base_consumption = random.uniform(2, 8)  # kW
        elif building_type == 'commercial':
            base_consumption = random.uniform(10, 50)  # kW
        elif building_type == 'industrial':
            base_consumption = random.uniform(50, 200)  # kW
        else:  # municipal
            base_consumption = random.uniform(5, 25)  # kW
        
        self.baseline_values = {
            'consumption': base_consumption,
            'voltage': random.uniform(220, 240),
            'current': base_consumption / 230,  # Approximate current
            'power_factor': random.uniform(0.85, 0.95)
        }
        
        self.metadata.update({
            'building_type': building_type,
            'meter_type': random.choice(['smart', 'digital', 'analog']),
            'phase': random.choice(['single', 'three']),
            'rated_capacity': base_consumption * random.uniform(1.5, 3.0)
        })
    
    def _generate_base_reading(self) -> Dict[str, Any]:
        """Generate base energy reading"""
        now = datetime.now()
        hour = now.hour
        day_of_week = now.weekday()
        
        # Time-based consumption patterns
        building_type = self.metadata['building_type']
        
        if building_type == 'residential':
            if 6 <= hour <= 9 or 17 <= hour <= 22:  # Peak hours
                consumption_factor = random.uniform(1.3, 1.8)
            elif 23 <= hour or hour <= 5:  # Night
                consumption_factor = random.uniform(0.4, 0.7)
            else:
                consumption_factor = random.uniform(0.8, 1.2)
        
        elif building_type == 'commercial':
            if 8 <= hour <= 18:  # Business hours
                consumption_factor = random.uniform(1.2, 1.6)
            elif 19 <= hour <= 22:  # Evening
                consumption_factor = random.uniform(0.6, 0.9)
            else:  # Night
                consumption_factor = random.uniform(0.2, 0.4)
        
        elif building_type == 'industrial':
            # More consistent, but with shift patterns
            if 6 <= hour <= 14 or 14 <= hour <= 22:  # Shift hours
                consumption_factor = random.uniform(0.9, 1.1)
            else:
                consumption_factor = random.uniform(0.7, 0.9)
        
        else:  # municipal
            if 6 <= hour <= 22:  # Active hours
                consumption_factor = random.uniform(1.0, 1.3)
            else:
                consumption_factor = random.uniform(0.6, 0.8)
        
        # Weekend adjustments
        if day_of_week >= 5:
            if building_type == 'commercial':
                consumption_factor *= random.uniform(0.3, 0.6)
            elif building_type == 'residential':
                consumption_factor *= random.uniform(1.1, 1.3)
        
        consumption = self.baseline_values['consumption'] * consumption_factor
        voltage = self.baseline_values['voltage'] + random.uniform(-5, 5)
        current = consumption / (voltage / 1000)  # Convert to proper units
        power_factor = self.baseline_values['power_factor'] + random.uniform(-0.05, 0.05)
        
        # Calculate derived values
        apparent_power = consumption / power_factor
        reactive_power = (apparent_power ** 2 - consumption ** 2) ** 0.5
        
        return {
            'consumption': round(max(0, consumption), 2),  # kW
            'voltage': round(max(200, min(250, voltage)), 1),  # V
            'current': round(max(0, current), 2),  # A
            'power_factor': round(max(0.7, min(1.0, power_factor)), 3),
            'apparent_power': round(apparent_power, 2),  # kVA
            'reactive_power': round(reactive_power, 2),  # kVAR
            'frequency': round(50 + random.uniform(-0.2, 0.2), 2),  # Hz
            'energy_today': round(consumption * random.uniform(8, 16), 2)  # kWh
        }
