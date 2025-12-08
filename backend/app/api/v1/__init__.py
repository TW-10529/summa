# app/api/v1/__init__.py - FIXED VERSION
from fastapi import APIRouter

# Import routers correctly
from .auth import router as auth_router
from .users import router as users_router
from .divisions import router as divisions_router
from .departments import router as departments_router
from .settings import router as settings_router
from .dashboard import router as dashboard_router
from .division_manager import router as division_manager_router

# Create the main API router
api_router = APIRouter()

# Include all routers with their prefixes
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(users_router, prefix="/users", tags=["users"])
api_router.include_router(divisions_router, prefix="/divisions", tags=["divisions"])
api_router.include_router(departments_router, prefix="/departments", tags=["departments"])
api_router.include_router(settings_router, prefix="/settings", tags=["settings"])
api_router.include_router(dashboard_router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(division_manager_router, prefix="/division-manager", tags=["division-manager"])

__all__ = [
    "api_router",  # Export the main router
    "auth_router", 
    "users_router", 
    "divisions_router", 
    "departments_router",
    "settings_router",
    "dashboard_router",
    "division_manager_router"
]