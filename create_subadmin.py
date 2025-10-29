"""
Create or promote a user to sub-admin role
"""
import sys
from pathlib import Path

# Change to backend directory
backend_dir = Path(__file__).parent / 'backend'
import os
os.chdir(backend_dir)
sys.path.insert(0, str(backend_dir))

from app.database import SessionLocal
from app.models.user import User, UserRole, Balance
from app.utils.security import get_password_hash, generate_referral_code

def create_subadmin(username, password=None, email=None, full_name=None, promote_existing=False):
    """Create new sub-admin or promote existing user to sub-admin role"""
    db = SessionLocal()
    try:
        # Check if user exists
        user = db.query(User).filter(User.username == username).first()
        
        if user and not promote_existing:
            print(f"❌ User '{username}' already exists!")
            print(f"   Current role: {user.role.value}")
            print()
            print("Use --promote flag to upgrade this user to sub-admin:")
            print(f"   python create_subadmin.py {username} --promote")
            return
        
        if user and promote_existing:
            # Promote existing user
            if user.role == UserRole.SUBADMIN:
                print(f"✅ User '{username}' is already a SUB-ADMIN")
                return
            
            old_role = user.role.value
            user.role = UserRole.SUBADMIN
            db.commit()
            
            print("=" * 60)
            print(f"✅ Successfully promoted '{username}' to SUB-ADMIN!")
            print("=" * 60)
            print(f"Previous role: {old_role}")
            print(f"New role: {user.role.value}")
            print()
            print("Login credentials unchanged")
            print("=" * 60)
            return
        
        # Create new sub-admin user
        if not password:
            password = input("Enter password for new sub-admin: ").strip()
            if not password:
                print("❌ Password is required!")
                return
        
        if not email:
            email = input("Enter email (optional, press Enter to skip): ").strip() or f"{username}@affluence.local"
        
        if not full_name:
            full_name = input("Enter full name (optional, press Enter to skip): ").strip() or username.title()
        
        # Generate referral code
        referral_code = generate_referral_code()
        
        # Create user
        new_user = User(
            username=username,
            email=email,
            full_name=full_name,
            hashed_password=get_password_hash(password),
            role=UserRole.SUBADMIN,
            referral_code=referral_code,
            is_active=True
        )
        
        db.add(new_user)
        db.flush()
        
        # Create balance record
        balance = Balance(user_id=new_user.id)
        db.add(balance)
        
        db.commit()
        db.refresh(new_user)
        
        print("=" * 60)
        print("✅ Sub-admin account created successfully!")
        print("=" * 60)
        print(f"Username: {new_user.username}")
        print(f"Email: {new_user.email}")
        print(f"Full Name: {new_user.full_name}")
        print(f"Role: {new_user.role.value}")
        print(f"Referral Code: {new_user.referral_code}")
        print()
        print("Login at:")
        print("  http://localhost:3000/admin-login.html")
        print()
        print("Sub-admin can access:")
        print("  - Vendor Lounge (view assigned coupons)")
        print("  - Sub-admin Dashboard")
        print("  - Referrals")
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

def list_users():
    """List all users with their roles"""
    db = SessionLocal()
    try:
        users = db.query(User).order_by(User.role, User.username).all()
        
        print("=" * 60)
        print("All Users:")
        print("=" * 60)
        
        by_role = {}
        for user in users:
            role = user.role.value
            if role not in by_role:
                by_role[role] = []
            by_role[role].append(user)
        
        for role in ['admin', 'subadmin', 'user']:
            if role in by_role:
                print(f"\n{role.upper()}S:")
                for user in by_role[role]:
                    print(f"  - {user.username} ({user.full_name}) - {user.email}")
        
        print("=" * 60)
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 60)
    print("  Create Sub-admin - Affluence Platform")
    print("=" * 60)
    print()
    
    if len(sys.argv) > 1 and sys.argv[1] == "--list":
        list_users()
        sys.exit(0)
    
    promote_existing = "--promote" in sys.argv
    
    if len(sys.argv) > 1 and sys.argv[1] != "--promote":
        username = sys.argv[1]
        password = sys.argv[2] if len(sys.argv) > 2 and sys.argv[2] != "--promote" else None
    else:
        username = input("Enter username for new sub-admin: ").strip()
        password = None
    
    if username:
        create_subadmin(username, password, promote_existing=promote_existing)
    else:
        print("❌ No username provided!")
        print()
        print("Usage:")
        print("  python create_subadmin.py <username> [password]")
        print("  python create_subadmin.py <username> --promote")
        print("  python create_subadmin.py --list")
