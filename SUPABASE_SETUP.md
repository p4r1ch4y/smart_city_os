# Smart City OS - Supabase Migration Guide

## Overview

This guide will help you migrate the Smart City OS from PostgreSQL + JWT authentication to Supabase with Indian cultural theming.

## 🚀 Quick Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a project name: `smart-city-os-india`
3. Set a strong database password
4. Select a region closest to your users (Asia Pacific for India)

### 2. Database Setup

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy and paste the contents of `database/supabase-schema.sql`
3. Run the SQL to create all tables, policies, and sample data

### 3. Environment Configuration

#### Frontend (.env)
```bash
# Copy from frontend/.env.example
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_ANALYTICS_URL=http://localhost:5000
REACT_APP_BLOCKCHAIN_URL=http://localhost:3000/api/blockchain
REACT_APP_APP_NAME=Smart City OS
REACT_APP_THEME=indian
```

#### Backend (.env)
```bash
# Copy from backend/.env.example
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3001
```

### 4. Get Supabase Keys

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (backend only)

### 5. Authentication Setup

1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Configure **Site URL**: `http://localhost:3001`
3. Add **Redirect URLs**:
   - `http://localhost:3001/dashboard`
   - `http://localhost:3001/login`
4. Enable **Email** provider
5. Optional: Configure **Google** or other OAuth providers

### 6. Row Level Security (RLS)

The schema automatically enables RLS policies. Key policies include:

- **Users**: Can view/edit own profile, admins can view all
- **Sensors**: Authenticated users can view, operators+ can manage
- **Alerts**: Authenticated users can view, operators+ can manage
- **Sensor Data**: Public read, system write access

## 🎨 Indian Cultural Theme

### Design Features

- **Colors**: Saffron orange, Indian green, navy blue inspired by Indian flag
- **Typography**: Clean, modern fonts with Hindi text elements
- **Gradients**: Tricolor and heritage-inspired gradients
- **Cultural Elements**: Mandala patterns, paisley accents, cultural shadows

### Theme Components

- `frontend/src/styles/indian-theme.css` - Complete color system
- Updated landing page with Indian cultural messaging
- Hindi text elements: "भारत डिजिटल शहर" (Digital India City)
- Cultural badges and modern Indian aesthetics

## 🔧 Migration Features

### Database Migration
- ✅ Complete Supabase schema with RLS policies
- ✅ User management with role-based access
- ✅ Sensor and alert management
- ✅ Real-time subscriptions
- ✅ Sample data for immediate testing

### Authentication Migration
- ✅ Supabase Auth integration
- ✅ JWT token management
- ✅ User profile management
- ✅ Role-based permissions
- ✅ Session persistence

### API Migration
- ✅ Supabase client integration
- ✅ Real-time subscriptions replace Socket.IO
- ✅ CRUD operations for all entities
- ✅ Error handling and fallbacks
- ✅ Mock data for offline development

### UI/UX Migration
- ✅ Indian cultural color scheme
- ✅ Modern component styling
- ✅ Cultural elements and patterns
- ✅ Professional government-ready design
- ✅ Accessibility considerations

## 🚀 Running the Application

### 1. Install Dependencies
```bash
# Frontend
cd frontend && npm install

# Backend
cd backend && npm install

# Analytics (optional)
cd analytics && pip install -r requirements.txt
```

### 2. Start Services
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm start

# Terminal 3: Analytics (optional)
cd analytics && python app.py
```

### 3. Access Application
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **Analytics**: http://localhost:5000

## 🧪 Testing

### Demo Credentials
The system includes sample users:
- **Admin**: admin@smartcity.gov.in
- **Operator**: operator@smartcity.gov.in
- **Manager**: manager@smartcity.gov.in

### Test Features
1. **Authentication**: Login/logout, profile management
2. **Real-time Data**: Sensor updates, alerts
3. **Dashboard**: Analytics, charts, maps
4. **CRUD Operations**: Sensors, alerts management
5. **Responsive Design**: Mobile, tablet, desktop

## 🔍 Troubleshooting

### Common Issues

1. **Supabase Connection Failed**
   - Verify project URL and keys
   - Check network connectivity
   - Ensure RLS policies are set correctly

2. **Authentication Issues**
   - Verify redirect URLs in Supabase
   - Check email provider settings
   - Ensure user exists in database

3. **Real-time Not Working**
   - Check Supabase real-time settings
   - Verify table permissions
   - Enable real-time for tables

4. **Styling Issues**
   - Ensure indian-theme.css is imported
   - Check CSS variable definitions
   - Verify Tailwind CSS classes

### Development Mode

For development without Supabase:
- The app includes fallback mock data
- Real-time simulation with intervals
- All features work offline

## 📚 Documentation

### Key Files
- `frontend/src/lib/supabase.js` - Supabase client and helpers
- `frontend/src/services/supabaseApi.js` - API service layer
- `frontend/src/contexts/AuthContext.js` - Authentication context
- `frontend/src/contexts/SocketContext.js` - Real-time context
- `database/supabase-schema.sql` - Database schema

### Architecture
- **Frontend**: React 18 + Supabase client
- **Backend**: Node.js + Supabase (optional for blockchain/analytics)
- **Database**: Supabase PostgreSQL with RLS
- **Real-time**: Supabase real-time subscriptions
- **Auth**: Supabase Auth with JWT

## 🌟 Production Deployment

### Supabase Production
1. Upgrade to Supabase Pro if needed
2. Configure custom domain
3. Set up proper CORS origins
4. Enable database backups
5. Monitor usage and performance

### Environment Variables
Update all environment variables for production:
- Use production Supabase URLs
- Set secure JWT secrets
- Configure proper CORS origins
- Enable production logging

## 🎯 Next Steps

1. **Customize Branding**: Update logos, colors, messaging
2. **Add Features**: Extend with city-specific requirements
3. **Integration**: Connect with existing city systems
4. **Monitoring**: Set up error tracking and analytics
5. **Security**: Review and enhance security policies

---

**Smart City OS** - Empowering Indian cities with modern technology while honoring cultural heritage.
