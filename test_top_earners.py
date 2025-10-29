"""Test the top earners endpoint"""
import sys
import os

# Change to backend directory
os.chdir('backend')
sys.path.insert(0, os.getcwd())

from app.database import get_db
from app.models import User, Balance
from sqlalchemy import func

def test_top_earners():
    db = next(get_db())
    
    try:
        # Get top earners
        result = []
        import asyncio
        
        # Since get_top_earners is async, we need to run it properly
        from app.routers.users import get_top_earners
        from app.models import User, Balance
        from sqlalchemy import func
        
        # Subquery to count referrals for each user
        referral_counts = db.query(
            User.referral_code,
            func.count(User.id).label('referral_count')
        ).filter(
            User.referred_by.isnot(None)
        ).group_by(User.referral_code).subquery()
        
        # Get top earners by affiliate balance with referral counts
        top_users = db.query(
            User.username,
            User.full_name,
            User.referral_code,
            Balance.affiliate_balance,
            func.coalesce(referral_counts.c.referral_count, 0).label('referral_count')
        ).join(Balance).outerjoin(
            referral_counts,
            User.referral_code == referral_counts.c.referral_code
        ).filter(
            User.is_active == True
        ).order_by(Balance.affiliate_balance.desc()).limit(10).all()
        
        print("\n=== Top 10 Earners (by Affiliate Balance) ===\n")
        print(f"{'Rank':<6} {'Username':<20} {'Full Name':<25} {'Affiliate':<15} {'Referrals':<10}")
        print("-" * 90)
        
        for idx, (username, full_name, ref_code, affiliate_earnings, referral_count) in enumerate(top_users, 1):
            print(f"{idx:<6} {username:<20} {full_name:<25} ₦{affiliate_earnings:<14,.2f} {referral_count:<10}")
        
        if not top_users:
            print("No users found!")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_top_earners()
