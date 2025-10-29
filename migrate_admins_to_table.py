"""
Migrate admin users from users table to new admins table
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
from app.models.admin import Admin, AdminRole

def migrate_admins():
    """Migrate admin and subadmin users from users table to admins table"""
    db = SessionLocal()
    try:
        print("=" * 60)
        print("  Migrating Admins to Separate Table")
        print("=" * 60)
        print()
        
        # Find all admin and subadmin users
        admin_users = db.query(User).filter(
            User.role.in_([UserRole.ADMIN, UserRole.SUBADMIN])
        ).all()
        
        if not admin_users:
            print("⚠️  No admin/subadmin users found in users table")
            print()
            return
        
        print(f"Found {len(admin_users)} admin/subadmin users to migrate:")
        print()
        
        migrated_count = 0
        for user in admin_users:
            # Check if already migrated
            existing_admin = db.query(Admin).filter(Admin.username == user.username).first()
            if existing_admin:
                print(f"⏭️  Skipping '{user.username}' - already exists in admins table")
                continue
            
            # Map UserRole to AdminRole
            admin_role = AdminRole.ADMIN if user.role == UserRole.ADMIN else AdminRole.SUBADMIN
            
            # Create new admin record
            new_admin = Admin(
                username=user.username,
                email=user.email,
                full_name=user.full_name,
                password_hash=user.password_hash,
                role=admin_role,
                is_active=user.is_active,
                created_at=user.created_at,
                last_login=None
            )
            
            db.add(new_admin)
            migrated_count += 1
            print(f"✅ Migrated '{user.username}' ({user.role.value} → {admin_role.value})")
        
        if migrated_count > 0:
            db.commit()
            print()
            print(f"✅ Successfully migrated {migrated_count} admin/subadmin user(s)")
            print()
            print("Note: Original users remain in users table.")
            print("      You can manually delete them if needed after verification.")
        else:
            print()
            print("ℹ️  No new admins to migrate")
        
        print()
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    migrate_admins()
