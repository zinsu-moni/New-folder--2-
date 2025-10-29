"""Fix user balances where total doesn't match activity + affiliate"""
import sys
import os

os.chdir('backend')
sys.path.insert(0, os.getcwd())

from app.database import get_db
from app.models import Balance, User

db = next(get_db())

try:
    # Get all balances
    balances = db.query(Balance).all()
    
    print("=== Current Balances ===")
    print(f"{'User ID':<10} {'Username':<15} {'Activity':<12} {'Affiliate':<12} {'Total':<12} {'Expected':<12}")
    print("-" * 85)
    
    for balance in balances:
        user = db.query(User).filter(User.id == balance.user_id).first()
        expected = balance.activity_balance + balance.affiliate_balance
        username = user.username if user else "N/A"
        
        print(f"{balance.user_id:<10} {username:<15} ₦{balance.activity_balance:<11.2f} ₦{balance.affiliate_balance:<11.2f} ₦{balance.total_balance:<11.2f} ₦{expected:<11.2f}")
    
    # Fix balances where total > activity + affiliate
    print("\n=== Fixing Orphaned Totals ===")
    fixed = 0
    for balance in balances:
        expected = balance.activity_balance + balance.affiliate_balance
        orphaned = balance.total_balance - expected
        
        if orphaned > 0.01:  # Has orphaned money
            user = db.query(User).filter(User.id == balance.user_id).first()
            print(f"\nUser {balance.user_id} ({user.username if user else 'N/A'}):")
            print(f"  Orphaned amount: ₦{orphaned:.2f}")
            print(f"  Moving to activity balance...")
            
            balance.activity_balance += orphaned
            # Total stays the same (it's already correct)
            fixed += 1
    
    if fixed > 0:
        db.commit()
        print(f"\n✅ Fixed {fixed} balance(s)")
        
        print("\n=== Updated Balances ===")
        print(f"{'User ID':<10} {'Username':<15} {'Activity':<12} {'Affiliate':<12} {'Total':<12}")
        print("-" * 73)
        
        for balance in db.query(Balance).all():
            user = db.query(User).filter(User.id == balance.user_id).first()
            username = user.username if user else "N/A"
            print(f"{balance.user_id:<10} {username:<15} ₦{balance.activity_balance:<11.2f} ₦{balance.affiliate_balance:<11.2f} ₦{balance.total_balance:<11.2f}")
    else:
        print("\n✅ All balances are correct!")
        
except Exception as e:
    db.rollback()
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
