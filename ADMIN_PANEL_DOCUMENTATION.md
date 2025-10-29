# Admin Panel System - Complete Documentation

## Overview
Complete three-tier role-based admin panel system for Affluence affiliate platform where users earn money by reading articles, referring others, and purchasing cards.

## System Architecture

### Roles
1. **ADMIN** - Full system access
   - Dashboard with complete statistics
   - User management (promote, demote, disable, delete)
   - Coupon generation and assignment
   - Article management (create, edit, publish, delete)
   - Card management (create, edit, delete)
   - Announcement system
   - Withdrawal approvals
   - System audit logs

2. **SUBADMIN (Vendor)** - Limited access for coupon vendors
   - View assigned coupons
   - Track coupon usage statistics
   - View referrals (users who used their coupons)
   - Vendor dashboard with statistics

3. **USER** - Regular platform users
   - Read articles to earn (activity_balance)
   - Refer others to earn (affiliate_balance)
   - Purchase cards for benefits (main_balance)
   - Withdraw earnings

## Database Models

### Admin Models (`backend/app/models/admin.py`)
- **Coupon** - Referral/registration coupons with tracking
  - `code` (unique)
  - `assigned_to` (vendor/sub-admin user_id)
  - `used_by` (user who used it)
  - `status` (UNUSED, USED, REVOKED)
  - `bonus_amount`
  - Timestamps: created_at, used_at, revoked_at

- **Article** - Reading tasks for users
  - `title`, `content`, `description`
  - `reward_amount`
  - `estimated_read_time` (seconds)
  - `is_published`
  - `read_count`
  - `author_id` (admin who created)

- **UserArticle** - User reading progress
  - `user_id`, `article_id`
  - `started_at`, `completed_at`
  - `time_spent` (seconds)
  - `is_completed`

- **Card** - Purchasable cards with benefits
  - `name`, `description`
  - `price` (cost to purchase)
  - `benefit_amount` (amount received)
  - `is_available`
  - `purchase_count`

- **CardPurchase** - Card purchase history
  - `user_id`, `card_id`
  - `purchase_price`, `benefit_received`
  - `purchased_at`

- **Announcement** - System-wide announcements
  - `title`, `content`
  - `is_active`
  - `created_by` (admin)

- **SystemLog** - Complete audit trail
  - `action` (role_changed, coupon_created, withdrawal_approved, etc.)
  - `description`
  - `performed_by` (admin user_id)
  - `target_user` (affected user_id, optional)
  - `metadata` (JSON for additional data)
  - `timestamp`

### Updated Models
- **User** - Added `role` column (USER, SUBADMIN, ADMIN)
- **Balance** - Changed from 3 to 4 balance types:
  - `main_balance` - From card purchases and initial bonus
  - `affiliate_balance` - From referrals (replaces referral_balance)
  - `activity_balance` - From articles, tasks, streams
  - `total_balance` - Sum of all balances

## API Endpoints

### Admin Endpoints (`/api/admin`)
```
GET    /dashboard                        - Dashboard stats
GET    /users                            - List all users (with filters)
GET    /users/{id}                       - User detailed stats
PUT    /users/{id}/role                  - Change user role
PUT    /users/{id}/status                - Enable/disable user
DELETE /users/{id}                       - Delete user

POST   /coupons                          - Create coupon
GET    /coupons                          - List coupons (with filters)
PUT    /coupons/{id}                     - Update coupon (assign/revoke)
DELETE /coupons/{id}                     - Delete coupon

POST   /articles                         - Create article
GET    /articles                         - List all articles
PUT    /articles/{id}                    - Update article
DELETE /articles/{id}                    - Delete article

POST   /cards                            - Create card
GET    /cards                            - List all cards
PUT    /cards/{id}                       - Update card
DELETE /cards/{id}                       - Delete card

POST   /announcements                    - Create announcement
GET    /announcements                    - List all announcements
PUT    /announcements/{id}               - Update announcement
DELETE /announcements/{id}               - Delete announcement

GET    /withdrawals                      - List withdrawal requests
PUT    /withdrawals/{id}/approve         - Approve/reject withdrawal

GET    /logs                             - System audit logs
```

### Sub-Admin Endpoints (`/api/subadmin`)
```
GET    /dashboard                        - Vendor statistics
GET    /coupons                          - My assigned coupons
GET    /coupons/{id}/stats               - Coupon usage stats
GET    /referrals                        - Users who used my coupons
```

### Article Endpoints (`/api/articles`)
```
GET    /                                 - Get published articles
GET    /{id}                             - Get article details
POST   /{id}/start                       - Start reading session
PUT    /{id}/progress                    - Update reading progress
POST   /{id}/complete                    - Complete & earn reward
GET    /my/completed                     - My completed articles
```

### Card Endpoints (`/api/cards`)
```
GET    /                                 - Get available cards
GET    /{id}                             - Get card details
POST   /{id}/purchase                    - Purchase card
GET    /my/purchases                     - My purchase history
```

### Announcement Endpoints (`/api/announcements`)
```
GET    /                                 - Get active announcements
```

## Request/Response Schemas

### Admin Schemas
```python
# Dashboard Stats
AdminDashboardStats:
  - total_users, total_subadmins, total_admins
  - total_earnings
  - total_articles_completed
  - pending_withdrawals
  - active_coupons, used_coupons

# User Management
UserRoleUpdate: { role: UserRole }
UserStatusUpdate: { is_active: bool }
UserDetailedStats: { user_id, username, full_name, email, role, 
                     main_balance, affiliate_balance, activity_balance, total_balance,
                     total_referrals, completed_articles, total_earned, 
                     pending_withdrawals, created_at }

# Coupon Management
CouponCreate: { code, assigned_to, bonus_amount }
CouponUpdate: { assigned_to?, status?, bonus_amount? }
CouponResponse: { id, code, assigned_to, used_by, status, bonus_amount, ... }

# Article Management
ArticleCreate: { title, content, description, reward_amount, estimated_read_time, is_published }
ArticleUpdate: { title?, content?, description?, reward_amount?, estimated_read_time?, is_published? }
ArticleResponse: { id, title, content, description, reward_amount, estimated_read_time, 
                   is_published, read_count, author_id, created_at, updated_at }

# Card Management
CardCreate: { name, description, price, benefit_amount, is_available }
CardUpdate: { name?, description?, price?, benefit_amount?, is_available? }
CardResponse: { id, name, description, price, benefit_amount, is_available, purchase_count, ... }

# Announcements
AnnouncementCreate: { title, content, is_active }
AnnouncementUpdate: { title?, content?, is_active? }
AnnouncementResponse: { id, title, content, is_active, created_by, created_at }

# Withdrawal Approval
WithdrawalApproval: { status: "approved" | "rejected", admin_note? }

# System Logs
SystemLogResponse: { id, action, description, performed_by, target_user, metadata, timestamp }
```

## Features Implemented

### 1. Admin Dashboard
- Real-time statistics
- User counts by role
- Total platform earnings
- Article completion metrics
- Pending withdrawals
- Coupon usage statistics

### 2. User Management
- Promote users to Sub-admin or Admin
- Demote Sub-admins/Admins to User
- Enable/disable user accounts
- Delete users with audit logging
- Detailed user statistics (earnings, referrals, articles completed)

### 3. Coupon System
- Generate unique coupon codes
- Assign coupons to vendors (Sub-admins)
- Track coupon usage (who used which code)
- Revoke coupons
- Automatic bonus on registration with coupon
- Users who register with vendor's coupon are tracked as referrals

### 4. Article System
- Create and publish articles
- Track article reading progress
- Time-based validation (users must spend minimum time)
- Automatic reward on completion (to activity_balance)
- View completed articles
- Track read counts per article

### 5. Card Purchase System
- Create cards with price and benefit
- Users purchase cards with main_balance
- Automatic benefit credit (profit = benefit - price)
- Purchase history tracking
- Enable/disable cards

### 6. Announcement System
- System-wide announcements
- Active/inactive status
- Visible to all users when active

### 7. Withdrawal Management
- View all withdrawal requests
- Filter by status (pending, approved, rejected)
- Approve or reject withdrawals
- Auto-refund on rejection (to main_balance)
- Admin notes for approval/rejection
- Audit logging

### 8. System Logging
- Complete audit trail
- Tracks all admin actions
- Role changes, coupon operations, article publishing, withdrawal approvals
- Metadata storage (JSON) for detailed information
- User targeting (who performed, who affected)

### 9. Vendor Lounge (Sub-admin)
- Dashboard with vendor statistics
- View assigned coupons
- Track coupon usage and conversion rate
- View referrals (users who registered with vendor's coupons)
- Coupon-level statistics

### 10. Balance System
Four separate balance types:
- **main_balance**: Card purchases, coupon bonuses, withdrawals
- **affiliate_balance**: Referral bonuses
- **activity_balance**: Article rewards, tasks, streaming
- **total_balance**: Sum of all (display only)

## Security Features

### Role-Based Access Control (RBAC)
```python
# Middleware functions
require_admin(current_user) - Only ADMIN role
require_subadmin(current_user) - SUBADMIN or ADMIN roles
get_current_active_user(current_user) - Any authenticated user
```

### Access Restrictions
- Admin endpoints require ADMIN role
- Sub-admin endpoints require SUBADMIN or ADMIN
- Article/Card endpoints require authentication
- System logs only accessible to admins
- Users can only access their own data

## Registration Flow

### With Coupon Code
1. User enters username, email, password, and coupon code
2. System validates coupon (exists, unused, not revoked)
3. User account created with coupon bonus in main_balance
4. Coupon marked as USED with user_id
5. Vendor (coupon owner) can see this user as referral

### With Referral Code
1. User enters referral code of existing user
2. System validates referral code
3. User account created
4. Referrer receives bonus in affiliate_balance

## Article Reading Flow

1. **Start Reading**
   - POST /articles/{id}/start
   - Creates UserArticle session
   - Returns session_id and expected reward

2. **Update Progress** (optional)
   - PUT /articles/{id}/progress
   - Tracks time spent
   - Can be called periodically from frontend

3. **Complete Article**
   - POST /articles/{id}/complete
   - Validates minimum reading time (30% of estimated)
   - Awards reward to activity_balance
   - Creates transaction record
   - Marks article as completed (can't earn again)

## Card Purchase Flow

1. **View Available Cards**
   - GET /cards
   - Shows price and benefit for each card

2. **Purchase Card**
   - POST /cards/{id}/purchase
   - Deducts price from main_balance
   - Adds benefit to main_balance
   - Net gain = benefit - price
   - Creates two transactions (debit purchase, credit benefit)
   - Records in CardPurchase table

## Withdrawal Approval Flow

1. **User Requests Withdrawal**
   - POST /api/withdrawals (existing endpoint)
   - Amount deducted from total_balance
   - Status: pending

2. **Admin Views Requests**
   - GET /api/admin/withdrawals
   - Filter by status

3. **Admin Approves/Rejects**
   - PUT /api/admin/withdrawals/{id}/approve
   - If approved: User receives money (external process)
   - If rejected: Amount refunded to main_balance
   - Creates audit log

## Next Steps

### Frontend Development Needed
1. Admin Dashboard HTML
2. User Management Page
3. Coupon Management Page
4. Article Management Page (CRUD)
5. Card Management Page (CRUD)
6. Withdrawal Approval Page
7. System Logs Viewer
8. Vendor Lounge Dashboard
9. Article Reading Page (with timer)
10. Card Purchase Page

### Backend Enhancements
1. Update other routers to use new balance structure
2. Add pagination to all list endpoints
3. Add search/filter functionality
4. Implement rate limiting
5. Add email notifications for approvals
6. Implement article categories/tags
7. Add coupon expiration dates
8. Add batch operations for admin

### Testing Required
1. Role-based access testing
2. Balance calculation verification
3. Article reading time validation
4. Coupon usage tracking
5. Withdrawal approval/rejection flow
6. System log completeness

## Files Created/Modified

### New Files
- `backend/app/models/admin.py` - Admin models
- `backend/app/schemas/admin.py` - Admin schemas
- `backend/app/routers/admin.py` - Admin endpoints
- `backend/app/routers/subadmin.py` - Sub-admin endpoints
- `backend/app/routers/articles.py` - Article endpoints
- `backend/app/routers/cards.py` - Card purchase endpoints
- `backend/app/routers/announcements.py` - Public announcements

### Modified Files
- `backend/app/models/user.py` - Added role, updated Balance
- `backend/app/models/__init__.py` - Export admin models
- `backend/app/schemas/__init__.py` - Export admin schemas
- `backend/app/routers/__init__.py` - Export new routers
- `backend/app/routers/auth.py` - Coupon validation on registration
- `backend/app/main.py` - Include new routers

## Environment Variables
No new environment variables required. Uses existing:
- `DATABASE_URL`
- `SECRET_KEY`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `REFERRAL_BONUS`

## Database Migration
Run database initialization to create new tables:
```bash
# Tables will be created automatically on first run
python -m backend.app.database
```

New tables created:
- `coupons`
- `articles`
- `user_articles`
- `cards`
- `card_purchases`
- `announcements`
- `system_logs`

Modified tables:
- `users` - Added `role` column
- `balances` - Renamed/added balance columns

## Testing the Admin Panel

### Create First Admin
```python
# In Python shell or init script
from backend.app.models import User, UserRole
from backend.app.database import SessionLocal

db = SessionLocal()
admin = db.query(User).filter(User.username == "yourusername").first()
admin.role = UserRole.ADMIN
db.commit()
```

### Test Admin Endpoints
```bash
# Login as admin
curl -X POST http://localhost:8000/api/auth/login \
  -d "username=admin&password=yourpassword"

# Get dashboard stats
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/admin/dashboard

# Create coupon
curl -X POST http://localhost:8000/api/admin/coupons \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"code":"WELCOME2024","assigned_to":2,"bonus_amount":10.00}'
```

## Summary
Complete admin panel system with:
- ✅ Three-tier role system (Admin, Sub-admin, User)
- ✅ Full CRUD for coupons, articles, cards, announcements
- ✅ User management (promote, demote, disable, delete)
- ✅ Withdrawal approval system
- ✅ Article reading with time tracking
- ✅ Card purchase system
- ✅ Vendor lounge for sub-admins
- ✅ Complete audit logging
- ✅ Four-balance system
- ✅ Coupon tracking and assignment
- ✅ System-wide announcements

Ready for frontend integration!
