#!/usr/bin/env python3
"""
Admin Panel Backup Script

This script creates a backup of all admin panel HTML files and related JS files
before rebuilding the admin panel from scratch.
"""

import os
import shutil
from datetime import datetime
from pathlib import Path

# Create backup directory with timestamp
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
backup_dir = Path("admin_panel_backup_" + timestamp)
os.makedirs(backup_dir, exist_ok=True)
os.makedirs(backup_dir / "js", exist_ok=True)

print(f"Creating backup in: {backup_dir}")

# Backup all admin HTML files
admin_files = list(Path('.').glob('admin-*.html'))
print(f"Found {len(admin_files)} admin HTML files")

for file in admin_files:
    print(f"Backing up: {file}")
    shutil.copy2(file, backup_dir / file.name)

# Backup JS files
js_files = ['js/admin.js', 'js/api.js', 'js/admin-shared.js']
for js_file in js_files:
    js_path = Path(js_file)
    if js_path.exists():
        print(f"Backing up: {js_file}")
        shutil.copy2(js_path, backup_dir / js_file)

print(f"\nBackup complete! Files saved to: {backup_dir}")
print("Now safe to proceed with admin panel deletion and rebuilding.")