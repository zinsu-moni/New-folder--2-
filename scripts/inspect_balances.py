import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from backend.app.database import SessionLocal
from backend.app.models import User, Balance, Transaction
from sqlalchemy import desc

session = SessionLocal()

usernames = ['admins', 'moni', 'moninim', 'admi']
print('\nChecking balances for specific users:')
for uname in usernames:
    user = session.query(User).filter(User.username == uname).first()
    if not user:
        print(f"- {uname}: user not found")
        continue
    bal = user.balance
    if not bal:
        print(f"- {uname} (id={user.id}): no balance row")
    else:
        print(f"- {uname} (id={user.id}): affiliate_balance={bal.affiliate_balance}, activity_balance={bal.activity_balance}, main_balance={bal.main_balance}, total_balance={bal.total_balance}")

print('\nTop 10 users by affiliate_balance:')
rows = session.query(User.username, Balance.affiliate_balance).join(Balance).order_by(desc(Balance.affiliate_balance)).limit(10).all()
for i, (uname, aff) in enumerate(rows, 1):
    print(f"{i}. {uname}: {aff}")

print('\nRecent referral-type transactions (limit 50):')
trans = session.query(Transaction).filter(Transaction.balance_type == 'referral').order_by(desc(Transaction.created_at)).limit(50).all()
for t in trans[:20]:
    print(f"- id={t.id}, user_id={t.user_id}, type={t.type}, amount={t.amount}, ref={t.reference}, created_at={t.created_at}")

session.close()

print('\nComputing net referral amounts from transactions and comparing to stored balances:')
from sqlalchemy import func, case

net_rows = session.query(
    User.id,
    User.username,
    func.coalesce(func.sum(case((Transaction.type == 'credit', Transaction.amount), else_=-Transaction.amount)), 0).label('net_ref')
).join(Transaction, Transaction.user_id == User.id).filter(Transaction.balance_type == 'referral').group_by(User.id).order_by(desc('net_ref')).limit(50).all()

for uid, uname, net in net_rows:
    user = session.query(User).filter(User.id == uid).first()
    stored = user.balance.affiliate_balance if user.balance else None
    print(f"- {uname} (id={uid}): net_ref_from_tx={net}, stored_affiliate_balance={stored}")

session.close()
