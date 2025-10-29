"""Migration helper: add tier, amount_alpha, amount_mega to tasks table if they don't exist.

This script uses the project's SQLAlchemy engine (backend.app.database.engine) and runs
ALTER TABLE ... ADD COLUMN IF NOT EXISTS statements. It is idempotent and safe to re-run.
"""
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy import text
from backend.app.database import engine

statements = [
    "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS tier VARCHAR(10) DEFAULT 'both';",
    "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS amount_alpha FLOAT NULL;",
    "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS amount_mega FLOAT NULL;",
]

with engine.begin() as conn:
    for sql in statements:
        print('Running:', sql)
        conn.execute(text(sql))

print('Migration completed.')
