"""
Verify and fix total_balance = activity_balance + affiliate_balance
Ensures all user balances follow the correct formula
"""
import sys
import os

os.chdir('backend')
sys.path.insert(0, os.getcwd())

from app.database import get_db
from app.models import Balance

def fix_total_balances():
    db = next(get_db())
    
    try:
        print("=== Checking and Fixing Total Balances ===\n")
        
        # Get all balances
        balances = db.query(Balance).all()
        
        fixed_count = 0
        correct_count = 0
        
        for balance in balances:
            expected_total = balance.activity_balance + balance.affiliate_balance
            
            if abs(balance.total_balance - expected_total) > 0.01:  # Allow for floating point errors
                print(f"❌ User ID {balance.user_id}:")
                print(f"   Activity: ₦{balance.activity_balance:,.2f}")
                print(f"   Affiliate: ₦{balance.affiliate_balance:,.2f}")
                print(f"   Current Total: ₦{balance.total_balance:,.2f}")
                print(f"   Expected Total: ₦{expected_total:,.2f}")
                print(f"   → Fixing...")
                
                balance.total_balance = expected_total
                fixed_count += 1
            else:
                correct_count += 1
        
        if fixed_count > 0:
            db.commit()
            print(f"\n✅ Fixed {fixed_count} balance(s)")
        
        print(f"✅ {correct_count} balance(s) were already correct")
        print(f"\n=== Summary ===")
        print(f"Total records: {len(balances)}")
        print(f"Fixed: {fixed_count}")
        print(f"Correct: {correct_count}")
        
        # Show all balances
        print("\n=== All User Balances ===")
        print(f"{'User ID':<10} {'Activity':<15} {'Affiliate':<15} {'Total':<15} {'Status':<10}")
        print("-" * 70)
        
        for balance in db.query(Balance).all():
            expected = balance.activity_balance + balance.affiliate_balance
            status = "✓" if abs(balance.total_balance - expected) < 0.01 else "✗"
            print(f"{balance.user_id:<10} ₦{balance.activity_balance:<14,.2f} ₦{balance.affiliate_balance:<14,.2f} ₦{balance.total_balance:<14,.2f} {status:<10}")
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    fix_total_balances()
