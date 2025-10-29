#!/usr/bin/env python3
"""
API Connection Tester

This script tests the connection to the API server and verifies that the routes are working.
"""

import http.server
import socketserver
import webbrowser
import json
import urllib.request
import urllib.error
import os
import time
import sys
from pathlib import Path

# Configuration
API_BASE = "http://localhost:8000/api"
ADMIN_ENDPOINTS = [
    "/dashboard",
    "/users",
    "/withdrawals",
    "/coupons",
    "/articles",
    "/cards",
    "/announcements"
]

# Check if API server is running
def check_api_server():
    print("Checking API server...", end=" ")
    try:
        with urllib.request.urlopen(API_BASE, timeout=2) as response:
            print("✅ API server is running")
            return True
    except urllib.error.URLError as e:
        print(f"❌ API server is not running: {e}")
        return False
    except Exception as e:
        print(f"❌ Error checking API server: {e}")
        return False

# Test an admin endpoint with a token
def test_admin_endpoint(endpoint, token):
    full_url = API_BASE + endpoint
    print(f"Testing {full_url}...", end=" ")
    
    try:
        req = urllib.request.Request(full_url)
        req.add_header("Authorization", f"Bearer {token}")
        
        with urllib.request.urlopen(req, timeout=5) as response:
            print(f"✅ Status: {response.status}")
            data = response.read()
            try:
                result = json.loads(data)
                print(f"  📊 Data: {str(result)[:100]}...")
            except:
                print(f"  📝 Response: {data[:100]}...")
            
            return True
    except urllib.error.HTTPError as e:
        print(f"❌ HTTP Error: {e.code} - {e.reason}")
        print(f"  📝 Response: {e.read().decode('utf-8')[:200]}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("=" * 60)
    print("API Connection Tester")
    print("=" * 60)
    
    # Check API server
    if not check_api_server():
        print("\nPlease start the API server with:")
        print("cd backend && uvicorn app.main:app --reload")
        return
    
    # Get admin token
    token = input("\nEnter admin token: ").strip()
    if not token:
        print("Token is required to test admin endpoints.")
        return
    
    print("\nTesting admin endpoints...")
    for endpoint in ADMIN_ENDPOINTS:
        test_admin_endpoint(f"/admin{endpoint}", token)
    
    print("\nFor more detailed diagnostics, open the API diagnostic page:")
    print("http://localhost:3000/api-diagnostic.html")

if __name__ == "__main__":
    main()