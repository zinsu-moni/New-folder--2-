import requests
import sys
import os
from colorama import init, Fore, Back, Style

# Initialize colorama
init()

def print_success(text):
    print(f"{Fore.GREEN}{text}{Style.RESET_ALL}")

def print_error(text):
    print(f"{Fore.RED}{text}{Style.RESET_ALL}")

def print_warning(text):
    print(f"{Fore.YELLOW}{text}{Style.RESET_ALL}")

def print_info(text):
    print(f"{Fore.CYAN}{text}{Style.RESET_ALL}")

def check_api_status(base_url):
    """Check if the API is running and responding."""
    print_info(f"\nChecking API at: {base_url}")
    
    # Test endpoints to try
    test_endpoints = [
        "",              # Root endpoint
        "/api",          # API root 
        "/api/auth/test",# Auth test endpoint
        "/api/health",   # Health check endpoint
        "/api/ping",     # Ping endpoint
    ]
    
    for endpoint in test_endpoints:
        url = f"{base_url}{endpoint}"
        try:
            print(f"  Testing endpoint: {url}")
            response = requests.get(url, timeout=5)
            if response.ok:
                print_success(f"  ✓ Success: {response.status_code} {response.reason}")
                print(f"    Response: {response.text[:100]}...")
                return True
            else:
                print_warning(f"  ✗ Failed: {response.status_code} {response.reason}")
        except requests.exceptions.RequestException as e:
            print_error(f"  ✗ Error: {str(e)}")
    
    return False

def check_auth_endpoints(base_url):
    """Check the authentication endpoints."""
    print_info("\nChecking authentication endpoints:")
    
    # Test login endpoint
    login_url = f"{base_url}/api/auth/login"
    test_data = {"email": "test@example.com", "password": "password123"}
    
    try:
        print(f"  Testing login endpoint: {login_url}")
        response = requests.post(login_url, json=test_data, timeout=5)
        if response.status_code == 401 or response.status_code == 422:
            print_success(f"  ✓ Login endpoint functioning (returned {response.status_code} as expected)")
        else:
            print_warning(f"  ✗ Unexpected response from login endpoint: {response.status_code} {response.reason}")
    except requests.exceptions.RequestException as e:
        print_error(f"  ✗ Error accessing login endpoint: {str(e)}")

def check_uvicorn_status():
    """Check if uvicorn server is running."""
    print_info("\nChecking if uvicorn is running:")
    
    try:
        # This is a simplified check that will vary by platform
        if os.name == 'nt':  # Windows
            import subprocess
            result = subprocess.run(['tasklist', '/FI', 'IMAGENAME eq python.exe'], 
                                  capture_output=True, text=True)
            if 'uvicorn' in result.stdout.lower():
                print_success("  ✓ Found uvicorn process running")
                return True
            else:
                print_warning("  ✗ No uvicorn process found running")
        else:  # Unix-like
            import subprocess
            result = subprocess.run(['ps', '-ef'], capture_output=True, text=True)
            if 'uvicorn' in result.stdout.lower():
                print_success("  ✓ Found uvicorn process running")
                return True
            else:
                print_warning("  ✗ No uvicorn process found running")
    except Exception as e:
        print_error(f"  ✗ Error checking uvicorn status: {str(e)}")
    
    return False

def suggest_fixes(api_running, uvicorn_running):
    """Provide suggestions to fix issues."""
    print_info("\nDiagnostic results:")
    
    if not uvicorn_running:
        print_error("  ✗ Backend server does not appear to be running")
        print_info("\nSuggested fixes:")
        print("  1. Start the backend server by running:")
        print(f"     {Fore.WHITE}cd backend && python -m uvicorn app.main:app --reload{Style.RESET_ALL}")
        print("  2. Check for errors in the console output when starting the server")
        
    elif not api_running:
        print_error("  ✗ Backend server is running but API endpoints are not responding properly")
        print_info("\nSuggested fixes:")
        print("  1. Check that the API routes are correctly defined in your FastAPI application")
        print("  2. Verify the API base URL in the frontend matches the backend URL")
        print("  3. Add a root health check endpoint in your FastAPI app:")
        print(f"""
    {Fore.WHITE}@app.get("/api")
    def api_root():
        return {{"status": "ok", "message": "API is running"}}
        
    @app.get("/api/health")
    def health_check():
        return {{"status": "healthy", "version": "1.0"}}{Style.RESET_ALL}
    """)
    else:
        print_success("  ✓ API server appears to be running correctly")

def main():
    """Main function to check API status."""
    print_info("=" * 60)
    print_info("        Affluence API Backend Diagnostic Tool")
    print_info("=" * 60)
    
    # Default base URL
    base_url = "http://localhost:8000"
    
    # Allow override from command line
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    
    # Check API status
    api_running = check_api_status(base_url)
    
    # Check authentication endpoints
    if api_running:
        check_auth_endpoints(base_url)
    
    # Check if uvicorn is running
    uvicorn_running = check_uvicorn_status()
    
    # Suggest fixes
    suggest_fixes(api_running, uvicorn_running)
    
    # Return status
    if api_running:
        print_success("\n✓ Backend API diagnostic completed successfully!")
        return 0
    else:
        print_error("\n✗ Backend API diagnostic failed - see suggested fixes above")
        return 1

if __name__ == "__main__":
    sys.exit(main())