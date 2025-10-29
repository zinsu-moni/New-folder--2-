"""Add test users with affiliate earnings and referrals"""
import sys
import os

os.chdir('backend')
sys.path.insert(0, os.getcwd())

from app.database import get_db
from app.models import User, Balance
from datetime import datetime
import random

def create_test_data():
    db = next(get_db())
    
    try:
        # Get existing users
        users = db.query(User).all()
        print(f"Found {len(users)} existing users")
        
        if len(users) < 3:
            print("Not enough users to create test data. Need at least 3 users.")
            return
        
        # Pick first 3 users to be top earners
        top_earners = users[:3]
        
        # Set affiliate earnings for top earners
        for idx, user in enumerate(top_earners):
            balance = db.query(Balance).filter(Balance.user_id == user.id).first()
            if balance:
                # Set affiliate earnings (decreasing)
                balance.affiliate_balance = 50000 - (idx * 10000)
                balance.total_balance = balance.main_balance + balance.affiliate_balance + balance.activity_balance
                print(f"Updated {user.username}: ₦{balance.affiliate_balance:,.2f} affiliate earnings")
        
        # Create some referred users for the top earners
        for idx, referrer in enumerate(top_earners):
            # Create 2-5 referrals per top earner
            num_referrals = random.randint(2, 5)
            
            for i in range(num_referrals):
                referred_user = User(
                    username=f"referred_{referrer.username}_{i}",
                    email=f"referred_{referrer.username}_{i}@test.com",
                    full_name=f"Referred User {i}",
                    phone=f"080{random.randint(10000000, 99999999)}",
                    password_hash="$2b$12$dummy_hash_for_testing",
                    referral_code=f"REF{random.randint(10000, 99999)}",
                    referred_by=referrer.referral_code,
                    is_active=True
                )
                
                db.add(referred_user)
                db.flush()
                
                # Create balance for referred user
                referred_balance = Balance(
                    user_id=referred_user.id,
                    main_balance=0.0,
                    affiliate_balance=0.0,
                    activity_balance=0.0,
                    total_balance=0.0
                )
                db.add(referred_balance)
            
            print(f"Created {num_referrals} referrals for {referrer.username}")
        
        db.commit()
        print("\n✅ Test data created successfully!")
        
        # Show results
        print("\n=== Current Top Earners ===")
        from sqlalchemy import func
        
        referral_counts = db.query(
            User.referral_code,
            func.count(User.id).label('referral_count')
        ).filter(
            User.referred_by.isnot(None)
        ).group_by(User.referral_code).subquery()
        
        top_users = db.query(
            User.username,
            User.full_name,
            Balance.affiliate_balance,
            func.coalesce(referral_counts.c.referral_count, 0).label('referral_count')
        ).join(Balance).outerjoin(
            referral_counts,
            User.referral_code == referral_counts.c.referral_code
        ).filter(
            User.is_active == True
        ).order_by(Balance.affiliate_balance.desc()).limit(10).all()
        
        print(f"\n{'Username':<20} {'Affiliate Earnings':<20} {'Referrals':<10}")
        print("-" * 50)
        for username, full_name, affiliate, referrals in top_users:
            print(f"{username:<20} ₦{affiliate:<19,.2f} {referrals:<10}")
        
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_data()
