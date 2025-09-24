# Smart City OS Architecture

This document provides a comprehensive architectural overview of the Smart City Operating System, including system components, data flows, and deployment strategies.

## System Overview

Smart City OS is a comprehensive platform that integrates IoT sensors, predictive analytics, blockchain transparency, and citizen services into a unified urban management system.

### Core Technologies
- **Frontend**: React 18, React Router, Tailwind CSS
- **Backend**: Node.js with Express, Vercel Functions
- **Database**: PostgreSQL (Supabase), Redis for caching
- **Analytics**: Python-based analytics service
- **Blockchain**: Solana integration with Anchor framework
- **IoT**: Python-based sensor simulation and data pipeline
- **Deployment**: Docker containers, Vercel hosting

## Architecture Diagrams

### 1. System Architecture Overview

```mermaid
classDiagram
    class Frontend {
        +React 18
        +Tailwind CSS
        +Context API
        +React Query
        +ThemeContext
        +AuthContext
        +CityContext
    }
    
    class BackendAPI {
        +Express Server
        +Authentication
        +Rate Limiting
        +CORS Middleware
        +Health Checks
        +WebSocket Support
    }
    
    class VercelFunctions {
        +Notices API
        +Analytics Proxy
        +Health Endpoint
        +Debug Tools
    }
    
    class Database {
        +PostgreSQL
        +Supabase Auth
        +Row Level Security
        +Real-time subscriptions
    }
    
    class Redis {
        +Session Storage
        +Caching Layer
        +Rate Limiting
    }
    
    class AnalyticsService {
        +Python Flask
        +ML Models
        +Predictive Analytics
        +Data Processing
    }
    
    class IoTSimulation {
        +Sensor Simulation
        +Data Generation
        +API Client
        +Real-time Updates
    }
    
    class BlockchainService {
        +Solana Integration
        +Smart Contracts
        +Anchor Framework
        +Transaction Processing
    }
    
    Frontend --> BackendAPI : HTTP/WebSocket
    Frontend --> VercelFunctions : API Calls
    BackendAPI --> Database : SQL Queries
    BackendAPI --> Redis : Caching
    BackendAPI --> AnalyticsService : Analytics Requests
    BackendAPI --> BlockchainService : Blockchain Operations
    IoTSimulation --> BackendAPI : Sensor Data
    AnalyticsService --> Database : Data Analysis
    VercelFunctions --> Database : Supabase Client
```

### 2. Database Entity Relationships

```mermaid
erDiagram
    User {
        uuid id PK
        string email
        string password_hash
        string first_name
        string last_name
        string role
        timestamp created_at
        timestamp updated_at
        boolean is_active
    }
    
    SensorData {
        uuid id PK
        string sensor_id
        string sensor_type
        json data
        float latitude
        float longitude
        timestamp timestamp
        string status
    }
    
    Alert {
        uuid id PK
        string title
        text description
        string severity
        string category
        string status
        uuid user_id FK
        timestamp created_at
        timestamp resolved_at
        json metadata
    }
    
    Notice {
        uuid id PK
        string title
        text content
        string category
        string priority
        uuid author_id FK
        timestamp created_at
        timestamp updated_at
        boolean is_published
        json tags
    }
    
    EmergencyService {
        uuid id PK
        string service_type
        string status
        uuid requester_id FK
        json location
        text description
        timestamp requested_at
        timestamp responded_at
        string priority
    }
    
    BlockchainTransaction {
        uuid id PK
        string transaction_hash
        string transaction_type
        json data
        string status
        timestamp created_at
        string solana_signature
    }
    
    User ||--o{ Alert : creates
    User ||--o{ Notice : authors
    User ||--o{ EmergencyService : requests
    SensorData ||--o{ Alert : triggers
    Alert ||--o{ BlockchainTransaction : records
```

### 3. Component Interaction (UML)

```mermaid
graph TB
    subgraph "Client Layer"
        A[React Frontend]
        B[Mobile App]
    end
    
    subgraph "API Gateway"
        C[Vercel Functions]
        D[Backend API Server]
    end
    
    subgraph "Service Layer"
        E[Authentication Service]
        F[Analytics Service]
        G[IoT Data Service]
        H[Emergency Service]
        I[Blockchain Service]
    end
    
    subgraph "Data Layer"
        J[(PostgreSQL)]
        K[(Redis Cache)]
        L[Supabase Storage]
    end
    
    subgraph "External Systems"
        M[IoT Sensors]
        N[Solana Blockchain]
        O[Payment Gateway]
    end
    
    A --> C
    A --> D
    B --> C
    B --> D
    
    C --> E
    C --> F
    D --> E
    D --> F
    D --> G
    D --> H
    D --> I
    
    E --> J
    E --> K
    F --> J
    G --> J
    G --> K
    H --> J
    I --> N
    
    M --> G
    I --> N
    H --> O
    
    F --> L
    G --> L
```

### 4. Request Flow Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant API as Backend API
    participant DB as Database
    participant A as Analytics
    participant IoT as IoT Service
    participant BC as Blockchain
    
    Note over U,BC: Citizen Service Request Flow
    
    U->>F: Submit Emergency Request
    F->>API: POST /api/emergency-services
    API->>DB: Validate user & store request
    DB-->>API: Request ID
    API->>A: Trigger predictive analysis
    A->>DB: Query historical data
    DB-->>A: Historical patterns
    A-->>API: Risk assessment
    API->>BC: Record transaction
    BC-->>API: Transaction hash
    API-->>F: Request confirmation
    F-->>U: Show request status
    
    Note over U,BC: IoT Data Processing Flow
    
    IoT->>API: POST /api/sensors/data
    API->>DB: Store sensor data
    API->>A: Process for anomalies
    A->>DB: Query thresholds
    DB-->>A: Alert rules
    A-->>API: Alert if threshold exceeded
    API->>DB: Create alert record
    API->>F: WebSocket notification
    F-->>U: Real-time alert display
    
    Note over U,BC: Analytics Dashboard Flow
    
    U->>F: Request dashboard data
    F->>API: GET /api/analytics/dashboard
    API->>A: Request processed metrics
    A->>DB: Aggregate sensor data
    DB-->>A: Aggregated results
    A-->>API: Formatted metrics
    API-->>F: Dashboard data
    F-->>U: Render visualizations
```

### 5. Deployment Architecture

```mermaid
graph TB
    subgraph "Production Environment"
        subgraph "Vercel Platform"
            VF[Vercel Functions]
            VS[Static Assets]
        end
        
        subgraph "Supabase Platform"
            SDB[(PostgreSQL)]
            SA[Supabase Auth]
            SS[Supabase Storage]
        end
        
        subgraph "Container Infrastructure"
            subgraph "Docker Compose"
                BE[Backend Service]
                AN[Analytics Service]
                IOT[IoT Simulation]
                RD[(Redis)]
            end
        end
        
        subgraph "Blockchain Network"
            SOL[Solana Mainnet/Devnet]
        end
    end
    
    subgraph "Development Environment"
        subgraph "Local Docker"
            LBE[Backend Container]
            LAN[Analytics Container]
            LIOT[IoT Container]
            LDB[(Local PostgreSQL)]
            LRD[(Local Redis)]
        end
    end
    
    subgraph "CI/CD Pipeline"
        GH[GitHub Repository]
        GHA[GitHub Actions]
        VD[Vercel Deployment]
    end
    
    subgraph "Monitoring & Logging"
        LOG[Application Logs]
        MON[Health Monitoring]
        ALT[Alert System]
    end
    
    VS --> VF
    VF --> SDB
    VF --> SA
    BE --> SDB
    BE --> RD
    AN --> SDB
    IOT --> BE
    BE --> SOL
    
    GH --> GHA
    GHA --> VD
    VD --> VF
    
    BE --> LOG
    AN --> LOG
    VF --> MON
    MON --> ALT
    
    LBE --> LDB
    LBE --> LRD
    LAN --> LDB
    LIOT --> LBE
```

### 6. Sensor Data Flow Pipeline

```mermaid
flowchart TD
    subgraph "IoT Layer"
        S1[Temperature Sensors]
        S2[Air Quality Sensors]
        S3[Traffic Sensors]
        S4[Noise Level Sensors]
        S5[Water Quality Sensors]
    end
    
    subgraph "Data Ingestion"
        SIM[IoT Simulation Service]
        API[Sensor Data API]
        VAL[Data Validation]
    end
    
    subgraph "Processing Pipeline"
        QUEUE[Message Queue]
        PROC[Data Processor]
        ENRICH[Data Enrichment]
        NORM[Normalization]
    end
    
    subgraph "Storage & Analytics"
        DB[(Time Series DB)]
        CACHE[(Redis Cache)]
        ML[ML Processing]
        PRED[Predictive Models]
    end
    
    subgraph "Alert System"
        RULES[Alert Rules Engine]
        NOTIF[Notification Service]
        DASH[Real-time Dashboard]
    end
    
    S1 --> SIM
    S2 --> SIM
    S3 --> SIM
    S4 --> SIM
    S5 --> SIM
    
    SIM --> API
    API --> VAL
    VAL --> QUEUE
    
    QUEUE --> PROC
    PROC --> ENRICH
    ENRICH --> NORM
    
    NORM --> DB
    NORM --> CACHE
    DB --> ML
    ML --> PRED
    
    PRED --> RULES
    RULES --> NOTIF
    NOTIF --> DASH
    
    CACHE --> DASH
```

## System Components

### Frontend (React Application)
- **Location**: `frontend/`
- **Technology**: React 18, React Router, Tailwind CSS
- **State Management**: Context API for Auth/Theme/City, React Query for data fetching
- **Features**: 
  - Dark/Light theme with localStorage persistence
  - Responsive design for mobile and desktop
  - Real-time updates via WebSocket
  - Interactive dashboards and visualizations

### Backend Services

#### Main API Server
- **Location**: `backend/`
- **Technology**: Node.js with Express
- **Features**:
  - RESTful API endpoints
  - WebSocket support for real-time updates
  - JWT-based authentication
  - Rate limiting and security middleware
  - Health monitoring endpoints

#### Vercel Functions
- **Location**: `api/`
- **Purpose**: Serverless endpoints for specific features
- **Endpoints**:
  - `/api/notices` - Notice management
  - `/api/health` - Health checks
  - `/api/analytics` - Analytics proxy
  - `/api/[[...slug]]` - Dynamic routing

### Data Layer

#### Primary Database (Supabase/PostgreSQL)
- **Purpose**: Main data storage with built-in auth
- **Features**:
  - Row Level Security (RLS)
  - Real-time subscriptions
  - Built-in authentication
  - RESTful API generation

#### Caching Layer (Redis)
- **Purpose**: Session storage and performance optimization
- **Use Cases**:
  - User session management
  - API response caching
  - Rate limiting counters
  - Real-time data buffering

### Analytics Service
- **Location**: `analytics/`
- **Technology**: Python with Flask
- **Capabilities**:
  - Machine learning model inference
  - Predictive analytics for city planning
  - Anomaly detection in sensor data
  - Statistical analysis and reporting

### IoT Integration
- **Location**: `iot-simulation/`
- **Purpose**: Simulate and manage IoT sensor data
- **Features**:
  - Multi-sensor type simulation
  - Configurable data generation patterns
  - Real-time data streaming
  - Geographic distribution simulation

### Blockchain Integration
- **Location**: `blockchain/` and `anchor_project/`
- **Technology**: Solana blockchain with Anchor framework
- **Use Cases**:
  - Transparent governance voting
  - Immutable audit trails
  - Smart contract automation
  - Decentralized identity management

## Key Data Flows

### 1. Citizen Service Request
1. User submits request via frontend
2. Frontend validates and sends to API
3. API authenticates user and stores request
4. Analytics service assesses priority and resource allocation
5. Blockchain records transaction for transparency
6. Real-time updates sent to relevant stakeholders

### 2. IoT Data Processing
1. Sensors generate data (simulated or real)
2. IoT service validates and normalizes data
3. Data stored in time-series optimized format
4. Analytics service processes for anomalies
5. Alerts generated based on predefined rules
6. Dashboard updated with real-time visualizations

### 3. Emergency Response
1. Emergency detected (manual report or sensor trigger)
2. System prioritizes based on severity and location
3. Appropriate services automatically notified
4. Resource allocation optimized using predictive models
5. Response tracked and recorded on blockchain
6. Citizens updated via multiple channels

## Deployment Strategies

### Production Deployment
- **Frontend**: Vercel static hosting with CDN
- **API Functions**: Vercel serverless functions
- **Database**: Supabase managed PostgreSQL
- **Analytics**: Containerized Python service
- **Monitoring**: Integrated logging and health checks

### Development Environment
- **Local Setup**: Docker Compose for full stack
- **Database**: Local PostgreSQL container
- **Services**: Hot-reload enabled containers
- **Testing**: Automated test suites for all components

### Scaling Considerations
- **Horizontal Scaling**: Containerized services can be replicated
- **Database Scaling**: Read replicas and connection pooling
- **Caching Strategy**: Multi-layer caching with Redis
- **CDN Integration**: Static asset optimization
- **Load Balancing**: Service mesh for microservices communication

## Security Architecture

### Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- API key management for service-to-service communication
- OAuth integration for third-party services

### Data Protection
- Encryption at rest and in transit
- Row-level security in database
- Input validation and sanitization
- Rate limiting and DDoS protection

### Blockchain Security
- Multi-signature wallet integration
- Smart contract auditing
- Secure key management
- Transaction verification protocols

## Monitoring & Observability

### Application Monitoring
- Health check endpoints for all services
- Performance metrics collection
- Error tracking and alerting
- User activity analytics

### Infrastructure Monitoring
- Container resource utilization
- Database performance metrics
- Network latency monitoring
- Storage capacity tracking

### Business Intelligence
- Citizen engagement metrics
- Service efficiency analytics
- Resource utilization reports
- Predictive maintenance insights

