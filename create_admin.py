"""
Create an admin user with specific credentials
"""
import sys
from pathlib import Path

# Change to backend directory
backend_dir = Path(__file__).parent / 'backend'
import os
os.chdir(backend_dir)
sys.path.insert(0, str(backend_dir))

from app.database import SessionLocal
from app.models.user import User, UserRole
from app.models.user import Balance
from app.utils.security import get_password_hash, generate_referral_code

def create_admin_user(username, password, email=None, full_name=None):
    """Create a new admin user"""
    db = SessionLocal()
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.username == username).first()
        
        if existing_user:
            print(f"⚠️  User '{username}' already exists!")
            print(f"   Current role: {existing_user.role.value}")
            
            # Update to admin if not already
            if existing_user.role != UserRole.ADMIN:
                existing_user.role = UserRole.ADMIN
                db.commit()
                print(f"✅ Updated '{username}' to ADMIN role")
            
            # Update password
            existing_user.password_hash = get_password_hash(password)
            db.commit()
            print(f"✅ Password updated for '{username}'")
            
            print()
            print("=" * 60)
            print(f"✅ Admin user '{username}' is ready!")
            print("=" * 60)
            print(f"Username: {username}")
            print(f"Password: {password}")
            print(f"Role: {existing_user.role.value}")
            print()
            print("Login at:")
            print("  http://localhost:3000/admin-login.html")
            print("=" * 60)
            return
        
        # Generate unique referral code
        while True:
            referral_code = generate_referral_code()
            if not db.query(User).filter(User.referral_code == referral_code).first():
                break
        
        # Set defaults
        if not email:
            email = f"{username}@example.com"  # Use .com instead of .local
        if not full_name:
            full_name = username.capitalize()
        
        # Create new admin user
        new_user = User(
            username=username,
            email=email,
            full_name=full_name,
            password_hash=get_password_hash(password),
            referral_code=referral_code,
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Create balance for user
        user_balance = Balance(
            user_id=new_user.id,
            main_balance=0.0,
            activity_balance=0.0,
            affiliate_balance=0.0,
            total_balance=0.0
        )
        db.add(user_balance)
        db.commit()
        
        print()
        print("=" * 60)
        print(f"✅ Successfully created admin user '{username}'!")
        print("=" * 60)
        print(f"Username: {username}")
        print(f"Password: {password}")
        print(f"Email: {email}")
        print(f"Full Name: {full_name}")
        print(f"Role: {new_user.role.value}")
        print(f"Referral Code: {referral_code}")
        print()
        print("Login at:")
        print("  http://localhost:3000/admin-login.html")
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 60)
    print("  Create Admin User - Affluence Platform")
    print("=" * 60)
    print()
    
    # Default admin credentials
    username = "admin"
    password = "admin123"
    
    if len(sys.argv) > 1:
        username = sys.argv[1]
    if len(sys.argv) > 2:
        password = sys.argv[2]
    
    create_admin_user(username, password)
