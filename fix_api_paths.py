#!/usr/bin/env python3
"""
Quick API Path Fixer for Admin Pages

This script scans all admin-*.html files and fixes any direct references 
to '/admin/' paths in fetch calls to avoid duplicating the prefix.
"""

import re
import os
from pathlib import Path

# Get project root and admin HTML files
PROJECT_ROOT = Path(__file__).parent
ADMIN_PAGES = list(PROJECT_ROOT.glob("admin-*.html"))

print(f"🔍 Scanning {len(ADMIN_PAGES)} admin pages for API path issues...")

# Regular expressions for finding problematic API paths
fetch_patterns = [
    (r'fetch\(`\${api\.baseURL}/admin/([^`]+)`', r'fetch(`${api.baseURL}/\1`'),
    (r'fetch\(api\.baseURL \+ \'/admin/([^\']+)\'', r'fetch(api.baseURL + \'/\1\''),
    (r'api\.get\(`/admin/([^`]+)`\)', r'api.get(`/\1`)'),
    (r'api\.post\(`/admin/([^`]+)`', r'api.post(`/\1`'),
    (r'api\.put\(`/admin/([^`]+)`', r'api.put(`/\1`'),
    (r'api\.delete\(`/admin/([^`]+)`', r'api.delete(`/\1`'),
]

# Track files modified
modified_files = []

# Process each admin page
for page in ADMIN_PAGES:
    with open(page, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Apply all pattern fixes
    for pattern, replacement in fetch_patterns:
        content = re.sub(pattern, replacement, content)
    
    # Save if modified
    if content != original_content:
        with open(page, 'w', encoding='utf-8') as f:
            f.write(content)
        modified_files.append(page.name)
        print(f"✅ Fixed API paths in {page.name}")

if modified_files:
    print(f"\n🎉 Fixed {len(modified_files)} files:")
    for file in modified_files:
        print(f"  - {file}")
else:
    print("\n✅ No issues found. All API paths are correct!")

print("\nNext steps:")
print("1. Restart the frontend server:")
print("   python serve_frontend.py")
print("2. Open the diagnostic page:")
print("   http://localhost:3000/api-diagnostic.html")