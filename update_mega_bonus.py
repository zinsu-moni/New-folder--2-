"""Update MEGA coupons to ₦500"""
import sys
import os

os.chdir('backend')
sys.path.insert(0, os.getcwd())

from app.database import get_db
from sqlalchemy import text

db = next(get_db())
try:
    result = db.execute(text("UPDATE coupons SET bonus_amount = 500.0 WHERE coupon_type = 'mega'"))
    db.commit()
    print(f"✅ Updated {result.rowcount} MEGA coupons to ₦500")
    
    # Show updated coupons
    coupons = db.execute(text("SELECT code, coupon_type, bonus_amount FROM coupons")).fetchall()
    print("\nAll coupons:")
    for code, ctype, bonus in coupons:
        print(f"  {code}: {ctype.upper()} - ₦{bonus:,.0f}")
finally:
    db.close()
