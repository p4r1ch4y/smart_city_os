#!/usr/bin/env python3
"""
Smart City IoT Sensor Simulation
Generates realistic sensor data for traffic, waste, air quality, noise, water quality, energy, and parking sensors.
"""

import asyncio
import signal
import sys
import time
import random
from datetime import datetime
from typing import List, Dict
from concurrent.futures import ThreadPoolExecutor
import threading

from colorama import Fore, Style, init
import click

from config import Config, get_random_location
from api_client import BatchAPIClient
from sensors.traffic_sensor import TrafficSensor, ParkingSensor
from sensors.environmental_sensors import AirQualitySensor, NoiseSensor, WaterQualitySensor
from sensors.utility_sensors import WasteSensor, EnergySensor

# Initialize colorama
init(autoreset=True)

class SmartCitySimulator:
    """Main simulator class that orchestrates all sensors"""
    
    def __init__(self):
        self.sensors: List = []
        self.api_client = BatchAPIClient(Config.API_ENDPOINT, batch_size=5)
        self.running = False
        self.stats_thread = None
        self.simulation_start_time = None
        
        # Sensor type mapping
        self.sensor_classes = {
            'traffic': TrafficSensor,
            'parking': ParkingSensor,
            'air_quality': AirQualitySensor,
            'noise': NoiseSensor,
            'water_quality': WaterQualitySensor,
            'waste': WasteSensor,
            'energy': EnergySensor
        }
    
    def create_sensors(self):
        """Create all sensors based on configuration"""
        print(f"{Fore.CYAN}🏗️  Creating sensors...")
        
        sensor_id_counter = 1
        
        for sensor_type, config in Config.SENSOR_TYPES.items():
            count = config['count']
            sensor_class = self.sensor_classes[sensor_type]
            
            print(f"{Fore.BLUE}Creating {count} {sensor_type} sensors...")
            
            for i in range(count):
                # Generate sensor details
                location = get_random_location()
                sensor_id = f"{sensor_type}_{sensor_id_counter:03d}"
                name = f"{sensor_type.replace('_', ' ').title()} Sensor {sensor_id_counter}"
                
                # Create sensor instance
                sensor = sensor_class(
                    sensor_id=sensor_id,
                    name=name,
                    sensor_type=sensor_type,
                    location=location
                )
                
                self.sensors.append(sensor)
                sensor_id_counter += 1
        
        print(f"{Fore.GREEN}✓ Created {len(self.sensors)} sensors total")
    
    def register_all_sensors(self):
        """Register all sensors with the backend"""
        print(f"{Fore.CYAN}📡 Registering sensors with backend...")
        
        # Check backend health first
        if not self.api_client.check_backend_health():
            print(f"{Fore.RED}❌ Backend is not accessible. Please start the backend server first.")
            return False
        
        success_count = 0
        for sensor in self.sensors:
            sensor_info = sensor.get_sensor_info()
            if self.api_client.register_sensor(sensor_info):
                success_count += 1
            time.sleep(0.1)  # Small delay to avoid overwhelming the server
        
        print(f"{Fore.GREEN}✓ Successfully registered {success_count}/{len(self.sensors)} sensors")
        return success_count > 0
    
    def simulate_sensor_data(self, sensor):
        """Generate and send data for a single sensor"""
        try:
            reading = sensor.generate_reading()
            self.api_client.add_to_batch(reading)
            
            # Print occasional status updates
            if random.random() < 0.01:  # 1% chance
                data_summary = self._summarize_data(reading['data'])
                quality_color = {
                    'good': Fore.GREEN,
                    'fair': Fore.YELLOW,
                    'poor': Fore.RED,
                    'invalid': Fore.MAGENTA
                }.get(reading['quality'], Fore.WHITE)
                
                print(f"{Fore.BLUE}📊 {sensor.name}: {data_summary} "
                      f"({quality_color}{reading['quality']}{Style.RESET_ALL})")
        
        except Exception as e:
            print(f"{Fore.RED}❌ Error generating data for {sensor.name}: {str(e)}")
    
    def _summarize_data(self, data: Dict) -> str:
        """Create a brief summary of sensor data"""
        if 'vehicle_count' in data:
            return f"Vehicles: {data['vehicle_count']}, Speed: {data['average_speed']}km/h"
        elif 'fill_percentage' in data:
            return f"Fill: {data['fill_percentage']:.1f}%, Temp: {data['temperature']:.1f}°C"
        elif 'pm25' in data:
            return f"PM2.5: {data['pm25']}, AQI: {data.get('aqi', 'N/A')}"
        elif 'decibel_level' in data:
            return f"Noise: {data['decibel_level']}dB"
        elif 'ph' in data:
            return f"pH: {data['ph']}, DO: {data['dissolved_oxygen']}mg/L"
        elif 'consumption' in data:
            return f"Power: {data['consumption']}kW, Voltage: {data['voltage']}V"
        elif 'occupancy_rate' in data:
            return f"Occupancy: {data['occupancy_rate']:.1f}%"
        else:
            return "Data generated"
    
    def run_simulation_cycle(self):
        """Run one cycle of the simulation"""
        with ThreadPoolExecutor(max_workers=10) as executor:
            # Submit all sensor tasks
            futures = []
            for sensor in self.sensors:
                future = executor.submit(self.simulate_sensor_data, sensor)
                futures.append(future)
            
            # Wait for all tasks to complete
            for future in futures:
                try:
                    future.result(timeout=5)
                except Exception as e:
                    print(f"{Fore.RED}❌ Sensor task failed: {str(e)}")
        
        # Flush any remaining batched data
        self.api_client.flush_batch()
    
    def print_periodic_stats(self):
        """Print statistics periodically"""
        while self.running:
            time.sleep(30)  # Print stats every 30 seconds
            if self.running:
                elapsed = time.time() - self.simulation_start_time
                print(f"\n{Fore.CYAN}⏱️  Simulation running for {elapsed/60:.1f} minutes")
                self.api_client.print_statistics()
    
    def run(self, duration_minutes: int = None):
        """Run the simulation"""
        print(f"{Fore.CYAN}🚀 Starting Smart City IoT Simulation...")
        
        # Create and register sensors
        self.create_sensors()
        if not self.register_all_sensors():
            print(f"{Fore.RED}❌ Failed to register sensors. Exiting.")
            return
        
        # Set up signal handlers for graceful shutdown
        def signal_handler(signum, frame):
            print(f"\n{Fore.YELLOW}🛑 Received shutdown signal. Stopping simulation...")
            self.running = False
        
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
        
        # Start simulation
        self.running = True
        self.simulation_start_time = time.time()
        
        # Start statistics thread
        self.stats_thread = threading.Thread(target=self.print_periodic_stats, daemon=True)
        self.stats_thread.start()
        
        print(f"{Fore.GREEN}✅ Simulation started! Generating data every {Config.UPDATE_INTERVAL} seconds")
        print(f"{Fore.YELLOW}Press Ctrl+C to stop the simulation")
        
        cycle_count = 0
        try:
            while self.running:
                cycle_start = time.time()
                
                # Run simulation cycle
                self.run_simulation_cycle()
                cycle_count += 1
                
                # Check if duration limit reached
                if duration_minutes:
                    elapsed_minutes = (time.time() - self.simulation_start_time) / 60
                    if elapsed_minutes >= duration_minutes:
                        print(f"{Fore.YELLOW}⏰ Duration limit reached ({duration_minutes} minutes)")
                        break
                
                # Wait for next cycle
                cycle_duration = time.time() - cycle_start
                sleep_time = max(0, Config.UPDATE_INTERVAL - cycle_duration)
                
                if sleep_time > 0:
                    time.sleep(sleep_time)
                
        except KeyboardInterrupt:
            print(f"\n{Fore.YELLOW}🛑 Simulation interrupted by user")
        
        finally:
            self.running = False
            print(f"\n{Fore.CYAN}📊 Final Statistics:")
            self.api_client.print_statistics()
            print(f"{Fore.GREEN}✅ Simulation completed after {cycle_count} cycles")

@click.command()
@click.option('--duration', '-d', type=int, help='Duration in minutes (default: run indefinitely)')
@click.option('--interval', '-i', type=float, help='Update interval in seconds (default: from config)')
@click.option('--sensors', '-s', type=int, help='Total number of sensors to create (overrides config)')
def main(duration, interval, sensors):
    """Smart City IoT Sensor Simulation"""
    
    # Override config if specified
    if interval:
        Config.UPDATE_INTERVAL = interval
    
    if sensors:
        # Distribute sensors across types proportionally
        total_configured = sum(config['count'] for config in Config.SENSOR_TYPES.values())
        for sensor_type in Config.SENSOR_TYPES:
            proportion = Config.SENSOR_TYPES[sensor_type]['count'] / total_configured
            Config.SENSOR_TYPES[sensor_type]['count'] = max(1, int(sensors * proportion))
    
    # Create and run simulator
    simulator = SmartCitySimulator()
    simulator.run(duration)

if __name__ == '__main__':
    main()
