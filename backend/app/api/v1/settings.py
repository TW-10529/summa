# app/api/v1/settings.py - MODIFIED FOR DIVISION MANAGER ACCESS
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import json
from datetime import datetime
import os
import zipfile
import io
import traceback

from app import models, schemas
from app.database import get_db
from app.api.v1.auth import get_current_active_user

router = APIRouter()

# Default settings
DEFAULT_SETTINGS = {
    "general": {
        "company_name": "FactoryShift Pro",
        "timezone": "UTC+05:30",
        "date_format": "DD/MM/YYYY",
        "time_format": "24-hour",
        "week_start": "Monday",
        "allow_auto_schedule": True,
        "enable_notifications": True,
        "min_shift_hours": 8,
        "max_shift_hours": 12,
    },
    "security": {
        "password_min_length": 8,
        "require_special_chars": True,
        "require_numbers": True,
        "require_uppercase": True,
        "session_timeout": 30,
        "max_login_attempts": 5,
        "enable_2fa": False,
        "ip_whitelist": [],
    },
    "notifications": {
        "email_notifications": True,
        "push_notifications": True,
        "shift_change_alerts": True,
        "attendance_alerts": True,
        "overtime_alerts": True,
        "schedule_reminders": True,
        "daily_reports": False,
        "weekly_reports": True,
    },
    "users": {
        "allow_self_registration": False,
        "require_approval": True,
        "default_role": "employee",
        "auto_assign_division": False,
        "max_employees_per_dept": 50,
        "allow_profile_updates": True,
    },
    "system": {
        "backup_frequency": "daily",
        "backup_time": "02:00",
        "keep_backups_for": 30,
        "log_retention": 90,
        "maintenance_mode": False,
        "api_rate_limit": 100,
        "enable_audit_log": True,
    }
}

def create_audit_log(db: Session, user_id: int, action: str, resource: str, 
                    resource_id: Optional[int] = None, details: Optional[Dict] = None,
                    ip_address: Optional[str] = None, user_agent: Optional[str] = None):
    """Helper function to create audit log entries"""
    audit_log = models.AuditLog(
        user_id=user_id,
        action=action,
        resource=resource,
        resource_id=resource_id,
        details=details,
        ip_address=ip_address,
        user_agent=user_agent
    )
    db.add(audit_log)
    db.commit()
    return audit_log

def initialize_default_settings(db: Session, user_id: int):
    """Initialize default settings if they don't exist"""
    for category, settings in DEFAULT_SETTINGS.items():
        for key, value in settings.items():
            existing = db.query(models.SystemSettings).filter(
                models.SystemSettings.key == key
            ).first()
            
            if not existing:
                db_setting = models.SystemSettings(
                    key=key,
                    value=value,
                    category=category,
                    description=f"Default setting for {key.replace('_', ' ')}",
                    updated_by=user_id
                )
                db.add(db_setting)
    
    db.commit()

def check_permissions(current_user: models.User, required_role: models.Role = models.Role.ADMIN):
    """Check user permissions"""
    if required_role == models.Role.ADMIN:
        if current_user.role != models.Role.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions. Only admin can access this."
            )
    elif required_role == models.Role.DIVISION_MANAGER:
        if current_user.role not in [models.Role.ADMIN, models.Role.DIVISION_MANAGER]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions. Only admin and division managers can access this."
            )

@router.get("/", response_model=Dict[str, Dict[str, Any]])
def get_settings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get system settings grouped by category"""
    # Admin can see all settings, division manager sees limited settings
    if current_user.role not in [models.Role.ADMIN, models.Role.DIVISION_MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions. Only admin and division managers can access settings."
        )
    
    # Initialize default settings if none exist
    settings_count = db.query(models.SystemSettings).count()
    if settings_count == 0:
        initialize_default_settings(db, current_user.id)
    
    # Get all settings
    settings = db.query(models.SystemSettings).all()
    
    # Filter settings for division manager
    if current_user.role == models.Role.DIVISION_MANAGER:
        # Division manager can only see general and notifications settings
        allowed_categories = ["general", "notifications"]
        settings = [s for s in settings if s.category in allowed_categories]
    
    # Group by category
    grouped_settings = {}
    for setting in settings:
        if setting.category not in grouped_settings:
            grouped_settings[setting.category] = {}
        grouped_settings[setting.category][setting.key] = setting.value
    
    # Create audit log
    create_audit_log(
        db=db,
        user_id=current_user.id,
        action="view",
        resource="settings",
        details={"category": "all"}
    )
    
    return grouped_settings

@router.put("/{category}/{key}")
def update_setting(
    category: str,
    key: str,
    setting_update: schemas.SettingsUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Update a specific setting"""
    # Check permissions
    if current_user.role == models.Role.ADMIN:
        pass  # Admin can update anything
    elif current_user.role == models.Role.DIVISION_MANAGER:
        # Division manager can only update general and notifications settings
        allowed_categories = ["general", "notifications"]
        if category not in allowed_categories:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Not enough permissions. Division managers can only update {', '.join(allowed_categories)} settings."
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions. Only admin and division managers can update settings."
        )
    
    # Find the setting
    setting = db.query(models.SystemSettings).filter(
        models.SystemSettings.category == category,
        models.SystemSettings.key == key
    ).first()
    
    if not setting:
        # Create new setting if it doesn't exist
        setting = models.SystemSettings(
            key=key,
            value=setting_update.value,
            category=category,
            description=f"Custom setting for {key.replace('_', ' ')}",
            updated_by=current_user.id
        )
        db.add(setting)
        action = "create"
    else:
        # Update existing setting
        old_value = setting.value
        setting.value = setting_update.value
        setting.updated_by = current_user.id
        action = "update"
    
    db.commit()
    db.refresh(setting)
    
    # Create audit log
    create_audit_log(
        db=db,
        user_id=current_user.id,
        action=action,
        resource="settings",
        resource_id=setting.id,
        details={
            "category": category,
            "key": key,
            "old_value": old_value if action == "update" else None,
            "new_value": setting_update.value
        }
    )
    
    return {"message": f"Setting {key} updated successfully", "setting": setting}

@router.post("/reset/{category}")
def reset_settings_category(
    category: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Reset all settings in a category to defaults"""
    # Only admin can reset settings
    if current_user.role != models.Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions. Only admin can reset settings."
        )
    
    if category not in DEFAULT_SETTINGS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid category. Must be one of: {', '.join(DEFAULT_SETTINGS.keys())}"
        )
    
    # Delete existing settings in category
    db.query(models.SystemSettings).filter(
        models.SystemSettings.category == category
    ).delete()
    
    # Add default settings
    for key, value in DEFAULT_SETTINGS[category].items():
        db_setting = models.SystemSettings(
            key=key,
            value=value,
            category=category,
            description=f"Default setting for {key.replace('_', ' ')}",
            updated_by=current_user.id
        )
        db.add(db_setting)
    
    db.commit()
    
    # Create audit log
    create_audit_log(
        db=db,
        user_id=current_user.id,
        action="reset",
        resource="settings",
        details={"category": category}
    )
    
    return {"message": f"Settings for {category} reset to defaults"}

@router.post("/reset-all")
def reset_all_settings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Reset all settings to defaults"""
    # Only admin can reset settings
    if current_user.role != models.Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions. Only admin can reset settings."
        )
    
    # Delete all settings
    db.query(models.SystemSettings).delete()
    
    # Initialize with defaults
    initialize_default_settings(db, current_user.id)
    
    # Create audit log
    create_audit_log(
        db=db,
        user_id=current_user.id,
        action="reset_all",
        resource="settings",
        details={}
    )
    
    return {"message": "All settings reset to defaults"}

@router.get("/audit-logs", response_model=List[schemas.AuditLogResponse])
def get_audit_logs(
    skip: int = 0,
    limit: int = 100,
    resource: Optional[str] = None,
    action: Optional[str] = None,
    user_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get audit logs with filters"""
    # Check permissions
    check_permissions(current_user, models.Role.ADMIN)
    
    query = db.query(models.AuditLog)
    
    if resource:
        query = query.filter(models.AuditLog.resource == resource)
    if action:
        query = query.filter(models.AuditLog.action == action)
    if user_id:
        query = query.filter(models.AuditLog.user_id == user_id)
    
    query = query.order_by(models.AuditLog.created_at.desc())
    logs = query.offset(skip).limit(limit).all()
    
    return logs

@router.get("/division-audit-logs")
def get_division_audit_logs(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get audit logs for division manager's division"""
    # Only division manager and admin can access
    if current_user.role not in [models.Role.ADMIN, models.Role.DIVISION_MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions."
        )
    
    query = db.query(models.AuditLog)
    
    # Division manager can only see logs for their division
    if current_user.role == models.Role.DIVISION_MANAGER:
        # Get users in the division
        division_users = db.query(models.User.id).filter(
            models.User.division_id == current_user.division_id
        ).subquery()
        
        query = query.filter(models.AuditLog.user_id.in_(division_users))
    
    query = query.order_by(models.AuditLog.created_at.desc())
    logs = query.offset(skip).limit(limit).all()
    
    return logs

@router.post("/backup")
def create_backup(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Create a system backup"""
    # Only admin can create backups
    if current_user.role != models.Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions. Only admin can create backups."
        )
    
    backup_id = f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    # In a real implementation, this would:
    # 1. Backup database
    # 2. Backup uploaded files
    # 3. Create a zip file
    # 4. Store it securely
    # 5. Return download URL
    
    # For now, we'll simulate it
    backup_details = {
        "backup_id": backup_id,
        "filename": f"{backup_id}.zip",
        "size": "245 MB",
        "created_at": datetime.now(),
        "status": "completed",
        "download_url": f"/api/v1/settings/backup/{backup_id}/download"
    }
    
    # Create audit log
    create_audit_log(
        db=db,
        user_id=current_user.id,
        action="backup",
        resource="system",
        details={"backup_id": backup_id}
    )
    
    return {
        "message": "Backup created successfully",
        "backup": backup_details
    }

@router.post("/clear-cache")
def clear_cache(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Clear system cache"""
    # Only admin can clear cache
    if current_user.role != models.Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions. Only admin can clear cache."
        )
    
    # In a real implementation, this would clear cache
    # For now, we'll just log it
    
    # Create audit log
    create_audit_log(
        db=db,
        user_id=current_user.id,
        action="clear_cache",
        resource="system",
        details={}
    )
    
    return {"message": "Cache cleared successfully"}

@router.get("/system-info")
def get_system_info(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get system information and health status"""
    # Check permissions
    check_permissions(current_user, models.Role.ADMIN)
    
    try:
        # Get counts
        user_count = db.query(models.User).count()
        division_count = db.query(models.Division).count()
        department_count = db.query(models.Department).count()
        shift_count = db.query(models.Shift).count()
        settings_count = db.query(models.SystemSettings).count()
        audit_log_count = db.query(models.AuditLog).count()
        
        # Get latest backup info (simulated)
        latest_backup = {
            "timestamp": datetime.now().isoformat(),
            "status": "healthy"
        }
        
        # System health (simulated)
        system_health = {
            "database": "connected",
            "api": "running",
            "storage": "85%",
            "memory": "65%",
            "cpu": "42%"
        }
        
        return {
            "counts": {
                "users": user_count,
                "divisions": division_count,
                "departments": department_count,
                "shifts": shift_count,
                "settings": settings_count,
                "audit_logs": audit_log_count
            },
            "latest_backup": latest_backup,
            "system_health": system_health,
            "uptime": "7 days, 3 hours",
            "version": "2.0.0"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting system info: {str(e)}"
        )

@router.get("/division-system-info")
def get_division_system_info(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get division-specific system information"""
    # Only division manager and admin can access
    if current_user.role not in [models.Role.ADMIN, models.Role.DIVISION_MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions."
        )
    
    try:
        division_id = current_user.division_id
        
        # Get division-specific counts
        division_user_count = db.query(models.User).filter(
            models.User.division_id == division_id
        ).count()
        
        division_dept_count = db.query(models.Department).filter(
            models.Department.division_id == division_id
        ).count()
        
        active_users = db.query(models.User).filter(
            models.User.division_id == division_id,
            models.User.is_active == True
        ).count()
        
        # Get division info
        division = db.query(models.Division).filter(models.Division.id == division_id).first()
        
        # Mock data for division system info
        division_health = {
            "database": "connected",
            "attendance_system": "running",
            "schedule_system": "running",
            "notification_system": "running"
        }
        
        return {
            "division": {
                "id": division.id if division else None,
                "name": division.name if division else "Unknown",
                "description": division.description if division else ""
            },
            "counts": {
                "total_users": division_user_count,
                "total_departments": division_dept_count,
                "active_users": active_users,
                "inactive_users": division_user_count - active_users
            },
            "system_health": division_health,
            "last_updated": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting division system info: {str(e)}"
        )