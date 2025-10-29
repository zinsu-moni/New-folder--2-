import requests
import json

# Base URL
base_url = "http://localhost:8000"

# Test admin endpoints
def test_admin_endpoints():
    print("\n=== Testing Admin API Endpoints ===")
    
    # Retrieve token (you should replace with a valid admin token)
    token = input("Enter your admin token: ")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Test endpoints
    endpoints = [
        "/api/admin/dashboard",
        "/api/admin/users",
        "/api/users"  # For comparison
    ]
    
    for endpoint in endpoints:
        url = f"{base_url}{endpoint}"
        print(f"\nTesting endpoint: {url}")
        
        try:
            response = requests.get(url, headers=headers)
            print(f"Status code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print("Success! Response sample:")
                print(json.dumps(data[:2] if isinstance(data, list) and len(data) > 2 else data, indent=2))
            else:
                print(f"Error: {response.text}")
        except Exception as e:
            print(f"Exception: {str(e)}")

if __name__ == "__main__":
    test_admin_endpoints()