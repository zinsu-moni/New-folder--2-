"""
Check admin user role
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

db = SessionLocal()
try:
    user = db.query(User).filter(User.username == 'admin').first()
    if user:
        print("=" * 60)
        print(f"Username: {user.username}")
        print(f"Email: {user.email}")
        print(f"Role (enum): {user.role}")
        print(f"Role (value): {user.role.value}")
        print("=" * 60)
    else:
        print("❌ Admin user not found!")
finally:
    db.close()
