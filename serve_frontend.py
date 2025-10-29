#!/usr/bin/env python3
"""
Simple HTTP server to serve the Affluence frontend
Run this from the root directory of the project
"""

import http.server
import socketserver
import os
from pathlib import Path

# Configuration
PORT = 3001  # Changed from 3000 to avoid conflicts
DIRECTORY = Path(__file__).parent

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIRECTORY), **kwargs)
    
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

if __name__ == '__main__':
    os.chdir(DIRECTORY)
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print("=" * 60)
        print(f"  🌐 Affluence Frontend Server")
        print("=" * 60)
        print(f"  Server running at: http://localhost:{PORT}")
        print(f"  Serving files from: {DIRECTORY}")
        print()
        print(f"  📄 Login page: http://localhost:{PORT}/login.html")
        print(f"  📄 Register page: http://localhost:{PORT}/register.html")
        print(f"  📄 Dashboard: http://localhost:{PORT}/dashboard.html")
        print(f"  📄 Admin Panel: http://localhost:{PORT}/admin-dashboard.html")
        print()
        print("  Press Ctrl+C to stop the server")
        print("=" * 60)
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n👋 Server stopped")
