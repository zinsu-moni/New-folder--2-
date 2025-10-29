"""
Fix admin user email
"""
import sys
from pathlib import Path

# Change to backend directory
backend_dir = Path(__file__).parent / 'backend'
import os
os.chdir(backend_dir)
sys.path.insert(0, str(backend_dir))

from app.database import SessionLocal
from app.models.user import User

def fix_email():
    """Fix admin email to valid format"""
    db = SessionLocal()
    try:
        # Find admin user
        user = db.query(User).filter(User.username == "admin").first()
        
        if not user:
            print("❌ Admin user not found!")
            return
        
        old_email = user.email
        user.email = "admin@example.com"
        db.commit()
        
        print("=" * 60)
        print("✅ Email updated successfully!")
        print("=" * 60)
        print(f"Old email: {old_email}")
        print(f"New email: {user.email}")
        print()
        print("You can now login at:")
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
    fix_email()
