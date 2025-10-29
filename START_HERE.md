# 🚀 Quick Start - Connect Frontend to Backend

## Step 1: Install Backend Dependencies

Open terminal in the `backend` folder:

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## Step 2: Initialize Database

```bash
# Still in backend folder with venv activated
python init_db.py
```

You should see: ✅ Database tables created successfully!

## Step 3: Seed Sample Data (Optional but Recommended)

```bash
python seed_db.py
```

This adds sample tasks and audio tracks.

## Step 4: Start Backend Server

```bash
# Option 1: Use the run script
run.bat

# Option 2: Manual start
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will run at: **http://localhost:8000**

Check if it's working: Open http://localhost:8000/docs

## Step 5: Add Scripts to HTML Files

You need to add these script tags before `</body>` in each HTML file:

### login.html
Add at the end, before `</body>`:
```html
    <script src="js/api.js"></script>
    <script src="js/login.js"></script>
</body>
```

### register.html
```html
    <script src="js/api.js"></script>
    <script src="js/register.js"></script>
</body>
```

### dashboard.html
```html
    <script src="js/api.js"></script>
    <script src="js/dashboard.js"></script>
</body>
```

### tasks.html
```html
    <script src="js/api.js"></script>
    <script src="js/tasks.js"></script>
</body>
```

### profile.html
```html
    <script src="js/api.js"></script>
    <script src="js/profile.js"></script>
</body>
```

### withdraw.html
```html
    <script src="js/api.js"></script>
    <script src="js/withdraw.js"></script>
</body>
```

### top-earners.html
```html
    <script src="js/api.js"></script>
    <script src="js/top-earners.js"></script>
</body>
```

### loans.html
```html
    <script src="js/api.js"></script>
    <script src="js/loans.js"></script>
</body>
```

### streaming.html
```html
    <script src="js/api.js"></script>
    <script src="js/streaming.js"></script>
</body>
```

## Step 6: Start Frontend Server

Open a NEW terminal (keep backend running):

```bash
# Go to main Affluence folder
cd c:\Users\zinsu\Desktop\Affluence

# Start server with Python
python -m http.server 5500
```

Or use VS Code Live Server extension.

## Step 7: Test Everything

1. Open: **http://localhost:5500/test-api.html**
2. Click "Check Server" - should show ✅ Online
3. Click "Register" to create a test account
4. Click "Login" to login
5. Test other endpoints

## Step 8: Use the App

1. Go to: **http://localhost:5500/register.html**
2. Register a new account
3. Login at: **http://localhost:5500/login.html**
4. You'll be redirected to the dashboard
5. Try all features!

---

## ✅ Checklist

- [ ] Backend dependencies installed
- [ ] Database initialized
- [ ] Sample data seeded
- [ ] Backend running on port 8000
- [ ] Script tags added to HTML files
- [ ] Frontend running on port 5500
- [ ] test-api.html shows server online
- [ ] Can register and login
- [ ] Dashboard loads data

---

## 🐛 Troubleshooting

**Backend won't start?**
- Check if port 8000 is available
- Make sure venv is activated
- Check .env file has correct database URL

**Frontend can't connect?**
- Check backend is running
- Check console (F12) for errors
- Verify CORS_ORIGINS in .env includes your frontend URL

**Database errors?**
- Make sure PostgreSQL connection is working
- Check DATABASE_URL in .env
- Try running init_db.py again

---

## 📱 Quick Commands

```bash
# Start Backend
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload

# Start Frontend (new terminal)
cd c:\Users\zinsu\Desktop\Affluence
python -m http.server 5500
```

You're all set! 🎉
