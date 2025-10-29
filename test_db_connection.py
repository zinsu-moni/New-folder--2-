"""
Test database connection for Affluence backend
"""
import sys
import os
from pathlib import Path

# Change to backend directory so .env file can be found
backend_dir = Path(__file__).parent / 'backend'
os.chdir(backend_dir)

# Add backend to path
sys.path.insert(0, str(backend_dir))

try:
    from app.database import engine, Base
    from sqlalchemy import text
    
    print("=" * 60)
    print("  Testing Database Connection")
    print("=" * 60)
    print()
    
    # Test connection
    print("🔍 Testing connection to database...")
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        print("✅ Database connection successful!")
        print()
        
        # Get database info
        db_url = str(engine.url)
        if 'sqlite' in db_url:
            print(f"📊 Database: SQLite (Local)")
            result = connection.execute(text("SELECT sqlite_version()"))
            version = result.fetchone()[0]
            print(f"   Version: {version}")
        else:
            print(f"📊 Database: PostgreSQL")
            result = connection.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            print(f"   Version: {version}")
        print()
        
        # List tables
        print("📋 Checking existing tables...")
        if 'sqlite' in db_url:
            result = connection.execute(text("""
                SELECT name FROM sqlite_master 
                WHERE type='table' 
                ORDER BY name
            """))
        else:
            result = connection.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name
            """))
        tables = result.fetchall()
        
        if tables:
            print(f"   Found {len(tables)} tables:")
            for table in tables:
                print(f"   - {table[0]}")
        else:
            print("   No tables found. Database needs initialization.")
        
        print()
        print("=" * 60)
        print("✅ Database is accessible and ready!")
        print("=" * 60)
        
except Exception as e:
    print()
    print("=" * 60)
    print("❌ Database Connection Failed")
    print("=" * 60)
    print()
    print(f"Error: {str(e)}")
    print()
    print("Possible issues:")
    print("  1. Database server is not running")
    print("  2. Database credentials are incorrect")
    print("  3. Network/firewall blocking connection")
    print("  4. Database host is unreachable")
    print()
    print("Check your DATABASE_URL in backend/.env file")
    print("=" * 60)
    sys.exit(1)
