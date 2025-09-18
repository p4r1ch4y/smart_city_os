// Smart City Management Platform JavaScript
class SmartCityDashboard {
    constructor() {
        this.data = {
            cityMetrics: {
                traffic: { current: 67, trend: "+2.3%", color: "#FF6B35" },
                energy: { current: 3.8, unit: "MW", trend: "-1.2%", color: "#00CED1" },
                airQuality: { current: 82, status: "Moderate", color: "#FFD700" },
                waterUsage: { current: 1045, unit: "ML/day", trend: "+0.8%", color: "#32CD32" },
                waste: { current: 73, trend: "+5.1%", color: "#FF69B4" },
                population: { current: 2847395, trend: "+0.02%" }
            },
            sensors: [
                { id: "T001", type: "Traffic", status: "online", value: "67%", location: "Main St & 1st Ave" },
                { id: "A001", type: "Air Quality", status: "online", value: "82 AQI", location: "Downtown Park" },
                { id: "W001", type: "Water", status: "online", value: "1045 ML", location: "Treatment Plant" },
                { id: "E001", type: "Energy", status: "warning", value: "3.8 MW", location: "Grid Station A" },
                { id: "N001", type: "Noise", status: "online", value: "52 dB", location: "City Center" }
            ],
            alerts: [
                { type: "warning", message: "High traffic congestion detected on Highway 101", time: "5 min ago" },
                { type: "info", message: "Street light maintenance scheduled for tonight", time: "15 min ago" },
                { type: "error", message: "Power grid anomaly in Sector 7", time: "32 min ago" }
            ],
            weather: {
                temperature: 24,
                humidity: 62,
                condition: "Partly Cloudy",
                windSpeed: 12
            }
        };

        this.charts = {};
        this.refreshInterval = 3000;
        this.currentSection = 'dashboard';
        this.notificationsEnabled = true;
        
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupClock();
        this.initializeCharts();
        this.startDataUpdates();
        this.setupInteractiveElements();
        this.populateSensors();
        this.populateAlerts();
        this.setupSettings();
        this.addAnimations();
    }

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        const sections = document.querySelectorAll('.section');

        console.log('Setting up navigation...', navItems.length, 'nav items found');
        console.log('Sections found:', sections.length);

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = item.dataset.section;
                
                console.log('Navigation clicked:', targetSection);
                
                if (!targetSection) return;
                
                // Update active nav item
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                // Update active section
                sections.forEach(section => {
                    section.classList.remove('active');
                    section.style.display = 'none';
                });
                
                const targetSectionElement = document.getElementById(targetSection);
                if (targetSectionElement) {
                    targetSectionElement.classList.add('active');
                    targetSectionElement.style.display = 'block';
                    console.log('Section activated:', targetSection);
                } else {
                    console.error('Section not found:', targetSection);
                }
                
                this.currentSection = targetSection;
                
                // Initialize section-specific content
                setTimeout(() => {
                    switch (targetSection) {
                        case 'analytics':
                            this.initializeAnalyticsCharts();
                            break;
                        case 'sensors':
                            this.populateSensors();
                            break;
                        case 'alerts':
                            this.populateAlerts();
                            break;
                        default:
                            break;
                    }
                }, 100);
            });
        });

        // Initialize dashboard as active
        const dashboardSection = document.getElementById('dashboard');
        if (dashboardSection) {
            dashboardSection.classList.add('active');
            dashboardSection.style.display = 'block';
        }
    }

    setupClock() {
        const updateTime = () => {
            const now = new Date();
            const timeString = now.toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            
            const timeElement = document.getElementById('currentTime');
            if (timeElement) {
                timeElement.textContent = timeString;
            }
        };
        
        updateTime();
        setInterval(updateTime, 1000);
    }

    initializeCharts() {
        // Traffic Flow Trends Chart
        const trafficCtx = document.getElementById('trafficChart');
        if (trafficCtx) {
            this.charts.traffic = new Chart(trafficCtx, {
                type: 'line',
                data: {
                    labels: ['6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'],
                    datasets: [{
                        label: 'Traffic Congestion',
                        data: [45, 78, 65, 82, 67, 52],
                        borderColor: '#00CED1',
                        backgroundColor: 'rgba(0, 206, 209, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#00CED1',
                        pointBorderColor: '#00CED1',
                        pointHoverBackgroundColor: '#32CD32',
                        pointHoverBorderColor: '#32CD32'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: {
                                color: '#ffffff'
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: {
                                color: '#ffffff'
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        },
                        y: {
                            ticks: {
                                color: '#ffffff'
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        }
                    }
                }
            });
        }
    }

    initializeAnalyticsCharts() {
        // Energy Distribution Chart
        const energyCtx = document.getElementById('energyChart');
        if (energyCtx && !this.charts.energy) {
            this.charts.energy = new Chart(energyCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Residential', 'Commercial', 'Industrial', 'Public'],
                    datasets: [{
                        data: [35, 25, 30, 10],
                        backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#32CD32'],
                        borderColor: '#0f0f19',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#ffffff',
                                padding: 20
                            }
                        }
                    }
                }
            });
        }

        // Air Quality Trends Chart
        const airCtx = document.getElementById('airQualityChart');
        if (airCtx && !this.charts.airQuality) {
            this.charts.airQuality = new Chart(airCtx, {
                type: 'bar',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'AQI',
                        data: [65, 78, 82, 75, 68, 72, 80],
                        backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C'],
                        borderColor: '#00CED1',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: {
                                color: '#ffffff'
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: {
                                color: '#ffffff'
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        },
                        y: {
                            ticks: {
                                color: '#ffffff'
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        }
                    }
                }
            });
        }
    }

    startDataUpdates() {
        setInterval(() => {
            this.updateMetrics();
            this.updateCharts();
            this.updateSensorData();
        }, this.refreshInterval);
    }

    updateMetrics() {
        // Traffic
        const trafficVariation = (Math.random() - 0.5) * 10;
        this.data.cityMetrics.traffic.current = Math.max(45, Math.min(85, 
            this.data.cityMetrics.traffic.current + trafficVariation));
        
        // Energy
        const energyVariation = (Math.random() - 0.5) * 0.5;
        this.data.cityMetrics.energy.current = Math.max(2.5, Math.min(4.2, 
            this.data.cityMetrics.energy.current + energyVariation));
        
        // Air Quality
        const aqiVariation = (Math.random() - 0.5) * 15;
        this.data.cityMetrics.airQuality.current = Math.max(35, Math.min(120, 
            this.data.cityMetrics.airQuality.current + aqiVariation));
        
        // Water Usage
        const waterVariation = (Math.random() - 0.5) * 50;
        this.data.cityMetrics.waterUsage.current = Math.max(850, Math.min(1200, 
            this.data.cityMetrics.waterUsage.current + waterVariation));
        
        // Waste
        const wasteVariation = (Math.random() - 0.5) * 5;
        this.data.cityMetrics.waste.current = Math.max(60, Math.min(90, 
            this.data.cityMetrics.waste.current + wasteVariation));
        
        // Population (slower changes)
        const popVariation = Math.floor((Math.random() - 0.5) * 100);
        this.data.cityMetrics.population.current = Math.max(2800000, Math.min(2900000, 
            this.data.cityMetrics.population.current + popVariation));

        this.updateDisplayValues();
    }

    updateDisplayValues() {
        // Update traffic
        const trafficValue = Math.round(this.data.cityMetrics.traffic.current);
        const trafficValueEl = document.getElementById('trafficValue');
        const trafficProgressEl = document.getElementById('trafficProgress');
        if (trafficValueEl) trafficValueEl.textContent = trafficValue;
        if (trafficProgressEl) trafficProgressEl.style.width = trafficValue + '%';
        
        // Update energy
        const energyValue = this.data.cityMetrics.energy.current.toFixed(1);
        const energyValueEl = document.getElementById('energyValue');
        if (energyValueEl) energyValueEl.textContent = energyValue;
        const energyCircle = document.querySelector('#energyCircle circle:last-child');
        if (energyCircle) {
            const percentage = (this.data.cityMetrics.energy.current / 4.2) * 100;
            energyCircle.style.strokeDasharray = `${percentage} 100`;
        }
        
        // Update air quality
        const aqiValue = Math.round(this.data.cityMetrics.airQuality.current);
        const aqiValueEl = document.getElementById('airQualityValue');
        if (aqiValueEl) aqiValueEl.textContent = aqiValue;
        this.updateAirQualityStatus(aqiValue);
        
        // Update water
        const waterValue = Math.round(this.data.cityMetrics.waterUsage.current);
        const waterValueEl = document.getElementById('waterValue');
        if (waterValueEl) waterValueEl.textContent = waterValue.toLocaleString();
        const waterLevel = document.getElementById('waterLevel');
        if (waterLevel) {
            const percentage = ((waterValue - 850) / (1200 - 850)) * 100;
            waterLevel.style.height = Math.max(20, Math.min(100, percentage)) + '%';
        }
        
        // Update waste
        const wasteValue = Math.round(this.data.cityMetrics.waste.current);
        const wasteValueEl = document.getElementById('wasteValue');
        if (wasteValueEl) wasteValueEl.textContent = wasteValue;
        
        // Update population with animation
        this.animateCountUp('populationValue', this.data.cityMetrics.population.current);
    }

    updateAirQualityStatus(aqi) {
        const statusElement = document.getElementById('airQualityStatus');
        const pm25Element = document.getElementById('pm25');
        const no2Element = document.getElementById('no2');
        
        let status, color;
        if (aqi <= 50) {
            status = 'Good';
            color = '#32CD32';
        } else if (aqi <= 100) {
            status = 'Moderate';
            color = '#FFD700';
        } else if (aqi <= 150) {
            status = 'Unhealthy';
            color = '#FF6B35';
        } else {
            status = 'Hazardous';
            color = '#FF1493';
        }
        
        if (statusElement) {
            statusElement.textContent = status;
            statusElement.style.backgroundColor = color + '33';
            statusElement.style.color = color;
        }
        
        // Update pollutant values
        const pm25Value = Math.round(aqi * 0.4 + (Math.random() - 0.5) * 10);
        const no2Value = Math.round(aqi * 0.5 + (Math.random() - 0.5) * 15);
        
        if (pm25Element) pm25Element.textContent = `${pm25Value} μg/m³`;
        if (no2Element) no2Element.textContent = `${no2Value} μg/m³`;
    }

    animateCountUp(elementId, targetValue) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const currentValue = parseInt(element.textContent.replace(/,/g, '')) || 0;
        const increment = (targetValue - currentValue) / 30;
        let current = currentValue;
        
        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= targetValue) || (increment < 0 && current <= targetValue)) {
                current = targetValue;
                clearInterval(timer);
            }
            element.textContent = Math.round(current).toLocaleString();
        }, 50);
    }

    updateCharts() {
        if (this.charts.traffic) {
            // Add new data point to traffic chart
            const chart = this.charts.traffic;
            const newData = Math.round(this.data.cityMetrics.traffic.current);
            
            chart.data.datasets[0].data.push(newData);
            chart.data.datasets[0].data.shift();
            chart.update('none');
        }
    }

    updateSensorData() {
        this.data.sensors.forEach(sensor => {
            // Randomly update sensor status
            if (Math.random() < 0.05) { // Reduced frequency
                const statuses = ['online', 'warning', 'offline'];
                const currentIndex = statuses.indexOf(sensor.status);
                const possibleStatuses = statuses.filter((_, index) => index !== currentIndex);
                sensor.status = possibleStatuses[Math.floor(Math.random() * possibleStatuses.length)];
            }
            
            // Update sensor values based on type
            switch (sensor.type) {
                case 'Traffic':
                    sensor.value = Math.round(this.data.cityMetrics.traffic.current) + '%';
                    break;
                case 'Air Quality':
                    sensor.value = Math.round(this.data.cityMetrics.airQuality.current) + ' AQI';
                    break;
                case 'Water':
                    sensor.value = Math.round(this.data.cityMetrics.waterUsage.current) + ' ML';
                    break;
                case 'Energy':
                    sensor.value = this.data.cityMetrics.energy.current.toFixed(1) + ' MW';
                    break;
                case 'Noise':
                    const noiseValue = Math.round(50 + (Math.random() - 0.5) * 20);
                    sensor.value = noiseValue + ' dB';
                    break;
            }
        });
        
        if (this.currentSection === 'sensors') {
            this.populateSensors();
        }
    }

    setupInteractiveElements() {
        // Metric cards click interaction
        document.querySelectorAll('.metric-card').forEach(card => {
            card.addEventListener('click', () => {
                card.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    card.style.transform = '';
                }, 150);
                
                // Add ripple effect
                this.createRipple(card);
            });
        });

        // Sensor marker interactions
        document.querySelectorAll('.sensor-marker').forEach(marker => {
            marker.addEventListener('click', () => {
                const sensorId = marker.dataset.sensor;
                const sensor = this.data.sensors.find(s => s.id === sensorId);
                if (sensor) {
                    this.showSensorDetails(sensor);
                }
            });
        });

        // Alert filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterAlerts(btn.dataset.type);
            });
        });

        // Service controls
        document.querySelectorAll('.toggle-switch input').forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                const service = e.target.id;
                const status = e.target.checked ? 'Active' : 'Inactive';
                const statusElement = e.target.closest('.service-control').querySelector('.control-status');
                if (statusElement) {
                    statusElement.textContent = status;
                    statusElement.style.color = e.target.checked ? '#32CD32' : '#FF6B35';
                }
                
                // Show notification
                this.showNotification(`${service.replace(/([A-Z])/g, ' $1')} ${status.toLowerCase()}`);
            });
        });
    }

    createRipple(element) {
        const ripple = document.createElement('div');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(0, 206, 209, 0.3);
            transform: scale(0);
            animation: ripple 600ms linear;
            width: ${size}px;
            height: ${size}px;
            left: ${rect.width / 2 - size / 2}px;
            top: ${rect.height / 2 - size / 2}px;
            pointer-events: none;
        `;
        
        element.style.position = 'relative';
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    showSensorDetails(sensor) {
        const modal = document.createElement('div');
        modal.className = 'sensor-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Sensor Details: ${sensor.id}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p><strong>Type:</strong> ${sensor.type}</p>
                    <p><strong>Status:</strong> <span class="sensor-status ${sensor.status}">${sensor.status}</span></p>
                    <p><strong>Current Value:</strong> ${sensor.value}</p>
                    <p><strong>Location:</strong> ${sensor.location}</p>
                    <p><strong>Last Updated:</strong> ${new Date().toLocaleTimeString()}</p>
                </div>
            </div>
        `;
        
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;
        
        modal.querySelector('.modal-content').style.cssText = `
            background: rgba(15, 15, 25, 0.95);
            border: 1px solid rgba(0, 206, 209, 0.3);
            border-radius: 12px;
            padding: 24px;
            max-width: 400px;
            width: 90%;
            color: white;
        `;
        
        modal.querySelector('.modal-close').style.cssText = `
            background: none;
            border: none;
            color: #00CED1;
            font-size: 24px;
            cursor: pointer;
            float: right;
        `;
        
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('modal-close')) {
                modal.remove();
            }
        });
    }

    populateSensors() {
        const sensorsGrid = document.getElementById('sensorsGrid');
        if (!sensorsGrid) return;
        
        sensorsGrid.innerHTML = this.data.sensors.map(sensor => `
            <div class="sensor-card fade-in">
                <div class="sensor-header">
                    <span class="sensor-id">${sensor.id}</span>
                    <span class="sensor-status ${sensor.status}">${sensor.status}</span>
                </div>
                <div class="sensor-type">${sensor.type}</div>
                <div class="sensor-value">${sensor.value}</div>
                <div class="sensor-location">${sensor.location}</div>
            </div>
        `).join('');
    }

    populateAlerts() {
        const alertsList = document.getElementById('alertsFullList');
        if (!alertsList) return;
        
        // Add more alerts for demonstration
        const extendedAlerts = [
            ...this.data.alerts,
            { type: "warning", message: "Water pressure low in District 5", time: "1 hour ago" },
            { type: "info", message: "Traffic light cycle updated at Main & Oak", time: "2 hours ago" },
            { type: "error", message: "Sensor T003 offline - requires maintenance", time: "3 hours ago" },
            { type: "info", message: "Air quality improved in downtown area", time: "4 hours ago" }
        ];
        
        alertsList.innerHTML = extendedAlerts.map(alert => `
            <div class="alert-item ${alert.type} fade-in">
                <div class="alert-icon">
                    ${alert.type === 'warning' ? '⚠️' : alert.type === 'error' ? '🚨' : 'ℹ️'}
                </div>
                <div class="alert-content">
                    <p>${alert.message}</p>
                    <span class="alert-time">${alert.time}</span>
                </div>
            </div>
        `).join('');
    }

    filterAlerts(type) {
        const alerts = document.querySelectorAll('#alertsFullList .alert-item');
        alerts.forEach(alert => {
            if (type === 'all' || alert.classList.contains(type)) {
                alert.style.display = 'flex';
            } else {
                alert.style.display = 'none';
            }
        });
    }

    setupSettings() {
        // Refresh rate setting
        const refreshSelect = document.getElementById('refreshRate');
        if (refreshSelect) {
            refreshSelect.addEventListener('change', (e) => {
                this.refreshInterval = parseInt(e.target.value);
                this.showNotification(`Refresh rate updated to ${this.refreshInterval / 1000} seconds`);
            });
        }

        // Theme setting
        const themeSelect = document.getElementById('theme');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                document.body.setAttribute('data-color-scheme', e.target.value);
                this.showNotification(`Theme changed to ${e.target.value} mode`);
            });
        }

        // Notifications setting
        const notificationsToggle = document.getElementById('notifications');
        if (notificationsToggle) {
            notificationsToggle.addEventListener('change', (e) => {
                this.notificationsEnabled = e.target.checked;
                this.showNotification(`Notifications ${e.target.checked ? 'enabled' : 'disabled'}`);
            });
        }
    }

    showNotification(message) {
        if (!this.notificationsEnabled) return;
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 206, 209, 0.9);
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            z-index: 1000;
            animation: slideInRight 300ms ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 300ms ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    addAnimations() {
        // Add CSS animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            
            @keyframes ripple {
                to { transform: scale(4); opacity: 0; }
            }
        `;
        document.head.appendChild(style);

        // Stagger animation for metric cards
        const metricCards = document.querySelectorAll('.metric-card');
        metricCards.forEach((card, index) => {
            card.style.animationDelay = `${index * 100}ms`;
            card.classList.add('fade-in');
        });
    }
}

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new SmartCityDashboard();
});

// Add some global utility functions
window.toggleMobileNav = function() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('open');
};

// Performance monitoring
window.addEventListener('load', () => {
    console.log('🏙️ Smart City Dashboard loaded successfully!');
    console.log('⚡ Real-time data updates every 3 seconds');
    console.log('📊 Interactive charts and visualizations ready');
    console.log('🎨 Modern UI with smooth animations active');
});

// Handle window resize for responsive design
window.addEventListener('resize', () => {
    // Resize charts if they exist
    if (window.dashboard && window.dashboard.charts) {
        Object.values(window.dashboard.charts).forEach(chart => {
            if (chart && chart.resize) {
                chart.resize();
            }
        });
    }
});