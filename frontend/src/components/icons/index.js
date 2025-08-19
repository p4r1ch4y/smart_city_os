import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Cpu,
  AlertTriangle,
  Building2,
  Settings,
  User,
  LogOut,
  Bell,
  Sun,
  Moon,
  Wifi,
  WifiOff,
  Car,
  Zap,
  Wind,
  Droplets,
  Trash2,
  Users,
  MapPin,
  Clock,
  Activity,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  ChevronRight,
  Menu,
  X,
  Home,
  Eye,
  EyeOff,
  Loader,
  RefreshCw,
  Download,
  Upload,
  Search,
  Filter,
  Calendar,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Thermometer,
  Gauge,
  Battery,
  Signal,
  Navigation,
  Target,
  Layers,
  BarChart,
  LineChart,
  PieChart,
  TrendingDown,
  Link
} from 'lucide-react';

// Icon mapping for consistent usage across the app
export const Icons = {
  // Navigation
  dashboard: BarChart3,
  analytics: TrendingUp,
  sensors: Cpu,
  alerts: AlertTriangle,
  blockchain: Link,
  services: Building2,
  settings: Settings,
  profile: User,
  logout: LogOut,
  home: Home,
  
  // UI Elements
  bell: Bell,
  sun: Sun,
  moon: Moon,
  menu: Menu,
  close: X,
  chevronRight: ChevronRight,
  eye: Eye,
  eyeOff: EyeOff,
  loader: Loader,
  refresh: RefreshCw,
  download: Download,
  upload: Upload,
  search: Search,
  filter: Filter,
  calendar: Calendar,
  
  // Connectivity
  wifi: Wifi,
  wifiOff: WifiOff,
  signal: Signal,
  
  // Metrics & Sensors
  traffic: Car,
  energy: Zap,
  airQuality: Wind,
  water: Droplets,
  waste: Trash2,
  population: Users,
  location: MapPin,
  time: Clock,
  activity: Activity,
  gauge: Gauge,
  battery: Battery,
  navigation: Navigation,
  target: Target,
  layers: Layers,
  
  // Status & Alerts
  shield: Shield,
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
  
  // Charts
  barChart: BarChart,
  lineChart: LineChart,
  pieChart: PieChart,
  trendingUp: TrendingUp,
  trendingDown: TrendingDown,
  
  // Weather
  cloud: Cloud,
  cloudRain: CloudRain,
  cloudSnow: CloudSnow,
  cloudLightning: CloudLightning,
  thermometer: Thermometer,
  
  // Devices
  globe: Globe,
  smartphone: Smartphone,
  monitor: Monitor,
  tablet: Tablet,
};

// Icon component wrapper for consistent styling
export const Icon = ({ 
  name, 
  size = 20, 
  className = '', 
  color = 'currentColor',
  strokeWidth = 2,
  ...props 
}) => {
  const IconComponent = Icons[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }
  
  return (
    <IconComponent
      size={size}
      className={className}
      color={color}
      strokeWidth={strokeWidth}
      {...props}
    />
  );
};

// Predefined icon sizes
export const IconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

// Status icon helper
export const StatusIcon = ({ status, size = 16, className = '' }) => {
  const statusIcons = {
    success: { icon: 'success', color: 'text-green-500' },
    error: { icon: 'error', color: 'text-red-500' },
    warning: { icon: 'warning', color: 'text-yellow-500' },
    info: { icon: 'info', color: 'text-blue-500' },
    loading: { icon: 'loader', color: 'text-gray-500' },
  };
  
  const config = statusIcons[status] || statusIcons.info;
  
  return (
    <Icon
      name={config.icon}
      size={size}
      className={`${config.color} ${className} ${status === 'loading' ? 'animate-spin' : ''}`}
    />
  );
};

// Metric icon helper
export const MetricIcon = ({ type, size = 24, className = '' }) => {
  const metricIcons = {
    traffic: 'traffic',
    energy: 'energy',
    'air-quality': 'airQuality',
    water: 'water',
    waste: 'waste',
    population: 'population',
  };
  
  return (
    <Icon
      name={metricIcons[type] || 'gauge'}
      size={size}
      className={className}
    />
  );
};

export default Icon;
