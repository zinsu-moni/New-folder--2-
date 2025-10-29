# 🚀 Quick Start Guide - Affluence Platform

## ✅ Prerequisites
- Python 3.11+ installed
- Internet connection (for first-time package installation)

---

## 🎯 Option 1: Quick Start (Recommended)

### Start Backend Server:
```bash
cd backend
start.bat
```
**OR** if start.bat doesn't work:
```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Start Frontend Server (in a new terminal):
```bash
python serve_frontend.py
```

---

## 🎯 Option 2: Start Everything at Once

Run from the Affluence directory:
```bash
start_all.bat
```

---

## 🌐 Access Your Application

Once both servers are running:

### User Pages:
- **Homepage**: http://localhost:3000/index.html
- **Register**: http://localhost:3000/register.html
- **Login**: http://localhost:3000/login.html
- **Dashboard**: http://localhost:3000/dashboard.html
- **Tasks**: http://localhost:3000/tasks.html
- **Withdrawals**: http://localhost:3000/withdraw.html
- **Loans**: http://localhost:3000/loans.html
- **Streaming**: http://localhost:3000/streaming.html
- **Profile**: http://localhost:3000/profile.html

### Admin Pages:
- **Admin Login**: http://localhost:3000/admin-login.html
- **Admin Dashboard**: http://localhost:3000/admin-dashboard.html
- **User Management**: http://localhost:3000/admin-users.html
- **Coupons**: http://localhost:3000/admin-coupons.html
- **Articles**: http://localhost:3000/admin-articles.html
- **Cards**: http://localhost:3000/admin-cards.html
- **Withdrawals**: http://localhost:3000/admin-withdrawals.html
- **Announcements**: http://localhost:3000/admin-announcements.html
- **System Logs**: http://localhost:3000/admin-logs.html

### API:
- **API Docs (Swagger)**: http://localhost:8000/docs
- **API Docs (ReDoc)**: http://localhost:8000/redoc
- **API Base**: http://localhost:8000/api

---

## 📊 Database

**Current Setup**: SQLite (Local)
- **Database File**: `backend/affluence.db`
- **Tables**: 18 tables created automatically
- **Test Connection**: `python test_db_connection.py`

**To switch to PostgreSQL** (when available):
1. Edit `backend/.env`
2. Uncomment the PostgreSQL DATABASE_URL line
3. Comment out the SQLite DATABASE_URL line
4. Restart the backend server

---

## 🔧 Common Commands

### Backend:
```bash
# Start backend
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Initialize/Reset database
python init_db.py

# Test database connection
cd ..
python test_db_connection.py
```

### Frontend:
```bash
# Start frontend server
python serve_frontend.py
```

### Testing:
```bash
# Test API connection
# Open browser: http://localhost:3000/test-connection.html
```

---

## 👤 First Time Setup

### 1. Register a User:
- Go to: http://localhost:3000/register.html
- Create your account

### 2. Make Yourself Admin (Optional):
You need to manually update the database to make a user an admin:

**Option A - Using Python:**
```python
# In backend directory
python
>>> from app.database import SessionLocal
>>> from app.models.user import User
>>> from app.models.user import UserRole
>>> db = SessionLocal()
>>> user = db.query(User).filter(User.username == "your_username").first()
>>> user.role = UserRole.ADMIN
>>> db.commit()
>>> exit()
```

**Option B - Create Admin Script:**
We can create a script to promote a user to admin.

### 3. Login:
- **User Login**: http://localhost:3000/login.html
- **Admin Login**: http://localhost:3000/admin-login.html

---

## ⚠️ Troubleshooting

### Backend won't start:
- **Error: "Could not import module 'main'"**
  - Make sure you're in the `backend` directory
  - Use: `python -m uvicorn app.main:app --reload`
  - NOT: `uvicorn main:app --reload`

- **Error: "Database connection failed"**
  - Check `backend/.env` file exists
  - Run: `python test_db_connection.py`
  - Verify DATABASE_URL is set correctly

### Frontend won't start:
- **Error: "Port 3000 already in use"**
  - Edit `serve_frontend.py` and change PORT to 5500 or 8080
  - Or kill the process using port 3000

### API not responding:
- Make sure backend is running on port 8000
- Check browser console for CORS errors
- Verify `backend/.env` has correct CORS_ORIGINS

---

## 📝 Default Database Settings

**Database Type**: SQLite
**Location**: `backend/affluence.db`

**Tables Created**:
1. users
2. balances
3. bank_details
4. tasks
5. user_tasks
6. withdrawals
7. loans
8. streams
9. transactions
10. notifications
11. coupons
12. articles
13. user_articles
14. cards
15. card_purchases
16. announcements
17. audios
18. system_logs

---

## 🔐 Security Notes

- Default SECRET_KEY in `.env` should be changed for production
- Admin access requires manual database update initially
- All passwords are hashed with bcrypt
- JWT tokens expire after 7 days (configurable in `.env`)

---

## 📞 Need Help?

- Check API documentation at http://localhost:8000/docs
- Review system logs in admin panel
- Check browser console (F12) for frontend errors
- Check terminal output for backend errors

---

**Happy coding! 🎉**
