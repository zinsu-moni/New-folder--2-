# FastAPI Health Check Patch
# Add these endpoints to your main.py file

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

# Add these endpoints to your FastAPI app

@app.get("/api")
def api_root():
    """
    Root API endpoint for health checking
    This is useful for the frontend to verify the API is available
    """
    return {
        "status": "ok",
        "message": "Affluence API is running",
        "version": "1.0"
    }

@app.get("/api/health")
def health_check():
    """
    Health check endpoint that returns more detailed status
    """
    return {
        "status": "healthy",
        "version": "1.0",
        "timestamp": datetime.datetime.now().isoformat(),
        "endpoints": {
            "auth": "/api/auth/*",
            "users": "/api/users/*",
            "admin": "/api/admin/*"
        }
    }

@app.get("/api/ping")
def ping():
    """
    Simple ping endpoint for quick connectivity tests
    """
    return {"ping": "pong"}