# 🔗 Frontend-Backend Integration Guide

## ✅ Integration Complete!

Your Affluence frontend is now connected to the FastAPI backend. Here's everything you need to know.

---

## 📁 JavaScript Files Created

All API integration files have been created in the `/js` folder:

1. **`api.js`** - Core API client and helper functions
2. **`login.js`** - Login page integration
3. **`register.js`** - Registration page integration
4. **`dashboard.js`** - Dashboard data loading
5. **`tasks.js`** - Tasks management
6. **`profile.js`** - Profile and settings
7. **`withdraw.js`** - Withdrawal functionality
8. **`top-earners.js`** - Leaderboard display
9. **`loans.js`** - Loan applications
10. **`streaming.js`** - Music streaming integration

---

## 🔧 How to Add Scripts to HTML Pages

Add these script tags to your HTML files **before the closing `</body>` tag**:

### **1. login.html**
```html
    <script src="js/api.js"></script>
    <script src="js/login.js"></script>
</body>
```

### **2. register.html**
```html
    <script src="js/api.js"></script>
    <script src="js/register.js"></script>
</body>
```

### **3. dashboard.html**
```html
    <script src="js/api.js"></script>
    <script src="js/dashboard.js"></script>
</body>
```

### **4. tasks.html**
```html
    <script src="js/api.js"></script>
    <script src="js/tasks.js"></script>
</body>
```

### **5. profile.html**
```html
    <script src="js/api.js"></script>
    <script src="js/profile.js"></script>
</body>
```

### **6. withdraw.html**
```html
    <script src="js/api.js"></script>
    <script src="js/withdraw.js"></script>
</body>
```

### **7. top-earners.html**
```html
    <script src="js/api.js"></script>
    <script src="js/top-earners.js"></script>
</body>
```

### **8. loans.html**
```html
    <script src="js/api.js"></script>
    <script src="js/loans.js"></script>
</body>
```

### **9. streaming.html**
```html
    <script src="js/api.js"></script>
    <script src="js/streaming.js"></script>
</body>
```

---

## 🚀 Testing the Integration

### **Step 1: Start Backend Server**

```bash
cd backend
run.bat  # Windows
# or
./run.sh  # Linux/Mac
```

Backend will run at: **http://localhost:8000**

### **Step 2: Start Frontend Server**

You can use any of these methods:

**Option A: Live Server (VS Code Extension)**
- Install "Live Server" extension
- Right-click `index.html` > Open with Live Server

**Option B: Python HTTP Server**
```bash
python -m http.server 5500
```

**Option C: Node.js HTTP Server**
```bash
npx http-server -p 5500
```

Frontend will run at: **http://localhost:5500**

### **Step 3: Test the Flow**

1. **Register** a new user at `/register.html`
2. **Login** at `/login.html`
3. View **Dashboard** at `/dashboard.html`
4. Take **Tasks** at `/tasks.html`
5. Check **Top Earners** at `/top-earners.html`

---

## 🎯 Required HTML Updates

### **Add IDs to Form Elements**

Make sure your HTML forms have these IDs:

#### **login.html**
```html
<form id="loginForm">
    <input type="text" id="username" required>
    <input type="password" id="password" required>
    <button type="submit">Login</button>
</form>
```

#### **register.html**
```html
<form id="registerForm">
    <input type="text" id="username" required>
    <input type="email" id="email" required>
    <input type="text" id="fullName" required>
    <input type="tel" id="phone">
    <input type="password" id="password" required>
    <input type="password" id="confirmPassword" required>
    <input type="text" id="referralCode">
    <input type="text" id="couponCode">
    <button type="submit">Register</button>
</form>
```

#### **dashboard.html**
```html
<!-- Balance Cards -->
<div id="totalBalance">0</div>
<div id="activityBalance">0</div>
<div id="referralBalance">0</div>

<!-- Stats -->
<div id="totalEarned">0</div>
<div id="totalTasks">0</div>
<div id="totalReferrals">0</div>
<div id="pendingWithdrawals">0</div>

<!-- Referral Link -->
<input type="text" id="referralLink" readonly>
<button id="copyReferralLink">Copy</button>
```

#### **tasks.html**
```html
<div id="tasksContainer">
    <!-- Tasks will be loaded here dynamically -->
</div>
```

#### **profile.html**
```html
<!-- Account Form -->
<form id="accountForm">
    <input type="text" id="profileUsername" readonly>
    <input type="email" id="profileEmail" required>
    <input type="text" id="profileFullName" required>
    <input type="tel" id="profilePhone">
    <button type="submit">Update Profile</button>
</form>

<!-- Bank Form -->
<form id="bankForm">
    <input type="text" id="bankName" required>
    <input type="text" id="accountName" required>
    <input type="text" id="accountNumber" required>
    <button type="submit">Update Bank Details</button>
</form>

<!-- Password Form -->
<form id="passwordForm">
    <input type="password" id="currentPassword" required>
    <input type="password" id="newPassword" required>
    <input type="password" id="confirmNewPassword" required>
    <button type="submit">Change Password</button>
</form>
```

#### **withdraw.html**
```html
<form id="withdrawalForm">
    <input type="number" id="withdrawalAmount" min="1000" required>
    <select id="balanceType" required>
        <option value="activity">Activity Balance</option>
        <option value="referral">Referral Balance</option>
        <option value="total">Total Balance</option>
    </select>
    <button type="submit">Request Withdrawal</button>
</form>

<div id="withdrawalHistory">
    <!-- History will be loaded here -->
</div>
```

#### **top-earners.html**
```html
<table>
    <tbody id="leaderboardBody">
        <!-- Leaderboard will be loaded here -->
    </tbody>
</table>
```

---

## 🔒 Authentication Flow

### **How It Works:**

1. User registers → Account created in database
2. User logs in → Receives JWT token
3. Token stored in localStorage
4. All API requests include token in Authorization header
5. Token expires after 7 days (configurable)

### **Protected Pages:**

These pages require authentication:
- dashboard.html
- tasks.html
- profile.html
- withdraw.html
- top-earners.html
- streaming.html
- loans.html

If user is not logged in, they'll be redirected to `/login.html`

---

## 📡 API Endpoints Being Used

### **Auth**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### **Users**
- `GET /api/users/me` - Get profile
- `PUT /api/users/me` - Update profile
- `POST /api/users/me/change-password` - Change password
- `PUT /api/users/me/bank-details` - Update bank
- `GET /api/users/dashboard` - Get stats
- `GET /api/users/top-earners` - Get leaderboard

### **Tasks**
- `GET /api/tasks/` - Get all tasks
- `GET /api/tasks/my-tasks` - Get user tasks
- `POST /api/tasks/{id}/take` - Take task
- `POST /api/tasks/{id}/claim` - Claim reward

### **Withdrawals**
- `POST /api/withdrawals/` - Create withdrawal
- `GET /api/withdrawals/` - Get history

### **Loans**
- `POST /api/loans/` - Apply for loan
- `GET /api/loans/` - Get history

### **Streaming**
- `GET /api/streams/audios` - Get audio tracks
- `POST /api/streams/start` - Start streaming
- `PUT /api/streams/{id}/update` - Update progress
- `POST /api/streams/{id}/claim` - Claim reward

---

## 🎨 Helper Functions Available

These functions are available globally from `api.js`:

```javascript
// Currency formatting
formatCurrency(1500) // Returns: ₦1,500

// Date formatting
formatDate('2024-01-15T10:30:00') // Returns: Jan 15, 2024, 10:30 AM

// Toast notifications
showToast('Success message', 'success')
showToast('Error message', 'error')
showToast('Info message', 'info')

// Check authentication
api.isAuthenticated() // Returns: true/false

// Get current token
api.getToken() // Returns: JWT token or null

// Logout user
api.logout() // Removes token and redirects to login
```

---

## 🐛 Common Issues & Solutions

### **Issue: CORS Error**

**Error:** `Access to fetch has been blocked by CORS policy`

**Solution:** Make sure backend `.env` has:
```env
CORS_ORIGINS=http://localhost:5500,http://127.0.0.1:5500
```

### **Issue: 401 Unauthorized**

**Error:** `Could not validate credentials`

**Solution:** 
- User needs to login again
- Token might have expired
- Check localStorage for `affluence_token`

### **Issue: Network Error**

**Error:** `Failed to fetch`

**Solution:**
- Make sure backend is running on port 8000
- Check if API_BASE_URL in `api.js` is correct
- Verify firewall/antivirus isn't blocking

### **Issue: Elements Not Updating**

**Problem:** Data not appearing on page

**Solution:**
- Check browser console for errors
- Verify HTML element IDs match JavaScript
- Check if API is returning data (use /docs)

---

## ✅ Final Checklist

- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:5500
- [ ] All script tags added to HTML files
- [ ] HTML form elements have correct IDs
- [ ] MySQL database created and initialized
- [ ] CORS_ORIGINS configured in .env
- [ ] Sample data seeded (optional)
- [ ] Can register a new user
- [ ] Can login successfully
- [ ] Dashboard loads data
- [ ] Can take and claim tasks
- [ ] Profile updates work
- [ ] Withdrawals can be requested

---

## 🎉 You're Ready!

Your Affluence platform is now fully integrated! 

**Next Steps:**
1. Add the script tags to all HTML files
2. Test registration and login
3. Test all features thoroughly
4. Customize styling as needed
5. Deploy to production when ready

Need help? Check the browser console (F12) for error messages!
