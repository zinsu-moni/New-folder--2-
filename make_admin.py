"""
Make a user an admin
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

def make_admin(username):
    """Promote a user to admin role"""
    db = SessionLocal()
    try:
        # Find user
        user = db.query(User).filter(User.username == username).first()
        
        if not user:
            print(f"❌ User '{username}' not found!")
            print("\nAvailable users:")
            users = db.query(User).all()
            for u in users:
                print(f"  - {u.username} (Current role: {u.role.value})")
            return
        
        # Check current role
        if user.role == UserRole.ADMIN:
            print(f"✅ User '{username}' is already an ADMIN")
            return
        
        # Update to admin
        old_role = user.role.value
        user.role = UserRole.ADMIN
        db.commit()
        
        print("=" * 60)
        print(f"✅ Successfully promoted '{username}' to ADMIN!")
        print("=" * 60)
        print(f"Previous role: {old_role}")
        print(f"New role: {user.role.value}")
        print()
        print("You can now login at:")
        print("  http://localhost:3000/admin-login.html")
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 60)
    print("  Make User Admin - Affluence Platform")
    print("=" * 60)
    print()
    
    if len(sys.argv) > 1:
        username = sys.argv[1]
    else:
        username = input("Enter username to promote to admin: ").strip()
    
    if username:
        make_admin(username)
    else:
        print("❌ No username provided!")
