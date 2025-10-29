#!/usr/bin/env python3
"""
Frontend Rebuild Script for Affluence

This script fixes common issues in the frontend code:
1. Corrects API path prefixes
2. Updates API base detection
3. Adds consistent error handling
"""

import os
import re
import json
from pathlib import Path
import shutil
from datetime import datetime

# Configuration
PROJECT_ROOT = Path(__file__).parent
BACKUP_DIR = PROJECT_ROOT / "backups" / f"frontend_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
JS_DIR = PROJECT_ROOT / "js"
ADMIN_PAGES = list(PROJECT_ROOT.glob("admin-*.html"))

print(f"🔨 Affluence Frontend Rebuild")
print(f"📁 Project root: {PROJECT_ROOT}")
print(f"📄 Found {len(ADMIN_PAGES)} admin pages")

# Step 1: Create a backup of the current frontend
os.makedirs(BACKUP_DIR, exist_ok=True)
os.makedirs(BACKUP_DIR / "js", exist_ok=True)

print(f"📦 Creating backup in {BACKUP_DIR}")

# Backup all HTML files
for html_file in PROJECT_ROOT.glob("*.html"):
    shutil.copy2(html_file, BACKUP_DIR)

# Backup all JS files
for js_file in JS_DIR.glob("*.js"):
    shutil.copy2(js_file, BACKUP_DIR / "js")

print(f"✅ Backup complete")

# Step 2: Fix API detection in api.js
api_js_path = JS_DIR / "api.js"
print(f"🔧 Fixing API base detection in {api_js_path}")

with open(api_js_path, "r", encoding="utf-8") as f:
    api_js_content = f.read()

# Update detectApiBase function with consistent behavior
api_base_detection_pattern = r"function detectApiBase\(\) \{[\s\S]*?\}"
api_base_detection_replacement = """function detectApiBase() {
    console.log("Detecting API base URL...");
    
    try {
        // 1) Explicit global override
        if (typeof window !== 'undefined' && window.AFFLUENCE_API_BASE) {
            console.log("Using global override API base:", window.AFFLUENCE_API_BASE);
            return String(window.AFFLUENCE_API_BASE).replace(/\\/$/, '');
        }

        // 2) Meta tag in <head>: <meta name="api-base" content="https://api.example.com">
        if (typeof document !== 'undefined') {
            const meta = document.querySelector('meta[name="api-base"]');
            if (meta && meta.content) {
                console.log("Using meta tag API base:", meta.content);
                return String(meta.content).replace(/\\/$/, '');
            }
        }

        // 3) Local storage (handy for quick overrides without code changes)
        const stored = (typeof localStorage !== 'undefined') ? localStorage.getItem('affluence_api_base') : null;
        if (stored) {
            console.log("Using localStorage API base:", stored);
            return String(stored).replace(/\\/$/, '');
        }

        // 4) If running locally, use hardcoded value
        console.log("Using hardcoded local API base URL");
        // Include /api in the base URL since it's part of the backend router prefix
        return 'http://localhost:8000/api';
    } catch (e) {
        console.error('API base detection failed:', e);
        return 'http://localhost:8000/api';
    }
}"""

api_js_content = re.sub(api_base_detection_pattern, api_base_detection_replacement, api_js_content)

# Update API request method with better error handling
request_pattern = r"async request\(endpoint, options = \{\}\) \{[\s\S]*?try \{[\s\S]*?const response = await fetch\(url, config\);"
request_replacement = """async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        // Add authorization header if token exists
        if (this.getToken() && !options.skipAuth) {
            headers['Authorization'] = `Bearer ${this.getToken()}`;
        }

        const config = {
            ...options,
            headers,
        };

        console.log(`🔄 API Request: ${config.method || 'GET'} ${url}`);
        console.log(`🔑 Auth token present: ${!!this.getToken()}`);
        
        try {
            // Add timeout to prevent hanging requests
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
            
            const fetchOptions = {
                ...config,
                signal: controller.signal
            };
            
            const response = await fetch(url, fetchOptions);
            clearTimeout(timeoutId);"""

api_js_content = re.sub(request_pattern, request_replacement, api_js_content)

with open(api_js_path, "w", encoding="utf-8") as f:
    f.write(api_js_content)

# Step 3: Fix admin.js
admin_js_path = JS_DIR / "admin.js"
print(f"🔧 Fixing admin API methods in {admin_js_path}")

with open(admin_js_path, "r", encoding="utf-8") as f:
    admin_js_content = f.read()

# Add admin router path helper to make API path handling more consistent
admin_router_helper = """// Admin API functions
console.log('[admin.js] Loading... api available:', typeof api);

# Helper function to ensure consistent API paths
function adminPath(path) {
    // Add leading slash if missing
    if (!path.startsWith('/')) {
        path = '/' + path;
    }
    
    // DO NOT add '/admin' prefix - it's already in the backend router prefix '/api/admin'
    // Remove any '/admin' prefix if it exists to avoid duplication
    if (path.startsWith('/admin/')) {
        path = path.substring(7); // Remove '/admin/'
    } else if (path.startsWith('/admin')) {
        path = path.substring(6); // Remove '/admin'
    }
    
    return path;
}

// Show backend connection error
function showBackendConnectionError(error) {
"""

# Replace the admin API functions header
admin_js_content = admin_js_content.replace(
    "// Admin API functions\nconsole.log('[admin.js] Loading... api available:', typeof api);",
    admin_router_helper
)

# Replace admin API methods to use the adminPath helper
admin_method_pattern = r"(getDashboard|getUsers|updateUserRole|updateUserStatus|deleteUser|impersonateUser|getCoupons|createCoupon|updateCoupon|deleteCoupon|getArticles|createArticle|updateArticle|deleteArticle|getCards|createCard|updateCard|deleteCard|getAnnouncements|createAnnouncement|updateAnnouncement|deleteAnnouncement|getWithdrawals|approveWithdrawal|getLogs|getClickToEarnTask|updateClickToEarnTask): async [\s\S]*?api\.(get|post|put|delete)\(`?\/admin\/"

def admin_method_replace(match):
    method_name = match.group(1)
    http_method = match.group(2)
    # Extract the original path by finding text between the first `/admin/` and the next backtick or quote
    return f"{method_name}: async {match.group(0).split(f'api.{http_method}(`/admin/')[1].split('`')[0]}"

# First, replace direct hardcoded paths with adminPath
admin_js_content = re.sub(r"api\.(get|post|put|delete)\(`?\/admin\/([^`'\"]+)(`|\"|')",
                          r"api.\1(adminPath('/\2')", admin_js_content)

# Update methods that might have been missed
admin_js_content = admin_js_content.replace("api.get('/dashboard')", "api.get(adminPath('/dashboard'))")
admin_js_content = admin_js_content.replace("api.get('/users", "api.get(adminPath('/users")
admin_js_content = admin_js_content.replace("api.post('/users", "api.post(adminPath('/users")
admin_js_content = admin_js_content.replace("api.put('/users", "api.put(adminPath('/users")
admin_js_content = admin_js_content.replace("api.delete('/users", "api.delete(adminPath('/users")

with open(admin_js_path, "w", encoding="utf-8") as f:
    f.write(admin_js_content)

# Step 4: Update admin pages with debugging helpers
print(f"🔧 Updating admin HTML pages with debugging helpers")

# Common debugging script to add to admin pages
debug_script = """
<!-- API Debugging Helper -->
<script>
    // API Connection Monitor
    function checkApiConnection() {
        const api = window.api;
        if (!api) {
            console.error('API object not available!');
            showConnectionError('API object not available');
            return;
        }
        
        // Test API connection
        fetch(api.baseURL + '/admin/dashboard', {
            headers: {
                'Authorization': `Bearer ${api.getToken()}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            console.log('API test connection status:', response.status);
            if (!response.ok) {
                showConnectionError(`API returned status ${response.status}`);
            } else {
                hideConnectionError();
            }
            return response.json();
        })
        .catch(error => {
            console.error('API connection test failed:', error);
            showConnectionError(`Connection failed: ${error.message}`);
        });
    }
    
    // Show connection error
    function showConnectionError(message) {
        let errorEl = document.getElementById('api-connection-error');
        if (!errorEl) {
            errorEl = document.createElement('div');
            errorEl.id = 'api-connection-error';
            errorEl.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background-color: #fee2e2;
                color: #b91c1c;
                padding: 10px 20px;
                text-align: center;
                z-index: 9999;
                font-weight: bold;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            `;
            document.body.appendChild(errorEl);
        }
        
        errorEl.innerHTML = `
            ⚠️ Backend connection issue: ${message}
            <button onclick="location.reload()" style="margin-left: 15px; padding: 3px 10px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Reload
            </button>
            <a href="admin-api-test.html" style="margin-left: 10px; color: #b91c1c; text-decoration: underline;">
                Run Diagnostics
            </a>
        `;
    }
    
    // Hide connection error
    function hideConnectionError() {
        const errorEl = document.getElementById('api-connection-error');
        if (errorEl) {
            errorEl.style.display = 'none';
        }
    }
    
    // Check connection when page loads
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(checkApiConnection, 1000);
    });
</script>
"""

for admin_page in ADMIN_PAGES:
    print(f"  - Updating {admin_page.name}")
    
    with open(admin_page, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Fix any direct fetch calls that might be adding /admin incorrectly
    if admin_page.name == "admin-users.html":
        # Fix the manual fetch in admin-users.html
        content = re.sub(
            r'fetch\(`\${api\.baseURL}/admin/users\?skip=',
            'fetch(`${api.baseURL}/users?skip=',
            content
        )
        content = re.sub(
            r'fetch\(api\.baseURL \+ \'/admin/users\',',
            'fetch(api.baseURL + \'/users\',',
            content
        )
    
    # Add the debugging script before the closing body tag
    if "</body>" in content and not "api-connection-error" in content:
        content = content.replace("</body>", f"{debug_script}\n</body>")
        
        with open(admin_page, "w", encoding="utf-8") as f:
            f.write(content)

print(f"✅ All admin pages updated")

print(f"""
🚀 Frontend rebuild complete!

Next steps:
1. Restart the frontend server:
   python serve_frontend.py
   
2. Restart the backend server:
   cd backend && uvicorn app.main:app --reload
   
3. Access the admin panel:
   http://localhost:3000/admin-dashboard.html
   
4. If you encounter issues, use the diagnostic page:
   http://localhost:3000/admin-api-test.html
""")