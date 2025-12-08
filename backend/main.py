# app/main.py - FIXED VERSION
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# Import the unified api_router instead of individual routers
from app.api.v1 import api_router

app = FastAPI(
    title="FactoryShift API",
    description="Factory Attendance and Shift Management System",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the unified router with the base prefix
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {
        "message": "Welcome to FactoryShift API",
        "version": "2.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": "2024-01-01T00:00:00Z"
    }

@app.get("/api/v1/test")
def test_endpoint():
    return {"message": "API is working!"}