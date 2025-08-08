import requests
import json
import time
from typing import Dict, Any, Optional
from colorama import Fore, Style, init

# Initialize colorama for colored output
init(autoreset=True)

class SmartCityAPIClient:
    """API client for communicating with Smart City OS backend"""
    
    def __init__(self, base_url: str, timeout: int = 30):
        self.base_url = base_url.rstrip('/')
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'SmartCity-IoT-Simulator/1.0'
        })
        
        # Statistics
        self.stats = {
            'sensors_registered': 0,
            'data_points_sent': 0,
            'successful_requests': 0,
            'failed_requests': 0,
            'alerts_generated': 0
        }
    
    def register_sensor(self, sensor_info: Dict[str, Any]) -> bool:
        """Register a new sensor with the backend"""
        try:
            url = f"{self.base_url}/api/sensors"
            print(f"DEBUG: Registering sensor at URL: {url}")
            response = self.session.post(
                url,
                json=sensor_info,
                timeout=self.timeout
            )
            
            if response.status_code == 201:
                self.stats['sensors_registered'] += 1
                self.stats['successful_requests'] += 1
                print(f"{Fore.GREEN}✓ Registered sensor: {sensor_info['name']}")
                return True
            elif response.status_code == 409:
                # Sensor already exists
                print(f"{Fore.YELLOW}⚠ Sensor already exists: {sensor_info['name']}")
                return True
            else:
                self.stats['failed_requests'] += 1
                print(f"{Fore.RED}✗ Failed to register sensor {sensor_info['name']}: {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            self.stats['failed_requests'] += 1
            print(f"{Fore.RED}✗ Network error registering sensor {sensor_info['name']}: {str(e)}")
            return False
    
    def send_sensor_data(self, sensor_data: Dict[str, Any]) -> bool:
        """Send sensor data to the backend"""
        try:
            response = self.session.post(
                f"{self.base_url}/api/sensors/data",
                json=sensor_data,
                timeout=self.timeout
            )
            
            if response.status_code == 201:
                self.stats['data_points_sent'] += 1
                self.stats['successful_requests'] += 1
                
                # Check if alerts were generated
                response_data = response.json()
                alerts_count = response_data.get('alerts', 0)
                if alerts_count > 0:
                    self.stats['alerts_generated'] += alerts_count
                    print(f"{Fore.YELLOW}⚠ {alerts_count} alert(s) generated for sensor {sensor_data['sensorId']}")
                
                return True
            else:
                self.stats['failed_requests'] += 1
                error_msg = response.json().get('message', 'Unknown error') if response.content else 'No response'
                print(f"{Fore.RED}✗ Failed to send data for sensor {sensor_data['sensorId']}: {error_msg}")
                return False
                
        except requests.exceptions.RequestException as e:
            self.stats['failed_requests'] += 1
            print(f"{Fore.RED}✗ Network error sending data for sensor {sensor_data['sensorId']}: {str(e)}")
            return False
    
    def check_backend_health(self) -> bool:
        """Check if the backend is healthy and accessible"""
        try:
            response = self.session.get(
                f"{self.base_url.replace('/api/sensors', '')}/health",
                timeout=5
            )
            
            if response.status_code == 200:
                health_data = response.json()
                print(f"{Fore.GREEN}✓ Backend is healthy - Uptime: {health_data.get('uptime', 'unknown')}s")
                return True
            else:
                print(f"{Fore.RED}✗ Backend health check failed: {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            print(f"{Fore.RED}✗ Cannot reach backend: {str(e)}")
            return False
    
    def get_sensor_info(self, sensor_id: str) -> Optional[Dict[str, Any]]:
        """Get sensor information from backend"""
        try:
            # First, get all sensors and find the one with matching sensorId
            response = self.session.get(
                f"{self.base_url}/sensors",
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                sensors_data = response.json()
                sensors = sensors_data.get('sensors', [])
                
                for sensor in sensors:
                    if sensor.get('sensorId') == sensor_id:
                        return sensor
                
                return None
            else:
                return None
                
        except requests.exceptions.RequestException:
            return None
    
    def print_statistics(self):
        """Print current statistics"""
        print(f"\n{Fore.CYAN}=== IoT Simulation Statistics ===")
        print(f"{Fore.WHITE}Sensors Registered: {Fore.GREEN}{self.stats['sensors_registered']}")
        print(f"{Fore.WHITE}Data Points Sent: {Fore.GREEN}{self.stats['data_points_sent']}")
        print(f"{Fore.WHITE}Successful Requests: {Fore.GREEN}{self.stats['successful_requests']}")
        print(f"{Fore.WHITE}Failed Requests: {Fore.RED}{self.stats['failed_requests']}")
        print(f"{Fore.WHITE}Alerts Generated: {Fore.YELLOW}{self.stats['alerts_generated']}")
        
        if self.stats['successful_requests'] + self.stats['failed_requests'] > 0:
            success_rate = (self.stats['successful_requests'] / 
                          (self.stats['successful_requests'] + self.stats['failed_requests'])) * 100
            print(f"{Fore.WHITE}Success Rate: {Fore.GREEN}{success_rate:.1f}%")
        
        print(f"{Fore.CYAN}================================\n")
    
    def reset_statistics(self):
        """Reset all statistics"""
        self.stats = {
            'sensors_registered': 0,
            'data_points_sent': 0,
            'successful_requests': 0,
            'failed_requests': 0,
            'alerts_generated': 0
        }

class BatchAPIClient(SmartCityAPIClient):
    """Extended API client with batch operations"""
    
    def __init__(self, base_url: str, timeout: int = 30, batch_size: int = 10):
        super().__init__(base_url, timeout)
        self.batch_size = batch_size
        self.pending_data = []
    
    def add_to_batch(self, sensor_data: Dict[str, Any]):
        """Add sensor data to batch queue"""
        self.pending_data.append(sensor_data)
        
        if len(self.pending_data) >= self.batch_size:
            self.flush_batch()
    
    def flush_batch(self):
        """Send all pending data"""
        if not self.pending_data:
            return
        
        print(f"{Fore.BLUE}📦 Sending batch of {len(self.pending_data)} data points...")
        
        success_count = 0
        for data in self.pending_data:
            if self.send_sensor_data(data):
                success_count += 1
        
        print(f"{Fore.GREEN}✓ Batch complete: {success_count}/{len(self.pending_data)} successful")
        self.pending_data.clear()
    
    def __del__(self):
        """Ensure all pending data is sent when client is destroyed"""
        if hasattr(self, 'pending_data') and self.pending_data:
            self.flush_batch()
