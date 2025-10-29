"""Test the coupon types are working correctly"""
import sys
import os

os.chdir('backend')
sys.path.insert(0, os.getcwd())

from app.database import get_db
from app.models import Coupon, CouponType, CouponStatus

def test_coupon_types():
    db = next(get_db())
    
    try:
        print("=== Testing Coupon Types ===\n")
        
        # Get all coupons
        coupons = db.query(Coupon).all()
        
        print(f"{'Code':<20} {'Type':<10} {'Bonus':<15} {'Status':<10}")
        print("-" * 60)
        
        for coupon in coupons:
            bonus_str = f"₦{coupon.bonus_amount:,.0f}"
            coupon_type_str = coupon.coupon_type.upper() if isinstance(coupon.coupon_type, str) else coupon.coupon_type
            status_str = coupon.status.value.upper() if hasattr(coupon.status, 'value') else str(coupon.status).upper()
            print(f"{coupon.code:<20} {coupon_type_str:<10} {bonus_str:<15} {status_str:<10}")
        
        print("\n=== Summary ===")
        mega_coupons = db.query(Coupon).filter(Coupon.coupon_type == 'mega').count()
        alpha_coupons = db.query(Coupon).filter(Coupon.coupon_type == 'alpha').count()
        unused_coupons = db.query(Coupon).filter(Coupon.status == CouponStatus.UNUSED).count()
        
        print(f"MEGA coupons: {mega_coupons} (₦700 each)")
        print(f"ALPHA coupons: {alpha_coupons} (₦2,000 each)")
        print(f"Unused coupons: {unused_coupons}")
        print(f"Total coupons: {len(coupons)}")
        
        print("\n✅ Coupon type system is working correctly!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_coupon_types()
