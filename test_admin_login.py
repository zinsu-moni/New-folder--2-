"""
Test admin login functionality
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_admin_login():
    print("=" * 60)
    print("  Testing Admin Login")
    print("=" * 60)
    print()
    
    # Test admin login
    print("1. Testing admin login...")
    login_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/admin/login",
            data=login_data
        )
        
        if response.status_code == 200:
            token_data = response.json()
            print("✅ Admin login successful!")
            print(f"   Token type: {token_data['token_type']}")
            print(f"   Access token: {token_data['access_token'][:50]}...")
            print()
            return token_data['access_token']
        else:
            print(f"❌ Admin login failed: {response.status_code}")
            print(f"   Response: {response.text}")
            print()
            return None
            
    except Exception as e:
        print(f"❌ Error during admin login: {e}")
        print()
        return None

def test_user_login():
    print("2. Testing regular user login (should fail for admin)...")
    login_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            data=login_data
        )
        
        if response.status_code == 200:
            print("⚠️  Admin can still login via user endpoint")
            print("   (This is expected during transition)")
            print()
        else:
            print(f"✅ User login correctly rejected: {response.status_code}")
            print()
            
    except Exception as e:
        print(f"❌ Error: {e}")
        print()

if __name__ == "__main__":
    token = test_admin_login()
    test_user_login()
    
    print("=" * 60)
    print()
    
    if token:
        print("Next steps:")
        print("1. Update admin-login.html to use /api/auth/admin/login")
        print("2. Update admin panel to use admin token endpoint")
        print("3. Update admin routers to use get_current_admin dependency")
        print()
