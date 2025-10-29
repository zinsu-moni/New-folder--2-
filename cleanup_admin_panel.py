#!/usr/bin/env python3
"""
Admin Panel Cleanup Script

This script deletes existing admin panel HTML files to prepare for rebuild.
"""

import os
import glob
from pathlib import Path

print("Preparing to delete admin panel HTML files...")

# Identify all admin HTML files
admin_files = list(glob.glob('admin-*.html'))
print(f"Found {len(admin_files)} admin HTML files to delete.")

# Delete each file
for file in admin_files:
    print(f"Deleting: {file}")
    try:
        os.remove(file)
        print(f"  ✓ Deleted successfully")
    except Exception as e:
        print(f"  ✗ Error deleting {file}: {e}")

print("\nCleanup complete! Ready to rebuild admin panel.")