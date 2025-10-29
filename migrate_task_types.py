"""
Migration script to update tasks table with new task types
"""
import sys
import os
sys.path.append('backend')

os.environ.setdefault('DATABASE_URL', 'sqlite:///backend/affluence.db')
os.environ.setdefault('SECRET_KEY', 'temp-secret-key-for-migration')

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Database connection
DATABASE_URL = "sqlite:///backend/affluence.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)

def migrate():
    """Update tasks table structure for image/text/link task types"""
    
    print("Updating tasks table...")
    
    db = SessionLocal()
    
    try:
        # Check current table structure
        result = db.execute(text("PRAGMA table_info(tasks)")).fetchall()
        columns = [row[1] for row in result]
        print(f"Current columns: {columns}")
        
        # Add new columns if they don't exist
        if 'task_url' not in columns:
            print("Adding task_url column...")
            db.execute(text("ALTER TABLE tasks ADD COLUMN task_url VARCHAR(500)"))
            db.commit()
            print("✓ Added task_url column")
        
        if 'instructions' not in columns:
            print("Adding instructions column...")
            db.execute(text("ALTER TABLE tasks ADD COLUMN instructions TEXT"))
            db.commit()
            print("✓ Added instructions column")
        
        # Rename 'link' to 'task_url' if it exists
        if 'link' in columns and 'task_url' in columns:
            print("Copying data from link to task_url...")
            db.execute(text("UPDATE tasks SET task_url = link WHERE link IS NOT NULL"))
            db.commit()
            print("✓ Copied link data to task_url")
        
        # Update task_type column to use new types (default to 'link')
        print("Updating task_type values...")
        db.execute(text("UPDATE tasks SET task_type = 'link' WHERE task_type IS NULL OR task_type = ''"))
        db.commit()
        print("✓ Updated task_type values")
        
        # Add submission column to user_tasks if it doesn't exist
        result = db.execute(text("PRAGMA table_info(user_tasks)")).fetchall()
        columns = [row[1] for row in result]
        
        if 'submission' not in columns:
            print("Adding submission column to user_tasks...")
            db.execute(text("ALTER TABLE user_tasks ADD COLUMN submission TEXT"))
            db.commit()
            print("✓ Added submission column to user_tasks")
        
        print("\n✓ Migration completed successfully!")
        print("\nTask types available:")
        print("  - image: Upload image task")
        print("  - text: Text submission task")
        print("  - link: Link submission task")
        
    except Exception as e:
        print(f"✗ Error during migration: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    migrate()
