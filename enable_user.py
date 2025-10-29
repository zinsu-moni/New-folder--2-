"""
Enable or disable a user account (recovery utility)
Usage:
  python enable_user.py <username> [--disable]
Default action enables the user.
"""
import sys
from pathlib import Path
import os

backend_dir = Path(__file__).parent / 'backend'
os.chdir(backend_dir)
sys.path.insert(0, str(backend_dir))

from app.database import SessionLocal
from app.models.user import User

def set_user_active(username: str, active: bool = True):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == username).first()
        if not user:
            print(f"❌ User '{username}' not found")
            return 1
        prev = user.is_active
        user.is_active = active
        db.commit()
        state = 'ENABLED' if active else 'DISABLED'
        print(f"✅ {state} user '{username}' (was: {'ENABLED' if prev else 'DISABLED'})")
        return 0
    except Exception as e:
        print('❌ Error:', e)
        db.rollback()
        return 2
    finally:
        db.close()

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python enable_user.py <username> [--disable]")
        sys.exit(1)
    username = sys.argv[1]
    active = True
    if len(sys.argv) > 2 and sys.argv[2] == '--disable':
        active = False
    sys.exit(set_user_active(username, active))
