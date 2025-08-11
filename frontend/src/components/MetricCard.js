import React from 'react';
import { MetricIcon } from './icons';
import './Dashboard.css';

const MetricCard = ({ 
  type, 
  title, 
  icon, 
  value, 
  unit, 
  trend, 
  trendValue, 
  status,
  details,
  progressValue,
  children 
}) => {
  const getTrendClass = (trend) => {
    if (trend === 'up' || trend === 'positive') return 'positive';
    if (trend === 'down' || trend === 'negative') return 'negative';
    return 'neutral';
  };

  return (
    <div className={`metric-card ${type}`} data-metric={type}>
      <div className="metric-header">
        <h3>{title}</h3>
        <div className="metric-icon">
          <MetricIcon type={type} size={24} />
        </div>
      </div>
      
      <div className="metric-value">
        <span className="value">{value}</span>
        {unit && <span className="unit">{unit}</span>}
      </div>

      {/* Progress bar for traffic, waste, etc. */}
      {progressValue !== undefined && (
        <div className="metric-progress">
          <div 
            className="progress-bar" 
            style={{ width: `${progressValue}%` }}
          />
        </div>
      )}

      {/* Circular progress for energy */}
      {type === 'energy' && (
        <div className="circular-progress">
          <svg viewBox="0 0 36 36">
            <circle 
              cx="18" 
              cy="18" 
              r="16" 
              fill="none" 
              stroke="rgba(0, 206, 209, 0.3)" 
              strokeWidth="2"
            />
            <circle 
              cx="18" 
              cy="18" 
              r="16" 
              fill="none" 
              stroke="#00CED1" 
              strokeWidth="2" 
              strokeDasharray={`${progressValue || 76} 100`}
              transform="rotate(-90 18 18)"
            />
          </svg>
        </div>
      )}

      {/* Air quality status */}
      {type === 'air-quality' && status && (
        <>
          <div className="air-quality-status">{status}</div>
          {details && (
            <div className="air-quality-details">
              {details.map((detail, index) => (
                <div key={index} className="detail">
                  <span>{detail.label}:</span>
                  <span>{detail.value}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Water level indicator */}
      {type === 'water' && (
        <div className="water-indicator">
          <div 
            className="water-level" 
            style={{ width: `${progressValue || 70}%` }}
          />
        </div>
      )}

      {/* Waste bins visualization */}
      {type === 'waste' && (
        <div className="waste-bins">
          <div className="bin">
            <div className="bin-fill" style={{ height: '73%' }} />
          </div>
          <div className="bin">
            <div className="bin-fill" style={{ height: '65%' }} />
          </div>
          <div className="bin">
            <div className="bin-fill" style={{ height: '80%' }} />
          </div>
        </div>
      )}

      {/* Population animation */}
      {type === 'population' && (
        <div className="population-animation">
          <div className="pulse-ring" />
          <div className="pulse-ring" />
          <div className="pulse-ring" />
        </div>
      )}

      {/* Custom children content */}
      {children}

      {/* Trend indicator */}
      {trend && trendValue && (
        <div className="metric-trend">
          <span className={`trend ${getTrendClass(trend)}`}>
            {trendValue}
          </span>
          <span>vs yesterday</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
