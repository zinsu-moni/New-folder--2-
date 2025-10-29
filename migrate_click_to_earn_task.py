"""
Migration script to create click_to_earn_task table and seed a default row
"""
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Configure database (SQLite default path used in this project)
DATABASE_URL = "sqlite:///backend/affluence.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)

def migrate():
    db = SessionLocal()
    try:
        print("Checking for click_to_earn_task table...")
        result = db.execute(text("PRAGMA table_info(click_to_earn_task)")).fetchall()
        if not result:
            print("Creating click_to_earn_task table...")
            db.execute(text(
                """
                CREATE TABLE click_to_earn_task (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    link VARCHAR(500) NOT NULL,
                    task_type VARCHAR(10) NOT NULL DEFAULT 'mega',
                    amount FLOAT NOT NULL DEFAULT 500.0,
                    updated_at DATETIME
                )
                """
            ))
            db.commit()
            print("✓ Table click_to_earn_task created")
        else:
            print("✓ Table already exists")

        # Ensure a single default row exists
        count = db.execute(text("SELECT COUNT(*) FROM click_to_earn_task")).scalar()
        if count == 0:
            print("Seeding default Click to Earn task row...")
            db.execute(text(
                """
                INSERT INTO click_to_earn_task (link, task_type, amount, updated_at)
                VALUES (:link, :task_type, :amount, CURRENT_TIMESTAMP)
                """
            ), {"link": "https://example.com", "task_type": "mega", "amount": 500.0})
            db.commit()
            print("✓ Seeded default row")
        else:
            print(f"✓ Existing rows found: {count}")

        print("\n✅ Migration completed successfully")
    except Exception as e:
        db.rollback()
        print(f"\n❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    migrate()
