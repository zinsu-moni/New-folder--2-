"""
Migration script to add coupon_type column to existing coupons table
This adds support for MEGA (₦700) and ALPHA (₦2000) coupon types
"""
import sys
import os

os.chdir('backend')
sys.path.insert(0, os.getcwd())

from app.database import get_db
from sqlalchemy import text

def migrate_coupon_types():
    db = next(get_db())
    
    try:
        print("Starting coupon_type migration...")
        
        # Check if column already exists
        result = db.execute(text("PRAGMA table_info(coupons)")).fetchall()
        columns = [col[1] for col in result]
        
        if 'coupon_type' in columns:
            print("✅ coupon_type column already exists!")
        else:
            # Add coupon_type column with default value 'mega'
            print("Adding coupon_type column...")
            db.execute(text("""
                ALTER TABLE coupons 
                ADD COLUMN coupon_type VARCHAR(10) DEFAULT 'mega' NOT NULL
            """))
            db.commit()
            print("✅ coupon_type column added successfully!")
        
        # Update bonus_amount based on coupon_type for existing coupons
        # Set existing coupons to 'mega' (₦700) if they don't have a type
        print("\nUpdating existing coupons...")
        
        # Get all coupons
        result = db.execute(text("SELECT id, code, bonus_amount, coupon_type FROM coupons")).fetchall()
        
        updated_count = 0
        for coupon in result:
            coupon_id, code, bonus_amount, coupon_type = coupon
            
            # Determine type based on bonus_amount if not already set
            if bonus_amount >= 1500:
                new_type = 'alpha'  # Use lowercase to match enum value
                new_bonus = 2000.0
            else:
                new_type = 'mega'  # Use lowercase to match enum value
                new_bonus = 700.0
            
            # Update the coupon
            db.execute(text("""
                UPDATE coupons 
                SET coupon_type = :new_type, bonus_amount = :new_bonus
                WHERE id = :coupon_id
            """), {"new_type": new_type, "new_bonus": new_bonus, "coupon_id": coupon_id})
            
            updated_count += 1
            print(f"  - Updated {code}: {coupon_type or 'mega'} → {new_type.upper()} (₦{new_bonus:,.0f})")
        
        db.commit()
        print(f"\n✅ Updated {updated_count} coupons successfully!")
        
        # Show summary
        print("\n=== Migration Summary ===")
        mega_count = db.execute(text("SELECT COUNT(*) FROM coupons WHERE coupon_type = 'mega'")).scalar()
        alpha_count = db.execute(text("SELECT COUNT(*) FROM coupons WHERE coupon_type = 'alpha'")).scalar()
        
        print(f"MEGA coupons (₦700): {mega_count}")
        print(f"ALPHA coupons (₦2,000): {alpha_count}")
        print(f"Total coupons: {mega_count + alpha_count}")
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ Error during migration: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    migrate_coupon_types()
