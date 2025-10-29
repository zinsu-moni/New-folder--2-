# 🚀 Affluence - Complete Setup Guide

## Quick Start

### Option 1: Start Everything at Once (Recommended)
```bash
start_all.bat
```
This will start both backend and frontend servers in separate windows.

### Option 2: Start Manually

#### Start Backend Server
```bash
cd backend
run.bat
```
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

#### Start Frontend Server
```bash
python serve_frontend.py
```
- Frontend: http://localhost:5500
- Login: http://localhost:5500/login.html
- Admin Panel: http://localhost:5500/admin-dashboard.html

## 📋 Prerequisites

1. **Python 3.11+** installed
2. **PostgreSQL Database** (already configured in `.env`)
3. **Internet connection** for installing dependencies

## 🔧 Configuration

### Backend Configuration (.env)
The backend is pre-configured with:
- PostgreSQL database connection
- CORS settings for frontend
- JWT authentication
- Admin panel routes

### Frontend Configuration
The frontend is configured to connect to:
- Backend API: `http://localhost:8000/api`
- All API calls use the correct endpoints

## 📁 Project Structure

```
Affluence/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── models/            # Database models
│   │   ├── routers/           # API endpoints
│   │   ├── schemas/           # Pydantic schemas
│   │   └── main.py           # FastAPI app
│   ├── .env                   # Environment variables
│   ├── requirements.txt       # Python dependencies
│   └── run.bat               # Backend startup script
│
├── js/                        # Frontend JavaScript
│   ├── api.js                # API client
│   ├── admin.js              # Admin panel functions
│   ├── login.js              # Login functionality
│   ├── register.js           # Registration
│   └── ...                   # Other page scripts
│
├── *.html                     # Frontend pages
├── serve_frontend.py          # Frontend server
└── start_all.bat             # Start everything

```

## 🎯 First Steps After Starting

1. **Register a new account**
   - Go to http://localhost:5500/register.html
   - Create your account

2. **Make yourself an admin** (in database or via script)
   ```python
   # Create a Python script or use init_db.py
   # Update user role to ADMIN
   ```

3. **Access Admin Panel**
   - Login at http://localhost:5500/login.html
   - Navigate to http://localhost:5500/admin-dashboard.html

## 🔐 Admin Panel Features

- **User Management**: View, edit, delete users and manage roles
- **Coupons**: Create and manage promotional coupons
- **Articles**: Create educational content for users
- **Cards**: Manage subscription cards/plans
- **Withdrawals**: Approve/reject withdrawal requests
- **Announcements**: Send notifications to users
- **System Logs**: View all admin actions

## 🌐 API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login
- GET `/api/auth/me` - Get current user

### User Features
- GET `/api/tasks` - Get available tasks
- POST `/api/tasks/{id}/claim` - Claim task reward
- POST `/api/withdrawals` - Request withdrawal
- GET `/api/loans` - Get loan offers
- POST `/api/streams` - Start streaming session

### Admin Features
- GET `/api/admin/users` - List all users
- PUT `/api/admin/users/{id}/role` - Change user role
- POST `/api/admin/coupons` - Create coupon
- GET `/api/admin/withdrawals` - View withdrawals
- PUT `/api/admin/withdrawals/{id}/approve` - Approve withdrawal
- GET `/api/admin/logs` - View system logs

## ⚠️ Troubleshooting

### Backend won't start
1. Check if port 8000 is available
2. Verify database connection in `.env`
3. Check backend terminal for error messages

### Frontend won't connect to backend
1. Ensure backend is running on port 8000
2. Check browser console for CORS errors
3. Verify API_CONFIG.BASE_URL in `js/api.js`

### Database errors
1. Verify DATABASE_URL in `backend/.env`
2. Check database is accessible
3. Run `python backend/init_db.py` to initialize tables

### CORS errors
- Already configured to allow localhost:5500
- If using different port, update `backend/.env` CORS_ORIGINS

## 📚 Documentation

- **API Documentation**: http://localhost:8000/docs (Interactive Swagger UI)
- **ReDoc**: http://localhost:8000/redoc (Alternative API docs)
- **Admin Guide**: See ADMIN_PANEL_DOCUMENTATION.md
- **Integration Guide**: See INTEGRATION_GUIDE.md

## 🔄 Development Workflow

1. Make changes to backend code
2. Backend auto-reloads (uvicorn --reload)
3. Make changes to frontend HTML/JS/CSS
4. Refresh browser to see changes

## 📝 Notes

- The backend uses SQLAlchemy 2.0 with async support
- Frontend uses vanilla JavaScript (no framework)
- Admin panel has role-based access control
- All passwords are hashed with bcrypt
- JWT tokens expire after 7 days

## 🆘 Support

If you encounter issues:
1. Check the terminal outputs for errors
2. Review the browser console (F12)
3. Check database connectivity
4. Verify all environment variables are set

---

**Happy developing! 🎉**
