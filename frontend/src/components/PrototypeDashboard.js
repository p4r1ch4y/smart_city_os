import React, { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useQuery } from 'react-query';
import { sensorService, alertService } from '../services/api';
import MetricCard from './MetricCard';
import RealtimeChart from './RealtimeChart';
import AlertsList from './AlertsList';
import SensorMap from './SensorMap';
import './Dashboard.css';

function PrototypeDashboard() {
  const { realtimeData, isConnected, getActiveAlerts } = useSocket();
  const [dashboardData, setDashboardData] = useState({
    traffic: { current: 67, trend: "positive", trendValue: "+2.3%" },
    energy: { current: 3.8, unit: "MW", trend: "negative", trendValue: "-1.2%" },
    airQuality: { current: 82, status: "Moderate", trend: "neutral", trendValue: "+0.1%" },
    waterUsage: { current: 1045, unit: "ML/day", trend: "positive", trendValue: "+0.8%" },
    waste: { current: 73, trend: "positive", trendValue: "+5.1%" },
    population: { current: 2847395, trend: "positive", trendValue: "+0.02%" }
  });

  // Fetch sensors data
  const { data: sensorsData, isLoading: sensorsLoading } = useQuery(
    ['sensors'],
    () => sensorService.getSensors({ limit: 100 }),
    {
      refetchInterval: 30000,
      onError: () => {
        // Handle error silently, use dummy data
      }
    }
  );

  // Fetch alerts data
  const { data: alertsData, isLoading: alertsLoading } = useQuery(
    ['alerts'],
    () => alertService.getAlerts({ limit: 10 }),
    {
      refetchInterval: 10000,
      onError: () => {
        // Handle error silently, use dummy data
      }
    }
  );

  // Update dashboard data with real-time data
  useEffect(() => {
    if (realtimeData && realtimeData.length > 0) {
      const latestData = realtimeData[realtimeData.length - 1];
      
      setDashboardData(prev => ({
        ...prev,
        traffic: {
          ...prev.traffic,
          current: Math.round(latestData.traffic || prev.traffic.current)
        },
        energy: {
          ...prev.energy,
          current: parseFloat((latestData.energy || prev.energy.current).toFixed(1))
        },
        airQuality: {
          ...prev.airQuality,
          current: Math.round(latestData.airQuality || prev.airQuality.current)
        },
        waterUsage: {
          ...prev.waterUsage,
          current: Math.round(latestData.water || prev.waterUsage.current)
        },
        waste: {
          ...prev.waste,
          current: Math.round(latestData.waste || prev.waste.current)
        }
      }));
    }
  }, [realtimeData]);

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toLocaleString();
  };

  return (
    <div className="dashboard-section">
      {/* Real-time Metrics Cards */}
      <div className="metrics-grid">
        <MetricCard
          type="traffic"
          title="Traffic Flow"
          value={dashboardData.traffic.current}
          unit="%"
          trend={dashboardData.traffic.trend}
          trendValue={dashboardData.traffic.trendValue}
          progressValue={dashboardData.traffic.current}
        />

        <MetricCard
          type="energy"
          title="Energy Consumption"
          value={dashboardData.energy.current}
          unit={dashboardData.energy.unit}
          trend={dashboardData.energy.trend}
          trendValue={dashboardData.energy.trendValue}
          progressValue={76}
        />

        <MetricCard
          type="air-quality"
          title="Air Quality Index"
          value={dashboardData.airQuality.current}
          unit="AQI"
          status={dashboardData.airQuality.status}
          details={[
            { label: "PM2.5", value: "35 μg/m³" },
            { label: "NO2", value: "42 μg/m³" }
          ]}
        />

        <MetricCard
          type="water"
          title="Water Usage"
          value={dashboardData.waterUsage.current}
          unit={dashboardData.waterUsage.unit}
          trend={dashboardData.waterUsage.trend}
          trendValue={dashboardData.waterUsage.trendValue}
          progressValue={70}
        />

        <MetricCard
          type="waste"
          title="Waste Management"
          value={dashboardData.waste.current}
          unit="%"
          trend={dashboardData.waste.trend}
          trendValue={dashboardData.waste.trendValue}
        />

        <MetricCard
          type="population"
          title="Population Count"
          value={formatNumber(dashboardData.population.current)}
          unit="people"
          trend={dashboardData.population.trend}
          trendValue={dashboardData.population.trendValue}
        />
      </div>

      {/* Charts and Map Row */}
      <div className="dashboard-row">
        <div className="chart-container">
          <h3>Traffic Flow Trends</h3>
          <div className="chart-wrapper">
            <RealtimeChart 
              data={realtimeData} 
              dataKey="traffic"
              color="#FF6B35"
              height={300}
            />
          </div>
        </div>
        
        <div className="map-container">
          <h3>City Sensor Map</h3>
          <div className="city-map">
            <SensorMap 
              sensors={sensorsData?.data?.sensors || []}
              height={300}
            />
          </div>
        </div>
      </div>

      {/* Alerts Panel */}
      <div className="alerts-panel">
        <h3>Recent Alerts</h3>
        <AlertsList 
          alerts={alertsData?.data?.alerts || getActiveAlerts()} 
          maxItems={5}
          showActions={false}
        />
      </div>
    </div>
  );
}

export default PrototypeDashboard;
