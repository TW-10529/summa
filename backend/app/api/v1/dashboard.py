# app/api/v1/dashboard.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from datetime import datetime, timedelta
from typing import List, Optional

from app import models, schemas
from app.database import get_db
from app.api.v1.auth import get_current_active_user

router = APIRouter()

@router.get("/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get dashboard statistics"""
    try:
        # Get counts based on user role
        if current_user.role == models.Role.ADMIN:
            # Admin sees everything
            division_count = db.query(models.Division).count()
            department_count = db.query(models.Department).count()
            user_count = db.query(models.User).count()
            
            # Calculate today's attendance (simulated for now)
            today = datetime.now().date()
            attendance_rate = 94.5  # This would come from attendance records
            
        elif current_user.role == models.Role.DIVISION_MANAGER:
            # Division manager sees only their division
            division_count = 1  # They only manage one division
            department_count = db.query(models.Department).filter(
                models.Department.division_id == current_user.division_id
            ).count()
            user_count = db.query(models.User).filter(
                models.User.division_id == current_user.division_id
            ).count()
            attendance_rate = 92.3
            
        elif current_user.role == models.Role.DEPARTMENT_MANAGER:
            # Department manager sees only their department
            division_count = 1
            department_count = 1  # They only manage one department
            user_count = db.query(models.User).filter(
                models.User.department_id == current_user.department_id
            ).count()
            attendance_rate = 95.1
            
        else:
            # Employee sees limited stats
            division_count = 0
            department_count = 0
            user_count = 1  # Just themselves
            attendance_rate = 100.0  # Their own attendance
        
        # Count active shifts (simulated)
        active_shifts = db.query(models.Shift).count()
        
        # Count pending approvals (simulated)
        pending_approvals = 3
        
        return {
            "total_divisions": division_count,
            "total_departments": department_count,
            "total_employees": user_count,
            "today_attendance": attendance_rate,
            "active_shifts": active_shifts,
            "pending_approvals": pending_approvals
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting dashboard stats: {str(e)}"
        )

@router.get("/recent-activity")
def get_recent_activity(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get recent system activity"""
    try:
        activities = []
        
        # Get recent audit logs for admin
        if current_user.role == models.Role.ADMIN:
            logs = db.query(models.AuditLog).order_by(
                models.AuditLog.created_at.desc()
            ).limit(limit).all()
            
            for log in logs:
                activities.append({
                    "id": log.id,
                    "type": "audit",
                    "action": log.action,
                    "resource": log.resource,
                    "user": log.user.full_name if log.user else "System",
                    "timestamp": log.created_at,
                    "details": log.details
                })
        
        # Get recent user activity for managers
        elif current_user.role in [models.Role.DIVISION_MANAGER, models.Role.DEPARTMENT_MANAGER]:
            # Get recent user logins in their scope
            recent_logins = db.query(models.AuditLog).filter(
                models.AuditLog.action == "login",
                models.AuditLog.resource == "auth"
            ).order_by(
                models.AuditLog.created_at.desc()
            ).limit(limit).all()
            
            for login in recent_logins:
                activities.append({
                    "id": login.id,
                    "type": "login",
                    "action": "logged in",
                    "user": login.user.full_name if login.user else "Unknown",
                    "timestamp": login.created_at,
                    "ip": login.ip_address
                })
        
        # For employees, show their own recent activity
        else:
            user_activities = db.query(models.AuditLog).filter(
                models.AuditLog.user_id == current_user.id
            ).order_by(
                models.AuditLog.created_at.desc()
            ).limit(limit).all()
            
            for activity in user_activities:
                activities.append({
                    "id": activity.id,
                    "type": "user_activity",
                    "action": activity.action,
                    "resource": activity.resource,
                    "timestamp": activity.created_at,
                    "details": activity.details
                })
        
        return {"activities": activities}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting recent activity: {str(e)}"
        )

@router.get("/division-overview")
def get_division_overview(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get division overview"""
    try:
        if current_user.role == models.Role.ADMIN:
            # Admin sees all divisions
            divisions = db.query(models.Division).all()
        elif current_user.role == models.Role.DIVISION_MANAGER:
            # Division manager sees their division
            divisions = db.query(models.Division).filter(
                models.Division.id == current_user.division_id
            ).all()
        else:
            # Others see their assigned division
            divisions = db.query(models.Division).filter(
                models.Division.id == current_user.division_id
            ).all() if current_user.division_id else []
        
        overview = []
        for division in divisions:
            # Count departments in this division
            dept_count = db.query(models.Department).filter(
                models.Department.division_id == division.id
            ).count()
            
            # Count employees in this division
            emp_count = db.query(models.User).filter(
                models.User.division_id == division.id
            ).count()
            
            overview.append({
                "id": division.id,
                "name": division.name,
                "description": division.description,
                "color": division.color,
                "department_count": dept_count,
                "employee_count": emp_count,
                "created_at": division.created_at
            })
        
        return {"divisions": overview}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting division overview: {str(e)}"
        )

@router.post("/generate-report")
def generate_report(
    report_type: str = "summary",
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Generate a system report"""
    try:
        # Only admin and managers can generate reports
        if current_user.role not in [models.Role.ADMIN, models.Role.DIVISION_MANAGER]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to generate reports."
            )
        
        # Parse dates
        start = datetime.strptime(start_date, "%Y-%m-%d") if start_date else datetime.now() - timedelta(days=30)
        end = datetime.strptime(end_date, "%Y-%m-%d") if end_date else datetime.now()
        
        # Generate report data based on type
        if report_type == "summary":
            report_data = generate_summary_report(db, current_user, start, end)
        elif report_type == "attendance":
            report_data = generate_attendance_report(db, current_user, start, end)
        elif report_type == "user":
            report_data = generate_user_report(db, current_user, start, end)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid report type: {report_type}"
            )
        
        # Create audit log
        audit_log = models.AuditLog(
            user_id=current_user.id,
            action="generate_report",
            resource="report",
            details={
                "report_type": report_type,
                "start_date": start.isoformat(),
                "end_date": end.isoformat()
            }
        )
        db.add(audit_log)
        db.commit()
        
        return {
            "message": f"{report_type.capitalize()} report generated successfully",
            "report": report_data,
            "generated_at": datetime.now().isoformat(),
            "format": "json"  # Could be "pdf", "csv", etc.
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating report: {str(e)}"
        )

def generate_summary_report(db: Session, user: models.User, start: datetime, end: datetime):
    """Generate summary report"""
    # Get basic counts
    user_count = db.query(models.User).count()
    division_count = db.query(models.Division).count()
    department_count = db.query(models.Department).count()
    
    # Get new users in date range
    new_users = db.query(models.User).filter(
        models.User.created_at.between(start, end)
    ).count()
    
    # Get audit logs in date range
    activity_count = db.query(models.AuditLog).filter(
        models.AuditLog.created_at.between(start, end)
    ).count()
    
    return {
        "period": {
            "start": start.isoformat(),
            "end": end.isoformat()
        },
        "summary": {
            "total_users": user_count,
            "total_divisions": division_count,
            "total_departments": department_count,
            "new_users": new_users,
            "activities": activity_count
        },
        "generated_by": user.full_name,
        "generated_at": datetime.now().isoformat()
    }

def generate_attendance_report(db: Session, user: models.User, start: datetime, end: datetime):
    """Generate attendance report (simulated)"""
    # In a real system, this would query attendance records
    return {
        "period": {
            "start": start.isoformat(),
            "end": end.isoformat()
        },
        "attendance_summary": {
            "average_attendance": 94.5,
            "total_present": 1250,
            "total_absent": 45,
            "total_late": 78,
            "overtime_hours": 245.5
        },
        "by_department": [
            {"department": "Production", "attendance": 92.3},
            {"department": "Quality", "attendance": 96.7},
            {"department": "Maintenance", "attendance": 91.5},
            {"department": "Logistics", "attendance": 94.2}
        ]
    }

def generate_user_report(db: Session, user: models.User, start: datetime, end: datetime):
    """Generate user activity report"""
    # Get user activities
    activities = db.query(models.AuditLog).filter(
        models.AuditLog.created_at.between(start, end)
    ).all()
    
    # Group by user
    user_activities = {}
    for activity in activities:
        if activity.user_id:
            user_name = activity.user.full_name if activity.user else f"User {activity.user_id}"
            if user_name not in user_activities:
                user_activities[user_name] = []
            user_activities[user_name].append({
                "action": activity.action,
                "resource": activity.resource,
                "timestamp": activity.created_at.isoformat(),
                "details": activity.details
            })
    
    return {
        "period": {
            "start": start.isoformat(),
            "end": end.isoformat()
        },
        "total_activities": len(activities),
        "user_activities": user_activities
    }