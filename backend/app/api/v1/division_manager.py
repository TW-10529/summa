# app/api/v1/division_manager.py - UPDATED WITH SETTINGS ENDPOINT
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any

from app import models, schemas
from app.database import get_db
from app.api.v1.auth import get_current_active_user

router = APIRouter()

def verify_division_manager(current_user: models.User):
    """Verify user is a division manager with a division assigned"""
    if current_user.role != models.Role.DIVISION_MANAGER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only division managers can access this endpoint"
        )
    
    if not current_user.division_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No division assigned to this manager"
        )
    
    return current_user.division_id

@router.get("/settings")
def get_division_settings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get division-specific settings"""
    division_id = verify_division_manager(current_user)
    
    try:
        # Get division info
        division = db.query(models.Division).filter(models.Division.id == division_id).first()
        if not division:
            raise HTTPException(status_code=404, detail="Division not found")
        
        # Get division statistics
        department_count = db.query(models.Department).filter(
            models.Department.division_id == division_id
        ).count()
        
        total_employees = db.query(models.User).filter(
            models.User.division_id == division_id
        ).count()
        
        active_employees = db.query(models.User).filter(
            models.User.division_id == division_id,
            models.User.is_active == True
        ).count()
        
        # Get managers in this division
        managers = db.query(models.User).filter(
            models.User.division_id == division_id,
            models.User.role.in_([models.Role.DIVISION_MANAGER, models.Role.DEPARTMENT_MANAGER])
        ).all()
        
        managers_list = []
        for manager in managers:
            manager_info = {
                "id": manager.id,
                "name": manager.full_name,
                "email": manager.email,
                "role": manager.role.value,
                "employee_id": manager.employee_id
            }
            
            # Add department info for department managers
            if manager.role == models.Role.DEPARTMENT_MANAGER and manager.department_id:
                department = db.query(models.Department).filter(
                    models.Department.id == manager.department_id
                ).first()
                if department:
                    manager_info["department"] = {
                        "id": department.id,
                        "name": department.name,
                        "code": department.code
                    }
            
            managers_list.append(manager_info)
        
        # Division settings (could be stored in database in real implementation)
        division_settings = {
            "division_info": {
                "id": division.id,
                "name": division.name,
                "description": division.description,
                "color": division.color,
                "created_at": division.created_at.isoformat() if division.created_at else None
            },
            "statistics": {
                "total_departments": department_count,
                "total_employees": total_employees,
                "active_employees": active_employees,
                "inactive_employees": total_employees - active_employees,
                "managers_count": len(managers_list)
            },
            "managers": managers_list,
            "settings": {
                "allow_self_scheduling": True,
                "require_approval_for_time_off": True,
                "notify_on_late_arrival": True,
                "max_overtime_hours": 20,
                "shift_change_deadline_hours": 24,
                "attendance_report_frequency": "weekly",
                "default_shift_start": "08:00",
                "default_shift_end": "16:00",
                "allow_shift_swaps": True,
                "auto_approve_overtime": False
            },
            "system_status": {
                "attendance_tracking": "active",
                "scheduling_system": "active",
                "notification_system": "active",
                "report_generation": "active"
            }
        }
        
        return division_settings
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching division settings: {str(e)}"
        )

@router.get("/dashboard/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get division dashboard statistics"""
    division_id = verify_division_manager(current_user)
    
    try:
        # Get division info
        division = db.query(models.Division).filter(models.Division.id == division_id).first()
        if not division:
            raise HTTPException(status_code=404, detail="Division not found")
        
        # Count departments
        department_count = db.query(models.Department).filter(
            models.Department.division_id == division_id
        ).count()
        
        # Count employees
        employee_count = db.query(models.User).filter(
            models.User.division_id == division_id,
            models.User.is_active == True
        ).count()
        
        # Mock data for now (you'll implement real attendance/schedule data)
        return {
            "division": {
                "id": division.id,
                "name": division.name,
                "description": division.description,
                "color": division.color
            },
            "stats": {
                "total_departments": department_count,
                "total_employees": employee_count,
                "active_employees": employee_count,
                "today_attendance": 92.5,
                "active_shifts": 3,
                "pending_approvals": 2
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting stats: {str(e)}"
        )

@router.get("/departments")
def get_division_departments(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get all departments in the division"""
    division_id = verify_division_manager(current_user)
    
    try:
        departments = db.query(models.Department).filter(
            models.Department.division_id == division_id
        ).all()
        
        result = []
        for dept in departments:
            # Get employee count
            employee_count = db.query(models.User).filter(
                models.User.department_id == dept.id
            ).count()
            
            # Get manager info
            manager_info = None
            if dept.manager_id:
                manager = db.query(models.User).filter(models.User.id == dept.manager_id).first()
                if manager:
                    manager_info = {
                        "id": manager.id,
                        "name": manager.full_name,
                        "email": manager.email,
                        "employee_id": manager.employee_id
                    }
            
            result.append({
                "id": dept.id,
                "name": dept.name,
                "code": dept.code,
                "description": dept.description,
                "division_id": dept.division_id,
                "manager_id": dept.manager_id,
                "created_at": dept.created_at,
                "manager": manager_info,
                "employee_count": employee_count
            })
        
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting departments: {str(e)}"
        )

@router.get("/attendance")
def get_attendance(
    date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get division attendance data"""
    division_id = verify_division_manager(current_user)
    
    try:
        # Mock attendance data (implement real attendance tracking later)
        departments = db.query(models.Department).filter(
            models.Department.division_id == division_id
        ).all()
        
        attendance_data = []
        total_employees = 0
        total_present = 0
        
        for dept in departments:
            employee_count = db.query(models.User).filter(
                models.User.department_id == dept.id
            ).count()
            
            # Mock attendance percentages
            present = int(employee_count * 0.92)  # 92% attendance
            absent = employee_count - present
            late = int(present * 0.1)  # 10% of present are late
            
            attendance_data.append({
                "department_id": dept.id,
                "department_name": dept.name,
                "department_code": dept.code,
                "total_employees": employee_count,
                "present": present,
                "absent": absent,
                "late": late,
                "on_leave": int(employee_count * 0.05),
                "attendance_rate": 92.0
            })
            
            total_employees += employee_count
            total_present += present
        
        attendance_rate = (total_present / total_employees * 100) if total_employees > 0 else 0
        
        return {
            "date": date or datetime.now().date().isoformat(),
            "division_id": division_id,
            "overall_attendance_rate": round(attendance_rate, 1),
            "departments": attendance_data,
            "summary": {
                "total_employees": total_employees,
                "total_present": total_present,
                "total_absent": total_employees - total_present,
                "total_late": sum(d["late"] for d in attendance_data),
                "total_on_leave": sum(d["on_leave"] for d in attendance_data)
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting attendance: {str(e)}"
        )

@router.get("/schedule")
def get_schedule(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get division schedule"""
    division_id = verify_division_manager(current_user)
    
    try:
        departments = db.query(models.Department).filter(
            models.Department.division_id == division_id
        ).all()
        
        schedule_data = []
        for dept in departments:
            employee_count = db.query(models.User).filter(
                models.User.department_id == dept.id
            ).count()
            
            schedule_data.append({
                "department_id": dept.id,
                "department_name": dept.name,
                "shifts": [
                    {
                        "shift_id": 1,
                        "shift_name": "Morning Shift",
                        "start_time": "08:00",
                        "end_time": "16:00",
                        "employees_scheduled": min(employee_count, 25),
                        "coverage_rate": 100 if employee_count >= 25 else (employee_count / 25 * 100)
                    },
                    {
                        "shift_id": 2,
                        "shift_name": "Afternoon Shift",
                        "start_time": "16:00",
                        "end_time": "00:00",
                        "employees_scheduled": min(max(employee_count - 25, 0), 20),
                        "coverage_rate": 80 if employee_count >= 45 else ((max(employee_count - 25, 0)) / 20 * 100)
                    }
                ]
            })
        
        return {
            "division_id": division_id,
            "date_range": {
                "start": start_date or datetime.now().date().isoformat(),
                "end": end_date or datetime.now().date().isoformat()
            },
            "departments": schedule_data
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting schedule: {str(e)}"
        )

@router.get("/approvals/pending")
def get_pending_approvals(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get pending approvals"""
    verify_division_manager(current_user)
    
    # Mock data for now
    return {
        "division_id": current_user.division_id,
        "total_pending": 2,
        "approvals": [
            {
                "id": 1,
                "type": "leave",
                "employee_name": "John Doe",
                "employee_id": "EMP001",
                "department_id": 1,
                "department_name": "Production Line A",
                "request_date": datetime.now().isoformat(),
                "start_date": (datetime.now() + timedelta(days=1)).isoformat(),
                "end_date": (datetime.now() + timedelta(days=3)).isoformat(),
                "reason": "Family vacation",
                "status": "pending"
            },
            {
                "id": 2,
                "type": "overtime",
                "employee_name": "Jane Smith",
                "employee_id": "EMP002",
                "department_id": 2,
                "department_name": "Production Line B",
                "request_date": datetime.now().isoformat(),
                "date": datetime.now().isoformat(),
                "hours": 3,
                "reason": "Project deadline",
                "status": "pending"
            }
        ]
    }

@router.post("/notifications/send")
def send_notification(
    notification: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Send division notification"""
    division_id = verify_division_manager(current_user)
    
    try:
        # Create audit log for the notification
        audit_log = models.AuditLog(
            user_id=current_user.id,
            action="send_notification",
            resource="division",
            resource_id=division_id,
            details=notification,
            created_at=datetime.now()
        )
        db.add(audit_log)
        db.commit()
        
        return {
            "message": "Notification sent successfully",
            "notification_id": audit_log.id,
            "timestamp": audit_log.created_at.isoformat()
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error sending notification: {str(e)}"
        )

@router.get("/reports/generate")
def generate_report(
    report_type: str = "attendance",
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Generate division report"""
    verify_division_manager(current_user)
    
    # Mock report data
    return {
        "report_id": f"report_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        "division_id": current_user.division_id,
        "report_type": report_type,
        "generated_by": current_user.full_name,
        "generated_at": datetime.now().isoformat(),
        "period": {
            "start": start_date or (datetime.now() - timedelta(days=30)).date().isoformat(),
            "end": end_date or datetime.now().date().isoformat()
        },
        "data": {},
        "summary": {
            "status": "completed",
            "message": "Report generated successfully"
        }
    }